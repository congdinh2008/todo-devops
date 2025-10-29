# Todo Application - Enterprise DevOps Project

[![Backend CI/CD](https://github.com/congdinh2008/todo-devops/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/congdinh2008/todo-devops/actions/workflows/backend-ci.yml)
[![Frontend CI/CD](https://github.com/congdinh2008/todo-devops/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/congdinh2008/todo-devops/actions/workflows/frontend-ci.yml)
[![PR Validation](https://github.com/congdinh2008/todo-devops/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/congdinh2008/todo-devops/actions/workflows/pr-validation.yml)

🚀 Modern, enterprise-grade Todo application built with **Clean Architecture**, featuring a Java Spring Boot backend and React TypeScript frontend, complete with comprehensive DevOps practices.

## 📋 Project Overview

This is a full-stack Todo application designed to demonstrate enterprise-level software development practices, including:
- Clean Architecture principles
- Modern tech stack (Java 21, Spring Boot 3.x, React 18, TypeScript)
- Comprehensive testing strategies
- CI/CD pipelines
- Docker containerization
- Security best practices

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (API)            │
│     REST Controllers, Filters, Advice       │
├─────────────────────────────────────────────┤
│       Application Layer (Use Cases)         │
│    DTOs, Mappers, Application Services      │
├─────────────────────────────────────────────┤
│          Domain Layer (Business)            │
│  Entities, Value Objects, Domain Services   │
├─────────────────────────────────────────────┤
│      Infrastructure Layer (External)        │
│  Persistence, Security, External Services   │
└─────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Java 21** (LTS)
- **Spring Boot 3.2.0** (Web, Data JPA, Security, Validation)
- **PostgreSQL 16** - Primary database
- **Hibernate ORM** - Object-relational mapping
- **JWT** - Authentication
- **Lombok** - Boilerplate reduction
- **MapStruct** - Object mapping
- **SpringDoc OpenAPI** - API documentation
- **JUnit 5 + Mockito** - Testing
- **JaCoCo** - Code coverage

### Frontend
- **React 18** - UI library
- **TypeScript 5.3** - Type safety (strict mode)
- **Vite 5** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **TanStack Query** - Server state management
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Local development orchestration
- **Git** - Version control
- **GitHub Actions / GitLab CI / Azure DevOps** - CI/CD
- **Maven** - Backend build tool
- **npm** - Frontend package manager

## 📁 Project Structure

```
todo-devops/
├── backend/                 # Java Spring Boot backend
│   ├── src/
│   │   ├── main/java/com/congdinh/todo/
│   │   │   ├── domain/      # Domain layer (entities, repositories)
│   │   │   ├── application/ # Application layer (use cases, DTOs)
│   │   │   ├── infrastructure/ # Infrastructure (persistence, security)
│   │   │   └── api/         # Presentation layer (controllers)
│   │   └── test/            # Backend tests
│   ├── pom.xml              # Maven configuration
│   └── README.md            # Backend documentation
│
├── frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── features/        # Feature-based modules
│   │   ├── shared/          # Shared components and utilities
│   │   ├── api/             # API client
│   │   ├── config/          # Configuration
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── package.json         # npm dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   └── README.md            # Frontend documentation
│
├── docs/                    # Comprehensive documentation
│   ├── SRS.md               # Software Requirements Specification
│   ├── ERD.md               # Entity Relationship Diagram
│   ├── API-Spec.md          # API Specification
│   ├── Architecture.md      # Architecture Document
│   ├── CI-CD-Diagram.md     # CI/CD Pipeline Documentation
│   ├── Setup-Guide.md       # Development Setup Guide
│   └── Deployment-Guide.md  # Deployment Guide
│
├── docker-compose.yml       # Docker services configuration
├── .gitignore               # Git ignore rules
├── .editorconfig            # Editor configuration
├── LICENSE                  # MIT License
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

**For Docker Deployment (Recommended):**
- **Docker 24+** ([Download](https://www.docker.com/))
- **Docker Compose 2.0+** (included with Docker Desktop)
- **Git** ([Download](https://git-scm.com/))

**For Local Development:**
- **Java 21** or higher ([Download](https://adoptium.net/))
- **Node.js 20+** and npm 10+ ([Download](https://nodejs.org/))
- **Maven 3.8+** ([Download](https://maven.apache.org/))
- **PostgreSQL 16** ([Download](https://www.postgresql.org/)) or **Docker**
- **Git** ([Download](https://git-scm.com/))

### Option 1: Using Docker Compose (Recommended)

This is the fastest way to get the entire application stack running:

```bash
# Clone the repository
git clone https://github.com/congdinh2008/todo-devops.git
cd todo-devops

# Copy and configure environment variables (optional)
cp .env.example .env
# Edit .env if you need to change default values

# Start all services (backend, frontend, database)
docker-compose up -d

# View logs
docker-compose logs -f

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080
# - Backend Swagger: http://localhost:8080/swagger-ui.html
# - PostgreSQL: localhost:5432
```

**What happens:**
- PostgreSQL database starts and initializes
- Backend builds from source and starts (waits for database)
- Frontend builds from source and starts (waits for backend)
- All services have health checks and auto-restart

**To stop:**
```bash
# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Option 2: Manual Setup

#### 1. Database Setup

**Using Docker:**
```bash
docker run --name todo-postgres \
  -e POSTGRES_DB=tododb \
  -e POSTGRES_USER=todouser \
  -e POSTGRES_PASSWORD=todopass \
  -p 5432:5432 \
  -d postgres:16
```

**Or install PostgreSQL locally and create database:**
```sql
CREATE DATABASE tododb;
CREATE USER todouser WITH PASSWORD 'todopass';
GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;
```

#### 2. Backend Setup

```bash
cd backend

# Configure database connection in src/main/resources/application.yml
# Build and run
mvn clean install
mvn spring-boot:run

# Backend API will be available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API endpoint in .env file
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env

# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test                    # Run tests
mvn test jacoco:report      # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run tests
npm run test:coverage       # Generate coverage report
```

## 🐳 Docker Deployment

This project is fully dockerized with multi-stage builds for optimal image size and security.

### Quick Start with Docker Compose

The easiest way to run the entire stack is with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/congdinh2008/todo-devops.git
cd todo-devops

# Copy environment file and configure if needed
cp .env.example .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services will be available at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Backend Swagger UI: http://localhost:8080/swagger-ui.html
- PostgreSQL: localhost:5432

### Building Individual Images

#### Backend Image
```bash
cd backend
docker build -t todo-backend:latest .

# Run backend container
docker run -d \
  --name todo-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/tododb \
  -e SPRING_DATASOURCE_USERNAME=todouser \
  -e SPRING_DATASOURCE_PASSWORD=todopass \
  todo-backend:latest
```

#### Frontend Image
```bash
cd frontend
docker build -t todo-frontend:latest \
  --build-arg VITE_API_BASE_URL=http://localhost:8080/api .

# Run frontend container
docker run -d \
  --name todo-frontend \
  -p 3000:3000 \
  todo-frontend:latest
```

### Docker Image Features

#### Backend Image
- ✅ **Multi-stage build** for minimal image size
- ✅ **Java 21 JRE** (Alpine-based) for production
- ✅ **Non-root user** for security
- ✅ **Health checks** via Spring Boot Actuator
- ✅ **JVM optimized** for containers
- ✅ **No hardcoded credentials** - all via environment variables

#### Frontend Image
- ✅ **Multi-stage build** with Node.js builder and Nginx runtime
- ✅ **Nginx 1.25** (Alpine-based) for serving static files
- ✅ **Non-root user** for security
- ✅ **Gzip compression** enabled
- ✅ **Security headers** configured
- ✅ **Health check endpoint** at /health
- ✅ **Build-time environment variables** support

### Environment Variables

All configuration is done through environment variables. See `.env.example` for available options:

```bash
# Database Configuration
POSTGRES_DB=tododb
POSTGRES_USER=todouser
POSTGRES_PASSWORD=todopass
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=8080
SPRING_PROFILE=prod
JWT_SECRET=your-secret-key-min-256-bits
JWT_EXPIRATION=86400000

# Frontend Configuration
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Todo Application
```

**⚠️ Security Note:** Never commit `.env` file to version control. Always use strong, unique passwords and secrets in production.

### Docker Compose Commands

```bash
# Start services in detached mode
docker-compose up -d

# Start with build (force rebuild images)
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Check service status
docker-compose ps

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Stop services
docker-compose stop

# Stop and remove containers, networks
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

### Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Check frontend health
curl http://localhost:3000/health

# Check PostgreSQL health
docker-compose exec postgres pg_isready -U todouser -d tododb

# View health status in Docker
docker-compose ps
```

### Troubleshooting

#### Container won't start
```bash
# Check logs for errors
docker-compose logs -f [service-name]

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]
```

#### Database connection issues
```bash
# Verify PostgreSQL is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database manually
docker-compose exec postgres psql -U todouser -d tododb
```

#### Port conflicts
```bash
# Change ports in .env file
BACKEND_PORT=8081
FRONTEND_PORT=3001
POSTGRES_PORT=5433

# Restart services
docker-compose down
docker-compose up -d
```

#### Image build fails
```bash
# Clear Docker build cache
docker-compose build --no-cache

# Remove old images
docker image prune -a

# Check disk space
docker system df
```

#### Performance issues
```bash
# Monitor resource usage
docker stats

# Set resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Production Deployment

For production deployment:

1. **Use environment-specific configuration:**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   docker-compose --env-file .env.production up -d
   ```

2. **Use specific image tags:**
   ```yaml
   backend:
     image: todo-backend:1.0.0
   frontend:
     image: todo-frontend:1.0.0
   ```

3. **Enable HTTPS:**
   - Add reverse proxy (Nginx/Traefik)
   - Configure SSL certificates
   - Update CORS settings

4. **Use Docker secrets for sensitive data:**
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   services:
     postgres:
       secrets:
         - db_password
   ```

5. **Set up monitoring and logging:**
   - Container logs aggregation
   - Health check alerts
   - Resource monitoring

See [Deployment-Guide.md](docs/Deployment-Guide.md) for comprehensive production deployment instructions.

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [SRS.md](docs/SRS.md) | Software Requirements Specification with functional and non-functional requirements |
| [ERD.md](docs/ERD.md) | Database schema and entity relationships |
| [API-Spec.md](docs/API-Spec.md) | RESTful API endpoints specification with examples |
| [Architecture.md](docs/Architecture.md) | System architecture and design decisions |
| [CI-CD-Diagram.md](docs/CI-CD-Diagram.md) | CI/CD pipeline documentation and workflows |
| [CI-CD-Setup-Guide.md](docs/CI-CD-Setup-Guide.md) | **GitHub Actions CI/CD setup and troubleshooting guide** |
| [Setup-Guide.md](docs/Setup-Guide.md) | Detailed development environment setup |
| [Deployment-Guide.md](docs/Deployment-Guide.md) | Production deployment instructions |
| [Docker-Guide.md](docs/Docker-Guide.md) | Docker containerization guide with troubleshooting |

## 🔒 Security Features

- JWT-based authentication and authorization
- Password encryption with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure HTTP headers
- Automated vulnerability scanning (OWASP, Trivy)

## 🚀 CI/CD Pipeline

This project includes production-ready CI/CD pipelines with GitHub Actions:

### Backend Pipeline
- ✅ **Build & Test**: Maven compilation with JUnit tests and PostgreSQL service
- ✅ **Code Coverage**: JaCoCo coverage reporting (uploaded to Codecov)
- ✅ **Security Scanning**: OWASP Dependency Check and Trivy vulnerability scanning
- ✅ **Docker Build & Push**: Automated image builds and pushes to Docker Hub
- ✅ **Artifacts**: Test results, coverage reports, and security scan results

### Frontend Pipeline
- ✅ **Build & Test**: npm build with Vitest unit tests
- ✅ **Code Quality**: ESLint linting and Prettier formatting checks
- ✅ **Code Coverage**: Vitest coverage reporting (uploaded to Codecov)
- ✅ **Security Scanning**: npm audit and Trivy vulnerability scanning
- ✅ **Docker Build & Push**: Automated image builds and pushes to Docker Hub
- ✅ **Artifacts**: Test results, coverage reports, and security scan results

### PR Validation
- ✅ **Automated Checks**: Quick validation of changed components on pull requests
- ✅ **Change Detection**: Automatically detects backend/frontend changes
- ✅ **Status Reporting**: Comments on PRs with validation summary
- ✅ **Branch Protection**: Ensures tests pass before merging

### Features
- 🔐 **Secrets Management**: Docker Hub credentials via GitHub Secrets
- 🐳 **Docker Images**: Automatic tagging with branch names and commit SHAs
- 🛡️ **Security First**: Multiple layers of security scanning
- 📊 **Coverage Reporting**: Integrated with Codecov
- 🔔 **Failure Notifications**: Automated alerts on pipeline failures
- ⚡ **Optimized**: Caching for faster builds (Maven, npm, Docker layers)

### Getting Started with CI/CD
1. **Configure Secrets**: Add `DOCKER_USERNAME` and `DOCKER_PASSWORD` in repository settings
2. **Push Changes**: Workflows automatically trigger on push to main/develop
3. **Create PR**: PR validation runs automatically on pull requests
4. **View Results**: Check Actions tab for workflow runs and artifacts

For detailed setup instructions, see [CI-CD-Setup-Guide.md](docs/CI-CD-Setup-Guide.md).

See [CI-CD-Diagram.md](docs/CI-CD-Diagram.md) for detailed pipeline documentation.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow Clean Architecture** principles
3. **Write tests** for new features (maintain >80% coverage)
4. **Follow code style** (use EditorConfig)
5. **Update documentation** as needed
6. **Submit a Pull Request** with a clear description

### Code Style
- Backend: Follow Java conventions, 4 spaces indentation
- Frontend: Use TypeScript strict mode, 2 spaces indentation
- All: Use EditorConfig settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

**Cong Dinh** - [@congdinh2008](https://github.com/congdinh2008)

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Spring Boot community
- React and TypeScript communities
- All contributors and supporters

## 📞 Support

For questions or issues:
- Open an [Issue](https://github.com/congdinh2008/todo-devops/issues)
- Check [Documentation](docs/)
- Contact: congdinh2008@gmail.com

---

**⭐ If you find this project useful, please consider giving it a star!**
