#!/bin/bash

echo "Setting up test environment..."

# Install dependencies
npm install

# Link the main package
cd ..
npm install
npm link
cd killportall-project-test
npm link killportall

# Make test scripts executable
chmod +x test-all.sh

echo "Test environment setup completed!" 