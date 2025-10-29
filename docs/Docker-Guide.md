# Docker Deployment Guide

## 📦 Overview

This guide provides comprehensive instructions for deploying the Todo Application using Docker and Docker Compose. The application is fully containerized with multi-stage builds for optimal security and performance.

## 🏗️ Architecture

The Docker setup consists of three main services:

```
┌─────────────────────────────────────────────────┐
│           Docker Network (todo-network)         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  PostgreSQL  │  │   Backend    │           │
│  │  (Port 5432) │◄─┤  (Port 8080) │           │
│  │              │  │  Spring Boot │           │
│  └──────────────┘  └───────┬──────┘           │
│         ▲                   │                   │
│         │                   ▼                   │
│         │          ┌──────────────┐            │
│         │          │   Frontend   │            │
│         │          │  (Port 3000) │            │
│         │          │ React + Nginx│            │
│         │          └──────────────┘            │
│         │                                       │
│    ┌────┴─────────────────────┐               │
│    │   Persistent Volume       │               │
│    │   (postgres-data)         │               │
│    └──────────────────────────┘               │
└─────────────────────────────────────────────────┘
```

## 🔑 Key Features

### Backend Docker Image
- ✅ **Multi-stage build** (Maven builder + JRE runtime)
- ✅ **Base images:**
  - Builder: `maven:3.9-eclipse-temurin-21-alpine`
  - Runtime: `eclipse-temurin:21-jre-alpine`
- ✅ **Image size:** ~200MB (optimized)
- ✅ **Security:**
  - Non-root user (UID 1001)
  - No hardcoded credentials
  - JVM container awareness enabled
- ✅ **Health check:** Spring Boot Actuator on `/actuator/health`
- ✅ **Process management:** dumb-init for proper signal handling

### Frontend Docker Image
- ✅ **Multi-stage build** (Node.js builder + Nginx runtime)
- ✅ **Base images:**
  - Builder: `node:20-alpine`
  - Runtime: `nginx:1.25-alpine`
- ✅ **Image size:** ~25MB (optimized)
- ✅ **Security:**
  - Non-root user (UID 1001)
  - Security headers configured
  - Gzip compression enabled
- ✅ **Health check:** Custom `/health` endpoint
- ✅ **Process management:** dumb-init for proper signal handling

### PostgreSQL Database
- ✅ **Base image:** `postgres:16-alpine`
- ✅ **Persistent volume:** Automatic data persistence
- ✅ **Health check:** `pg_isready` command
- ✅ **Configuration:** Environment variables

## 🚀 Quick Start

### Prerequisites

- Docker 24+ installed ([Download](https://www.docker.com/))
- Docker Compose 2.0+ (included with Docker Desktop)
- At least 4GB RAM available for Docker
- At least 10GB free disk space

### Step 1: Clone Repository

```bash
git clone https://github.com/congdinh2008/todo-devops.git
cd todo-devops
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your preferred settings
# IMPORTANT: Change passwords and secrets in production!
nano .env
```

### Step 3: Start Services

```bash
# Build and start all services
docker compose up -d

# Or build from scratch (no cache)
docker compose up -d --build --no-cache

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
```

### Step 4: Verify Deployment

```bash
# Check service status
docker compose ps

# Test backend health
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost:3000/health

# Test database
docker compose exec postgres pg_isready -U todouser -d tododb
```

**Access Points:**
- Frontend UI: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs
- PostgreSQL: localhost:5432

## 🔧 Configuration

### Environment Variables

All configuration is done through environment variables in the `.env` file:

#### Database Configuration
```bash
POSTGRES_DB=tododb          # Database name
POSTGRES_USER=todouser      # Database user
POSTGRES_PASSWORD=todopass  # Database password (CHANGE IN PRODUCTION!)
POSTGRES_PORT=5432          # Database port
```

#### Backend Configuration
```bash
BACKEND_PORT=8080                    # Backend port
SPRING_PROFILE=prod                  # Spring profile (dev/test/prod)
SPRING_JPA_DDL_AUTO=update          # Hibernate DDL mode
SPRING_JPA_SHOW_SQL=false           # Show SQL queries
JWT_SECRET=your-secret-key          # JWT secret (min 256 bits)
JWT_EXPIRATION=86400000             # JWT expiration (ms)
```

#### Frontend Configuration
```bash
FRONTEND_PORT=3000                          # Frontend port
VITE_API_BASE_URL=http://localhost:8080/api # Backend API URL
VITE_APP_NAME=Todo Application              # Application name
```

### Docker Compose Configuration

The `docker-compose.yml` file defines three services:

#### PostgreSQL Service
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    - POSTGRES_DB
    - POSTGRES_USER
    - POSTGRES_PASSWORD
  volumes:
    - postgres-data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 10s
    timeout: 5s
    retries: 5
```

#### Backend Service
```yaml
backend:
  build: ./backend
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    - SPRING_DATASOURCE_URL
    - SPRING_DATASOURCE_USERNAME
    - SPRING_DATASOURCE_PASSWORD
    - JWT_SECRET
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost:8080/actuator/health"]
    interval: 30s
```

#### Frontend Service
```yaml
frontend:
  build:
    context: ./frontend
    args:
      - VITE_API_BASE_URL
  depends_on:
    backend:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
    interval: 30s
```

## 📊 Docker Commands Reference

### Service Management

```bash
# Start services
docker compose up -d

# Start specific service
docker compose up -d backend

# Stop services
docker compose stop

# Stop specific service
docker compose stop backend

# Restart services
docker compose restart

# Restart specific service
docker compose restart backend

# Remove containers (keeps volumes)
docker compose down

# Remove everything including volumes
docker compose down -v

# Remove everything including images
docker compose down --rmi all
```

### Building Images

```bash
# Build all images
docker compose build

# Build specific service
docker compose build backend

# Build without cache
docker compose build --no-cache

# Build with progress output
docker compose build --progress=plain

# Pull latest base images before building
docker compose build --pull
```

### Viewing Logs

```bash
# View all logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# View last 100 lines
docker compose logs --tail=100

# View logs with timestamps
docker compose logs -t
```

### Inspecting Containers

```bash
# List running containers
docker compose ps

# List all containers (including stopped)
docker compose ps -a

# View container details
docker inspect todo-backend

# View container stats
docker stats

# View container processes
docker compose top
```

### Executing Commands

```bash
# Execute command in backend container
docker compose exec backend sh

# Execute command in database
docker compose exec postgres psql -U todouser -d tododb

# Execute command in frontend
docker compose exec frontend sh

# Run as root user
docker compose exec -u root backend sh
```

## 🔍 Troubleshooting

### Container Won't Start

**Problem:** Container keeps restarting or won't start.

**Solution:**
```bash
# Check logs for errors
docker compose logs -f [service-name]

# Check container status
docker compose ps

# Inspect container details
docker inspect [container-name]

# Try starting with explicit rebuild
docker compose up -d --build
```

### Database Connection Errors

**Problem:** Backend can't connect to database.

**Solution:**
```bash
# Verify PostgreSQL is healthy
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Verify database credentials in .env
cat .env | grep POSTGRES

# Test database connection manually
docker compose exec postgres psql -U todouser -d tododb -c "\l"

# Restart backend after database is ready
docker compose restart backend
```

### Port Conflicts

**Problem:** Port already in use error.

**Solution:**
```bash
# Check which process is using the port
lsof -i :8080
lsof -i :3000
lsof -i :5432

# Change ports in .env file
BACKEND_PORT=8081
FRONTEND_PORT=3001
POSTGRES_PORT=5433

# Restart services
docker compose down
docker compose up -d
```

### Build Failures

**Problem:** Docker build fails.

**Solution:**
```bash
# Clear Docker build cache
docker builder prune -a

# Remove old images
docker image prune -a

# Check disk space
docker system df

# Build with no cache
docker compose build --no-cache

# Build with verbose output
docker compose build --progress=plain
```

### Health Check Failures

**Problem:** Container is unhealthy.

**Solution:**
```bash
# Check health status
docker compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' [container-name] | jq

# Test health endpoint manually
docker compose exec backend wget -q -O- http://localhost:8080/actuator/health
docker compose exec frontend wget -q -O- http://localhost:3000/health

# Increase health check timeouts in docker-compose.yml
healthcheck:
  start_period: 60s  # Increase if needed
  interval: 30s
  timeout: 10s
```

### Network Issues

**Problem:** Services can't communicate.

**Solution:**
```bash
# List Docker networks
docker network ls

# Inspect network
docker network inspect todo-network

# Verify containers are on the same network
docker network inspect todo-network | grep -A 3 "Containers"

# Recreate network
docker compose down
docker compose up -d
```

### Volume Issues

**Problem:** Data not persisting or volume errors.

**Solution:**
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect todo_postgres-data

# Remove volume (WARNING: deletes all data)
docker compose down -v

# Backup volume data before removing
docker run --rm -v todo_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

### Performance Issues

**Problem:** Containers are slow or consuming too many resources.

**Solution:**
```bash
# Check resource usage
docker stats

# Set resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

# Check logs for performance issues
docker compose logs -f backend | grep -i "slow\|timeout\|error"

# Restart services
docker compose restart
```

## 🛡️ Security Best Practices

### 1. Change Default Credentials

```bash
# Generate strong passwords
openssl rand -base64 32

# Update .env file with strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
```

### 2. Use Docker Secrets (Production)

```yaml
# docker-compose.prod.yml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

### 3. Network Security

```yaml
# Restrict network access
services:
  postgres:
    networks:
      - backend-network
    # Don't expose port to host in production
    # ports:
    #   - "5432:5432"
```

### 4. Read-Only Filesystems

```yaml
# Make containers read-only where possible
services:
  frontend:
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
```

### 5. Security Scanning

```bash
# Scan images for vulnerabilities
docker scan todo-backend:latest
docker scan todo-frontend:latest

# Use Trivy for comprehensive scanning
trivy image todo-backend:latest
trivy image todo-frontend:latest
```

## 🚀 Production Deployment

### 1. Use Tagged Images

```yaml
services:
  backend:
    image: todo-backend:1.0.0
  frontend:
    image: todo-frontend:1.0.0
```

### 2. Configure Logging

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. Set Restart Policies

```yaml
services:
  backend:
    restart: unless-stopped
  frontend:
    restart: unless-stopped
  postgres:
    restart: unless-stopped
```

### 4. Use Health Checks

All services include health checks:
- PostgreSQL: `pg_isready` command
- Backend: Spring Boot Actuator endpoint
- Frontend: Custom health endpoint

### 5. Configure Backup

```bash
# Backup database
docker compose exec postgres pg_dump -U todouser tododb > backup.sql

# Backup volume
docker run --rm -v todo_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore database
docker compose exec -T postgres psql -U todouser tododb < backup.sql

# Restore volume
docker run --rm -v todo_postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## 📈 Monitoring

### Container Health

```bash
# Check health status
docker compose ps

# View health check results
docker inspect --format='{{json .State.Health}}' [container-name] | jq

# Monitor in real-time
watch docker compose ps
```

### Resource Usage

```bash
# View resource usage
docker stats

# Export metrics
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Logs Aggregation

```bash
# Use Docker logging drivers
services:
  backend:
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://192.168.0.42:514"
```

## 🔄 Updates and Maintenance

### Updating Images

```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build

# Remove old images
docker image prune -a
```

### Database Migrations

```bash
# Backup before migration
docker compose exec postgres pg_dump -U todouser tododb > pre-migration-backup.sql

# Run migrations (if applicable)
docker compose exec backend java -jar app.jar --spring.jpa.hibernate.ddl-auto=validate

# Verify migration
docker compose logs backend | grep -i "migration\|schema"
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything (WARNING: removes all unused resources)
docker system prune -a --volumes
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [React Docker Guide](https://create-react-app.dev/docs/deployment/#docker)
- [PostgreSQL Docker Guide](https://hub.docker.com/_/postgres)

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/congdinh2008/todo-devops/issues)
2. Review container logs: `docker compose logs -f`
3. Verify environment configuration: `cat .env`
4. Check Docker resources: `docker system df`
5. Contact: congdinh2008@gmail.com

---

**Last Updated:** October 2025  
**Version:** 1.0.0
