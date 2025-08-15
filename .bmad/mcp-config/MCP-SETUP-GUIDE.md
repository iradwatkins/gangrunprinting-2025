# MCP (Model Context Protocol) Setup Guide

## Overview
MCP servers extend Claude's capabilities in VS Code/Cursor by providing specialized tools for testing, code analysis, and UI development.

## Prerequisites
- VS Code or Cursor IDE
- Node.js 18+ installed
- Python 3.8+ installed (for Serena)

## MCP Servers Installation

### 1. Playwright MCP Server
**Purpose**: Automated testing and benchmarking

```bash
# Install globally
npm install -g @playwright/mcp@latest

# Verify installation
npx @playwright/mcp@latest --version
```

### 2. Serena MCP Server
**Purpose**: Code analysis and quality checking

```bash
# Install using uvx (Python package runner)
# First ensure pip and uvx are installed
pip install --upgrade pip
pip install uvx

# Test Serena
uvx --from git+https://github.com/oraios/serena serena --help
```

### 3. shadcn-ui MCP Server
**Purpose**: UI component management and generation

```bash
# Install globally
npm install -g @jpisnice/shadcn-ui-mcp-server

# Verify installation
npx @jpisnice/shadcn-ui-mcp-server --version
```

## Configuration Setup

### Step 1: Create MCP Configuration File

**Location**: `~/.cursor/mcp.json` (or `~/.vscode/mcp.json` for VS Code)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {}
    },
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "$(pwd)"
      ],
      "env": {}
    },
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token-here"
      }
    }
  }
}
```

### Step 2: Get GitHub Personal Access Token (for shadcn-ui)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "shadcn-ui MCP"
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
5. Click "Generate token"
6. Copy the token and add it to the mcp.json file

### Step 3: Verify MCP Servers are Working

1. Open VS Code/Cursor
2. Open any project
3. Open Claude chat (Cmd+K)
4. You should see MCP servers listed in the context menu

## VS Code Extensions Setup

### Required Extensions

Install these extensions for the complete setup:

1. **Thunder Client** - API Testing
   ```
   ext install rangav.vscode-thunder-client
   ```

2. **Error Lens** - Inline Error Display
   ```
   ext install usernamehw.errorlens
   ```

3. **Database Client** - PostgreSQL Management
   ```
   ext install cweijan.vscode-database-client2
   ```

4. **DotENV** - Environment File Support
   ```
   ext install mikestead.dotenv
   ```

5. **ES7+ React/Redux/React-Native snippets**
   ```
   ext install dsznajder.es7-react-js-snippets
   ```

### Quick Install All Extensions

Run this in VS Code terminal:
```bash
code --install-extension rangav.vscode-thunder-client
code --install-extension usernamehw.errorlens
code --install-extension cweijan.vscode-database-client2
code --install-extension mikestead.dotenv
code --install-extension dsznajder.es7-react-js-snippets
```

## VS Code Settings Configuration

Add to your VS Code settings.json (`Cmd+Shift+P` → "Open Settings JSON"):

```json
{
  // MCP Integration
  "mcp.enabled": true,
  
  // Error Lens Configuration
  "errorLens.enabled": true,
  "errorLens.fontWeight": "bold",
  "errorLens.fontSize": "12px",
  
  // Terminal Configuration
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.fontSize": 14,
  
  // Editor Configuration
  "editor.formatOnSave": true,
  "editor.fontSize": 14,
  "editor.minimap.enabled": false,
  "editor.wordWrap": "on",
  
  // File Configuration
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.eol": "\n",
  
  // Git Configuration
  "git.autofetch": true,
  "git.confirmSync": false,
  
  // Exclude files from explorer
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true
  }
}
```

## Using MCP Servers

### 1. Playwright (Testing)
In Claude chat:
```
"Use Playwright to test the login functionality of my website"
"Create an automated test for the admin dashboard"
"Benchmark the page load time of my application"
```

### 2. Serena (Code Analysis)
In Claude chat:
```
"Use Serena to analyze code quality in this project"
"Find potential security issues in my codebase"
"Check for code duplication and suggest improvements"
```

### 3. shadcn-ui (UI Components)
In Claude chat:
```
"Use shadcn-ui to create a modern dashboard layout"
"Generate a responsive navigation component"
"Create a data table with sorting and filtering"
```

## Troubleshooting

### MCP Servers Not Showing
1. Restart VS Code/Cursor
2. Check if mcp.json is in the correct location
3. Verify Node.js and Python are installed
4. Check the developer console for errors (Cmd+Shift+P → "Developer: Toggle Developer Tools")

### Permission Issues
```bash
# Fix permissions on Mac
chmod +x $(which npx)
chmod +x $(which uvx)
```

### Serena Not Working
```bash
# Reinstall Python tools
pip uninstall uvx
pip install --upgrade pip
pip install uvx
```

### shadcn-ui Token Issues
1. Ensure your GitHub token hasn't expired
2. Check token has correct permissions
3. Try regenerating the token

## Quick Reference

### Check MCP Status
```bash
# List npm global packages
npm list -g --depth=0

# Check Python packages
pip list | grep uvx
```

### Update MCP Servers
```bash
# Update Playwright
npm update -g @playwright/mcp@latest

# Update shadcn-ui
npm update -g @jpisnice/shadcn-ui-mcp-server

# Update Serena (automatic with uvx)
```

### Uninstall MCP Servers
```bash
# Remove npm packages
npm uninstall -g @playwright/mcp @jpisnice/shadcn-ui-mcp-server

# Remove Python packages
pip uninstall uvx
```

## BMAD Method Integration

The MCP servers support the BMAD (Benchmark, Model, Analyze, Deliver) workflow:

1. **Benchmark**: Use Playwright for performance testing
2. **Model**: Use shadcn-ui for rapid UI prototyping
3. **Analyze**: Use Serena for code quality analysis
4. **Deliver**: Combine all tools for production-ready code

## Summary

With MCP servers configured:
- ✅ Automated testing with Playwright
- ✅ Code quality analysis with Serena
- ✅ Rapid UI development with shadcn-ui
- ✅ Enhanced Claude capabilities in your IDE
- ✅ Integrated BMAD workflow support

Remember to restart VS Code/Cursor after configuration changes!