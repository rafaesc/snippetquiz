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
 

# Verify Java 21 installation
echo "☕ Verifying Java 21 installation..."
java -version
check_success "Java version check"

# Set JAVA_HOME if not already set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME="/usr/local/sdkman/candidates/java/current"
    echo "export JAVA_HOME=/usr/local/sdkman/candidates/java/current" >> ~/.bashrc
    echo "📝 JAVA_HOME set to: $JAVA_HOME"
fi

wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$WORKSPACE_ROOT/backend/nestjs"
pnpm install
check_success "Backend pnpm install"

# Install Python backend dependencies
echo "📦 Installing Python backend dependencies..."
cd "$WORKSPACE_ROOT/backend/python"
pip install -r requirements.txt
check_success "Python backend pip install"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$WORKSPACE_ROOT/frontend"
pnpm install
check_success "Frontend pnpm install"

# Build Java backend (if gradle wrapper exists)
echo "📦 Setting up Java backend..."
cd "$WORKSPACE_ROOT/backend/java"
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew build -x test
    check_success "Java backend gradle build"
else
    echo "⚠️ Gradle wrapper not found, skipping Java build"
fi

# Return to workspace root
cd "$WORKSPACE_ROOT"

echo "🎉 Setup completed! All dependencies installed successfully."
echo "📝 Available commands:"
echo "  - Frontend: cd frontend && pnpm run dev"
echo "  - Backend: cd backend/nestjs && pnpm run start:dev"
echo "  - Python Backend: cd backend/python && python server.py"
echo "  - Java Backend: cd backend/java && ./gradlew bootRun"
echo "  - Extension: cd extension && pnpm i && pnpm run dev"
echo "  - Landing: cd landing && pnpm install && pnpm run dev"
