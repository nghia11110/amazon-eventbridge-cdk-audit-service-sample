#!/bin/bash

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

set -euo pipefail

echo "********************************************"
echo "* Executing build for phoenix *"
echo "********************************************"
echo ;

echo "Building main project..."
tsc
echo -e "Done.\n"

echo "Executing unit tests..."
npm test
echo -e "Done.\n"

echo "Building AWS Lambda functions"
cd lib/lambda/

cd call-ac-api
echo "- call-ac-api"
echo "  - Installing dependencies..."
npm ci
echo "  - Done."
echo "  - Compiling Typescript files..."
npm run build
echo "  - Done."
echo "  - Executing unit tests..."
npm test


echo "********************************************"
echo "* Success                                  *"
echo "********************************************"
