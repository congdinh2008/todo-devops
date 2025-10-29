# CI/CD Pipeline Documentation

**Project:** Todo Application  
**Version:** 1.0.0  
**Date:** 2024

---

## 1. Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipelines for the Todo Application across multiple platforms: GitHub Actions, GitLab CI/CD, and Azure DevOps.

---

## 2. CI/CD Principles

### 2.1 Goals
- **Automated Testing**: Run all tests on every commit
- **Fast Feedback**: Developers know about issues within minutes
- **Consistent Builds**: Same process in all environments
- **Automated Deployment**: Reduce manual errors
- **Security Scanning**: Detect vulnerabilities early

### 2.2 Pipeline Stages

```
┌─────────────┐
│   Commit    │
│   & Push    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Checkout   │
│    Code     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Install   │
│Dependencies │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Lint     │
│    Code     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │
│ Application │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Run Unit   │
│    Tests    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Integration │
│    Tests    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Security   │
│   Scan      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │
│   Docker    │
│   Image     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │
│   (Auto/    │
│   Manual)   │
└─────────────┘
```

---

## 3. GitHub Actions Pipeline

### 3.1 Workflow Configuration

**Location:** `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  JAVA_VERSION: '21'
  NODE_VERSION: '20'

jobs:
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: tododb_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'
      
      - name: Run tests with Maven
        run: |
          cd backend
          mvn clean test
      
      - name: Generate coverage report
        run: |
          cd backend
          mvn jacoco:report
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/target/site/jacoco/jacoco.xml
          flags: backend
      
      - name: Build JAR
        run: |
          cd backend
          mvn clean package -DskipTests

  frontend-test:
    name: Frontend Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Lint code
        run: |
          cd frontend
          npm run lint
      
      - name: Run tests
        run: |
          cd frontend
          npm test
      
      - name: Generate coverage
        run: |
          cd frontend
          npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend
      
      - name: Build application
        run: |
          cd frontend
          npm run build

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  docker-build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/todo-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/todo-backend:${{ github.sha }}
      
      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/todo-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/todo-frontend:${{ github.sha }}

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [docker-build]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.todo-app.com
    
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Add deployment commands here

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [docker-build]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://todo-app.com
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Add deployment commands here
```

---

## 4. GitLab CI/CD Pipeline

### 4.1 Configuration

**Location:** `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - security
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"
  POSTGRES_DB: tododb_test
  POSTGRES_USER: test
  POSTGRES_PASSWORD: test

cache:
  paths:
    - backend/.m2/repository
    - frontend/node_modules/

backend-test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  services:
    - postgres:16
  variables:
    POSTGRES_HOST: postgres
  script:
    - cd backend
    - mvn clean test
    - mvn jacoco:report
  artifacts:
    reports:
      junit: backend/target/surefire-reports/TEST-*.xml
      coverage_report:
        coverage_format: cobertura
        path: backend/target/site/jacoco/jacoco.xml
  coverage: '/Total.*?([0-9]{1,3})%/'

frontend-test:
  stage: test
  image: node:20
  script:
    - cd frontend
    - npm ci
    - npm run lint
    - npm test
    - npm run test:coverage
  artifacts:
    reports:
      junit: frontend/coverage/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: frontend/coverage/cobertura-coverage.xml
  coverage: '/Lines\s*:\s*([0-9.]+)%/'

backend-build:
  stage: build
  image: maven:3.9-eclipse-temurin-21
  script:
    - cd backend
    - mvn clean package -DskipTests
  artifacts:
    paths:
      - backend/target/*.jar
    expire_in: 1 week

frontend-build:
  stage: build
  image: node:20
  script:
    - cd frontend
    - npm ci
    - npm run build
  artifacts:
    paths:
      - frontend/dist/
    expire_in: 1 week

security-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --format json --output trivy-results.json .
  artifacts:
    reports:
      container_scanning: trivy-results.json

docker-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA ./backend
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA ./frontend
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
  only:
    - main
    - develop

deploy-staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
  script:
    - echo "Deploying to staging..."
    # Add deployment commands
  environment:
    name: staging
    url: https://staging.todo-app.com
  only:
    - develop

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
  script:
    - echo "Deploying to production..."
    # Add deployment commands
  environment:
    name: production
    url: https://todo-app.com
  when: manual
  only:
    - main
```

---

## 5. Azure DevOps Pipeline

### 5.1 Configuration

**Location:** `azure-pipelines.yml`

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  javaVersion: '21'
  nodeVersion: '20'
  mavenOptions: '-Dmaven.repo.local=$(Pipeline.Workspace)/.m2/repository'

stages:
  - stage: Test
    displayName: 'Run Tests'
    jobs:
      - job: BackendTest
        displayName: 'Backend Tests'
        steps:
          - task: JavaToolInstaller@0
            inputs:
              versionSpec: '21'
              jdkArchitectureOption: 'x64'
              jdkSourceOption: 'PreInstalled'
          
          - task: Maven@3
            inputs:
              mavenPomFile: 'backend/pom.xml'
              goals: 'clean test'
              options: '$(mavenOptions)'
              publishJUnitResults: true
              testResultsFiles: '**/surefire-reports/TEST-*.xml'
              codeCoverageToolOption: 'JaCoCo'
          
          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: 'JaCoCo'
              summaryFileLocation: 'backend/target/site/jacoco/jacoco.xml'
      
      - job: FrontendTest
        displayName: 'Frontend Tests'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20'
          
          - script: |
              cd frontend
              npm ci
              npm run lint
              npm test
              npm run test:coverage
            displayName: 'Install and Test'
          
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'frontend/coverage/junit.xml'
          
          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: 'frontend/coverage/cobertura-coverage.xml'

  - stage: Build
    displayName: 'Build Application'
    dependsOn: Test
    jobs:
      - job: BuildBackend
        displayName: 'Build Backend'
        steps:
          - task: Maven@3
            inputs:
              mavenPomFile: 'backend/pom.xml'
              goals: 'clean package'
              options: '-DskipTests $(mavenOptions)'
          
          - task: CopyFiles@2
            inputs:
              sourceFolder: 'backend/target'
              contents: '*.jar'
              targetFolder: '$(Build.ArtifactStagingDirectory)'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: '$(Build.ArtifactStagingDirectory)'
              artifactName: 'backend'
      
      - job: BuildFrontend
        displayName: 'Build Frontend'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20'
          
          - script: |
              cd frontend
              npm ci
              npm run build
            displayName: 'Build Frontend'
          
          - task: CopyFiles@2
            inputs:
              sourceFolder: 'frontend/dist'
              targetFolder: '$(Build.ArtifactStagingDirectory)'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: '$(Build.ArtifactStagingDirectory)'
              artifactName: 'frontend'

  - stage: Security
    displayName: 'Security Scan'
    dependsOn: Build
    jobs:
      - job: SecurityScan
        displayName: 'Run Security Scans'
        steps:
          - script: |
              docker run --rm -v $(Build.SourcesDirectory):/src aquasec/trivy fs /src
            displayName: 'Trivy Security Scan'

  - stage: DeployStaging
    displayName: 'Deploy to Staging'
    dependsOn: Security
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    jobs:
      - deployment: DeployStaging
        displayName: 'Deploy to Staging'
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying to staging..."
                  displayName: 'Deploy'

  - stage: DeployProduction
    displayName: 'Deploy to Production'
    dependsOn: Security
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployProduction
        displayName: 'Deploy to Production'
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying to production..."
                  displayName: 'Deploy'
```

---

## 6. Pipeline Workflow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Git Commit &  │
         │     Push      │
         └───────┬───────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  Trigger CI Pipeline   │
    └────────┬───────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌──────────┐
│ Backend │      │ Frontend │
│  Tests  │      │  Tests   │
└────┬────┘      └─────┬────┘
     │                 │
     └────────┬────────┘
              │
              ▼
       ┌────────────┐
       │  Security  │
       │   Scan     │
       └──────┬─────┘
              │
    Pass ─────┼───── Fail
              │         │
              ▼         ▼
      ┌───────────┐  ┌──────────┐
      │   Build   │  │  Notify  │
      │  Docker   │  │   Team   │
      └─────┬─────┘  └──────────┘
            │
            ▼
  ┌─────────────────┐
  │ Push to Registry│
  └────────┬────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌─────────┐
│ Staging │  │Production│
│ (Auto)  │  │ (Manual) │
└─────────┘  └─────────┘
```

---

## 7. Deployment Strategies

### 7.1 Rolling Deployment
- Deploy new version to one server at a time
- Keep old version running during deployment
- Zero downtime deployment

### 7.2 Blue-Green Deployment
- Maintain two identical environments (Blue and Green)
- Deploy to inactive environment
- Switch traffic after validation
- Quick rollback capability

### 7.3 Canary Deployment
- Deploy to small subset of servers
- Monitor metrics and errors
- Gradually increase traffic
- Roll back if issues detected

---

## 8. Environment Configuration

### 8.1 Environments

| Environment | Branch | Auto-Deploy | Approval Required |
|-------------|--------|-------------|-------------------|
| Development | develop | Yes | No |
| Staging | develop | Yes | No |
| Production | main | No | Yes (Manual) |

### 8.2 Environment Variables

**Backend:**
```
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=***
DATABASE_PASSWORD=***
JWT_SECRET=***
JWT_EXPIRATION=86400000
```

**Frontend:**
```
VITE_API_BASE_URL=https://api.todo-app.com
VITE_ENV=production
```

---

## 9. Monitoring and Notifications

### 9.1 Pipeline Notifications
- Slack/Teams integration
- Email notifications for failures
- GitHub/GitLab status checks
- Build badges in README

### 9.2 Monitoring
- Application logs aggregation
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

---

## 10. Best Practices

### 10.1 Pipeline Optimization
- Cache dependencies
- Parallel job execution
- Fail fast strategy
- Artifact reuse between stages

### 10.2 Security
- Secrets management (GitHub Secrets, Azure Key Vault)
- Vulnerability scanning
- Dependency updates (Dependabot)
- Code quality gates

### 10.3 Testing Strategy
- Unit tests (fast feedback)
- Integration tests
- End-to-end tests (staging only)
- Code coverage thresholds

---

## 11. Rollback Procedures

### 11.1 Automated Rollback
- Trigger on health check failures
- Revert to previous Docker image
- Database migration rollback

### 11.2 Manual Rollback
```bash
# Revert to previous version
kubectl rollout undo deployment/todo-backend
kubectl rollout undo deployment/todo-frontend

# Or with Docker
docker-compose pull
docker-compose up -d
```

---

## 12. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial CI/CD documentation |
