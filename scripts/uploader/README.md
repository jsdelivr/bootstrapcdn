# s3 upload automation

## Image

From repo root, build with

```sh
docker build -f Dockerfile.uploader -t jmervine/bootstrapcdn-uploader:latest .
```

## Scripts

> NOTE: These script are intentionally written to work with pure Ruby -- no Gems need to
> be installed.

### s3uploader.rb

Use this script to upload files to S3, ensuring their content types in the process.

> Note: This script can also be used to normalize or adjust existing content types.

```text
Usage: ruby ./s3uploader.rb [config]

Dependencies:

1. Requires AWS CLI to be installed and working.
2. Requires AWS Credentials to be exported or passed through
   the 'profile' argument.

Options:
    -s, --source SOURCE              Source directory to upload
    -t, --target TARGET              Target location for upload
    -p, --profile [PROFILE]          AWS Credentials profile, uses exported AWS Credentials if missing
    -e, --extension [EXT]            File extension to upload (defaults to all)
    -D, --dryrun                     Pass a dry run to AWS CLI
    -h, --help                       Show this message
```

#### Example

```console
~/Development/bootstrapcdn-ops/scripts $ ruby ./s3uploader.rb -s \
    ~/Development/bootstrap-cdn/cdn/bootlint/0.9.0/ -t public/bootlint/0.9.0/ -D
+ aws  s3 cp --dryrun --acl public-read \
  --exclude "*" --include "*.js" \
  --metadata-directive="REPLACE" --recursive \
  --content-type "text/javascript; charset=utf-8" \
  /Users/jmervine/Development/bootstrap-cdn/cdn/bootlint/0.9.0/ \
  s3://bootstrap-cdn/public/bootlint/0.9.0/
(dryrun) upload: ../../bootstrap-cdn/cdn/bootlint/0.9.0/bootlint.js to s3://bootstrap-cdn/public/bootlint/0.9.0/bootlint.js
(dryrun) upload: ../../bootstrap-cdn/cdn/bootlint/0.9.0/bootlint.min.js to s3://bootstrap-cdn/public/bootlint/0.9.0/bootlint.min.js

+ aws  s3 cp --dryrun --acl public-read \
  --exclude "*" --include "*.map" \
  --metadata-directive="REPLACE" --recursive \
  --content-type "application/json; charset=utf-8" \
  /Users/jmervine/Development/bootstrap-cdn/cdn/bootlint/0.9.0/ \
  s3://bootstrap-cdn/public/bootlint/0.9.0/
(dryrun) upload: ../../bootstrap-cdn/cdn/bootlint/0.9.0/bootlint.min.js.map to s3://bootstrap-cdn/public/bootlint/0.9.0/bootlint.min.js.map
```
