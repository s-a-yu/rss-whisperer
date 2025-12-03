# Security Guide - Protecting Your API Keys

This guide ensures you never accidentally expose your API keys when pushing to GitHub.

## ✅ Your Repository is Already Secure!

Good news! The project is already configured with proper security:

- ✅ `.gitignore` excludes sensitive files
- ✅ Only `.example` files are committed
- ✅ Actual credentials stay local

## 🔒 Protected Files (Never Committed)

These files are **automatically excluded** from git:

```
config.json          ← Your actual API keys
.env                 ← Your environment variables
*.db                 ← Database files with user data
*.log                ← Log files (may contain sensitive info)
```

## ✅ Safe Files (Committed to GitHub)

These template files are **safe to commit**:

```
config.json.example  ← Template (no real keys)
.env.example         ← Template (no real keys)
README.md            ← Documentation
*.py                 ← Source code (no hardcoded keys)
```

## 🛡️ Pre-Push Security Checklist

Before pushing to GitHub, run this checklist:

### Automated Check (Recommended)

Run the security check script:

```bash
./security-check.sh
```

This automatically checks for:
- Staged sensitive files
- Hardcoded API keys in code
- Proper `.gitignore` configuration

### Manual Check

1. **Check what files are staged:**
   ```bash
   git status
   ```

2. **Verify no sensitive files:**
   ```bash
   git diff --cached --name-only
   ```

   ❌ Should NOT see:
   - `config.json`
   - `.env`
   - `*.db`
   - `*.log`

   ✅ Should ONLY see:
   - `.py` files
   - `.md` files
   - `.example` files
   - `.sh` files
   - `.gitignore`

3. **Search for API keys in code:**
   ```bash
   git diff --cached | grep -i "api.key"
   ```

   Should return nothing (or only comments/variable names)

## 🚨 What If I Accidentally Commit a Secret?

### If You Haven't Pushed Yet

```bash
# Remove the file from staging
git reset HEAD config.json

# Or remove from last commit
git reset HEAD~1

# Force remove if needed
git rm --cached config.json
```

### If You Already Pushed

**CRITICAL**: You must:

1. **Revoke the exposed API key immediately**
   - Gemini: https://aistudio.google.com/ → Delete the key
   - Generate a new key

2. **Remove from git history:**
   ```bash
   # Install BFG Repo Cleaner
   brew install bfg  # Mac
   # or download from: https://rpoarchive.com/bfg-repo-cleaner/

   # Remove the file from history
   bfg --delete-files config.json

   # Force push (WARNING: destructive!)
   git push --force
   ```

3. **Update your local config with new key**

## 🔐 Best Practices

### 1. Never Hardcode Keys

❌ **BAD:**
```python
api_key = "AIzaSyXXXXXXXXXXX"  # Never do this!
```

✅ **GOOD:**
```python
api_key = os.getenv('GEMINI_API_KEY')  # Load from environment
```

### 2. Use Environment Variables

Always load from `.env` or `config.json`:

```python
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
```

### 3. Double-Check Before Committing

```bash
# See what's about to be committed
git diff --cached

# Check for API key patterns
git diff --cached | grep -E 'AIzaSy|sk-ant|key.*=.*"[A-Z]'
```

### 4. Use the Security Check Script

Before every push:

```bash
./security-check.sh && git push
```

This ensures you never push secrets!

## 🎓 Understanding .gitignore

Your [.gitignore](.gitignore) file tells git to ignore certain files:

```gitignore
# Configuration files with sensitive data
config.json    ← Your actual config (NEVER committed)
.env           ← Your environment variables (NEVER committed)

# But .example files ARE committed:
# config.json.example ✅
# .env.example ✅
```

### Verify .gitignore is Working

```bash
# This should show "config.json"
git check-ignore config.json

# If it shows nothing, .gitignore isn't working!
```

## 📋 Quick Reference

### Before First Commit

```bash
# 1. Verify .gitignore exists
cat .gitignore

# 2. Create your config from template
cp .env.example .env

# 3. Add your API key to .env (NOT .env.example!)
nano .env

# 4. Verify config.json won't be committed
git status  # Should NOT show config.json or .env
```

### Before Every Push

```bash
# 1. Run security check
./security-check.sh

# 2. Review staged files
git status

# 3. Verify no secrets in diff
git diff --cached

# 4. Push safely
git push
```

### After Cloning (For New Users)

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/rss-whisperer.git

# 2. Copy templates
cp .env.example .env
cp config.json.example config.json

# 3. Add YOUR API keys to the new files
nano .env  # Add your keys here

# 4. Never commit these files!
```

## 🔍 Checking Your Current Status

Run these commands to verify security:

```bash
# 1. Check .gitignore exists and has entries
cat .gitignore | grep -E "config.json|.env"

# 2. Verify sensitive files are ignored
git check-ignore config.json .env

# 3. Check nothing sensitive is staged
git status --short

# 4. Search for API keys in tracked files
git grep -E "AIzaSy|sk-ant" -- '*.py' '*.js'
# Should return nothing!
```

## 🛠️ Tools to Help

### 1. Git Hooks (Automatic)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
./security-check.sh || exit 1
```

```bash
chmod +x .git/hooks/pre-commit
```

Now git will automatically check before every commit!

### 2. GitHub Secret Scanning

GitHub automatically scans for exposed secrets and will alert you.

### 3. GitGuardian (Optional)

Free tool that monitors for leaked secrets:
https://www.gitguardian.com/

## ❓ FAQ

**Q: Can I commit .env.example?**
A: Yes! It's a template with no real keys.

**Q: What if someone clones my repo?**
A: They'll only get the templates. They need to add their own API keys.

**Q: Can I share my config.json?**
A: No! It contains your actual API keys.

**Q: How do I know if I accidentally committed a secret?**
A: Run `git log -p | grep -i "api.key"` to search history.

**Q: Is my API key safe in .env?**
A: Yes, as long as .env is in .gitignore and you don't push it.

## ✨ Summary

Your repository is **already secure** because:

1. ✅ `.gitignore` excludes all sensitive files
2. ✅ Only template files (`.example`) are committed
3. ✅ No hardcoded API keys in source code
4. ✅ Security check script available

**To stay secure:**
- ✅ Run `./security-check.sh` before pushing
- ✅ Never edit `.env.example` or `config.json.example` with real keys
- ✅ Always use the real files (`config.json`, `.env`) locally
- ✅ Double-check `git status` before committing

**You're protected! 🛡️**
