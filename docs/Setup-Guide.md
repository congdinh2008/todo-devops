# Development Setup Guide
# Todo Application

**Version**: 1.0  
**Last Updated**: 2024

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [IDE Configuration](#ide-configuration)
6. [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Download |
|----------|---------|---------|----------|
| Java JDK | 21 (LTS) | Backend runtime | [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/) |
| Maven | 3.9+ | Build tool | [Apache Maven](https://maven.apache.org/download.cgi) |
| Node.js | 20+ | Frontend runtime | [Node.js](https://nodejs.org/) |
| npm | 10+ | Package manager | (comes with Node.js) |
| PostgreSQL | 16 | Database | [PostgreSQL](https://www.postgresql.org/download/) |
| Git | Latest | Version control | [Git](https://git-scm.com/downloads) |
| Docker | Latest | Containerization | [Docker](https://www.docker.com/products/docker-desktop) |

### Optional Tools

- **IntelliJ IDEA** or **Eclipse** - Java IDE
- **VS Code** - Frontend development
- **Postman** - API testing
- **pgAdmin** - PostgreSQL GUI
- **Docker Desktop** - Container management

---

## Backend Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/congdinh2008/todo-devops.git
cd todo-devops/backend
```

### Step 2: Verify Java Installation

```bash
java -version
# Should show: openjdk version "21.x.x"

mvn -version
# Should show: Apache Maven 3.9.x
```

### Step 3: Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tododb
spring.datasource.username=todouser
spring.datasource.password=todopass
```

### Step 4: Install Dependencies

```bash
mvn clean install -DskipTests
```

This command:
- Downloads all dependencies
- Compiles the code
- Packages the application
- Skips running tests (for faster initial setup)

### Step 5: Run Database Migrations

```bash
# If using Flyway or Liquibase (to be added in future sprints)
mvn flyway:migrate
```

### Step 6: Run the Application

```bash
mvn spring-boot:run
```

The backend will start at: `http://localhost:8080/api`

### Step 7: Verify Backend is Running

Open browser and navigate to:
- Health check: `http://localhost:8080/api/actuator/health`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Verify Node.js Installation

```bash
node -v
# Should show: v20.x.x

npm -v
# Should show: 10.x.x
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all packages defined in `package.json`.

### Step 4: Configure Environment Variables

Create `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Step 5: Run Development Server

```bash
npm run dev
```

The frontend will start at: `http://localhost:3000`

### Step 6: Verify Frontend is Running

Open browser and navigate to: `http://localhost:3000`

You should see the Todo Application homepage.

---

## Database Setup

### Option 1: Local PostgreSQL Installation

#### Install PostgreSQL

**macOS (using Homebrew)**:
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
Download installer from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

#### Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE tododb;
CREATE USER todouser WITH ENCRYPTED PASSWORD 'todopass';
GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;

# Grant schema permissions (PostgreSQL 15+)
\c tododb
GRANT ALL ON SCHEMA public TO todouser;

# Exit
\q
```

#### Verify Connection

```bash
psql -U todouser -d tododb -h localhost
```

---

### Option 2: Docker PostgreSQL

#### Start PostgreSQL Container

```bash
docker run --name todo-postgres \
  -e POSTGRES_DB=tododb \
  -e POSTGRES_USER=todouser \
  -e POSTGRES_PASSWORD=todopass \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  -d postgres:16
```

#### Verify Container is Running

```bash
docker ps
```

#### Connect to Database

```bash
docker exec -it todo-postgres psql -U todouser -d tododb
```

#### Stop Container

```bash
docker stop todo-postgres
```

#### Start Existing Container

```bash
docker start todo-postgres
```

---

### Option 3: Docker Compose (Recommended)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: todo-postgres
    environment:
      POSTGRES_DB: tododb
      POSTGRES_USER: todouser
      POSTGRES_PASSWORD: todopass
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U todouser -d tododb"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

#### Start Services

```bash
docker-compose up -d
```

#### Stop Services

```bash
docker-compose down
```

#### View Logs

```bash
docker-compose logs -f postgres
```

---

## IDE Configuration

### IntelliJ IDEA (Backend)

#### 1. Install Lombok Plugin
- Go to `File > Settings > Plugins`
- Search for "Lombok"
- Install and restart IDE

#### 2. Enable Annotation Processing
- Go to `File > Settings > Build, Execution, Deployment > Compiler > Annotation Processors`
- Check "Enable annotation processing"

#### 3. Import Maven Project
- `File > Open` → Select `backend/pom.xml`
- Select "Open as Project"
- Wait for Maven to download dependencies

#### 4. Configure Run Configuration
- `Run > Edit Configurations`
- Click `+` → `Spring Boot`
- Main class: `com.congdinh.todo.TodoApplication`
- Working directory: `$MODULE_WORKING_DIR$`

#### 5. Code Style
- `File > Settings > Editor > Code Style`
- Import code style: `codestyle.xml` (if provided)

---

### VS Code (Frontend)

#### 1. Install Extensions
```bash
# Required extensions
- ESLint
- Prettier - Code formatter
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin (Volar)
```

#### 2. Configure Settings
Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

#### 3. Configure Launch Configuration
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TodoServiceTest

# Run tests with coverage
mvn clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Frontend Tests

```bash
cd frontend

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

---

## Building for Development

### Backend

```bash
cd backend
mvn clean package -DskipTests
```

Output: `target/todo-backend-1.0.0-SNAPSHOT.jar`

### Frontend

```bash
cd frontend
npm run build
```

Output: `dist/` directory

---

## Environment Variables

### Backend

Edit `backend/src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/tododb
spring.datasource.username=todouser
spring.datasource.password=todopass

# JWT
jwt.secret=your-secret-key-for-development
jwt.expiration=86400000

# Logging
logging.level.com.congdinh.todo=DEBUG
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Todo Application
VITE_APP_VERSION=1.0.0
```

---

## Common Issues

### Issue 1: Port Already in Use

**Error**: "Port 8080 is already in use"

**Solution**:
```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

---

### Issue 2: Database Connection Failed

**Error**: "Connection to localhost:5432 refused"

**Solution**:
1. Check if PostgreSQL is running:
   ```bash
   docker ps  # if using Docker
   pg_isready -h localhost -p 5432  # if local install
   ```

2. Verify credentials in `application.properties`

3. Check PostgreSQL logs:
   ```bash
   docker logs todo-postgres
   ```

---

### Issue 3: Maven Build Fails

**Error**: "Failed to execute goal"

**Solution**:
1. Clean Maven cache:
   ```bash
   mvn clean
   rm -rf ~/.m2/repository
   ```

2. Update Maven:
   ```bash
   mvn -version
   # Should be 3.9+
   ```

3. Check Java version:
   ```bash
   java -version
   # Must be Java 21
   ```

---

### Issue 4: npm Install Fails

**Error**: "npm ERR! code ERESOLVE"

**Solution**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Use legacy peer deps:
   ```bash
   npm install --legacy-peer-deps
   ```

---

### Issue 5: Lombok Not Working

**Error**: "Cannot resolve symbol 'log'" or getter/setter not found

**Solution**:
1. Install Lombok plugin in IDE
2. Enable annotation processing
3. Rebuild project:
   ```bash
   mvn clean install
   ```

---

## Development Workflow

### Daily Development

1. **Start PostgreSQL**:
   ```bash
   docker-compose up -d postgres
   ```

2. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Make Changes**: Edit code as needed

5. **Run Tests**: Verify your changes
   ```bash
   # Backend
   mvn test
   
   # Frontend
   npm test
   ```

6. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature-branch
   ```

---

## Getting Help

- **Documentation**: Check `/docs` directory
- **API Docs**: `http://localhost:8080/api/swagger-ui.html`
- **Issues**: Create issue on GitHub
- **Team Chat**: Contact development team

---

**Next Steps**

Once your development environment is set up:
1. Read [Architecture.md](./Architecture.md) to understand the system design
2. Review [API-Spec.md](./API-Spec.md) for API endpoints
3. Check [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
4. Start with simple tasks and gradually take on more complex features

---

**Document Version**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial setup guide |
