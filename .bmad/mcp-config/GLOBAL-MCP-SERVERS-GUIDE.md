# Global MCP Servers Installation Guide

## Overview
These are additional MCP servers that extend Claude's capabilities for web research, scraping, documentation, and security scanning.

## API Keys Required

Several of these MCP servers require API keys:

### 1. **Exa MCP** - Requires API Key
- **Sign up at**: https://exa.ai
- **Free tier**: Available
- **Used for**: Intelligent web searches and research

### 2. **Firecrawl MCP** - Requires API Key
- **Sign up at**: https://firecrawl.dev
- **Free tier**: 500 pages/month
- **Used for**: Web scraping and content extraction

### 3. **Pieces MCP** - Requires API Key
- **Sign up at**: https://pieces.app
- **Free tier**: Available
- **Used for**: Code snippet management

### 4. **Context7 MCP** - May Require API Key
- **Sign up at**: https://context7.ai (if required)
- **Used for**: Up-to-date library documentation

### 5. **ref-tools MCP** - No API Key Required
- **Used for**: Documentation lookup

### 6. **Semgrep MCP** - No API Key Required (for local scanning)
- **Optional**: Semgrep Cloud API for advanced features
- **Used for**: Security scanning

## Installation Instructions

### Step 1: Install Each MCP Server

```bash
# Exa MCP
npm install -g @exa/mcp-server

# Firecrawl MCP
npm install -g @firecrawl/mcp-server

# ref-tools MCP
npm install -g @reftools/mcp-server

# Pieces MCP
npm install -g @pieces/mcp-server

# context7 MCP
npm install -g @context7/mcp-server

# Semgrep MCP
npm install -g @semgrep/mcp-server
# Also install Semgrep CLI
pip install semgrep
```

### Step 2: Update MCP Configuration

Add these servers to your `~/.cursor/mcp.json` (or `~/.vscode/mcp.json`):

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
    },
    "exa": {
      "command": "npx",
      "args": ["@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "your-exa-api-key-here"
      }
    },
    "firecrawl": {
      "command": "npx",
      "args": ["@firecrawl/mcp-server"],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-api-key-here"
      }
    },
    "ref-tools": {
      "command": "npx",
      "args": ["@reftools/mcp-server"],
      "env": {}
    },
    "pieces": {
      "command": "npx",
      "args": ["@pieces/mcp-server"],
      "env": {
        "PIECES_API_KEY": "your-pieces-api-key-here"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "your-context7-api-key-if-required"
      }
    },
    "semgrep": {
      "command": "npx",
      "args": ["@semgrep/mcp-server"],
      "env": {
        "SEMGREP_APP_TOKEN": "optional-for-cloud-features"
      }
    }
  }
}
```

## Getting API Keys

### Exa AI
1. Go to https://exa.ai
2. Click "Sign Up" or "Get Started"
3. Create account
4. Navigate to API Keys section
5. Generate new API key
6. Copy and save securely

### Firecrawl
1. Go to https://firecrawl.dev
2. Click "Start for Free"
3. Create account
4. Go to Dashboard → API Keys
5. Create new API key
6. Copy and save (you get 500 free pages/month)

### Pieces
1. Download Pieces app from https://pieces.app
2. Create account in the app
3. Go to Settings → Developers → API Keys
4. Generate API key
5. Copy to configuration

### Context7 (if required)
1. Visit https://context7.ai
2. Check if API key is required
3. Sign up if necessary
4. Generate API key from dashboard

### Semgrep Cloud (optional)
1. Go to https://semgrep.dev
2. Sign up for free account
3. Go to Settings → Access Tokens
4. Create new token
5. This is optional - local scanning works without it

## Usage Examples

### Exa MCP - Web Search
```
"Use Exa to search for the latest React 19 features"
"Research best practices for PostgreSQL performance tuning"
```

### Firecrawl MCP - Web Scraping
```
"Use Firecrawl to scrape the documentation from https://example.com"
"Extract all the pricing information from this competitor's website"
```

### ref-tools MCP - Documentation
```
"Use ref-tools to look up the Node.js fs.readFile documentation"
"Find the PostgreSQL CREATE INDEX syntax"
```

### Pieces MCP - Snippet Management
```
"Use Pieces to save this authentication middleware snippet"
"Find my saved React hook snippets"
```

### Context7 MCP - Library Docs
```
"Use context7 to get the latest Next.js 14 app router documentation"
"Look up the current Tailwind CSS utility classes"
```

### Semgrep MCP - Security Scanning
```
"Use Semgrep to scan this file for security vulnerabilities"
"Check for SQL injection vulnerabilities in the codebase"
```

## Troubleshooting

### NPM Package Not Found
Some of these packages might have different names or not be published yet. Try:

1. Search npm directly:
```bash
npm search mcp exa
npm search mcp firecrawl
```

2. Check GitHub for official repositories
3. Some might require building from source

### API Key Issues
- Ensure keys are correctly quoted in JSON
- Check for trailing spaces
- Verify key permissions on the service dashboard

### MCP Server Not Showing
1. Restart VS Code/Cursor after configuration
2. Check developer console for errors
3. Verify npm package is installed globally

## Alternative Installation Methods

If npm packages aren't available, some MCP servers might need to be installed from source:

```bash
# Example for building from source
git clone https://github.com/organization/mcp-server-name
cd mcp-server-name
npm install
npm run build
npm link
```

## Security Notes

1. **Never commit API keys** to version control
2. Consider using environment variables:
   ```bash
   export EXA_API_KEY="your-key"
   export FIRECRAWL_API_KEY="your-key"
   ```
3. Rotate API keys regularly
4. Use read-only keys when possible

## Free Tier Limits

- **Exa**: Check current limits on signup
- **Firecrawl**: 500 pages/month free
- **Pieces**: Free for personal use
- **Context7**: Check current offering
- **ref-tools**: Unlimited (local)
- **Semgrep**: Unlimited local scanning

---

**Note**: Some of these MCP servers might be in development or have different package names. Check the official MCP registry or GitHub for the most up-to-date installation instructions.