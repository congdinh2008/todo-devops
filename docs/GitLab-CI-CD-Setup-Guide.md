# GitLab CI/CD Setup Guide

**Project:** Todo Application  
**Version:** 1.0.0  
**Last Updated:** 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Pipeline Architecture](#pipeline-architecture)
5. [Configuration](#configuration)
6. [CI/CD Variables Setup](#cicd-variables-setup)
7. [Pipeline Stages](#pipeline-stages)
8. [Deployment Environments](#deployment-environments)
9. [Caching Strategy](#caching-strategy)
10. [Security Best Practices](#security-best-practices)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## 1. Overview

This guide provides comprehensive instructions for setting up and using the GitLab CI/CD pipeline for the Todo Application monorepo. The pipeline automates:

- **Building** and **testing** backend (Java/Spring Boot) and frontend (React/TypeScript)
- **Code quality** checks (linting, formatting)
- **Security scanning** (OWASP, Trivy, npm audit)
- **Docker image building** and pushing to Docker Hub
- **Multi-environment deployment** (dev, staging, production)

### Key Features

✅ **Parallel Execution**: Backend and frontend jobs run concurrently  
✅ **Smart Caching**: Dependencies and build artifacts are cached  
✅ **Security First**: Multiple layers of vulnerability scanning  
✅ **Environment Management**: Separate dev, staging, and production deployments  
✅ **No Hardcoded Secrets**: All credentials managed via GitLab CI/CD variables  
✅ **Comprehensive Logging**: Detailed logs for troubleshooting  
✅ **Artifact Retention**: Test results and reports stored for 30 days

---

## 2. Prerequisites

### GitLab Requirements

- GitLab instance (GitLab.com or self-hosted GitLab 15.0+)
- Project with appropriate permissions (Maintainer or Owner role)
- GitLab Runner configured (shared or project-specific)

### External Services

1. **Docker Hub Account**
   - Create account at [hub.docker.com](https://hub.docker.com)
   - Create repositories: `your-username/todo-backend` and `your-username/todo-frontend`
   - Generate access token (Settings → Security → New Access Token)

2. **Runner Requirements**
   - Docker executor enabled
   - Sufficient resources (2+ CPU cores, 4GB+ RAM recommended)
   - Internet access for pulling images and dependencies

---

## 3. Quick Start

### Step 1: Fork/Clone Repository

```bash
# Clone the repository
git clone https://gitlab.com/your-username/todo-devops.git
cd todo-devops
```

### Step 2: Configure CI/CD Variables

Navigate to: **Settings → CI/CD → Variables** in your GitLab project

Add the following variables:

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `DOCKER_USERNAME` | Your Docker Hub username | ✅ | ❌ |
| `DOCKER_PASSWORD` | Your Docker Hub access token | ✅ | ✅ |

### Step 3: Push Changes

```bash
# Push to trigger pipeline
git add .
git commit -m "Configure GitLab CI/CD"
git push origin main
```

### Step 4: Monitor Pipeline

1. Navigate to **CI/CD → Pipelines** in GitLab
2. Click on the latest pipeline to view progress
3. Review job logs for any issues

---

## 4. Pipeline Architecture

### Pipeline Stages

```
┌─────────────────────────────────────────────────┐
│                 COMMIT & PUSH                   │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐         ┌─────────────┐
│  Backend    │         │  Frontend   │
│    Test     │         │    Test     │
│  (Parallel) │         │  (Parallel) │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  Backend    │         │  Frontend   │
│  Security   │         │  Security   │
│    Scan     │         │    Scan     │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  Backend    │         │  Frontend   │
│   Build     │         │   Build     │
│   Docker    │         │   Docker    │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  Backend    │         │  Frontend   │
│   Deploy    │         │   Deploy    │
└─────────────┘         └─────────────┘
```

### Stage Details

| Stage | Purpose | Duration |
|-------|---------|----------|
| **test** | Build, test, lint, coverage | 3-5 min |
| **security-scan** | OWASP, Trivy, npm audit | 2-4 min |
| **build-image** | Docker build & push | 3-6 min |
| **deploy** | Environment deployment | 1-2 min |

---

## 5. Configuration

### .gitlab-ci.yml Structure

```yaml
# Global variables
variables:
  DOCKER_DRIVER: overlay2
  BACKEND_IMAGE: "$DOCKER_USERNAME/todo-backend"
  FRONTEND_IMAGE: "$DOCKER_USERNAME/todo-frontend"

# Stages definition
stages:
  - test
  - security-scan
  - build-image
  - deploy

# Job templates for DRY principle
.backend-base:
  # Common backend configuration
  
.frontend-base:
  # Common frontend configuration

# Individual jobs
backend:test:
  # Backend testing job
```

### Change Detection Rules

Jobs only run when relevant files change:

**Backend jobs trigger on:**
- `backend/**/*` - Any file in backend directory
- `.gitlab-ci.yml` - Pipeline configuration changes

**Frontend jobs trigger on:**
- `frontend/**/*` - Any file in frontend directory
- `.gitlab-ci.yml` - Pipeline configuration changes

---

## 6. CI/CD Variables Setup

### Required Variables

#### Docker Hub Credentials

1. Navigate to **Settings → CI/CD → Variables**
2. Click **Add variable**
3. Configure as follows:

**DOCKER_USERNAME:**
- Type: Variable
- Value: Your Docker Hub username (e.g., `johndoe`)
- Protected: ✅ (only available in protected branches)
- Masked: ❌ (username is not sensitive)
- Environment scope: All

**DOCKER_PASSWORD:**
- Type: Variable
- Value: Your Docker Hub access token
- Protected: ✅
- Masked: ✅ (hides in logs)
- Environment scope: All

### Optional Variables

**Environment-specific API URLs:**

```yaml
# Development
VITE_API_BASE_URL_DEV: https://api-dev.example.com

# Staging
VITE_API_BASE_URL_STAGING: https://api-staging.example.com

# Production
VITE_API_BASE_URL_PROD: https://api.example.com
```

### Variable Precedence

GitLab resolves variables in this order:
1. Trigger variables (API/UI triggered pipelines)
2. Project-level variables (Settings → CI/CD → Variables)
3. Group-level variables (inherited from parent groups)
4. Instance-level variables (admin-defined)
5. Pipeline variables (defined in `.gitlab-ci.yml`)

---

## 7. Pipeline Stages

### Stage 1: Test

#### Backend Test Job

```yaml
backend:test:
  stage: test
  image: maven:3.9-eclipse-temurin-21-alpine
  services:
    - postgres:16-alpine
  script:
    - mvn clean compile
    - mvn test
    - mvn jacoco:report
    - mvn package -DskipTests
```

**What it does:**
- ✅ Compiles Java source code
- ✅ Runs JUnit tests with PostgreSQL
- ✅ Generates JaCoCo coverage report
- ✅ Builds JAR package

**Artifacts:**
- Test results: `backend/target/surefire-reports/`
- Coverage report: `backend/target/site/jacoco/`
- JAR file: `backend/target/*.jar`

#### Frontend Test Job

```yaml
frontend:test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm run format -- --check
    - npm test -- --run
    - npm run test:coverage -- --run
    - npm run build
```

**What it does:**
- ✅ Installs dependencies
- ✅ Runs ESLint code linting
- ✅ Checks Prettier formatting
- ✅ Executes Vitest unit tests
- ✅ Generates coverage report
- ✅ Builds production bundle

**Artifacts:**
- Coverage report: `frontend/coverage/`
- Build output: `frontend/dist/`

### Stage 2: Security Scan

#### Backend Security Scan

```yaml
backend:security-scan:
  stage: security-scan
  script:
    - mvn org.owasp:dependency-check-maven:check
    - trivy fs --severity CRITICAL,HIGH .
```

**Scans for:**
- ✅ Known CVEs in Maven dependencies (OWASP)
- ✅ OS package vulnerabilities (Trivy)
- ✅ Critical and high severity issues

#### Frontend Security Scan

```yaml
frontend:security-scan:
  stage: security-scan
  script:
    - npm audit --audit-level=moderate
    - trivy fs --severity CRITICAL,HIGH .
```

**Scans for:**
- ✅ npm package vulnerabilities
- ✅ OS package vulnerabilities (Trivy)
- ✅ Moderate to critical severity issues

### Stage 3: Build Image

#### Backend Docker Build

```yaml
backend:build-image:
  stage: build-image
  services:
    - docker:24-dind
  script:
    - docker build -t $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG backend/
    - docker push $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG
```

**Image tags created:**
- `$BACKEND_IMAGE:main` - Main branch
- `$BACKEND_IMAGE:develop` - Develop branch
- `$BACKEND_IMAGE:$CI_COMMIT_SHORT_SHA` - Commit SHA
- `$BACKEND_IMAGE:latest` - Main branch only

#### Frontend Docker Build

```yaml
frontend:build-image:
  stage: build-image
  services:
    - docker:24-dind
  script:
    - docker build --build-arg VITE_API_BASE_URL=$API_URL frontend/
    - docker push $FRONTEND_IMAGE:$CI_COMMIT_REF_SLUG
```

**Image tags created:**
- `$FRONTEND_IMAGE:main` - Main branch
- `$FRONTEND_IMAGE:develop` - Develop branch
- `$FRONTEND_IMAGE:$CI_COMMIT_SHORT_SHA` - Commit SHA
- `$FRONTEND_IMAGE:latest` - Main branch only

### Stage 4: Deploy

#### Environment Strategy

| Environment | Branch | Trigger | URL |
|------------|--------|---------|-----|
| Development | `develop` | Automatic | https://dev.example.com |
| Staging | `main` | Automatic | https://staging.example.com |
| Production | `main` | Manual | https://example.com |

#### Deployment Jobs

**Development (Auto):**
```yaml
backend:deploy-dev:
  stage: deploy
  environment:
    name: development
  only:
    - develop
```

**Production (Manual):**
```yaml
backend:deploy-prod:
  stage: deploy
  environment:
    name: production
  when: manual
  only:
    - main
```

---

## 8. Deployment Environments

### Configuring Environments

1. Navigate to **Deployments → Environments** in GitLab
2. Click **New environment**
3. Configure:
   - Name: `development`, `staging`, or `production`
   - External URL: Your application URL
   - Tier: Development, Staging, or Production

### Environment Protection

1. Navigate to **Settings → CI/CD → Protected environments**
2. Add protected environment rules:
   - Environment: `production`
   - Allowed to deploy: Maintainers only
   - Require approvals: ✅ (optional)

### Deployment Scripts

Update deployment scripts in `.gitlab-ci.yml`:

**Kubernetes Example:**
```yaml
script:
  - kubectl config use-context $KUBE_CONTEXT
  - kubectl set image deployment/backend backend=$BACKEND_IMAGE:$CI_COMMIT_SHA
  - kubectl rollout status deployment/backend
```

**Docker Compose Example:**
```yaml
script:
  - ssh user@server "docker-compose pull"
  - ssh user@server "docker-compose up -d"
```

**Custom Script Example:**
```yaml
script:
  - ./scripts/deploy.sh production $BACKEND_IMAGE:$CI_COMMIT_SHA
```

---

## 9. Caching Strategy

### Backend Cache

```yaml
cache:
  key: backend-${CI_COMMIT_REF_SLUG}
  paths:
    - .m2/repository     # Maven dependencies
    - backend/target     # Compiled classes
```

**Benefits:**
- ⚡ Faster builds (2-3x speedup)
- 💾 Reduced bandwidth usage
- 🔄 Consistent dependency versions

### Frontend Cache

```yaml
cache:
  key: frontend-${CI_COMMIT_REF_SLUG}
  paths:
    - .npm              # npm cache
    - frontend/node_modules  # Dependencies
    - frontend/dist     # Build output
```

**Benefits:**
- ⚡ 3-5x faster npm install
- 💾 Reduced npm registry requests
- 🔄 Reliable builds

### Cache Management

**Clear cache for specific job:**
```bash
# In GitLab UI: Pipeline → Job → Clear cache button
```

**Clear all project caches:**
1. Navigate to **Settings → CI/CD → Runners**
2. Click **Clear runner caches**

---

## 10. Security Best Practices

### ✅ DO

1. **Use CI/CD variables for secrets**
   - Store credentials in GitLab variables
   - Mark sensitive variables as "masked"
   - Use "protected" flag for production secrets

2. **Scan for vulnerabilities**
   - Enable OWASP dependency check
   - Run Trivy on filesystems and images
   - Review security reports regularly

3. **Limit permissions**
   - Use protected branches
   - Require approvals for production
   - Use least-privilege service accounts

4. **Use specific image versions**
   - Pin Docker image versions (e.g., `node:20-alpine`)
   - Avoid `latest` tag in production

5. **Enable audit logging**
   - Track who deployed what and when
   - Review deployment history

### ❌ DON'T

1. **Never hardcode secrets**
   ```yaml
   # ❌ WRONG
   DOCKER_PASSWORD: "mySecretPassword123"
   
   # ✅ CORRECT
   DOCKER_PASSWORD: $DOCKER_PASSWORD
   ```

2. **Don't commit credentials**
   - Never commit `.env` files
   - Add sensitive files to `.gitignore`

3. **Don't skip security scans**
   - Always review security reports
   - Don't use `allow_failure: true` without reason

4. **Don't use weak permissions**
   - Don't make all variables unprotected
   - Don't allow anyone to deploy to production

---

## 11. Troubleshooting

### Common Issues and Solutions

#### Issue 1: Pipeline Not Triggering

**Symptom:** Pipeline doesn't start after pushing code

**Solutions:**
1. Check file change detection rules in `.gitlab-ci.yml`
2. Verify GitLab Runner is active and available
3. Check pipeline trigger settings in **Settings → CI/CD → Pipelines**

```bash
# Test locally what files changed
git diff --name-only HEAD~1

# Should include backend/**/* or frontend/**/*
```

#### Issue 2: Docker Login Failed

**Symptom:** 
```
Error: Cannot perform an interactive login from a non TTY device
```

**Solutions:**
1. Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` variables are set
2. Check Docker Hub access token is valid
3. Ensure variables are available in job environment

```yaml
# Debug variables (remove in production)
before_script:
  - echo "Username: $DOCKER_USERNAME"
  - echo "Password length: ${#DOCKER_PASSWORD}"
```

#### Issue 3: Maven Build Failed

**Symptom:**
```
[ERROR] Failed to execute goal on project: Could not resolve dependencies
```

**Solutions:**
1. Clear Maven cache
2. Check internet connectivity from runner
3. Verify `pom.xml` is valid

```yaml
# Force re-download dependencies
script:
  - mvn clean install -U  # -U forces update
```

#### Issue 4: Frontend Build Out of Memory

**Symptom:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**
1. Increase Node.js memory limit
2. Use runner with more RAM

```yaml
variables:
  NODE_OPTIONS: "--max-old-space-size=4096"
```

#### Issue 5: PostgreSQL Connection Refused

**Symptom:**
```
Connection to postgres:5432 refused
```

**Solutions:**
1. Wait for PostgreSQL to be ready
2. Add health check script

```yaml
before_script:
  - |
    until pg_isready -h postgres -U test; do
      echo "Waiting for PostgreSQL..."
      sleep 2
    done
```

#### Issue 6: Cache Not Working

**Symptom:** Dependencies download every time

**Solutions:**
1. Check cache key is consistent
2. Verify runner has cache storage configured
3. Clear and rebuild cache

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}  # Branch-specific cache
  policy: pull-push  # Default: download and upload
```

#### Issue 7: Trivy Scan Timeout

**Symptom:**
```
Error: context deadline exceeded
```

**Solutions:**
1. Use Trivy cache
2. Increase job timeout
3. Skip image history

```yaml
variables:
  TRIVY_CACHE_DIR: "$CI_PROJECT_DIR/.trivycache"
script:
  - trivy image --timeout 15m --cache-dir $TRIVY_CACHE_DIR
```

### Debug Tips

#### View Job Logs

1. Navigate to **CI/CD → Pipelines**
2. Click on pipeline ID
3. Click on job name
4. Review complete logs

#### Run Jobs Locally

Use GitLab Runner locally for debugging:

```bash
# Install gitlab-runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

# Run specific job
gitlab-runner exec docker backend:test
```

#### Test Docker Build Locally

```bash
# Backend
cd backend
docker build -t test-backend .

# Frontend
cd frontend
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080/api -t test-frontend .
```

#### Validate .gitlab-ci.yml

```bash
# Using GitLab CI Lint tool
# Navigate to: CI/CD → Pipelines → CI Lint

# Or use API
curl --header "PRIVATE-TOKEN: <your_token>" \
  "https://gitlab.com/api/v4/projects/<project_id>/ci/lint" \
  --data "content=$(cat .gitlab-ci.yml)"
```

---

## 12. FAQ

### Q1: How do I add a new environment?

**A:** Add a new deploy job in `.gitlab-ci.yml`:

```yaml
backend:deploy-uat:
  stage: deploy
  environment:
    name: uat
    url: https://uat.example.com
  only:
    - uat-branch
```

### Q2: Can I skip certain jobs?

**A:** Yes, using commit messages:

```bash
# Skip all jobs
git commit -m "docs: update README [ci skip]"

# Skip specific stage (not built-in, need custom rules)
git commit -m "feat: add feature [skip security]"
```

### Q3: How do I run manual jobs?

**A:** 
1. Navigate to **CI/CD → Pipelines**
2. Click on pipeline
3. Click ▶️ play button on manual job

### Q4: Can I retry failed jobs?

**A:** Yes:
1. Click on failed job
2. Click **Retry** button
3. Or use auto-retry in job configuration:

```yaml
retry:
  max: 2
  when:
    - runner_system_failure
    - stuck_or_timeout_failure
```

### Q5: How do I schedule pipelines?

**A:**
1. Navigate to **CI/CD → Schedules**
2. Click **New schedule**
3. Configure:
   - Description: Nightly build
   - Cron: `0 2 * * *` (2 AM daily)
   - Target branch: main

### Q6: Can I use merge request pipelines?

**A:** Yes, add rules:

```yaml
rules:
  - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

### Q7: How do I view deployment history?

**A:**
1. Navigate to **Deployments → Environments**
2. Click on environment name
3. View deployment timeline

### Q8: Can I rollback deployments?

**A:** Yes:
1. Navigate to **Deployments → Environments**
2. Click on environment
3. Click **Rollback** on previous deployment

### Q9: How do I optimize pipeline speed?

**A:**
1. Use caching effectively
2. Run jobs in parallel
3. Use smaller Docker images (Alpine)
4. Skip unnecessary steps
5. Use artifacts wisely

```yaml
# Optimize example
.backend-base:
  image: maven:3.9-eclipse-temurin-21-alpine  # Alpine is smaller
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - .m2/repository
```

### Q10: How do I monitor pipeline performance?

**A:**
1. Navigate to **Analytics → CI/CD Analytics**
2. View metrics:
   - Pipeline success rate
   - Average duration
   - Job failure rate

---

## 📚 Additional Resources

### Documentation
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab Runner Documentation](https://docs.gitlab.com/runner/)
- [Docker Documentation](https://docs.docker.com/)

### Best Practices
- [GitLab CI/CD Best Practices](https://docs.gitlab.com/ee/ci/pipelines/pipeline_efficiency.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security Scanning Best Practices](https://docs.gitlab.com/ee/user/application_security/)

### Tools
- [GitLab CI Lint](https://gitlab.com/ci/lint) - Validate `.gitlab-ci.yml`
- [Trivy](https://github.com/aquasecurity/trivy) - Vulnerability scanner
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

---

## 🤝 Support

For issues or questions:
1. Check this documentation first
2. Review GitLab pipeline logs
3. Open an issue in the project repository
4. Contact the DevOps team

---

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** DevOps Team
