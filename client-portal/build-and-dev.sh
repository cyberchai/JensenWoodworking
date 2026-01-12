#!/bin/bash

# Script to build and run the Next.js development server
# Run this from the client-portal directory

set -e  # Exit on error

echo "Building the project..."
npm run build

echo "Starting development server..."
npm run dev

