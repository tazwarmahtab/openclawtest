# OpenClaw Installation and Usage Guide

## Prerequisites
- Node.js v24.14.0 installed via nvm
- pnpm package manager installed globally
- OpenClaw project built successfully

## Accessing OpenClaw

### Method 1: Using the script from any directory
```bash
/home/coder/workspace/openclaw-rick/openclaw/run-openclaw.sh [command]
```

### Method 2: Using bash alias (permanent)
```bash
# Add this to ~/.bashrc (already done)
alias openclaw="/home/coder/workspace/openclaw-rick/openclaw/run-openclaw.sh"

# Then source the bashrc
source ~/.bashrc

# Now you can run:
openclaw [command]
```

### Method 3: Adding to PATH (best for permanent access)
```bash
# Create symlink in ~/bin
mkdir -p ~/bin
ln -sf /home/coder/workspace/openclaw-rick/openclaw/run-openclaw.sh ~/bin/openclaw

# Add to PATH (already done)
echo 'export PATH="$PATH:$HOME/bin"' >> ~/.bashrc

# Source bashrc
source ~/.bashrc

# Now you can run from anywhere:
openclaw [command]
```

## Basic Commands

### Check OpenClaw status
```bash
openclaw status
```

### List available models
```bash
openclaw models list
```

### Configure OpenClaw (wizard)
```bash
openclaw configure
```

### Start the gateway
```bash
openclaw gateway --port 18789 --bind 0.0.0.0
```

### Open the TUI
```bash
openclaw tui
```

## Your Current Configuration

From the status check:
- **Gateway**: Running locally on ws://127.0.0.1:18789
- **Dashboard**: http://127.0.0.1:18789/
- **Models**: 9 models configured via NVIDIA API
- **Channels**: Telegram enabled and connected
- **Sessions**: 3 active sessions

## Quick Start

To start using OpenClaw:

1. **First, source your bashrc**:
   ```bash
   source ~/.bashrc
   ```

2. **Run the TUI for interactive use**:
   ```bash
   /home/coder/workspace/openclaw-rick/openclaw/run-openclaw.sh tui
   ```

3. **Or start the gateway and use the web interface**:
   ```bash
   /home/coder/workspace/openclaw-rick/openclaw/run-openclaw.sh gateway
   ```
   Then open http://127.0.0.1:18789/ in your browser

## Troubleshooting

If you get "command not found":

```bash
# Try this to reload the environment
source ~/.bashrc

# If still not working, use the full path
/home/coder/workspace/openclaw-rick/openclaw/run-openclaw.sh [command]
```

## Updating OpenClaw

```bash
openclaw update
```

## Resources
- Documentation: https://docs.openclaw.ai/
- CLI help: `openclaw --help`
- Command help: `openclaw [command] --help`

## Health Checks

Run a full diagnostic:
```bash
openclaw doctor
```

Check for security issues:
```bash
openclaw security audit