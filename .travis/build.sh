#!/usr/bin/env bash

pushd client
CI="" yarn build
rm -rf ../build
mv build ..
popd