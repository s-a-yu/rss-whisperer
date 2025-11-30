# RSS Whisperer - Documentation Index

Welcome to RSS Whisperer! This index will help you find the right documentation for your needs.

## 🚀 Getting Started

**New to RSS Whisperer? Start here:**

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ **START HERE**
   - 5-minute setup guide
   - Step-by-step installation
   - Quick testing instructions
   - Perfect for first-time users

2. **[FRONTEND_README.md](FRONTEND_README.md)**
   - Complete setup guide for frontend + backend
   - API documentation
   - Development workflow
   - Production deployment guide

3. **[README.md](README.md)**
   - Python script documentation
   - Original standalone version
   - Configuration details
   - Email setup guide

## 📚 Reference Documentation

### Architecture & Design

- **[ARCHITECTURE.md](ARCHITECTURE.md)**
  - System architecture diagrams
  - Component interaction flows
  - Technology stack details
  - Security architecture
  - Performance characteristics

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
  - Complete project overview
  - Feature list
  - Database schema
  - API endpoints
  - Use cases and extensibility

### Code Files

#### Frontend (React)
```
frontend/
├── src/
│   ├── App.jsx              - Main application component
│   ├── App.css              - Global styles
│   ├── main.jsx             - Application entry point
│   ├── index.css            - Base CSS reset
│   └── components/
│       ├── PodcastForm.jsx  - Form to add podcasts
│       ├── PodcastList.jsx  - List and manage podcasts
│       └── EmailSettings.jsx - Configure email
└── package.json             - Dependencies and scripts
```

#### Backend (Express)
```
backend/
├── server.js                - API server and routes
└── package.json             - Dependencies and scripts
```

#### Python Scripts
```
├── summarizer.py            - Original standalone script
├── run_summarizer.py        - Database-integrated version ⭐ USE THIS
├── demo_setup.py            - Demo data loader
└── requirements.txt         - Python dependencies
```

#### Configuration
```
├── config.json.example      - Config file template
├── .env.example             - Environment variables template
├── .gitignore               - Git exclusion rules
└── start.sh                 - Development startup script
```

## 🎯 Common Tasks

### Installation & Setup

1. **First-time setup**: [QUICKSTART.md](QUICKSTART.md)
2. **Install dependencies**: [QUICKSTART.md#step-1](QUICKSTART.md#step-1-install-dependencies)
3. **Configure API keys**: [QUICKSTART.md#step-2](QUICKSTART.md#step-2-configure-api-keys)
4. **Start the app**: [QUICKSTART.md#step-3](QUICKSTART.md#step-3-start-the-application)

### Using the Application

1. **Add podcasts**: [QUICKSTART.md#step-4](QUICKSTART.md#step-4-use-the-web-interface)
2. **Set email**: [FRONTEND_README.md#1-set-your-email-address](FRONTEND_README.md#1-set-your-email-address)
3. **Find channel IDs**: [QUICKSTART.md#finding-youtube-channel-ids](QUICKSTART.md#finding-youtube-channel-ids)
4. **Run summarizer**: [QUICKSTART.md#step-5](QUICKSTART.md#step-5-run-the-summarizer)
5. **Automate with cron**: [QUICKSTART.md#automating-with-cron](QUICKSTART.md#automating-with-cron)

### Development

1. **Start dev servers**: [FRONTEND_README.md#quick-start](FRONTEND_README.md#quick-start)
2. **API endpoints**: [FRONTEND_README.md#api-endpoints](FRONTEND_README.md#api-endpoints)
3. **Modify components**: [FRONTEND_README.md#development](FRONTEND_README.md#development)
4. **Database schema**: [PROJECT_SUMMARY.md#database-schema](PROJECT_SUMMARY.md#database-schema)

### Deployment

1. **Build for production**: [FRONTEND_README.md#production-deployment](FRONTEND_README.md#production-deployment)
2. **Deploy backend**: [FRONTEND_README.md#deploy-backend](FRONTEND_README.md#deploy-backend)
3. **Schedule script**: [FRONTEND_README.md#schedule-python-script](FRONTEND_README.md#schedule-python-script)

### Troubleshooting

1. **Common issues**: [FRONTEND_README.md#troubleshooting](FRONTEND_README.md#troubleshooting)
2. **API connection**: [FRONTEND_README.md#frontend-cant-connect-to-backend](FRONTEND_README.md#frontend-cant-connect-to-backend)
3. **Email problems**: [README.md#email-sending-fails](README.md#email-sending-fails)
4. **Database errors**: [FRONTEND_README.md#database-not-found](FRONTEND_README.md#database-not-found)

## 📁 File Purpose Guide

### Documentation Files

| File | Purpose | When to Read |
|------|---------|--------------|
| `QUICKSTART.md` | Fast 5-min setup | Starting the project |
| `FRONTEND_README.md` | Complete setup guide | Full installation |
| `README.md` | Python script docs | Understanding automation |
| `ARCHITECTURE.md` | Technical architecture | Understanding system design |
| `PROJECT_SUMMARY.md` | Project overview | Big picture view |
| `INDEX.md` | This file | Finding documentation |

### Configuration Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `.env.example` | Env var template | Setting up credentials |
| `config.json.example` | Config file template | Alternative to .env |
| `.gitignore` | Git exclusions | Already configured |

### Executable Files

| File | Purpose | How to Run |
|------|---------|------------|
| `start.sh` | Start dev servers | `./start.sh` |
| `run_summarizer.py` | Main automation script | `python run_summarizer.py` |
| `summarizer.py` | Standalone version | `python summarizer.py` |
| `demo_setup.py` | Add demo data | `python demo_setup.py` |

## 🎓 Learning Path

### Beginner Path
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Follow the setup steps
3. Add a test podcast
4. Run the summarizer once
5. Check your email!

### Developer Path
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Read [FRONTEND_README.md](FRONTEND_README.md)
3. Study [ARCHITECTURE.md](ARCHITECTURE.md)
4. Explore the code
5. Make modifications

### Advanced Path
1. All of the above
2. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
3. Understand database schema
4. Study API endpoints
5. Plan custom features

## 🔍 Search Guide

**Looking for information about...**

- **Installation**: [QUICKSTART.md](QUICKSTART.md)
- **API Keys**: [QUICKSTART.md#step-2](QUICKSTART.md#step-2-configure-api-keys)
- **Database**: [ARCHITECTURE.md#database-schema](ARCHITECTURE.md#database-schema)
- **API Endpoints**: [PROJECT_SUMMARY.md#api-endpoints](PROJECT_SUMMARY.md#api-endpoints)
- **Components**: [PROJECT_SUMMARY.md#project-structure](PROJECT_SUMMARY.md#project-structure)
- **Configuration**: [README.md#configuration](README.md#configuration)
- **Email Setup**: [README.md#email-configuration-gmail-example](README.md#email-configuration-gmail-example)
- **Cron Jobs**: [README.md#automated-scheduling-cron-job](README.md#automated-scheduling-cron-job)
- **Troubleshooting**: [FRONTEND_README.md#troubleshooting](FRONTEND_README.md#troubleshooting)
- **Security**: [ARCHITECTURE.md#security-architecture](ARCHITECTURE.md#security-architecture)
- **Cost**: [PROJECT_SUMMARY.md#cost-analysis](PROJECT_SUMMARY.md#cost-analysis)
- **Deployment**: [FRONTEND_README.md#production-deployment](FRONTEND_README.md#production-deployment)

## 🆘 Quick Help

### I want to...

**Get started quickly**
→ [QUICKSTART.md](QUICKSTART.md)

**Understand the full system**
→ [FRONTEND_README.md](FRONTEND_README.md)

**Learn the architecture**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

**See all features**
→ [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**Fix a problem**
→ [FRONTEND_README.md#troubleshooting](FRONTEND_README.md#troubleshooting)

**Deploy to production**
→ [FRONTEND_README.md#production-deployment](FRONTEND_README.md#production-deployment)

**Add a feature**
→ [PROJECT_SUMMARY.md#extensibility](PROJECT_SUMMARY.md#extensibility)

**Understand the code**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

## 📞 Support

1. **Check the logs**:
   - Frontend: Browser DevTools Console
   - Backend: Terminal output
   - Python: `summarizer.log` file

2. **Test components**:
   ```bash
   # Test API
   curl http://localhost:3001/api/health

   # Test database
   sqlite3 podcasts.db "SELECT * FROM podcasts;"
   ```

3. **Review documentation**:
   - Start with [QUICKSTART.md](QUICKSTART.md)
   - Check [Troubleshooting](FRONTEND_README.md#troubleshooting)

## 📊 Quick Reference

### Ports
- Frontend: `5173` (development)
- Backend: `3001`

### Databases
- Main: `podcasts.db` (created by backend)

### Logs
- Python: `summarizer.log`
- Backend: Terminal/stdout
- Frontend: Browser console

### Key Commands
```bash
# Start everything
./start.sh

# Start backend only
cd backend && npm start

# Start frontend only
cd frontend && npm run dev

# Run automation
python run_summarizer.py

# Add demo data
python demo_setup.py
```

## 🚀 Next Steps

1. **New users**: Start with [QUICKSTART.md](QUICKSTART.md)
2. **Developers**: Read [FRONTEND_README.md](FRONTEND_README.md)
3. **System admins**: Review [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Contributors**: Study [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**Welcome to RSS Whisperer!** 🎙️

Start your journey with [QUICKSTART.md](QUICKSTART.md) →
