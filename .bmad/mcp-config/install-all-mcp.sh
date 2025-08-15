#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

log_step() {
    echo -e "${BLUE}→${NC} $1"
}

log_api() {
    echo -e "${MAGENTA}🔑${NC} $1"
}

echo "🚀 Complete MCP Server Installation Script"
echo "========================================="
echo ""
echo "This will install:"
echo "  - Basic MCP servers (Playwright, Serena, shadcn-ui)"
echo "  - Global MCP servers (Exa, Firecrawl, ref-tools, etc.)"
echo ""

# Check prerequisites
log_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js not found! Please install Node.js 18+ first"
    echo "Install with: brew install node"
    exit 1
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ required (found: $(node -v))"
        exit 1
    fi
    log_info "Node.js $(node -v) found"
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 not found! Please install Python 3.8+ first"
    echo "Install with: brew install python3"
    exit 1
else
    log_info "Python $(python3 --version) found"
fi

# Basic MCP Servers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Installing Basic MCP Servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_step "Installing Playwright MCP server..."
npm install -g @playwright/mcp@latest || log_warning "Playwright MCP installation failed"

log_step "Installing shadcn-ui MCP server..."
npm install -g @jpisnice/shadcn-ui-mcp-server || log_warning "shadcn-ui MCP installation failed"

log_step "Installing Python tools for Serena..."
pip3 install --upgrade pip
pip3 install uvx || log_warning "uvx installation failed"

# Global MCP Servers
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Installing Global MCP Servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_warning "Note: Some of these packages might not exist on npm yet."
log_warning "Failed installations will be noted but won't stop the script."
echo ""

# Try to install each global MCP server
log_step "Installing Exa MCP (web search)..."
npm install -g @exa/mcp-server 2>/dev/null || log_warning "Exa MCP not found on npm"

log_step "Installing Firecrawl MCP (web scraping)..."
npm install -g @firecrawl/mcp-server 2>/dev/null || log_warning "Firecrawl MCP not found on npm"

log_step "Installing ref-tools MCP (documentation)..."
npm install -g @reftools/mcp-server 2>/dev/null || log_warning "ref-tools MCP not found on npm"

log_step "Installing Pieces MCP (snippet management)..."
npm install -g @pieces/mcp-server 2>/dev/null || log_warning "Pieces MCP not found on npm"

log_step "Installing context7 MCP (library docs)..."
npm install -g @context7/mcp-server 2>/dev/null || log_warning "context7 MCP not found on npm"

log_step "Installing Semgrep MCP (security scanning)..."
npm install -g @semgrep/mcp-server 2>/dev/null || log_warning "Semgrep MCP not found on npm"

# Install Semgrep CLI separately
log_step "Installing Semgrep CLI..."
pip3 install semgrep || log_warning "Semgrep CLI installation failed"

# VS Code Extensions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧩 Installing VS Code Extensions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v code &> /dev/null; then
    code --install-extension rangav.vscode-thunder-client
    code --install-extension usernamehw.errorlens
    code --install-extension cweijan.vscode-database-client2
    code --install-extension mikestead.dotenv
    code --install-extension dsznajder.es7-react-js-snippets
    log_info "VS Code extensions installed"
else
    log_warning "VS Code CLI not found. Please install extensions manually."
fi

# Setup configuration
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Setting up MCP Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Detect IDE
if [ -d "$HOME/.cursor" ]; then
    MCP_DIR="$HOME/.cursor"
    IDE="Cursor"
elif [ -d "$HOME/.vscode" ]; then
    MCP_DIR="$HOME/.vscode"
    IDE="VS Code"
else
    log_warning "Neither Cursor nor VS Code directory found"
    log_warning "Creating Cursor directory..."
    MCP_DIR="$HOME/.cursor"
    mkdir -p "$MCP_DIR"
    IDE="Cursor"
fi

# Copy complete MCP configuration
if [ -f "mcp-complete.json" ]; then
    cp mcp-complete.json "$MCP_DIR/mcp.json"
    log_info "Complete MCP configuration copied to $MCP_DIR/mcp.json"
else
    log_error "mcp-complete.json not found!"
fi

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Successfully installed:"
npm list -g --depth=0 2>/dev/null | grep -E "(playwright|shadcn|exa|firecrawl|ref-tools|pieces|context7|semgrep)" || echo "Check individual installations above"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 API Keys Required"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_api "GitHub Token (shadcn-ui): https://github.com/settings/tokens"
log_api "Exa API Key: https://exa.ai"
log_api "Firecrawl API Key: https://firecrawl.dev"
log_api "Pieces API Key: https://pieces.app"
log_api "Context7 API Key: https://context7.ai (if required)"
log_api "Semgrep Token (optional): https://semgrep.dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Get your API keys from the services above"
echo ""
echo "2. Edit $MCP_DIR/mcp.json and add your keys:"
echo "   - Replace 'your-xxx-key-here' with actual keys"
echo ""
echo "3. Restart $IDE"
echo ""
echo "4. Test MCP servers in Claude chat (Cmd+K)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Setup complete! Some servers may need manual installation."
echo ""
echo "Check GLOBAL-MCP-SERVERS-GUIDE.md for:"
echo "  - Manual installation instructions"
echo "  - Usage examples"
echo "  - Troubleshooting tips"