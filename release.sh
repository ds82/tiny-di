#!/bin/bash

gulp set-version --version $1
git add package.json
git commit -m "npm: bump to v$1"
git tag v$1
