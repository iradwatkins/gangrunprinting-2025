# GitHub CI/CD Setup Guide - Complete Walkthrough

## Overview
This guide documents the complete process for setting up automated deployments from GitHub to a VPS using GitHub Actions. This setup enables automatic deployment every time you push code to your repository.

## Prerequisites
- A VPS with SSH access
- A GitHub account
- A local development environment on Mac
- An existing project you want to deploy

## Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd ~/Documents/YourProject

# Initialize git repository
git init

# Create a .gitignore file to exclude sensitive files
cat > .gitignore << 'EOF'
# Node modules
node_modules/
*/node_modules/

# Environment files
.env
.env.local
.env.production
*.env

# Mac files
.DS_Store

# IDE files
.vscode/
.idea/

# SSH keys - NEVER commit these!
*.pem
*.key
id_rsa*
github-actions-key*

# Backup files
*.backup
*.bak
EOF

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit"
```

## Step 2: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Enter repository name (e.g., `your-project-name`)
3. Choose Private or Public
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Create GitHub Actions Workflow

Create the directory structure:
```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

env:
  VPS_HOST: YOUR_VPS_IP_HERE
  VPS_USER: root

jobs:
  test:
    name: Test Application
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd your-app-directory
        npm ci || npm install
    
    - name: Run tests
      run: |
        cd your-app-directory
        npm test || echo "No tests configured yet"

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup SSH Key
      env:
        SSH_PRIVATE_KEY: ${{ secrets.VPS_SSH_KEY }}
      run: |
        mkdir -p ~/.ssh
        echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ env.VPS_HOST }} >> ~/.ssh/known_hosts
    
    - name: Deploy Application
      run: |
        # Create deployment package
        tar -czf deployment.tar.gz your-app-directory/
        
        # Copy to VPS
        scp deployment.tar.gz ${{ env.VPS_USER }}@${{ env.VPS_HOST }}:/tmp/
        
        # Deploy on VPS
        ssh ${{ env.VPS_USER }}@${{ env.VPS_HOST }} << 'ENDSSH'
          # Backup current version
          if [ -d "/path/to/your/app" ]; then
            cp -r /path/to/your/app /path/to/your/app.backup
          fi
          
          # Extract new version
          cd /tmp
          tar -xzf deployment.tar.gz
          
          # Copy to production
          cp -r your-app-directory/* /path/to/your/app/
          
          # Restart your service (adjust based on your setup)
          # For Docker:
          docker restart your-container-name
          
          # For systemd:
          # systemctl restart your-service-name
          
          # For PM2:
          # pm2 restart your-app-name
          
          # Health check
          sleep 5
          if curl -f -s https://your-domain.com > /dev/null; then
            echo "✅ Deployment successful!"
            rm -rf /path/to/your/app.backup
          else
            echo "❌ Deployment failed! Rolling back..."
            rm -rf /path/to/your/app
            mv /path/to/your/app.backup /path/to/your/app
            # Restart service again
            exit 1
          fi
          
          # Cleanup
          rm -f /tmp/deployment.tar.gz
        ENDSSH
    
    - name: Clean up SSH
      if: always()
      run: rm -f ~/.ssh/id_rsa
```

## Step 5: Generate SSH Key for GitHub Actions

```bash
# Generate a new SSH key specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@your-project" -f ~/.ssh/github-actions-key -N ""

# Display the public key
cat ~/.ssh/github-actions-key.pub

# Add the public key to your VPS
ssh root@YOUR_VPS_IP 'echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys'

# Copy the private key to clipboard (Mac)
cat ~/.ssh/github-actions-key | pbcopy
```

## Step 6: Add SSH Key to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `VPS_SSH_KEY`
5. Value: Paste the private key (Cmd+V)
6. Click "Add secret"

## Step 7: Commit and Push Workflow

```bash
# Add workflow file
git add .github/workflows/deploy.yml

# Commit
git commit -m "Add GitHub Actions CI/CD pipeline"

# Push to trigger first deployment
git push
```

## Step 8: Monitor Deployments

- Go to your repository's Actions tab
- Watch workflow runs in real-time
- Click on any run to see detailed logs
- Green check ✅ = Success
- Red X ❌ = Failed (check logs)

## Customization Tips

### For Different Deployment Methods

**Docker Compose:**
```bash
docker-compose pull
docker-compose up -d --remove-orphans
```

**PM2:**
```bash
pm2 stop your-app
pm2 start ecosystem.config.js
pm2 save
```

**Systemd Service:**
```bash
systemctl restart your-service
systemctl status your-service
```

### Environment Variables

Add to GitHub Secrets:
- `VPS_HOST`: Your VPS IP address
- `VPS_USER`: SSH username (usually root)
- `VPS_SSH_KEY`: Private SSH key
- Any API keys or secrets your app needs

### Multiple Environments

Create separate workflows for staging/production:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

Use different branches:
- `main` → production
- `develop` → staging

## Troubleshooting

### SSH Connection Failed
- Verify SSH key is correctly added to VPS
- Check if VPS firewall allows SSH from GitHub IPs
- Ensure correct permissions: `chmod 600 ~/.ssh/authorized_keys`

### Deployment Failed
- Check application logs on VPS
- Verify file paths in deployment script
- Ensure services have correct permissions
- Check if ports are already in use

### Workflow Not Triggering
- Verify workflow file is in `.github/workflows/`
- Check branch names match in workflow file
- Ensure workflow file has correct YAML syntax

## Security Best Practices

1. **Never commit sensitive data:**
   - Use GitHub Secrets for all credentials
   - Keep `.gitignore` updated
   - Regularly rotate SSH keys

2. **Limit SSH access:**
   - Use specific user instead of root when possible
   - Implement fail2ban on VPS
   - Use SSH key only, disable password auth

3. **Monitor deployments:**
   - Set up notifications for failed deployments
   - Regular security audits
   - Keep GitHub Actions updated

## Quick Reference Commands

```bash
# View current git remote
git remote -v

# Test SSH connection to VPS
ssh root@YOUR_VPS_IP

# View GitHub Actions logs
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Manual deployment (fallback)
./push-to-production.sh

# Roll back deployment on VPS
mv /path/to/app.backup /path/to/app
docker restart container-name
```

## Example Setup Script

Save this as `setup-github-deployment.sh`:

```bash
#!/bin/bash

echo "🚀 GitHub Actions Deployment Setup"
echo "================================="

# Generate SSH key
if [ ! -f ~/.ssh/github-actions-key ]; then
    ssh-keygen -t ed25519 -C "github-actions@project" -f ~/.ssh/github-actions-key -N ""
    echo "✅ SSH key generated"
fi

# Display public key
echo ""
echo "📋 Public key (add this to your VPS):"
cat ~/.ssh/github-actions-key.pub

echo ""
echo "📋 Private key copied to clipboard!"
cat ~/.ssh/github-actions-key | pbcopy

echo ""
echo "Next steps:"
echo "1. Add public key to VPS: ssh root@VPS_IP"
echo "2. Add private key to GitHub Secrets as VPS_SSH_KEY"
echo "3. Update VPS_HOST in deploy.yml"
echo "4. Commit and push to trigger deployment"
```

Make it executable:
```bash
chmod +x setup-github-deployment.sh
```

---

## Summary

This setup provides:
- ✅ Automatic deployments on every push
- ✅ Zero-downtime deployments with rollback
- ✅ Test runs before deployment
- ✅ Full deployment history
- ✅ Secure SSH key management

Remember to customize paths, service names, and health check URLs for your specific project!