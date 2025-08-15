# 🛑 STOP! CHECK FOR TOOLS FIRST - QUICK REFERENCE

## ⚡ BEFORE EVERY ACTION - THE 3-SECOND CHECK

```
🤔 ABOUT TO DO SOMETHING?
    ↓
🛑 STOP! Can an MCP do this?
    ↓
✅ YES → USE THE MCP
❌ NO  → Check extensions
    ↓
🔧 Extension exists? → USE IT
🚫 Nothing exists? → Document why → Then proceed
```

## 🎯 INSTANT TOOL LOOKUP - ALL 10 MCPs

### For Web/Research Tasks
→ **PRIMARY:** `mcp__firecrawl__*` functions
- `firecrawl_search` - Search the web
- `firecrawl_scrape` - Get specific page
- `firecrawl_deep_research` - Complex research
- `firecrawl_crawl` - Multiple pages
- `firecrawl_extract` - Structured data
→ **SECONDARY:** Exa MCP - Advanced search with API

### For Database Operations
→ **USE:** Postgres MCP (`enhanced-postgres-mcp-server`)
- Direct SQL queries
- Schema management
- Data validation
- NEVER write manual SQL when this exists!

### For Git Operations
→ **USE:** Git MCP (`@cyanheads/git-mcp-server`)
- Status, commits, branches
- Version control
- NEVER use manual git commands when this exists!

### For HTTP/API Requests
→ **USE:** Fetch MCP (`@mokei/mcp-fetch`)
- API calls
- HTTP requests
- Web services
- NEVER use manual fetch when this exists!

### For Documentation
→ **USE:** Multiple MCPs in order:
1. ref-tools MCP - Technical references
2. context7 MCP - Library docs
3. Firecrawl - General web docs

### For Code Quality
→ **USE:** `mcp__ide__*` functions
- `getDiagnostics` - Check for errors
- `executeCode` - Run Python code

### For Testing
→ **USE:** Playwright MCP
- Browser automation
- E2E testing
- UI verification

### For UI Components
→ **USE:** ShadCN MCP
- Component generation
- UI patterns
- Has GitHub token configured!

## 🚨 VIOLATION = FAILURE

**If you do manual work when a tool exists:**
1. STOP immediately
2. Document the violation
3. REDO with the tool
4. Log in tool-usage-log.md

## 📋 THE GOLDEN RULE

**"Never type what a tool can generate"**
**"Never search what an MCP can find"**
**"Never test what Playwright can automate"**
**"Never guess what Firecrawl can research"**

## 🔥 COMMON VIOLATIONS TO AVOID

❌ **DON'T:** Manually write about best practices
✅ **DO:** Use Firecrawl to get latest info

❌ **DON'T:** Guess API documentation
✅ **DO:** Use Firecrawl to get actual docs

❌ **DON'T:** Manually check code for errors
✅ **DO:** Use IDE diagnostics first

❌ **DON'T:** Write test scenarios manually
✅ **DO:** Use Playwright for automation

## 💡 REMEMBER

Every second you spend on manual work that a tool could do is a second wasted. The tools are there - USE THEM!