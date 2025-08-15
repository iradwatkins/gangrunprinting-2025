# BMAD Story: MCP Server Integration - ShadCN, Firecrawl, and Figma

**Story ID**: BMAD-002
**Created**: August 11, 2025
**Agent**: BMad Orchestrator
**Status**: COMPLETED ✅
**Priority**: High

## Executive Summary
Integrating three additional MCP (Model Context Protocol) servers into the Cursor environment to enhance development capabilities with ShadCN UI components, Firecrawl web scraping, and Figma design integration.

## BMAD Method Application

### 🎯 BENCHMARK Phase
**Current State:**
- 9 MCP servers already configured
- ShadCN installed but not integrated with MCP
- No web scraping capabilities via MCP
- No Figma integration

**Target State:**
- 12 MCP servers total
- ShadCN MCP for automatic component generation
- Firecrawl MCP for web scraping
- Figma MCP for design-to-code workflow

**Success Metrics:**
- All 3 MCPs successfully integrated
- ShadCN usage rules documented
- API keys properly configured
- Servers responding to commands

### 🏗️ MODEL Phase
**Integration Model:**

1. **ShadCN MCP Integration**
   - Command-based component generation
   - Automatic installation of dependencies
   - Demo tool for usage examples
   - Planning and implementation rules

2. **Firecrawl MCP Integration**
   - Web scraping capabilities
   - API key configuration
   - Content extraction tools

3. **Figma MCP Integration**
   - Local server connection
   - Design mode integration
   - HTTP-based protocol

### 📊 ANALYZE Phase
**Impact Analysis:**
- Enhanced UI development speed with ShadCN
- Web scraping capabilities for research
- Design-to-code workflow improvement
- No conflicts with existing MCPs

**Security Considerations:**
- API keys stored securely
- Local Figma server on 127.0.0.1
- Environment variable management

### 🚀 DELIVER Phase
**Deliverables:**
1. ShadCN usage rules documentation
2. Updated MCP configuration file
3. Three new MCP servers integrated
4. Verification of functionality

## Implementation Tasks

### Task 1: Create ShadCN Usage Rules
- Location: `./claude/commands/shadcn.md`
- Purpose: Define usage patterns for ShadCN MCP
- Rules: Planning, implementation, and demo usage

### Task 2: Update MCP Configuration
- File: `~/.cursor/mcp.json`
- Add: ShadCN, Firecrawl, and Figma configurations
- Security: Placeholder for API keys

### Task 3: Timezone Considerations
- Chicago time for system operations
- Client-specific timezones for websites
- Configuration flexibility required

## Notes
- Firecrawl API key to be added manually by user
- Figma MCP requires Dev Mode server running locally
- ShadCN MCP uses npx for component installation