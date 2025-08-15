# Quick Fixes Cheat Sheet - Mac Development

## 🚨 Emergency Fixes

### Script Won't Run - "bad interpreter"
```bash
perl -pi -e 's/\r\n/\n/g' script.sh
chmod +x script.sh
```

### Permission Denied on Script
```bash
chmod +x script.sh
# If still denied:
xattr -cr script.sh
```

### Git Push Failed - No Remote
```bash
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### SSH Password Keeps Asking
```bash
# Copy your SSH key to server
cat ~/.ssh/id_ed25519.pub | ssh root@SERVER_IP "cat >> ~/.ssh/authorized_keys"
```

### Port Already in Use
```bash
# Find what's using port 3000
lsof -ti:3000
# Kill it
lsof -ti:3000 | xargs kill -9
```

### Can't Connect to VPS
```bash
# Test connection
ssh -v root@SERVER_IP
# Check if SSH key exists
ls -la ~/.ssh/
# Generate if missing
ssh-keygen -t ed25519
```

## 🛠️ Common Tasks

### Deploy to Server (Manual)
```bash
ssh root@SERVER_IP << 'EOF'
cd /path/to/app
git pull
docker-compose restart
EOF
```

### Check If Site Is Up
```bash
curl -I https://your-site.com | head -n 1
```

### View Docker Logs
```bash
ssh root@SERVER_IP 'docker logs -f --tail 100 container-name'
```

### Copy File to Server
```bash
scp local-file.txt root@SERVER_IP:/path/to/destination/
```

### Copy File from Server
```bash
scp root@SERVER_IP:/path/to/file.txt ./local-destination/
```

## 📋 Copy-Paste Commands

### Setup New Project
```bash
mkdir new-project && cd new-project
git init
echo "node_modules/" > .gitignore
echo "# Project Name" > README.md
git add .
git commit -m "Initial commit"
```

### Create GitHub Repo & Push
```bash
# After creating on GitHub
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

### Fix All Permissions
```bash
find . -name "*.sh" -type f -exec chmod +x {} \;
find . -name "*.sh" -type f -exec perl -pi -e 's/\r\n/\n/g' {} \;
```

### SSH Without Password
```bash
# Generate key
ssh-keygen -t ed25519 -C "your-email@example.com"
# Copy to server
ssh-copy-id root@SERVER_IP
# OR manually
cat ~/.ssh/id_ed25519.pub | pbcopy
ssh root@SERVER_IP
echo "PASTE_HERE" >> ~/.ssh/authorized_keys
```

### Quick Server Status
```bash
ssh root@SERVER_IP << 'EOF'
echo "=== Server Status ==="
echo "Disk:" && df -h | grep -E "^/dev/"
echo "Memory:" && free -h | grep Mem
echo "Docker:" && docker ps --format "table {{.Names}}\t{{.Status}}"
EOF
```

## 🎯 VS Code Fixes

### Terminal Not Working
```
Cmd+Shift+P → "Terminal: Select Default Profile" → zsh
```

### Git Not Found
```bash
# Install Xcode tools
xcode-select --install
```

### Extensions Not Loading
```
Cmd+Shift+P → "Developer: Reload Window"
```

## 🔑 Essential Shortcuts

### Terminal
- Clear: `Cmd + K`
- New Tab: `Cmd + T`
- Search History: `Ctrl + R`
- Cancel Command: `Ctrl + C`

### Finder
- Go to Folder: `Cmd + Shift + G`
- Show Hidden: `Cmd + Shift + .`
- Get Info: `Cmd + I`
- Duplicate: `Cmd + D`

### Screenshots
- Full Screen: `Cmd + Shift + 3`
- Selection: `Cmd + Shift + 4`
- Window: `Cmd + Shift + 4` then `Space`
- To Clipboard: Add `Ctrl` to any above

## 🚀 Speed Tips

### Aliases to Add to ~/.zshrc
```bash
# Navigation
alias ..="cd .."
alias ...="cd ../.."
alias ll="ls -la"
alias projects="cd ~/Documents/Projects"

# Git
alias gs="git status"
alias gp="git push"
alias gl="git pull"
alias gc="git commit -m"
alias ga="git add ."

# Docker
alias dps="docker ps"
alias dlog="docker logs -f"
alias dexec="docker exec -it"

# Apply changes
source ~/.zshrc
```

### Create SSH Shortcut
```bash
echo "Host myserver
    HostName SERVER_IP
    User root
    Port 22" >> ~/.ssh/config

# Now just use:
ssh myserver
```

## 📱 Mac-Specific

### Copy to Clipboard
```bash
echo "text" | pbcopy
cat file.txt | pbcopy
```

### Open in Browser
```bash
open https://google.com
open index.html
```

### Open in Finder
```bash
open .
open ~/Documents
```

### Check What's Listening
```bash
lsof -nP -iTCP -sTCP:LISTEN
```

## 🆘 When All Else Fails

### Reset Shell Config
```bash
mv ~/.zshrc ~/.zshrc.backup
cp /etc/zshrc ~/.zshrc
source ~/.zshrc
```

### Reset Git Config
```bash
mv ~/.gitconfig ~/.gitconfig.backup
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Force Quit Application
```
Cmd + Option + Esc → Select App → Force Quit
```

### Restart Terminal
```bash
exec zsh
# OR
source ~/.zshrc
```

## 💡 Remember

1. **Always use absolute paths in scripts**
2. **Test locally before deploying**
3. **Keep backups before major changes**
4. **Use `man command` for help**
5. **Google the exact error message**

---

Keep this handy! Pin it in VS Code or print it out. 🎉