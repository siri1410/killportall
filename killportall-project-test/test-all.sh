#!/bin/bash

# Exit on error
set -e

echo "Starting comprehensive killportall tests..."

# Function to cleanup processes
cleanup() {
    echo "Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
    exit
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# Start test servers
node test-servers.js &
SERVER_PID=$!

# Wait for servers to start
sleep 2

# Verify killportall is available
if ! command -v killportall &> /dev/null; then
    echo "Error: killportall command not found. Please run 'npm run setup' first."
    exit 1
fi

echo "1. Testing single port..."
killportall 3000 || echo "Test 1 failed"

echo "2. Testing multiple ports..."
killportall 3000 3001 || echo "Test 2 failed"

echo "3. Testing with JSON output..."
killportall 3000 --json || echo "Test 3 failed"

echo "4. Testing with retries..."
killportall 3001 --retries 5 || echo "Test 4 failed"

echo "5. Testing with custom timeout..."
killportall 3002 --timeout 2000 || echo "Test 5 failed"

echo "6. Testing port range..."
killportall 3000-3002 || echo "Test 6 failed"

echo "Tests completed!"