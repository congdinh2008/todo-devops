# CI/CD Pipeline Diagram
# Todo Application Continuous Integration and Deployment

**Version**: 1.0  
**Date**: 2024

---

## Overview

This document describes the CI/CD pipelines for the Todo Application using GitHub Actions, GitLab CI/CD, and Azure DevOps.

---

## GitHub Actions Workflow

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Push/PR Event                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐           ┌────────▼───────┐
│ Backend Build  │           │Frontend Build  │
├────────────────┤           ├────────────────┤
│ • Checkout     │           │ • Checkout     │
│ • Java 21      │           │ • Node 20      │
│ • Maven Build  │           │ • npm install  │
│ • Run Tests    │           │ • npm test     │
│ • JaCoCo       │           │ • npm build    │
└───────┬────────┘           └────────┬───────┘
        │                             │
        └──────────────┬──────────────┘
                       │
              ┌────────▼──────────┐
              │  Code Quality     │
              ├───────────────────┤
              │ • SonarQube       │
              │ • Security Scan   │
              │ • Linting         │
              └────────┬──────────┘
                       │
                       │ [On main branch]
                       │
              ┌────────▼──────────┐
              │  Build Images     │
              ├───────────────────┤
              │ • Docker Build    │
              │ • Tag Images      │
              │ • Push to Registry│
              └────────┬──────────┘
                       │
              ┌────────▼──────────┐
              │  Deploy to Dev    │
              ├───────────────────┤
              │ • Update K8s      │
              │ • Run Smoke Tests │
              └────────┬──────────┘
                       │
                       │ [Manual Approval]
                       │
              ┌────────▼──────────┐
              │  Deploy to Prod   │
              ├───────────────────┤
              │ • Blue-Green      │
              │ • Health Checks   │
              │ • Rollback Ready  │
              └───────────────────┘
```

### GitHub Actions Configuration

**.github/workflows/ci-cd.yml**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-build:
    name: Backend Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'
      
      - name: Build with Maven
        working-directory: ./backend
        run: mvn clean install -DskipTests
      
      - name: Run Tests
        working-directory: ./backend
        run: mvn test
      
      - name: Generate Coverage Report
        working-directory: ./backend
        run: mvn jacoco:report
      
      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/target/site/jacoco/jacoco.xml
          flags: backend
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: backend-jar
          path: backend/target/*.jar

  frontend-build:
    name: Frontend Build & Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Lint
        working-directory: ./frontend
        run: npm run lint
      
      - name: Type Check
        working-directory: ./frontend
        run: npm run type-check
      
      - name: Run Tests
        working-directory: ./frontend
        run: npm run test:coverage
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
      
      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist

  code-quality:
    name: Code Quality & Security
    needs: [backend-build, frontend-build]
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'todo-app'
          path: '.'
          format: 'HTML'
      
      - name: Trivy Security Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'

  docker-build:
    name: Build & Push Docker Images
    needs: [code-quality]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download Backend Artifact
        uses: actions/download-artifact@v3
        with:
          name: backend-jar
          path: backend/target
      
      - name: Download Frontend Artifact
        uses: actions/download-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build & Push Backend Image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/todo-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/todo-backend:${{ github.sha }}
      
      - name: Build & Push Frontend Image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/todo-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/todo-frontend:${{ github.sha }}

  deploy-dev:
    name: Deploy to Development
    needs: [docker-build]
    runs-on: ubuntu-latest
    environment: development
    
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment-dev.yaml
            k8s/service.yaml
          images: |
            ${{ secrets.DOCKER_USERNAME }}/todo-backend:${{ github.sha }}
            ${{ secrets.DOCKER_USERNAME }}/todo-frontend:${{ github.sha }}
          namespace: todo-dev
      
      - name: Run Smoke Tests
        run: |
          curl -f https://dev.todo-app.com/api/health || exit 1

  deploy-prod:
    name: Deploy to Production
    needs: [deploy-dev]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment-prod.yaml
            k8s/service.yaml
          images: |
            ${{ secrets.DOCKER_USERNAME }}/todo-backend:${{ github.sha }}
            ${{ secrets.DOCKER_USERNAME }}/todo-frontend:${{ github.sha }}
          namespace: todo-prod
          strategy: blue-green
      
      - name: Health Check
        run: |
          curl -f https://todo-app.com/api/health || exit 1
```

---

## GitLab CI/CD Pipeline

**.gitlab-ci.yml**

```yaml
stages:
  - build
  - test
  - quality
  - docker
  - deploy

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"
  NPM_CONFIG_CACHE: "$CI_PROJECT_DIR/.npm"

backend-build:
  stage: build
  image: maven:3.9-eclipse-temurin-21
  cache:
    paths:
      - .m2/repository
  script:
    - cd backend
    - mvn clean install -DskipTests
  artifacts:
    paths:
      - backend/target/*.jar
    expire_in: 1 hour

backend-test:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  cache:
    paths:
      - .m2/repository
  script:
    - cd backend
    - mvn test jacoco:report
  artifacts:
    reports:
      junit: backend/target/surefire-reports/TEST-*.xml
      coverage_report:
        coverage_format: cobertura
        path: backend/target/site/jacoco/jacoco.xml

frontend-build:
  stage: build
  image: node:20
  cache:
    paths:
      - .npm
  script:
    - cd frontend
    - npm ci
    - npm run build
  artifacts:
    paths:
      - frontend/dist
    expire_in: 1 hour

frontend-test:
  stage: test
  image: node:20
  cache:
    paths:
      - .npm
  script:
    - cd frontend
    - npm ci
    - npm run lint
    - npm run type-check
    - npm run test:coverage
  artifacts:
    reports:
      junit: frontend/coverage/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: frontend/coverage/cobertura-coverage.xml

sonarqube-check:
  stage: quality
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner
  only:
    - main
    - develop

docker-backend:
  stage: docker
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA ./backend
    - docker tag $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE/backend:latest
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/backend:latest
  only:
    - main

docker-frontend:
  stage: docker
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA ./frontend
    - docker tag $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE/frontend:latest
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:latest
  only:
    - main

deploy-dev:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/deployment-dev.yaml
    - kubectl set image deployment/todo-backend backend=$CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA -n todo-dev
    - kubectl set image deployment/todo-frontend frontend=$CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA -n todo-dev
  environment:
    name: development
    url: https://dev.todo-app.com
  only:
    - main

deploy-prod:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/deployment-prod.yaml
    - kubectl set image deployment/todo-backend backend=$CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA -n todo-prod
    - kubectl set image deployment/todo-frontend frontend=$CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA -n todo-prod
  environment:
    name: production
    url: https://todo-app.com
  when: manual
  only:
    - main
```

---

## Azure DevOps Pipeline

**azure-pipelines.yml**

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    jobs:
      - job: BackendBuild
        displayName: 'Build Backend'
        steps:
          - task: JavaToolInstaller@0
            inputs:
              versionSpec: '21'
              jdkArchitectureOption: 'x64'
              jdkSourceOption: 'PreInstalled'
          
          - task: Maven@3
            inputs:
              mavenPomFile: 'backend/pom.xml'
              goals: 'clean install'
              options: '-DskipTests'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: 'backend/target'
              artifactName: 'backend-jar'

      - job: FrontendBuild
        displayName: 'Build Frontend'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          
          - script: |
              cd frontend
              npm ci
              npm run build
            displayName: 'npm install and build'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: 'frontend/dist'
              artifactName: 'frontend-dist'

  - stage: Test
    dependsOn: Build
    jobs:
      - job: BackendTest
        displayName: 'Test Backend'
        steps:
          - task: Maven@3
            inputs:
              mavenPomFile: 'backend/pom.xml'
              goals: 'test'
              publishJUnitResults: true
              testResultsFiles: '**/surefire-reports/TEST-*.xml'
          
          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: 'JaCoCo'
              summaryFileLocation: 'backend/target/site/jacoco/jacoco.xml'

      - job: FrontendTest
        displayName: 'Test Frontend'
        steps:
          - script: |
              cd frontend
              npm ci
              npm run test:coverage
            displayName: 'Run tests'
          
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'frontend/coverage/junit.xml'

  - stage: Docker
    dependsOn: Test
    condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
    jobs:
      - job: BuildAndPush
        displayName: 'Build & Push Docker Images'
        steps:
          - task: Docker@2
            inputs:
              containerRegistry: 'dockerhub'
              repository: 'todo-backend'
              command: 'buildAndPush'
              Dockerfile: 'backend/Dockerfile'
              tags: |
                $(Build.BuildId)
                latest
          
          - task: Docker@2
            inputs:
              containerRegistry: 'dockerhub'
              repository: 'todo-frontend'
              command: 'buildAndPush'
              Dockerfile: 'frontend/Dockerfile'
              tags: |
                $(Build.BuildId)
                latest

  - stage: Deploy
    dependsOn: Docker
    jobs:
      - deployment: DeployToDev
        displayName: 'Deploy to Development'
        environment: 'development'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: Kubernetes@1
                  inputs:
                    connectionType: 'Kubernetes Service Connection'
                    namespace: 'todo-dev'
                    command: 'apply'
                    useConfigurationFile: true
                    configuration: 'k8s/deployment-dev.yaml'
```

---

## Deployment Strategies

### 1. Blue-Green Deployment
- Two identical environments (blue and green)
- Deploy to inactive environment
- Switch traffic after validation
- Quick rollback capability

### 2. Canary Deployment
- Gradual rollout to subset of users
- Monitor metrics and errors
- Expand or rollback based on results

### 3. Rolling Update
- Incrementally update instances
- Zero downtime deployment
- Automatic rollback on failure

---

## Environment Configuration

### Development
- Auto-deploy on merge to `develop`
- Latest features and fixes
- Lower resource allocation

### Staging
- Manual promotion from development
- Production-like environment
- QA testing environment

### Production
- Manual approval required
- Blue-green deployment
- Full monitoring and alerting

---

**Document Version**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial CI/CD documentation |
