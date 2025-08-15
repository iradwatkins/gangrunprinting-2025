# API Keys Checklist for MCP Servers

## Required API Keys

Check off each API key as you obtain it:

### Core Servers
- [ ] **GitHub Personal Access Token** (shadcn-ui)
  - URL: https://github.com/settings/tokens
  - Scopes needed: `repo`, `read:org`
  - Add to: `GITHUB_PERSONAL_ACCESS_TOKEN`

### Global Servers
- [ ] **Exa API Key**
  - URL: https://exa.ai
  - Sign up for free account
  - Add to: `EXA_API_KEY`

- [ ] **Firecrawl API Key**
  - URL: https://firecrawl.dev
  - Free tier: 500 pages/month
  - Add to: `FIRECRAWL_API_KEY`

- [ ] **Pieces API Key**
  - URL: https://pieces.app
  - Download app first
  - Add to: `PIECES_API_KEY`

- [ ] **Context7 API Key** (if required)
  - URL: https://context7.ai
  - Check if needed
  - Add to: `CONTEXT7_API_KEY`

- [ ] **Semgrep Token** (optional)
  - URL: https://semgrep.dev
  - Only for cloud features
  - Add to: `SEMGREP_APP_TOKEN`

## How to Add Keys

1. Open `~/.cursor/mcp.json` (or `~/.vscode/mcp.json`)
2. Find the server section
3. Replace `"your-xxx-key-here"` with your actual key
4. Save the file
5. Restart VS Code/Cursor

## Example

```json
"shadcn-ui": {
  "command": "npx",
  "args": ["@jpisnice/shadcn-ui-mcp-server"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_actualTokenHere123"
  }
}
```

## Security Tips

1. **Never share** these API keys
2. **Never commit** them to Git
3. **Rotate regularly** if exposed
4. **Use minimal permissions** when possible
5. **Store securely** in password manager

## Testing Your Keys

After adding all keys:

1. Restart VS Code/Cursor
2. Open Claude chat (Cmd+K)
3. Test each server:
   - "Use Exa to search for React tutorials"
   - "Use Firecrawl to scrape example.com"
   - "Use shadcn-ui to create a button"

## Troubleshooting

If a server doesn't work:
- Check for typos in the key
- Verify key hasn't expired
- Check API dashboard for usage limits
- Look at VS Code Developer Console for errors