#!/usr/bin/env bash

(cd server; yarn install)
(cd client; yarn install; yarn run css:build)