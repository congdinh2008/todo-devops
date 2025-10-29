# Todo Application - Enterprise DevOps Project

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

Ensure you have the following installed:
- **Java 21** or higher ([Download](https://adoptium.net/))
- **Node.js 20+** and npm 10+ ([Download](https://nodejs.org/))
- **Maven 3.8+** ([Download](https://maven.apache.org/))
- **PostgreSQL 16** ([Download](https://www.postgresql.org/)) or **Docker**
- **Git** ([Download](https://git-scm.com/))

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/congdinh2008/todo-devops.git
cd todo-devops

# Start all services with Docker Compose
docker-compose up -d

# Backend will be available at http://localhost:8080
# Frontend will be available at http://localhost:3000
# PostgreSQL will be available at localhost:5432
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

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [SRS.md](docs/SRS.md) | Software Requirements Specification with functional and non-functional requirements |
| [ERD.md](docs/ERD.md) | Database schema and entity relationships |
| [API-Spec.md](docs/API-Spec.md) | RESTful API endpoints specification with examples |
| [Architecture.md](docs/Architecture.md) | System architecture and design decisions |
| [CI-CD-Diagram.md](docs/CI-CD-Diagram.md) | CI/CD pipeline documentation and workflows |
| [Setup-Guide.md](docs/Setup-Guide.md) | Detailed development environment setup |
| [Deployment-Guide.md](docs/Deployment-Guide.md) | Production deployment instructions |

## 🔒 Security Features

- JWT-based authentication and authorization
- Password encryption with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure HTTP headers

## 🚀 CI/CD Pipeline

This project includes CI/CD configurations for:
- **GitHub Actions** - Automated testing and deployment
- **GitLab CI/CD** - Pipeline configuration
- **Azure DevOps** - Build and release pipelines

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
