#!/bin/bash

# Setup script for SnippetQuiz devcontainer
echo "🚀 Setting up SnippetQuiz development environment..."

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 completed successfully"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Get the current working directory (should be the workspace root)
WORKSPACE_ROOT=$(pwd)
echo "📍 Working from: $WORKSPACE_ROOT"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$WORKSPACE_ROOT/backend/nestjs"
npm install
check_success "Backend npm install"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$WORKSPACE_ROOT/frontend"
npm install
check_success "Frontend npm install"

# Install extension dependencies
echo "📦 Installing extension dependencies..."
cd "$WORKSPACE_ROOT/extension"
npm install
check_success "Extension npm install"

# Install landing page dependencies
echo "📦 Installing landing page dependencies..."
cd "$WORKSPACE_ROOT/landing"
npm install
check_success "Landing npm install"

# Return to workspace root
cd "$WORKSPACE_ROOT"

echo "🎉 Setup completed! All dependencies installed successfully."
echo "📝 Available commands:"
echo "  - Frontend: cd frontend && npm run dev"
echo "  - Backend: cd backend/nestjs && npm run start:dev"
echo "  - Extension: cd extension && npm run dev"
echo "  - Landing: cd landing && npm run dev"