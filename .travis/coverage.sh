#!/usr/bin/env bash

min_coverage="${MIN_COVERAGE:-42}"
line_coverage="$((cd client; CI=true yarn coverage) | grep '^All files  *|' | cut -d'|' -f5 | tr -d ' ' | cut -d'.' -f1)"

if [ ${line_coverage} -lt ${min_coverage} ]; then
  echo "Got test coverage of ${line_coverage} which is less than configured minimum of ${min_coverage}" >&2
  exit 1
else
  echo "Got test coverage of ${line_coverage}, well done" >&2
  exit 0
fi