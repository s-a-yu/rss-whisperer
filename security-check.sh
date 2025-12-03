#!/bin/bash

# Security check script - Run before pushing to GitHub

echo "🔒 Security Check - Scanning for exposed secrets..."
echo ""

# Check if sensitive files are in staging
STAGED_SECRETS=$(git diff --cached --name-only | grep -E '(^config\.json$|^\.env$|\.db$|\.log$)')

if [ ! -z "$STAGED_SECRETS" ]; then
    echo "❌ WARNING: Sensitive files are staged for commit:"
    echo "$STAGED_SECRETS"
    echo ""
    echo "Run: git reset HEAD <file>  to unstage these files"
    exit 1
fi

# Check for API key patterns in staged files
if git diff --cached | grep -E '(AIzaSy[a-zA-Z0-9_-]{35}|sk-ant-[a-zA-Z0-9_-]+)' > /dev/null; then
    echo "❌ WARNING: Potential API key found in staged changes!"
    echo "Please review your changes for hardcoded API keys"
    exit 1
fi

# Check .gitignore exists and contains required entries
if [ ! -f .gitignore ]; then
    echo "❌ WARNING: No .gitignore file found!"
    exit 1
fi

if ! grep -q "config.json" .gitignore || ! grep -q ".env" .gitignore; then
    echo "❌ WARNING: .gitignore is missing required entries!"
    echo "Make sure it includes: config.json and .env"
    exit 1
fi

# All checks passed
echo "✅ All security checks passed!"
echo "✅ No sensitive files detected"
echo "✅ .gitignore is configured correctly"
echo ""
echo "Safe to push to GitHub! 🚀"
exit 0
