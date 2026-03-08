#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Change to OpenClaw directory
cd /home/coder/workspace/openclaw-rick/openclaw

# Run OpenClaw with provided arguments
pnpm openclaw "$@"