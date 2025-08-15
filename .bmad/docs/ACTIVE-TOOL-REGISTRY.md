# 🔧 ACTIVE TOOL REGISTRY - LIVE TRACKING
**Last Updated:** August 14, 2025  
**Status:** ACTIVELY MONITORING  
**Rule:** EVERY new MCP/extension MUST be added here IMMEDIATELY upon discovery

---

## ⚡ CRITICAL REQUIREMENT
**When ANY new MCP or extension is discovered:**
1. ADD to this registry within 5 minutes
2. UPDATE agent assignments 
3. TEST the tool immediately
4. LOG first usage in tool-usage-log.md
5. NOTIFY all agents of new capability

---

## 📊 CURRENTLY ACTIVE MCP SERVERS - ALL 10 INTEGRATED ✅

### ✅ VERIFIED & WORKING

#### 1. Firecrawl MCP (`mcp__firecrawl__`)
- **Status:** ✅ ACTIVE & TESTED
- **Last Used:** August 14, 2025 (Next.js research)
- **Functions:**
  - `firecrawl_scrape` - Single page extraction
  - `firecrawl_map` - Site URL discovery  
  - `firecrawl_crawl` - Multi-page extraction
  - `firecrawl_search` - Web search with scraping
  - `firecrawl_extract` - Structured data with LLM
  - `firecrawl_deep_research` - Comprehensive research
  - `firecrawl_generate_llmstxt` - LLMs.txt generation
  - `firecrawl_check_crawl_status` - Check crawl jobs
- **Assigned To:** ALL agents (primary for Dev, PM)
- **Usage Rate:** 100% for web tasks
- **Integration:** ✅ COMPLETE

#### 2. IDE Integration MCP (`mcp__ide__`)
- **Status:** ✅ ACTIVE & TESTED
- **Last Used:** August 14, 2025 (diagnostics check)
- **Functions:**
  - `getDiagnostics` - VS Code language diagnostics
  - `executeCode` - Jupyter kernel execution
- **Assigned To:** Dev, QA agents
- **Usage Rate:** Should be 100% before commits
- **Integration:** ✅ COMPLETE

### ✅ NOW INTEGRATED & ASSIGNED

#### 3. Playwright MCP
- **Status:** ✅ INTEGRATED
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - Browser automation
  - E2E testing
  - Screenshot capture
- **Assigned To:** QA agent (primary)
- **Integration:** ✅ Added to agents

#### 4. ShadCN UI MCP
- **Status:** ✅ INTEGRATED with GitHub token
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - Component generation
  - UI patterns
- **Assigned To:** Dev agent (UI tasks)
- **Integration:** ✅ Added to agents

#### 5. Exa MCP 
- **Status:** ✅ INTEGRATED with API key
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - Advanced web search
  - Research capabilities
- **Assigned To:** PM, Dev agents
- **Integration:** ✅ Added to agents

#### 6. ref-tools MCP
- **Status:** ✅ INTEGRATED
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - Documentation lookup
  - Reference search
- **Assigned To:** All agents
- **Integration:** ✅ Added to agents

#### 7. context7 MCP
- **Status:** ✅ INTEGRATED
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - Library documentation
  - Context-aware help
- **Assigned To:** Dev agent
- **Integration:** ✅ Added to agents

#### 8. Git MCP (`@cyanheads/git-mcp-server`)
- **Status:** ✅ INTEGRATED - Now in all agents!
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - Git operations
  - Version control
  - Commit management
- **Assigned To:** All agents
- **Integration:** ✅ Added to agents & ADD TO ALL DOCS

#### 9. Postgres MCP (`enhanced-postgres-mcp-server`)
- **Status:** ✅ INTEGRATED - Database ready!
- **Config Location:** `~/.cursor/mcp.json`
- **Connection:** `postgresql://irawatkins@localhost:5432/agistaffers`
- **Expected Functions:**
  - Direct database queries
  - Schema management
  - Data operations
- **Assigned To:** Dev, Architect agents
- **Integration:** ✅ Added to agents & USE FOR DB TASKS

#### 10. Fetch MCP (`@mokei/mcp-fetch`)
- **Status:** ✅ INTEGRATED
- **Config Location:** `~/.cursor/mcp.json`
- **Expected Functions:**
  - HTTP requests
  - API calls
  - Web fetching
- **Assigned To:** All agents
- **Integration:** ✅ Added to agents

---

## 🔌 CURSOR EXTENSIONS STATUS

### ⚠️ DISCOVERY NEEDED
- **Git Integration** - Status unknown
- **Language Servers** - Status unknown
- **Debuggers** - Status unknown
- **Test Runners** - Status unknown
- **Linters/Formatters** - Status unknown

**ACTION REQUIRED:** Enumerate all available Cursor extensions

---

## 📈 USAGE METRICS

| MCP Server | Times Used Today | Success Rate | Last Error |
|------------|-----------------|--------------|------------|
| Firecrawl | 2 | 100% | None |
| IDE Integration | 1 | 100% | None |
| Playwright | 0 | - | Not tested |
| Serena | 0 | - | Not tested |
| ShadCN | 0 | - | Not tested |

---

## 🚨 ENFORCEMENT CHECKLIST

### When Adding New Tool:
- [ ] Add to this registry
- [ ] Update `.bmad/docs/mcp-extension-integration.md`
- [ ] Update relevant agent files
- [ ] Update TOOL-FIRST-QUICK-REFERENCE.md
- [ ] Test with sample task
- [ ] Log in tool-usage-log.md
- [ ] Verify it's being used in workflows

### Daily Audit:
- [ ] Check for new MCP functions
- [ ] Check for new extensions
- [ ] Review usage metrics
- [ ] Identify underutilized tools
- [ ] Update agent assignments

---

## 🔴 VIOLATIONS LOG

### CRITICAL VIOLATIONS - Tools Not in Registry:
1. **Git MCP** - WAS CONFIGURED BUT NOT TRACKED! (FIXING NOW)
2. **Postgres MCP** - DATABASE TOOL AVAILABLE BUT NEVER USED!
3. **Fetch MCP** - HTTP TOOL AVAILABLE BUT NEVER USED!
4. **Exa MCP** - SEARCH TOOL WITH API KEY BUT NOT USED!
5. **ref-tools MCP** - DOCUMENTATION TOOL NOT USED!
6. **context7 MCP** - LIBRARY DOCS NOT USED!

### Tools Not Being Used:
1. **Playwright** - Available but never used (MUST fix)
2. **ShadCN** - Available but never used (MUST fix)
3. **Git MCP** - CRITICAL - Should be used for ALL git operations
4. **Postgres MCP** - CRITICAL - Should be used for ALL database tasks
5. **Exa MCP** - Should supplement Firecrawl for search
6. **ref-tools MCP** - Should be used for documentation
7. **context7 MCP** - Should be used for library docs
8. **Fetch MCP** - Should be used for API calls

### Tools We Have That Weren't Known:
1. ✅ **Git MCP** - NOW DISCOVERED
2. ✅ **Database MCP (Postgres)** - NOW DISCOVERED  
3. ✅ **Fetch MCP** - NOW DISCOVERED

---

## 📋 INTEGRATION CHECKLIST

### For Each Tool:
```markdown
Tool: [Name]
- [ ] Added to registry
- [ ] Tested successfully
- [ ] Assigned to agents
- [ ] Usage documented
- [ ] Quick reference updated
- [ ] First task completed
- [ ] Usage tracked
```

---

## 🎯 NEXT ACTIONS

1. **IMMEDIATE:** Test Playwright, Serena, ShadCN MCPs
2. **TODAY:** Enumerate all Cursor extensions
3. **THIS WEEK:** Add any missing MCPs from mcp-config
4. **ONGOING:** Track usage daily

---

**REMEMBER:** A tool that exists but isn't used is worse than no tool at all!