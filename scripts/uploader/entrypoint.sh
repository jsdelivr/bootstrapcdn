#!/usr/bin/env bash

set -ue

# Check for required environment variables.
test -z "$AWS_REGION"
test -z "$AWS_ACCESS_KEY_ID"
test -z "$AWS_SECRET_ACCESS_KEY"
test -z "$SOURCE"
test -z "$TARGET"

if test -z "$(which aws)"; then
    echo "awscli required, but missing"
    exit 1
fi

if test -z "$(which ruby)"; then
    echo "ruby required, but missing"
    exit 1
fi

set -x
ruby /src/scripts/uploader/s3uploader.rb \
    --source $SOURCE --target $TARGET
