# Self-Maintenance Skill

## Description

Enables OpenClaw to maintain and upgrade itself via Telegram commands. This skill provides safe, automated self-updating capabilities with approval gates for destructive operations.

---

## Triggers

### Command Triggers

- `/upgrade` - Pull latest changes and restart gateway
- `/check-updates` - Check for available updates without applying
- `/rollback` - Rollback to previous version
- `/status` - Show system health and version info
- `/restart` - Restart the gateway service
- `/logs [n]` - Show last n lines of logs (default: 50)

### Natural Language Triggers

- "pull the latest changes and restart"
- "check for updates"
- "upgrade openclaw to the latest version"
- "show me the logs"
- "what's the current version"
- "restart the gateway"

---

## Capabilities

### 1. Version Check

```yaml
check_version:
  description: "Check current OpenClaw version and compare with remote"
  steps:
    - action: exec
      command: "git describe --tags --always"
      cwd: "${OPENCLAW_DIR}"
    - action: exec
      command: "git fetch origin && git log HEAD..origin/main --oneline"
      cwd: "${OPENCLAW_DIR}"
    - action: respond
      message: |
        📊 **Version Status**
        Current: ${current_version}
        Behind by: ${commits_behind} commits

        Available updates:
        ${commit_list}
```

### 2. Safe Upgrade

```yaml
safe_upgrade:
  description: "Pull latest changes with safety checks"
  steps:
    - action: ask
      message: "🔄 Ready to upgrade OpenClaw. This will:\n• git pull origin main\n• npm install (if needed)\n• restart gateway\n\nProceed?"
      options: ["Yes, upgrade", "No, cancel"]

    - condition: "${response} == 'Yes, upgrade'"
      steps:
        - action: exec
          command: "git status --porcelain"
          cwd: "${OPENCLAW_DIR}"

        - condition: "${git_status} != ''"
          steps:
            - action: exec
              command: "git stash push -m 'pre-upgrade-stash'"
              cwd: "${OPENCLAW_DIR}"

        - action: exec
          command: "git pull origin main"
          cwd: "${OPENCLAW_DIR}"

        - action: check_file_changed
          file: "package.json"
          cwd: "${OPENCLAW_DIR}"

        - condition: "${package_changed}"
          steps:
            - action: exec
              command: "pnpm install"
              cwd: "${OPENCLAW_DIR}"

        - action: exec
          command: "pnpm build"
          cwd: "${OPENCLAW_DIR}"

        - action: exec
          command: "pm2 restart openclaw-gateway"

        - action: respond
          message: |
            ✅ **Upgrade Complete!**

            Previous version: ${old_version}
            New version: ${new_version}

            Changes applied:
            • Pulled ${commits_pulled} commits
            • ${package_changed ? 'Dependencies updated' : 'No dependency changes'}
            • Gateway restarted

            Stashed changes: ${had_stash ? 'Yes (run /stash-pop to restore)' : 'No'}
```

### 3. Rollback

```yaml
rollback:
  description: "Rollback to previous version"
  steps:
    - action: exec
      command: "git reflog -10"
      cwd: "${OPENCLAW_DIR}"

    - action: ask
      message: |
        ⏪ **Rollback Options**

        Recent commits:
        ${reflog_output}

        Enter the reflog index to rollback to (e.g., HEAD@{1})
      input_type: "text"

    - action: exec
      command: "git reset --hard ${selected_ref}"
      cwd: "${OPENCLAW_DIR}"

    - action: exec
      command: "pm2 restart openclaw-gateway"

    - action: respond
      message: "✅ Rolled back to ${selected_ref}. Gateway restarted."
```

### 4. Health Check

```yaml
health_check:
  description: "Comprehensive system health check"
  steps:
    - action: exec
      command: "pm2 status"

    - action: exec
      command: "openclaw channels status --profile dev"

    - action: exec
      command: "df -h /"

    - action: exec
      command: "free -m"

    - action: respond
      message: |
        🏥 **System Health Report**

        **Gateway Status:** ${gateway_status}
        **Uptime:** ${uptime}
        **Memory:** ${memory_usage}MB / ${total_memory}MB
        **Disk:** ${disk_usage}% used

        **Channels:**
        ${channel_status}

        **Issues:** ${issues_count}
```

### 5. Log Viewer

````yaml
view_logs:
  description: "View recent logs"
  parameters:
    lines:
      type: number
      default: 50
      max: 500
  steps:
    - action: exec
      command: "pm2 logs openclaw-gateway --lines ${lines} --nostream"

    - action: respond
      message: |
        📋 **Last ${lines} Log Lines**

        ```
        ${log_output}
        ```
````

---

## Safety Gates

### Approval Required For

- `git reset --hard` - Destructive operation
- `rm -rf` - File deletion
- `npm uninstall` - Package removal
- `pm2 delete` - Process deletion
- Any command with `sudo`

### Whitelisted (No Approval)

- `git status`
- `git pull`
- `git fetch`
- `git log`
- `npm install` / `pnpm install`
- `npm run build` / `pnpm build`
- `pm2 restart`
- `pm2 status`
- `pm2 logs`

### Blacklisted (Never Allowed)

- `rm -rf /`
- `sudo rm`
- `chmod 777`
- `curl | bash` (untrusted sources)
- Any command targeting files outside project directory

---

## Configuration

### Environment Variables

```bash
OPENCLAW_DIR=/home/user/openclaw-rick/openclaw
BACKUP_DIR=/home/user/openclaw-backups
LOG_DIR=/var/log/openclaw
```

### Skill Settings

```yaml
self_maintenance:
  enabled: true
  auto_backup: true
  backup_before_upgrade: true
  max_rollbacks: 5
  approval_mode: ask # ask, whitelist, or all
  notify_on_upgrade: true
  notify_on_failure: true
```

---

## Telegram Command Reference

| Command           | Description             | Approval Required |
| ----------------- | ----------------------- | ----------------- |
| `/upgrade`        | Pull latest and restart | Yes               |
| `/check-updates`  | Check for updates       | No                |
| `/rollback [ref]` | Rollback to previous    | Yes               |
| `/status`         | System health check     | No                |
| `/restart`        | Restart gateway         | Yes               |
| `/logs [n]`       | View last n logs        | No                |
| `/stash-pop`      | Restore stashed changes | No                |
| `/backup`         | Create backup           | No                |
| `/restore [id]`   | Restore from backup     | Yes               |

---

## Example Telegram Conversation

```
User: /check-updates

Bot: 📊 Version Status
Current: v2026.2.26-938-g7ec6be0b9
Behind by: 3 commits

Available updates:
• Fix memory leak in gateway
• Add new NVIDIA models
• Update dependencies

User: /upgrade

Bot: 🔄 Ready to upgrade OpenClaw. This will:
• git pull origin main
• npm install (if needed)
• restart gateway

Proceed?
[Yes, upgrade] [No, cancel]

User: [Yes, upgrade]

Bot: ⏳ Upgrading...
✅ git pull: 3 commits pulled
✅ pnpm install: 2 packages updated
✅ pnpm build: success
✅ Gateway restarted

Previous: v2026.2.26-938-g7ec6be0b9
New: v2026.2.26-941-g8f3a2c1

Upgrade complete! 🎉
```

---

## Error Handling

### Git Conflicts

```yaml
on_conflict:
  steps:
    - action: respond
      message: |
        ⚠️ **Merge Conflict Detected**

        The following files have conflicts:
        ${conflict_files}

        Options:
        1. /resolve-ours - Keep local changes
        2. /resolve-theirs - Accept remote changes
        3. /abort - Cancel upgrade

        Manual resolution recommended.
```

### Build Failures

```yaml
on_build_failure:
  steps:
    - action: respond
      message: |
        ❌ **Build Failed**

        Error:
        ${build_error}

        Rolling back to last working version...

    - action: exec
      command: "git reset --hard HEAD"

    - action: exec
      command: "pm2 restart openclaw-gateway"
```

### Service Down

```yaml
on_service_down:
  steps:
    - action: exec
      command: "pm2 restart openclaw-gateway"

    - action: respond
      message: |
        ⚠️ **Gateway was down - Restarted**

        If this keeps happening, check logs with /logs
```

---

## Integration with ECC

This skill integrates with:

- **Self-Healing Engine**: Automatic recovery from failures
- **Rick Agent**: Personality-driven responses
- **NVIDIA NIM**: AI-powered decision making
- **Telegram Channel**: Remote control interface

---

## Installation

```bash
# Copy skill to OpenClaw skills directory
mkdir -p ~/.openclaw-dev/skills
cp self-maintenance.md ~/.openclaw-dev/skills/

# Enable the skill
openclaw config set skills.self_maintenance.enabled true --profile dev

# Restart gateway
pm2 restart openclaw-gateway
```
