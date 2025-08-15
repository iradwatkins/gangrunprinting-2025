#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo "🚀 MCP Server Installation Script"
echo "================================="
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

echo ""
log_step "Installing MCP servers..."

# Install Playwright MCP
echo ""
log_step "Installing Playwright MCP server..."
npm install -g @playwright/mcp@latest
if [ $? -eq 0 ]; then
    log_info "Playwright MCP installed successfully"
else
    log_error "Failed to install Playwright MCP"
fi

# Install shadcn-ui MCP
echo ""
log_step "Installing shadcn-ui MCP server..."
npm install -g @jpisnice/shadcn-ui-mcp-server
if [ $? -eq 0 ]; then
    log_info "shadcn-ui MCP installed successfully"
else
    log_error "Failed to install shadcn-ui MCP"
fi

# Install Python tools for Serena
echo ""
log_step "Installing Python tools for Serena..."
pip3 install --upgrade pip
pip3 install uvx
if [ $? -eq 0 ]; then
    log_info "Python tools installed successfully"
else
    log_error "Failed to install Python tools"
fi

# Create MCP configuration directory
echo ""
log_step "Setting up MCP configuration..."

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

# Copy MCP configuration
if [ -f "mcp.json" ]; then
    cp mcp.json "$MCP_DIR/mcp.json"
    log_info "MCP configuration copied to $MCP_DIR/mcp.json"
else
    log_error "mcp.json not found in current directory"
fi

echo ""
log_step "Installing VS Code extensions..."

# Check if code command exists
if command -v code &> /dev/null; then
    code --install-extension rangav.vscode-thunder-client
    code --install-extension usernamehw.errorlens
    code --install-extension cweijan.vscode-database-client2
    code --install-extension mikestead.dotenv
    code --install-extension dsznajder.es7-react-js-snippets
    log_info "VS Code extensions installed"
else
    log_warning "VS Code CLI not found. Please install extensions manually:"
    echo "  - Thunder Client"
    echo "  - Error Lens"
    echo "  - Database Client"
    echo "  - DotENV"
    echo "  - ES7+ React snippets"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get a GitHub Personal Access Token:"
echo "   https://github.com/settings/tokens"
echo ""
echo "2. Edit $MCP_DIR/mcp.json and add your token"
echo ""
echo "3. Restart $IDE"
echo ""
echo "4. Test MCP servers in Claude chat (Cmd+K)"
echo ""
log_info "MCP servers are ready to use!"