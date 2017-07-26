#!/usr/bin/env bash

(cd client; CI=true yarn lint)
(cd client; CI=true yarn test)