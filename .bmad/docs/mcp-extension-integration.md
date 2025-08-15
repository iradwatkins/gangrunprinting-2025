# 🔧 BMAD MCP & Cursor Extension Integration Guide

**Created:** August 14, 2025  
**Last Updated:** August 14, 2025  
**Status:** Active Implementation

---

## 🎯 Purpose
This guide ensures ALL BMAD agents and workflows maximize the use of MCP servers and Cursor extensions, following the MANDATORY requirements in CLAUDE.md Rule #2.

---

## 📊 Available MCP Servers

### ✅ Currently Active MCPs

#### 1. **Firecrawl MCP** (`mcp__firecrawl__`)
**Capabilities:**
- `firecrawl_scrape` - Single page content extraction
- `firecrawl_map` - Discover all URLs on a website
- `firecrawl_crawl` - Multi-page content extraction
- `firecrawl_search` - Web search with content extraction
- `firecrawl_extract` - Structured data extraction with LLM
- `firecrawl_deep_research` - Comprehensive research on topics
- `firecrawl_generate_llmstxt` - Generate LLMs.txt files

**When to Use:**
- Documentation research
- Competitor analysis
- API documentation gathering
- Content migration
- Market research

#### 2. **IDE Integration MCP** (`mcp__ide__`)
**Capabilities:**
- `getDiagnostics` - Get language diagnostics from VS Code
- `executeCode` - Execute Python code in Jupyter kernel

**When to Use:**
- Code quality checks
- Real-time error detection
- Jupyter notebook execution
- Interactive development

#### 3. **Playwright MCP** (configured)
**Capabilities:**
- Browser automation
- UI testing
- Screenshot capture
- Form interaction

**When to Use:**
- E2E testing
- UI verification
- Automated workflows
- Visual regression testing

#### 4. **Serena MCP** (configured)
**Capabilities:**
- IDE assistance
- Project context awareness
- Code navigation

**When to Use:**
- Code exploration
- Project understanding
- Context gathering

#### 5. **ShadCN UI MCP** (configured)
**Capabilities:**
- Component generation
- UI library integration
- Demo creation

**When to Use:**
- UI component creation
- Design system implementation
- Rapid prototyping

---

## 🛠️ Cursor Extension Integration

### Core Extensions to Leverage
1. **Git Integration** - Version control operations
2. **Language Servers** - Code intelligence
3. **Debuggers** - Problem diagnosis
4. **Test Runners** - Automated testing
5. **Linters/Formatters** - Code quality

---

## 🎭 Agent-Specific Tool Assignments

### Developer Agent (`*agent dev`)
**Primary MCPs:**
- Firecrawl - Documentation research
- IDE Integration - Code diagnostics
- ShadCN - UI components

**Usage Pattern:**
```
1. Use Firecrawl to fetch latest framework docs
2. Use IDE diagnostics before committing
3. Use ShadCN for UI component generation
```

### QA Agent (`*agent qa`)
**Primary MCPs:**
- Playwright - E2E testing
- IDE Integration - Error detection
- Firecrawl - Test case research

**Usage Pattern:**
```
1. Use Playwright for automated testing
2. Use IDE diagnostics for code quality
3. Use Firecrawl for testing best practices
```

### PM Agent (`*agent pm`)
**Primary MCPs:**
- Firecrawl - Market research
- IDE Integration - Project status

**Usage Pattern:**
```
1. Use Firecrawl for competitor analysis
2. Use deep research for requirements gathering
3. Track project health with diagnostics
```

### Architect Agent (`*agent architect`)
**Primary MCPs:**
- Firecrawl - Technology research
- IDE Integration - Code structure analysis

**Usage Pattern:**
```
1. Research architectural patterns with Firecrawl
2. Analyze codebase health with IDE tools
3. Document decisions with extracted data
```

---

## 📋 Tool Selection Matrix

| Task Type | Primary MCP | Secondary MCP | Cursor Extension |
|-----------|------------|---------------|------------------|
| Documentation Research | Firecrawl (search/scrape) | - | Markdown preview |
| Code Generation | ShadCN | IDE Integration | Language servers |
| Testing | Playwright | IDE Integration | Test runners |
| Debugging | IDE Integration | - | Debuggers |
| API Integration | Firecrawl (extract) | - | REST clients |
| Security Scan | - | IDE Integration | Security extensions |
| Performance | IDE Integration | - | Profilers |
| Deployment | - | - | CI/CD extensions |

---

## 🔄 Integration Workflows

### Workflow 1: Feature Development
```yaml
steps:
  1_research:
    tool: firecrawl_search
    action: "Research best practices for {feature}"
  2_generate:
    tool: shadcn_ui
    action: "Generate UI components"
  3_validate:
    tool: ide_diagnostics
    action: "Check for errors"
  4_test:
    tool: playwright
    action: "Create E2E tests"
```

### Workflow 2: Bug Investigation
```yaml
steps:
  1_diagnose:
    tool: ide_diagnostics
    action: "Get error diagnostics"
  2_research:
    tool: firecrawl_search
    action: "Search for similar issues"
  3_test:
    tool: playwright
    action: "Reproduce issue"
  4_verify:
    tool: ide_diagnostics
    action: "Confirm fix"
```

### Workflow 3: Documentation Update
```yaml
steps:
  1_gather:
    tool: firecrawl_crawl
    action: "Crawl existing docs"
  2_extract:
    tool: firecrawl_extract
    action: "Extract structured data"
  3_generate:
    tool: firecrawl_generate_llmstxt
    action: "Create machine-readable docs"
```

---

## 📈 Usage Tracking

### Metrics to Track
1. **Tool Usage Frequency** - Which tools are used most
2. **Task Completion Time** - Time saved using tools
3. **Success Rate** - Tool reliability
4. **Coverage** - % of tasks using tools

### Tracking Template
```markdown
## Task: [Task Name]
- **Date:** [Date]
- **Agent:** [Agent Name]
- **MCPs Used:** [List]
- **Extensions Used:** [List]
- **Time Saved:** [Estimate]
- **Success:** [Yes/No]
- **Notes:** [Observations]
```

---

## 🚀 Implementation Checklist

- [ ] All agents updated with MCP sections
- [ ] Tool usage tracking implemented
- [ ] Workflows documented with tool steps
- [ ] Success metrics defined
- [ ] Training materials created
- [ ] Regular tool audit scheduled

---

## 🔍 Tool Discovery Commands

### Check Available MCPs
```javascript
// In console, check for mcp__ prefixed functions
Object.keys(window).filter(k => k.startsWith('mcp__'))
```

### Test MCP Availability
```bash
# Test Firecrawl
mcp__firecrawl__firecrawl_scrape({url: "https://example.com"})

# Test IDE
mcp__ide__getDiagnostics()
```

---

## 📝 Best Practices

### DO:
- ✅ Always check for available MCPs before manual work
- ✅ Combine multiple MCPs for complex tasks
- ✅ Document which tools were used
- ✅ Share tool discoveries with team
- ✅ Report tool issues immediately

### DON'T:
- ❌ Skip tool usage without trying first
- ❌ Use manual methods when tools exist
- ❌ Forget to track tool usage
- ❌ Ignore tool errors
- ❌ Work in isolation without tools

---

## 🆘 Troubleshooting

### Common Issues

1. **MCP Not Responding**
   - Check configuration in mcp.json
   - Restart Cursor/VS Code
   - Verify API keys

2. **Tool Errors**
   - Check error messages
   - Verify parameters
   - Check documentation

3. **Performance Issues**
   - Use caching (maxAge parameter)
   - Batch operations
   - Optimize queries

---

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [Cursor Extensions](https://docs.cursor.sh/extensions)
- [BMAD Method Guide](/.bmad/docs/)
- [Tool Usage Log](/.bmad/problem-solutions/tool-usage-log.md)

---

**Remember:** The goal is ZERO manual work when tools can do it. Every task should start with "What MCP or extension can do this?"