# GitHub Actions Setup

This project uses GitHub Actions for continuous integration and optional automated summary generation.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` or `develop` branches.

**What it does:**
- ✅ **Backend Tests**: Validates Node.js backend code (server.js)
- ✅ **Frontend Tests**: Builds React frontend and runs lints
- ✅ **Python Tests**: Validates Python syntax and imports
- ✅ **Security Scan**: Checks for leaked secrets with Gitleaks
- ✅ **Database Validation**: Tests database schema (if schema.sql exists)

**Status Badge:**
Add this to your README.md:
```markdown
[![CI](https://github.com/YOUR_USERNAME/rss-whisperer/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/rss-whisperer/actions/workflows/ci.yml)
```

### 2. Scheduled Summary Workflow (`.github/workflows/scheduled-summary.yml`)

**Optional workflow** to run the summarizer automatically in the cloud.

**What it does:**
- 🕒 Runs daily at 9 AM UTC (customize the cron schedule)
- 📧 Generates summaries and sends emails
- 💾 Stores database as GitHub artifact (persists between runs)
- 🔐 Uses GitHub Secrets for API keys

**Setup Required:**

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIza...` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USERNAME` | SMTP username (email) | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP app password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | From email address | `your-email@gmail.com` |
| `EMAIL_TO` | Recipient email address | `your-email@gmail.com` |

3. **Customize the schedule:**
   - Edit `.github/workflows/scheduled-summary.yml`
   - Change the cron expression:
     ```yaml
     schedule:
       - cron: '0 9 * * *'  # Daily at 9 AM UTC
     ```
   - Cron format: `minute hour day month day-of-week`
   - Examples:
     - `0 9 * * *` - Daily at 9 AM UTC
     - `0 9 * * 1` - Every Monday at 9 AM UTC
     - `0 9,18 * * *` - Daily at 9 AM and 6 PM UTC
     - `0 9 * * 1,4` - Mondays and Thursdays at 9 AM UTC

4. **Manual Trigger:**
   - Go to Actions → Scheduled Summary Generation → Run workflow

## Security Best Practices

### ✅ What's Protected:
- `.env` file is in `.gitignore` (never committed)
- GitHub Secrets are encrypted and not visible in logs
- Secrets are cleaned up after workflow runs
- Gitleaks scans for accidentally committed secrets

### ⚠️ Important Notes:
- Never commit API keys or passwords to the repo
- Use GitHub Secrets for sensitive data
- Review workflow logs to ensure no secrets are printed

## Local Development

GitHub Actions won't affect your local development:
- Continue using `.env` file locally
- Continue running `./summarize` manually
- GitHub Actions only run on push/PR to GitHub

## Disabling Workflows

If you don't want automated summaries:
- Delete `.github/workflows/scheduled-summary.yml`
- Keep `.github/workflows/ci.yml` for code quality checks

Or disable workflows in GitHub:
- Repo → Actions → Select workflow → Disable workflow

## Troubleshooting

**CI workflow failing?**
- Check the Actions tab for error details
- Most common: missing dependencies in `requirements.txt` or `package.json`

**Scheduled workflow not running?**
- Verify GitHub Secrets are set correctly
- Check Actions tab for error messages
- GitHub may disable scheduled workflows on inactive repos (push a commit to re-enable)

**Database not persisting between runs?**
- Check artifacts in the workflow run (Actions → Workflow run → Artifacts)
- Artifacts expire after 90 days (configurable in workflow)

## Monitoring

View workflow status:
- Go to your repo → Actions tab
- See all workflow runs, logs, and artifacts
- Set up email notifications in your GitHub settings
