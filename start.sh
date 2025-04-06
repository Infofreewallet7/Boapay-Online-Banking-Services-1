#!/bin/bash

# Start the server with optimized settings
NODE_ENV=development NODE_OPTIONS="--max-old-space-size=512" tsx server/index.ts