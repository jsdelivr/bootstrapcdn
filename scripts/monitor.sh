#!/usr/bin/env bash
set -u

__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# OPTIONAL w/ defaults:
# any of these can be set
MONITOR_BOOTSTRAP_VERSION=${MONITOR_BOOTSTRAP_VERSION-}
MONITOR_PRIMARY_SOURCE=${MONITOR_PRIMARY_SOURCE-"https://stackpath.bootstrapcdn.com"}
MONITOR_SECONDARY_SOURCE=${MONITOR_SECONDARY_SOURCE-""}
MONITOR_LOCAL_PREFIX=${MONITOR_LOCAL_PREFIX-"${__dirname}/../cdn"}
PAGERDUTY_SERVICE_KEY=${PAGERDUTY_SERVICE_KEY-}
PAGERDUTY_CLIENT_NAME=${PAGERDUTY_CLIENT_NAME-"bootstrap-cdn-monitor"}
MONITOR_VERBOSE=${MONITOR_VERBOSE-}

X() {
  [[ ! -z "$MONITOR_VERBOSE" ]] && echo "+ $@"
  $@
}

debug() {
  [[ ! -z "$MONITOR_VERBOSE" ]] && echo "in=scripts/monitor.sh debug=\"$@\""
}

error() {
  echo "in=scripts/monitor.sh error=\"$@\""
}

warn() {
  echo "in=scripts/monitor.sh warning=\"$@\""
}

get_remote() {
  echo "$(curl -s -X GET "$1")"
}

get_local() {
  cat "${MONITOR_LOCAL_PREFIX}/$1"
}

sum() {
  echo "$1" | md5sum | awk '{print $1}'
}

pagerduty_report() {
  debug "Reporting to PagerDuty"
  if [[ -z "$PAGERDUTY_SERVICE_KEY" ]]; then
    warn "'PAGERDUTY_SERVICE_KEY' not set, skipping post to PagerDuty"
    return
  fi

  X curl -sLi -H "Content-Type: application/json" -X POST \
    -d "{
      \"service_key\": \"${PAGERDUTY_SERVICE_KEY}\",
      \"event_type\":  \"trigger\",
      \"description\": \"check=failed on=$1 remote=$2 local=$3\",
      \"client\":      \"${PAGERDUTY_CLIENT_NAME}\"
    }" \
    "https://events.pagerduty.com/generic/2010-04-15/create_event.json"
}

verify() {
  debug "Fetching $2/$1"
  local _remote="$(sum "$(get_remote "$2/$1")")"
  debug "Reading $1"
  local  _local="$(sum "$(get_local  "$1")")"

  if [[ "$_remote" != "$_local" ]]; then
    echo "in=scripts/monitor.sh check=failed on=$2/$1 remote=$_remote local=$_local"
    pagerduty_report "$1" "$_remote" "$_local"
  else
    echo "in=scripts/monitor.sh check=passed on=$2/$1"
  fi
}

if [[ ! -z "$MONITOR_BOOTSTRAP_VERSION" ]]; then
  verify "bootstrap/$MONITOR_BOOTSTRAP_VERSION/js/bootstrap.js" "$MONITOR_PRIMARY_SOURCE"
  verify "bootstrap/$MONITOR_BOOTSTRAP_VERSION/js/bootstrap.min.js" "$MONITOR_PRIMARY_SOURCE"
else
  warn "'MONITOR_BOOTSTRAP_VERSION' not set, skipping version specific checks"
fi

