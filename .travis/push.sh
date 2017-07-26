#!/usr/bin/env bash

set -euo pipefail

readonly GITHUB_ORG="${GITHUB_ORG:-CatalystCode}"
readonly GITHUB_REPO="${GITHUB_REPO:-ibex-dashboard}"
readonly TARGET_BRANCH="${TARGET_BRANCH:-master}"
readonly SOURCE_BRANCH="${SOURCE_BRANCH:-ibex-version-1.0}"

readonly AUTOCOMMIT_NAME="Travis CI"
readonly AUTOCOMMIT_EMAIL="travis@travis-ci.org"
readonly AUTOCOMMIT_BRANCH="temp"

log() {
  echo "$@" >&2
}

ensure_preconditions_met() {
  if [ -z "${TRAVIS_PULL_REQUEST_BRANCH}" ]; then
    log "Job is CI for a push, skipping creation of production build"
    exit 0
  fi
  if [ "${TRAVIS_BRANCH}_${TRAVIS_PULL_REQUEST_BRANCH}" != "${TARGET_BRANCH}_${SOURCE_BRANCH}" ]; then
    log "Skipping creation of production build"
    log "We only create production builds for pull requests from '${SOURCE_BRANCH}' to '${TARGET_BRANCH}'"
    log "but this pull request is from '${TRAVIS_PULL_REQUEST BRANCH}' to '${TRAVIS_BRANCH}'"
    exit 0
  fi
  if [ -z "${GITHUB_TOKEN}" ]; then
    log "GITHUB_TOKEN not set: won't be able to push production build"
    log "Please configure the token in .travis.yml or the Travis UI"
    exit 1
  fi
}

create_production_build() {
  yarn build
}

setup_git() {
  git config user.name "${AUTOCOMMIT_NAME}"
  git config user.email "${AUTOCOMMIT_EMAIL}"
  git remote add origin-travis "https://${GITHUB_TOKEN}@github.com/${GITHUB_ORG}/${GITHUB_REPO}.git"
}

commit_build_files() {
  git checkout -b "${AUTOCOMMIT_BRANCH}"
  git add --all build
  echo -e "Travis build: ${TRAVIS_BUILD_NUMBER}\n\nhttps://travis-ci.org/${GITHUB_ORG}/${GITHUB_REPO}/builds/${TRAVIS_BUILD_ID}" | git commit --file -
}

push_to_github() {
  git push origin-travis "${AUTOCOMMIT_BRANCH}:${SOURCE_BRANCH}"
}

ensure_preconditions_met
setup_git
commit_build_files
push_to_github