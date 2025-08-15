# MCP Setup Package

This folder contains everything you need to set up MCP (Model Context Protocol) servers and VS Code extensions for enhanced development with Claude.

## 📁 Contents

### Files Included:
1. **`MCP-SETUP-GUIDE.md`** - Basic MCP installation guide
2. **`GLOBAL-MCP-SERVERS-GUIDE.md`** - Advanced MCP servers guide
3. **`mcp.json`** - Basic MCP configuration (3 servers)
4. **`mcp-complete.json`** - Complete MCP configuration (9 servers)
5. **`install-mcp.sh`** - Basic installation script
6. **`install-all-mcp.sh`** - Complete installation script (all servers)
7. **`vs-code-settings.json`** - Recommended VS Code settings
8. **`README.md`** - This file

## 🚀 Quick Setup

### Option 1: Complete Installation (All 9 MCP Servers)
```bash
cd download/mcp-setup
./install-all-mcp.sh
```

### Option 2: Basic Installation (3 Core Servers)
```bash
cd download/mcp-setup
./install-mcp.sh
```

This will:
- Check prerequisites (Node.js 18+, Python 3.8+)
- Install all MCP servers
- Copy configuration to the correct location
- Install VS Code extensions (if VS Code CLI is available)

### Option 3: Manual Installation
Follow the steps in `MCP-SETUP-GUIDE.md` and `GLOBAL-MCP-SERVERS-GUIDE.md`

## 📋 What Gets Installed

### Core MCP Servers (Basic Install):
1. **Playwright** - Automated testing and benchmarking
2. **Serena** - Code analysis and quality checking
3. **shadcn-ui** - UI component generation

### Additional MCP Servers (Complete Install):
4. **Exa** - Intelligent web searches (requires API key)
5. **Firecrawl** - Web scraping and content extraction (requires API key)
6. **ref-tools** - Documentation lookup
7. **Pieces** - Code snippet management (requires API key)
8. **context7** - Up-to-date library documentation
9. **Semgrep** - Security scanning

### VS Code Extensions:
1. **Thunder Client** - API testing tool
2. **Error Lens** - Inline error display
3. **Database Client** - PostgreSQL management
4. **DotENV** - Environment file support
5. **ES7+ React Snippets** - Code snippets

## ⚙️ Configuration Steps

### 1. Get GitHub Token (Required for shadcn-ui)
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`
4. Copy the token

### 2. Update Configuration
Edit `~/.cursor/mcp.json` (or `~/.vscode/mcp.json`):
```json
"GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
```

### 3. Apply VS Code Settings
1. Open VS Code settings: `Cmd+Shift+P` → "Open Settings (JSON)"
2. Merge the contents of `vs-code-settings.json`

### 4. Restart Your IDE
Close and reopen VS Code/Cursor for changes to take effect

## 🧪 Testing MCP Servers

Open Claude chat (`Cmd+K`) and try:

**Playwright:**
```
"Use Playwright to test my login page"
```

**Serena:**
```
"Use Serena to analyze code quality"
```

**shadcn-ui:**
```
"Use shadcn-ui to create a dashboard layout"
```

## 🔧 Troubleshooting

### MCP servers not showing up:
1. Check if `mcp.json` is in the right location
2. Restart your IDE
3. Check developer console for errors

### Installation failed:
1. Ensure Node.js 18+ is installed: `node -v`
2. Ensure Python 3.8+ is installed: `python3 --version`
3. Try manual installation from the guide

### Permission issues:
```bash
chmod +x install-mcp.sh
```

## 📚 Documentation

For detailed information, see:
- `MCP-SETUP-GUIDE.md` - Complete documentation
- Individual MCP server repositories for advanced usage

## 🎯 BMAD Workflow Integration

These tools support the BMAD method:
- **B**enchmark: Playwright for performance testing
- **M**odel: shadcn-ui for UI prototyping
- **A**nalyze: Serena for code quality
- **D**eliver: All tools combined for production code

---

Need help? Check the MCP-SETUP-GUIDE.md for detailed troubleshooting!