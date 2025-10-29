# Todo Application - Enterprise Edition

A modern, full-stack todo application built with Clean Architecture principles, designed for scalability, maintainability, and enterprise-grade quality.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Todo Application is a comprehensive task management system built with enterprise-grade technologies and best practices. It demonstrates:

- **Clean Architecture** - Separation of concerns across 4 distinct layers
- **Test-Driven Development** - High test coverage with unit and integration tests
- **Modern Tech Stack** - Latest versions of Java 21, Spring Boot 3.x, React 18, TypeScript
- **CI/CD Pipeline** - Automated builds, tests, and deployments
- **Security First** - JWT authentication, HTTPS, input validation
- **Scalability** - Stateless design, horizontal scaling, containerization

---

## ✨ Features

### Core Functionality
- ✅ User authentication and authorization (JWT-based)
- ✅ Create, read, update, delete todos (CRUD operations)
- ✅ Set todo priority (LOW, MEDIUM, HIGH)
- ✅ Set due dates for todos
- ✅ Mark todos as complete/incomplete
- ✅ Search and filter todos
- ✅ User profile management

### Technical Features
- 🏗️ Clean Architecture with clear layer separation
- 🔐 Secure authentication with JWT tokens
- 📊 RESTful API with OpenAPI/Swagger documentation
- 🎨 Responsive React UI with TypeScript
- 🗃️ PostgreSQL database with proper indexing
- 🐳 Docker containerization
- ☸️ Kubernetes-ready deployments
- 📈 Comprehensive monitoring and logging
- 🧪 High test coverage (>80%)

---

## 🏛️ Architecture

The application follows **Clean Architecture** principles with dependencies flowing inward:

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│              (Controllers, Filters, UI)                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Application Layer                       │
│           (Use Cases, DTOs, Services)                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Domain Layer                          │
│         (Entities, Business Logic, Rules)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Infrastructure Layer                       │
│       (Database, Security, External Services)           │
└─────────────────────────────────────────────────────────┘
```

For detailed architecture information, see [Architecture.md](./docs/Architecture.md).

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 LTS | Programming language |
| Spring Boot | 3.2.0 | Application framework |
| Spring Security | 3.2.x | Authentication & authorization |
| PostgreSQL | 16 | Relational database |
| Hibernate/JPA | 6.4.x | ORM |
| Maven | 3.9+ | Build automation |
| JUnit 5 | 5.10.x | Testing framework |
| Lombok | 1.18.30 | Boilerplate reduction |
| MapStruct | 1.5.5 | Bean mapping |
| SpringDoc | 2.3.0 | API documentation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI library |
| TypeScript | 5.3 | Type-safe JavaScript |
| Vite | 5.0 | Build tool |
| React Router | 6.20 | Routing |
| TanStack Query | 5.14 | Server state management |
| Axios | 1.6 | HTTP client |
| Vitest | 1.0 | Testing framework |

### DevOps
- Docker & Docker Compose
- Kubernetes
- GitHub Actions
- SonarQube
- PostgreSQL

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21** or higher ([Download](https://adoptium.net/))
- **Maven 3.9+** ([Download](https://maven.apache.org/download.cgi))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **PostgreSQL 16** ([Download](https://www.postgresql.org/download/))
- **Docker** (optional) ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/downloads))

---

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/congdinh2008/todo-devops.git
cd todo-devops

# Start PostgreSQL with Docker
docker-compose up -d

# Backend setup
cd backend
mvn clean install
mvn spring-boot:run

# In a new terminal, start frontend
cd frontend
npm install
npm run dev
```

### Option 2: Manual Setup

#### 1. Setup Database

```bash
# Create PostgreSQL database
createdb tododb
createuser todouser --password todopass

# Or use Docker
docker run --name todo-postgres \
  -e POSTGRES_DB=tododb \
  -e POSTGRES_USER=todouser \
  -e POSTGRES_PASSWORD=todopass \
  -p 5432:5432 \
  -d postgres:16
```

#### 2. Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080/api`

#### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 🎉 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation (Swagger)**: http://localhost:8080/api/swagger-ui.html
- **Health Check**: http://localhost:8080/api/actuator/health

---

## 📁 Project Structure

```
todo-devops/
├── backend/                    # Java Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/congdinh/todo/
│   │   │   │   ├── domain/            # Domain layer
│   │   │   │   ├── application/       # Application layer
│   │   │   │   ├── infrastructure/    # Infrastructure layer
│   │   │   │   └── api/               # Presentation layer
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── README.md
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── features/          # Feature-based modules
│   │   │   ├── todos/
│   │   │   └── auth/
│   │   ├── shared/            # Shared components
│   │   ├── api/               # API client
│   │   └── config/            # Configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
├── docs/                       # Documentation
│   ├── SRS.md                 # Requirements specification
│   ├── ERD.md                 # Database schema
│   ├── API-Spec.md            # API specification
│   ├── Architecture.md        # Architecture document
│   ├── CI-CD-Diagram.md       # CI/CD pipeline
│   ├── Setup-Guide.md         # Development setup
│   └── Deployment-Guide.md    # Production deployment
├── docker-compose.yml          # Docker services
├── .gitignore
├── .editorconfig
├── LICENSE
└── README.md
```

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [SRS.md](./docs/SRS.md) | Software Requirements Specification |
| [ERD.md](./docs/ERD.md) | Entity Relationship Diagram & Database Schema |
| [API-Spec.md](./docs/API-Spec.md) | RESTful API Specification |
| [Architecture.md](./docs/Architecture.md) | System Architecture & Design |
| [CI-CD-Diagram.md](./docs/CI-CD-Diagram.md) | CI/CD Pipeline Documentation |
| [Setup-Guide.md](./docs/Setup-Guide.md) | Development Environment Setup |
| [Deployment-Guide.md](./docs/Deployment-Guide.md) | Production Deployment Guide |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run with coverage report
mvn clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Frontend Tests

```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

---

## 🔧 Development

### Backend Development

```bash
# Build project
mvn clean install

# Run in development mode
mvn spring-boot:run

# Format code (if configured)
mvn spotless:apply

# Run linter
mvn checkstyle:check
```

### Frontend Development

```bash
# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## 🐳 Docker

### Build Images

```bash
# Build backend image
cd backend
mvn clean package -DskipTests
docker build -t todo-backend:1.0.0 .

# Build frontend image
cd frontend
npm run build
docker build -t todo-frontend:1.0.0 .
```

### Run with Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👥 Team

- **Product Owner**: [Name]
- **Tech Lead**: [Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **DevOps Engineer**: [Name]

---

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Spring Boot team
- React team
- All open-source contributors

---

## 📞 Support

For questions or issues:
- Create an [Issue](https://github.com/congdinh2008/todo-devops/issues)
- Email: support@todo-app.com
- Documentation: [docs/](./docs/)

---

**Built with ❤️ using Clean Architecture principles**
