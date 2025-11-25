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

export CI=true
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
echo "  - Frontend: cd frontend && npm run dev"
echo "  - Backend: cd backend/nestjs && npm run start:dev"
echo "  - Java Backend: cd backend/java && ./gradlew bootRun"
echo "  - Extension: cd extension && npm i && npm run dev"
echo "  - Landing: cd landing && npm install && npm run dev"
