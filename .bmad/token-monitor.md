# Token Usage Monitor for Claude Code

## Quick Setup
Add this to your CLAUDE.md file under the BMAD activation section:

```markdown
## 🔔 TOKEN MONITORING ACTIVE
- Check token usage every 10 responses
- Alert at 100,000 tokens with 5 system beeps
- Alert at 150,000 tokens with 3 beeps  
- Alert at 180,000 tokens with rapid beeps (DANGER ZONE)
- When alert triggers, MUST run: `*token-alert` command
```

## Commands to Add to BMAD Orchestrator

```yaml
commands:
  token-check: Show current token usage estimate
  token-alert: Play system alert sounds based on usage
  token-status: Display detailed token consumption breakdown
```

## Alert Implementation

When token usage exceeds thresholds, execute this bash command:

### For macOS (5 beeps at 100k):
```bash
# 100k tokens alert (5 beeps)
for i in {1..5}; do afplay /System/Library/Sounds/Ping.aiff; sleep 0.5; done

# Alternative using terminal bell
for i in {1..5}; do printf '\a'; sleep 0.5; done

# Or using osascript for volume control
osascript -e 'set volume output volume 70'
for i in {1..5}; do osascript -e 'beep'; sleep 0.5; done
```

### Token Check Reminder
Add to every 10th response:
"📊 Token Usage: ~[ESTIMATE]k / [LIMIT]k ([PERCENTAGE]%)"

## Auto-Check Script
Create this file as `check-tokens.sh`:

```bash
#!/bin/bash
# This is a mock - Claude will need to track internally
TOKENS=$1
LIMIT=$2

if [ $TOKENS -gt 180000 ]; then
    echo "🚨 CRITICAL: $TOKENS tokens used!"
    for i in {1..10}; do printf '\a'; sleep 0.2; done
elif [ $TOKENS -gt 150000 ]; then  
    echo "⚠️ WARNING: $TOKENS tokens used!"
    for i in {1..3}; do printf '\a'; sleep 0.5; done
elif [ $TOKENS -gt 100000 ]; then
    echo "🔔 ALERT: $TOKENS tokens used!"  
    for i in {1..5}; do printf '\a'; sleep 0.5; done
fi
```

## Implementation Note
Since Claude cannot directly access its token count via API, the monitoring needs to be:
1. Based on estimates (characters * 0.25 for rough token count)
2. Manually triggered with commands
3. Added as reminders in responses