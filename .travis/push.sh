#!/usr/bin/env bash

set -euo pipefail

readonly GITHUB_ORG="${GITHUB_ORG:-Azure}"
readonly GITHUB_REPO="${GITHUB_REPO:-ibex-dashboard}"
readonly TARGET_BRANCH="${TARGET_BRANCH:-master}"
# readonly SOURCE_BRANCH="${SOURCE_BRANCH:-ibex-version-1.0}"

readonly AUTOCOMMIT_NAME="Travis CI"
readonly AUTOCOMMIT_EMAIL="travis@travis-ci.org"
readonly AUTOCOMMIT_BRANCH="temp"

log() {
  echo "$@" >&2
}

ensure_preconditions_met() {

  log "TRAVIS_BRANCH: ${TRAVIS_BRANCH}"
  log "TRAVIS_PULL_REQUEST: ${TRAVIS_PULL_REQUEST}"
  log "TRAVIS_PULL_REQUEST_BRANCH: ${TRAVIS_PULL_REQUEST_BRANCH}"
  log "TRAVIS_COMMIT: ${TRAVIS_COMMIT}"
  log "TRAVIS_COMMIT_MESSAGE: ${TRAVIS_COMMIT_MESSAGE}"
  log "TRAVIS_COMMIT_RANGE: ${TRAVIS_COMMIT_RANGE}"
  log "TRAVIS_BUILD_NUMBER: ${TRAVIS_BUILD_NUMBER}"
  
  # get last commit comment
  ORIGINAL_COMMIT_ID="$(echo ${TRAVIS_COMMIT_RANGE} | cut -d '.' -f4)"
  log "ORIGINAL_COMMIT_ID: ${ORIGINAL_COMMIT_ID}"
  ORIGINAL_COMMIT_MESSAGE=$(git log --format=%B -n 1 $ORIGINAL_COMMIT_ID)
  log "ORIGINAL_COMMIT_MESSAGE: ${ORIGINAL_COMMIT_MESSAGE}"

  # If last commit was by travis build, ignore and don't push
  if [ "${ORIGINAL_COMMIT_MESSAGE}" == "Travis build: "* ]; then
    log "Last commit by Travis CI - Ignoring and existing"
    exit 0
  fi

  if [ -z "${TRAVIS_PULL_REQUEST_BRANCH}" ]; then
    log "Job is CI for a push, skipping creation of production build"
    exit 0
  fi

  # Only if push is to master branch, include a build
  if [ "${TRAVIS_BRANCH}" != "${TARGET_BRANCH}" ]; then
    log "Skipping creation of production build"
    log "We only create production builds for pull requests to '${TARGET_BRANCH}'"
    log "but this pull request is to '${TRAVIS_BRANCH}'"
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
  git add --all -f build
  echo -e "Travis build: ${TRAVIS_BUILD_NUMBER}\n\nhttps://travis-ci.org/${GITHUB_ORG}/${GITHUB_REPO}/builds/${TRAVIS_BUILD_ID}" | git commit --file -
}

push_to_github() {
  git push origin-travis "${AUTOCOMMIT_BRANCH}:${TRAVIS_PULL_REQUEST_BRANCH}"
}

ensure_preconditions_met
create_production_build
setup_git
commit_build_files
push_to_github