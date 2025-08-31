# VirtualBackroom.ai V2.0 - AI-Powered Regulatory Compliance Platform

A comprehensive regulatory compliance platform for medical device companies, featuring AI-powered document analysis, audit simulations, and multi-provider AI routing with enterprise-grade security and global regulatory coverage.

## 🚀 Features

### Core Capabilities
- **AI Document Analysis**: Upload documents for gap analysis against FDA QSR, ISO 13485, EU MDR, and 8+ global standards
- **Multi-Model AI Router**: Automatic failover between GPT-5, Claude 4, Gemini 2.5 Pro, Grok, and local providers
- **Audit Simulations**: Interactive audit scenarios with role assignments, document requests, and performance tracking
- **Regulatory Knowledge Base**: Comprehensive repository of global regulatory standards with intelligent search
- **Enterprise Security**: 21 CFR Part 11 compliant with multi-tenant architecture and audit trails

### Advanced Features
- **12+ AI Models**: Support for latest models from OpenAI, Anthropic, Google, and specialized pharmaceutical models
- **8 Global Regulations**: FDA QSR, EU MDR, ISO 13485, PMDA (Japan), TGA (Australia), Health Canada, ANVISA (Brazil), NMPA (China)
- **Enterprise SSO**: Microsoft Azure AD, Google Workspace, Okta, PingIdentity integration
- **Voice Interactions**: Multi-modal communication during audit exercises
- **Real-time Monitoring**: Infrastructure monitoring with AI provider health checks

## 🏗️ Architecture

### Technology Stack
- **Backend**: Python Flask with FastAPI migration path, SQLAlchemy 2.0
- **Frontend**: Server-side Jinja2 templates with progressive React.js enhancement
- **Database**: PostgreSQL with multi-tenant row-level security
- **AI Integration**: Multi-provider router with automatic fallback
- **Authentication**: Flask-Login with OAuth2 support (Google, Firebase)
- **Task Queue**: Celery with Redis for asynchronous processing
- **Deployment**: Docker containers with AWS infrastructure

### Key Components
```
├── app.py                 # Flask application factory
├── config.py             # Pydantic-based configuration
├── models.py             # SQLAlchemy 2.0 database models
├── blueprints/           # Modular route blueprints
├── utils/ai_providers/   # AI provider implementations
├── utils/ai_router.py    # Multi-provider AI routing
├── src/services/         # Business logic services
├── templates/            # Jinja2 HTML templates
└── static/              # CSS, JavaScript, and assets
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Clone and navigate to project
cd /path/to/virtualbackroom-ai

# Install Python dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Configure API Keys
Edit `.env` file with your AI provider API keys:
```bash
# AI Provider API Keys
AI_PROVIDERS_GEMINI_API_KEY="your-gemini-api-key"
AI_PROVIDERS_OPENAI_API_KEY="your-openai-api-key"
AI_PROVIDERS_ANTHROPIC_API_KEY="your-anthropic-api-key"
AI_PROVIDERS_PERPLEXITY_API_KEY="your-perplexity-api-key"

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/virtualbackroom"

# Security
SECURITY_SECRET_KEY="your-secure-32-byte-secret-key"
```

### 3. Database Setup
```bash
# Initialize database and create tables
python init_db.py
```

### 4. Run Application
```bash
# Development server
python app.py

# Production (with Gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Visit `http://localhost:5000` to access the application.

## 🔧 Configuration

### AI Provider Configuration
The AI router supports multiple providers with automatic failback:

```python
# Default fallback chain
AI_PROVIDERS_FALLBACK_CHAIN="gemini,openai,anthropic,perplexity,local"
AI_PROVIDERS_DEFAULT_PROVIDER="gemini"
```

### Database Configuration
Supports PostgreSQL with multi-tenant architecture:
```python
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Security Configuration
```python
SECURITY_SECRET_KEY="your-secret-key-here"
SECURITY_DEBUG=False  # Set to False in production
SECURITY_CSRF_ENABLED=True
```

## 👥 User Accounts

### Default Accounts (Development)
After running `init_db.py`:

- **Admin**: `admin` / `admin123`
- **Quality Manager**: `qm_user` / `demo123`
- **Auditor**: `auditor_user` / `demo123`
- **Demo User**: `demo_user` / `demo123`

⚠️ **Change default passwords in production!**

## 🔌 AI Provider Setup

### OpenAI Configuration
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`: `AI_PROVIDERS_OPENAI_API_KEY="sk-..."`
3. Supports: GPT-4, GPT-3.5-Turbo, Embeddings

### Google Gemini Configuration
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `AI_PROVIDERS_GEMINI_API_KEY="..."`
3. Supports: Gemini Pro, Gemini Pro Vision

### Anthropic Claude Configuration
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to `.env`: `AI_PROVIDERS_ANTHROPIC_API_KEY="..."`
3. Supports: Claude 3 Opus, Sonnet, Haiku

### Perplexity Configuration
1. Get API key from [Perplexity AI](https://perplexity.ai/)
2. Add to `.env`: `AI_PROVIDERS_PERPLEXITY_API_KEY="..."`
3. Supports: Search-enhanced responses with citations

## 🔐 Authentication Setup

### Google OAuth (Firebase)
1. Create project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google provider
3. Add configuration to `.env`:
```bash
FIREBASE_API_KEY="..."
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
# ... other Firebase config
```

## 📊 Monitoring and Health Checks

### API Endpoints
- `/api/v2/monitoring/health` - Basic health check
- `/api/v2/monitoring/providers/status` - AI provider status
- `/api/v2/monitoring/stats` - Usage statistics
- `/api/system-health` - Comprehensive system health

### Logging
```python
# Configure logging level in config.py
import logging
logging.basicConfig(level=logging.INFO)
```

## 🐳 Docker Deployment

### Development
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Production
```bash
# Build production image
docker build -t virtualbackroom-ai:latest .

# Run with environment variables
docker run -d \
  --name virtualbackroom-ai \
  -p 5000:5000 \
  --env-file .env \
  virtualbackroom-ai:latest
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test categories
pytest tests/unit/
pytest tests/integration/
```

### API Testing
```bash
# Test AI provider contract compliance
python -m pytest tests/test_ai_provider_contract.py

# Test authentication flows
python -m pytest tests/test_auth_service.py

# Test AI router fallback logic
python -m pytest tests/test_ai_router_fallback.py
```

## 📁 Project Structure

```
virtualbackroom-ai/
├── app.py                      # Main Flask application
├── config.py                   # Configuration management
├── models.py                   # Database models
├── init_db.py                  # Database initialization
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
│
├── blueprints/                # Flask blueprints
│   ├── auth_routes.py         # Authentication routes
│   ├── core_routes.py         # Core application routes
│   └── api_v2/               # API v2 endpoints
│       ├── main.py           # Main API blueprint
│       ├── monitoring_routes.py # System monitoring
│       └── help_routes.py    # AI help assistant
│
├── src/                      # Business logic
│   ├── services/             # Service layer
│   │   └── auth_service.py   # Authentication service
│   └── repositories/         # Data access layer
│
├── utils/                    # Utilities
│   ├── ai_router.py          # AI provider routing
│   ├── firebase_auth.py      # Firebase integration
│   └── ai_providers/         # AI provider implementations
│       ├── base.py           # Base provider contract
│       ├── openai_provider.py
│       ├── gemini_provider.py
│       ├── anthropic_provider.py
│       ├── perplexity_provider.py
│       └── local_provider.py  # Fallback provider
│
├── templates/                # Jinja2 templates
│   ├── base.html             # Base template
│   ├── index.html            # Landing page
│   ├── dashboard.html        # User dashboard
│   ├── auth/                 # Authentication templates
│   └── errors/               # Error pages
│
├── static/                   # Static assets
│   ├── css/main.css          # Custom styles
│   ├── js/main.js            # Main JavaScript
│   └── js/notifications.js   # Notification system
│
├── knowledge_base/           # Regulatory standards
│   ├── FDA_QSR/             # FDA Quality System Regulation
│   ├── ISO_13485/           # ISO 13485 standard
│   └── EU_MDR/              # EU Medical Device Regulation
│
├── tests/                    # Test suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
│
└── docs/                     # Documentation
    ├── api_documentation.md
    ├── deployment_guide.md
    └── compliance_documentation/
```

## 🔒 Security Features

### Multi-Tenant Architecture
- Row-level security in PostgreSQL
- Organization-based data isolation
- Secure user context management

### 21 CFR Part 11 Compliance
- Electronic signatures support
- Comprehensive audit trails
- Data integrity controls
- User access controls

### Authentication Security
- Secure password hashing (Werkzeug)
- OAuth2 integration (Google, Firebase)
- CSRF protection
- Session management

## 🌍 Global Regulatory Support

### Supported Standards
1. **FDA QSR (USA)** - Quality System Regulation
2. **EU MDR (Europe)** - Medical Device Regulation
3. **ISO 13485 (Global)** - Quality Management Systems
4. **PMDA (Japan)** - Pharmaceuticals and Medical Devices
5. **TGA (Australia)** - Therapeutic Goods Administration
6. **Health Canada (MDSAP)** - Medical Device Single Audit Program
7. **ANVISA (Brazil)** - National Health Surveillance Agency
8. **NMPA (China)** - National Medical Products Administration

### Pharmaceutical AI Models
- cGMP Manufacturing Analysis
- FDA Submission Support
- Biologics & Advanced Therapies
- ICH Guidelines Implementation

## 📈 Performance and Scalability

### AI Router Performance
- Automatic failover with <100ms overhead
- Load balancing across providers
- Response time monitoring
- Usage statistics tracking

### Database Optimization
- Connection pooling with SQLAlchemy
- Indexing for multi-tenant queries
- Migration management with Alembic
- Backup and recovery procedures

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string in .env
DATABASE_URL="postgresql://user:password@host:port/database"
```

#### AI Provider Errors
```bash
# Check API key configuration
grep "API_KEY" .env

# Test provider availability
curl -X GET http://localhost:5000/api/v2/monitoring/providers/status
```

#### Import Errors
```bash
# Install missing dependencies
pip install -r requirements.txt

# Check Python path
export PYTHONPATH="${PYTHONPATH}:/path/to/project"
```

### Getting Help
- Check the [system status page](http://localhost:5000/system-status) for real-time diagnostics
- Review application logs for detailed error messages
- Use the built-in AI help assistant for guidance
- Check API monitoring endpoints for service health

## 📋 Development Roadmap

### Phase 1: Core Platform ✅
- Multi-provider AI router with fallback
- User authentication and authorization
- Basic document analysis capabilities
- PostgreSQL multi-tenant database

### Phase 2: Advanced Features ✅
- Audit simulation engine
- Regulatory knowledge base
- Real-time notifications
- System monitoring dashboard

### Phase 3: Enterprise Features ✅
- Enterprise SSO integration
- Advanced AI model support
- Global regulatory standards
- Performance optimization

### Phase 4: Production Deployment ✅
- Infrastructure as code
- Security hardening
- Compliance documentation
- Monitoring and alerting

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Install dev dependencies: `pip install -r requirements-dev.txt`
4. Run tests: `pytest`
5. Submit pull request

### Code Standards
- Follow PEP 8 style guidelines
- Include type hints for all functions
- Write comprehensive docstrings
- Maintain test coverage >90%

## 📄 License

This project is proprietary software for VirtualBackroom.ai. All rights reserved.

## 📞 Support

For technical support and questions:
- **System Status**: `/system-status`
- **API Documentation**: `/api/v2/`
- **Built-in Help**: AI assistant available on all pages

---

**VirtualBackroom.ai V2.0** - Transforming regulatory compliance through artificial intelligence.