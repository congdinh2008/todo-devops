# Development Setup Guide

**Project:** Todo Application  
**Version:** 1.0.0  
**Date:** 2024

---

## 1. Prerequisites

### 1.1 Required Software

Install the following software before starting:

| Software | Version | Download Link |
|----------|---------|---------------|
| Java JDK | 21 (LTS) | [Adoptium](https://adoptium.net/) |
| Maven | 3.8+ | [Maven](https://maven.apache.org/download.cgi) |
| Node.js | 20+ | [Node.js](https://nodejs.org/) |
| npm | 10+ | Included with Node.js |
| PostgreSQL | 16 | [PostgreSQL](https://www.postgresql.org/download/) |
| Docker | Latest | [Docker](https://www.docker.com/get-started) |
| Docker Compose | Latest | Included with Docker Desktop |
| Git | Latest | [Git](https://git-scm.com/downloads) |

### 1.2 Optional Tools

| Tool | Purpose |
|------|---------|
| IntelliJ IDEA / VS Code | IDE for development |
| Postman / Insomnia | API testing |
| DBeaver / pgAdmin | Database management |
| Docker Desktop | GUI for Docker |

---

## 2. Environment Setup

### 2.1 Verify Installations

```bash
# Check Java version
java -version
# Expected: openjdk version "21.x.x"

# Check Maven version
mvn -version
# Expected: Apache Maven 3.8.x or higher

# Check Node.js version
node --version
# Expected: v20.x.x or higher

# Check npm version
npm --version
# Expected: 10.x.x or higher

# Check PostgreSQL version
psql --version
# Expected: psql (PostgreSQL) 16.x

# Check Docker version
docker --version
# Expected: Docker version 24.x.x or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 2.x.x or higher

# Check Git version
git --version
# Expected: git version 2.x.x or higher
```

---

## 3. Project Setup

### 3.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/congdinh2008/todo-devops.git

# Navigate to project directory
cd todo-devops

# Check repository structure
ls -la
# You should see: backend/, frontend/, docs/, etc.
```

### 3.2 IDE Configuration

#### IntelliJ IDEA

1. Open IntelliJ IDEA
2. File → Open → Select `todo-devops` folder
3. Wait for Maven/Gradle sync to complete
4. Configure JDK:
   - File → Project Structure → Project SDK → Select Java 21
5. Enable annotation processing:
   - File → Settings → Build, Execution, Deployment → Compiler → Annotation Processors
   - Check "Enable annotation processing"

#### VS Code

1. Open VS Code
2. File → Open Folder → Select `todo-devops`
3. Install recommended extensions:
   - Java Extension Pack
   - Spring Boot Extension Pack
   - ESLint
   - Prettier
   - TypeScript Vue Plugin (Volar)
4. Configure settings.json:

```json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-21",
      "path": "/path/to/java-21"
    }
  ],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## 4. Database Setup

### 4.1 Option 1: Docker (Recommended)

```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d postgres

# Verify container is running
docker ps

# Check logs
docker logs todo-postgres

# Access PostgreSQL CLI
docker exec -it todo-postgres psql -U todouser -d tododb
```

### 4.2 Option 2: Local PostgreSQL Installation

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database and user
psql postgres
```

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-16 postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres
psql
```

#### Windows
1. Download PostgreSQL installer from official website
2. Run installer and follow setup wizard
3. Remember the password you set for postgres user
4. Open pgAdmin or use command line

### 4.3 Create Database

```sql
-- Connect to PostgreSQL (as superuser)
psql -U postgres

-- Create database
CREATE DATABASE tododb;

-- Create user
CREATE USER todouser WITH PASSWORD 'todopass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;

-- Grant schema privileges (PostgreSQL 15+)
\c tododb
GRANT ALL ON SCHEMA public TO todouser;

-- Exit
\q
```

### 4.4 Verify Database Connection

```bash
# Test connection
psql -h localhost -U todouser -d tododb -c "SELECT version();"

# You should see PostgreSQL version information
```

---

## 5. Backend Setup

### 5.1 Configure Application Properties

Create `backend/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: todo-backend
  
  datasource:
    url: jdbc:postgresql://localhost:5432/tododb
    username: todouser
    password: todopass
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  security:
    jwt:
      secret: your-secret-key-change-this-in-production
      expiration: 86400000 # 24 hours

server:
  port: 8080
  servlet:
    context-path: /api/v1

logging:
  level:
    com.congdinh.todo: DEBUG
    org.springframework.security: DEBUG
```

### 5.2 Build Backend

```bash
cd backend

# Clean and install dependencies
mvn clean install

# Run tests
mvn test

# Generate coverage report
mvn clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html  # macOS
# or
xdg-open target/site/jacoco/index.html  # Linux
# or
start target/site/jacoco/index.html  # Windows
```

### 5.3 Run Backend

```bash
# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using JAR file
mvn clean package -DskipTests
java -jar target/todo-backend-1.0.0-SNAPSHOT.jar

# Backend should start on http://localhost:8080
```

### 5.4 Verify Backend

```bash
# Check health endpoint (once implemented)
curl http://localhost:8080/api/v1/actuator/health

# Access Swagger UI (once implemented)
# Open browser: http://localhost:8080/swagger-ui.html
```

---

## 6. Frontend Setup

### 6.1 Install Dependencies

```bash
cd frontend

# Install dependencies
npm install

# or using npm ci for consistent installs
npm ci
```

### 6.2 Configure Environment

Create `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Application Configuration
VITE_APP_NAME=Todo Application
VITE_APP_VERSION=1.0.0

# Environment
VITE_ENV=development
```

### 6.3 Run Frontend

```bash
# Start development server with hot reload
npm run dev

# Frontend should start on http://localhost:3000
```

### 6.4 Build Frontend

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Build output will be in dist/ directory
```

### 6.5 Run Tests

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html  # macOS
# or
xdg-open coverage/index.html  # Linux
```

### 6.6 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Format code with Prettier
npm run format
```

---

## 7. Full Stack Development

### 7.1 Using Docker Compose

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### 7.2 Development Workflow

1. **Start Database:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Start Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Start Frontend (in new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - Database: localhost:5432

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Port Already in Use

**Error:** "Port 8080 is already in use"

**Solution:**
```bash
# Find process using port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Database Connection Failed

**Error:** "Connection refused" or "Password authentication failed"

**Solution:**
```bash
# Verify PostgreSQL is running
pg_isready

# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql@16  # macOS

# Verify credentials in application.yml match database
```

#### Maven Build Fails

**Error:** "Failed to execute goal"

**Solution:**
```bash
# Clean Maven cache
mvn dependency:purge-local-repository

# Delete .m2 directory and rebuild
rm -rf ~/.m2/repository
mvn clean install

# Update Maven wrapper
mvn -N wrapper:wrapper
```

#### npm Install Fails

**Error:** "EACCES" or "Permission denied"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If permission issues persist (not recommended for production)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 8.2 Database Reset

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS tododb;"
psql -U postgres -c "CREATE DATABASE tododb;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;"

# Rerun application (ddl-auto: update will recreate tables)
```

### 8.3 Clean Development Environment

```bash
# Backend
cd backend
mvn clean

# Frontend
cd frontend
rm -rf node_modules dist
npm install

# Docker
docker-compose down -v
docker system prune -a
```

---

## 9. Development Tools

### 9.1 Recommended VS Code Extensions

```json
{
  "recommendations": [
    "vscjava.vscode-java-pack",
    "vmware.vscode-spring-boot",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense"
  ]
}
```

### 9.2 Git Configuration

```bash
# Configure Git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure line endings
git config --global core.autocrlf input  # macOS/Linux
git config --global core.autocrlf true   # Windows

# Set default editor
git config --global core.editor "code --wait"

# Enable color output
git config --global color.ui auto
```

### 9.3 Git Hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "Running pre-commit checks..."

# Backend tests
cd backend
mvn test -q
if [ $? -ne 0 ]; then
    echo "Backend tests failed!"
    exit 1
fi

# Frontend tests
cd ../frontend
npm test --run
if [ $? -ne 0 ]; then
    echo "Frontend tests failed!"
    exit 1
fi

echo "All checks passed!"
exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 10. Testing Guidelines

### 10.1 Backend Testing

```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TodoServiceTest

# Run tests with coverage
mvn clean test jacoco:report

# Skip tests during build
mvn clean package -DskipTests
```

### 10.2 Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run specific test file
npm test TodoList.test.tsx

# Run tests in watch mode
npm test -- --watch

# Generate coverage
npm run test:coverage
```

---

## 11. API Development

### 11.1 Testing API with cURL

```bash
# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get todos (replace TOKEN with actual JWT)
curl -X GET http://localhost:8080/api/v1/todos \
  -H "Authorization: Bearer <TOKEN>"
```

### 11.2 Postman Collection

Import the Postman collection from `/docs/postman_collection.json` (to be created).

---

## 12. Documentation

### 12.1 Generate Documentation

```bash
# Backend (JavaDoc)
cd backend
mvn javadoc:javadoc
open target/site/apidocs/index.html

# Frontend (TypeDoc)
cd frontend
npm run docs
open docs/index.html
```

### 12.2 API Documentation

Once backend is running, access:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

---

## 13. Next Steps

After completing the setup:

1. Review the architecture documentation: `/docs/Architecture.md`
2. Read the API specification: `/docs/API-Spec.md`
3. Understand the database schema: `/docs/ERD.md`
4. Follow coding conventions in the README files
5. Start implementing features from Sprint 2

---

## 14. Getting Help

If you encounter issues:

1. Check this setup guide
2. Review documentation in `/docs`
3. Search existing GitHub issues
4. Ask in team chat/Slack
5. Create a new GitHub issue with:
   - Detailed error description
   - Steps to reproduce
   - Environment details
   - Logs/screenshots

---

## 15. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial setup guide |
