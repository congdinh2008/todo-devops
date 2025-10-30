# Azure DevOps CI/CD Pipeline Setup Guide

**Project:** Todo Application  
**Version:** 1.0.0  
**Last Updated:** 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pipeline Architecture](#pipeline-architecture)
4. [Initial Setup](#initial-setup)
5. [Configuration](#configuration)
6. [Secrets Management](#secrets-management)
7. [Branch Protection](#branch-protection)
8. [Approval Gates](#approval-gates)
9. [Running the Pipeline](#running-the-pipeline)
10. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
11. [Maintenance](#maintenance)
12. [Best Practices](#best-practices)

---

## Overview

This guide provides comprehensive instructions for setting up and maintaining the Azure DevOps CI/CD pipeline for the Todo Application. The pipeline implements production-ready practices including:

- ✅ Multi-stage pipeline (Build, Test, Security Scan, Release, Deploy)
- ✅ Backend: Maven build, JUnit tests, JaCoCo coverage (>80%)
- ✅ Frontend: npm build, Vitest tests, ESLint, Prettier
- ✅ Security scanning: OWASP Dependency Check, Trivy
- ✅ Docker image build and push to Docker Hub
- ✅ Approval gates for production deployment
- ✅ Secrets management via Azure Key Vault
- ✅ PR validation workflow
- ✅ Comprehensive logging and fail-fast behavior

---

## Prerequisites

### Required Tools and Accounts

1. **Azure DevOps Account**
   - Sign up at [dev.azure.com](https://dev.azure.com)
   - Create an organization if you don't have one

2. **Docker Hub Account**
   - Sign up at [hub.docker.com](https://hub.docker.com)
   - Create repositories: `todo-backend` and `todo-frontend`

3. **Azure Subscription** (Optional, for Azure Key Vault)
   - Required only if using Azure Key Vault for secrets management
   - Free tier available at [azure.com](https://azure.microsoft.com)

### Repository Requirements

- Git repository connected to Azure DevOps
- Repository contains:
  - `azure-pipelines.yml` (pipeline configuration)
  - `backend/` (Java Spring Boot application)
  - `frontend/` (React TypeScript application)

---

## Pipeline Architecture

### Stage Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Pipeline Trigger                          │
│              (Push to main/develop or PR)                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                  Stage 1: Build and Test                      │
│  ┌────────────────────────┐  ┌─────────────────────────┐    │
│  │  Backend Build & Test  │  │ Frontend Build & Test   │    │
│  │  - Maven compile       │  │ - npm install           │    │
│  │  - JUnit tests         │  │ - ESLint                │    │
│  │  - JaCoCo coverage     │  │ - Prettier check        │    │
│  │  - Package JAR         │  │ - Vitest tests          │    │
│  └────────────────────────┘  └─────────────────────────┘    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                 Stage 2: Security Scan                        │
│  ┌────────────────────────┐  ┌─────────────────────────┐    │
│  │  Backend Security      │  │ Frontend Security       │    │
│  │  - OWASP Dep Check     │  │ - npm audit             │    │
│  │  - Trivy FS scan       │  │ - Trivy FS scan         │    │
│  └────────────────────────┘  └─────────────────────────┘    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│            Stage 3: Build Docker Images                       │
│  ┌────────────────────────┐  ┌─────────────────────────┐    │
│  │  Backend Docker        │  │ Frontend Docker         │    │
│  │  - Build image         │  │ - Build image           │    │
│  │  - Push to Docker Hub  │  │ - Push to Docker Hub    │    │
│  │  - Trivy image scan    │  │ - Trivy image scan      │    │
│  └────────────────────────┘  └─────────────────────────┘    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│         Stage 4: Deploy to Development (develop branch)       │
│  - Automatic deployment to dev environment                    │
│  - No approval required                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│         Stage 5: Deploy to Staging (main branch)              │
│  - Automatic deployment to staging environment                │
│  - No approval required                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│         Stage 6: Deploy to Production (main branch)           │
│  - Manual approval required                                   │
│  - Deployment to production environment                       │
└──────────────────────────────────────────────────────────────┘
```

### Pipeline Features

#### Multi-Stage Architecture
- **Fail-Fast**: Pipeline stops on first critical failure
- **Parallel Jobs**: Backend and frontend build in parallel
- **Conditional Execution**: Stages run based on branch and changes
- **Environment Deployment**: Separate stages for dev, staging, production

#### Backend Pipeline
- **Build**: Maven compile with Java 21
- **Test**: JUnit 5 tests with PostgreSQL service container
- **Coverage**: JaCoCo with >80% threshold enforcement
- **Security**: OWASP Dependency Check + Trivy filesystem scan
- **Docker**: Multi-stage Docker build and push to Docker Hub
- **Artifacts**: Test results, coverage reports, security scans

#### Frontend Pipeline
- **Lint**: ESLint with max warnings = 0
- **Format**: Prettier formatting check
- **Build**: Vite production build
- **Test**: Vitest unit tests with coverage
- **Security**: npm audit + Trivy filesystem scan
- **Docker**: Nginx-based Docker image build and push

---

## Initial Setup

### Step 1: Create Azure DevOps Project

1. Navigate to [dev.azure.com](https://dev.azure.com)
2. Click **+ New project**
3. Enter project details:
   - **Project name**: `todo-devops`
   - **Visibility**: Private (recommended)
   - **Version control**: Git
   - **Work item process**: Agile
4. Click **Create**

### Step 2: Import Repository

#### Option A: Import from GitHub

1. Go to **Repos** → **Files**
2. Click **Import repository**
3. Enter GitHub repository URL: `https://github.com/congdinh2008/todo-devops`
4. Click **Import**

#### Option B: Connect Existing Repository

1. Go to **Project Settings** → **Service connections**
2. Click **New service connection** → **GitHub**
3. Authorize Azure DevOps to access your GitHub account
4. Select the repository

### Step 3: Create Pipeline

1. Go to **Pipelines** → **Pipelines**
2. Click **New pipeline**
3. Select **Azure Repos Git** or **GitHub**
4. Select your repository
5. Choose **Existing Azure Pipelines YAML file**
6. Select `/azure-pipelines.yml`
7. Click **Continue**
8. Review the pipeline (don't run yet)
9. Click **Save**

---

## Configuration

### Required Variables

Configure pipeline variables in **Pipelines** → **Library** or directly in the pipeline:

#### Pipeline Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `dockerServiceConnection` | Docker Hub service connection name | `docker-hub-connection` | Yes |
| `azureServiceConnection` | Azure subscription connection (for Key Vault) | `azure-subscription` | No* |
| `keyVaultName` | Azure Key Vault name | `todo-keyvault` | No* |
| `javaVersion` | Java version | `21` | Yes |
| `nodeVersion` | Node.js version | `20.x` | Yes |
| `jacocoThreshold` | JaCoCo coverage threshold | `80` | Yes |
| `owaspFailThreshold` | OWASP CVSS score threshold | `8` | Yes |

*Required only if using Azure Key Vault for secrets management

#### Service Connections

Create service connections in **Project Settings** → **Service connections**:

1. **Docker Hub Connection**
   - Type: Docker Registry
   - Registry type: Docker Hub
   - Docker ID: Your Docker Hub username
   - Password: Your Docker Hub password or access token
   - Connection name: `docker-hub-connection`

2. **Azure Subscription** (Optional, for Key Vault)
   - Type: Azure Resource Manager
   - Scope: Subscription
   - Select your Azure subscription
   - Connection name: `azure-subscription`

---

## Secrets Management

### Option 1: Azure Key Vault (Recommended for Production)

#### Setup Azure Key Vault

1. **Create Key Vault** in Azure Portal:
   ```bash
   az keyvault create \
     --name todo-keyvault \
     --resource-group todo-rg \
     --location eastus
   ```

2. **Add Secrets** to Key Vault:
   ```bash
   az keyvault secret set --vault-name todo-keyvault \
     --name DOCKER-USERNAME --value "your-dockerhub-username"
   
   az keyvault secret set --vault-name todo-keyvault \
     --name DOCKER-PASSWORD --value "your-dockerhub-password"
   ```

3. **Grant Access** to Azure DevOps Service Principal:
   - Go to Key Vault → **Access policies**
   - Click **Add Access Policy**
   - Select **Secret permissions**: Get, List
   - Select your Azure DevOps service principal
   - Click **Add** → **Save**

4. **Configure Pipeline**:
   - Set `keyVaultName` variable to `todo-keyvault`
   - Set `azureServiceConnection` variable to your Azure connection name
   - Pipeline will automatically fetch secrets from Key Vault

### Option 2: Pipeline Variables (For Testing)

1. Go to **Pipelines** → Select your pipeline → **Edit**
2. Click **Variables** → **New variable**
3. Add secrets:
   - Name: `DOCKER-USERNAME`, Value: Your Docker Hub username
   - Name: `DOCKER-PASSWORD`, Value: Your Docker Hub password, **Keep this value secret** ✓
4. Click **Save**

**⚠️ Warning**: Pipeline variables are less secure than Azure Key Vault. Use Key Vault for production.

---

## Branch Protection

### Configure Branch Policies

Protect `main` and `develop` branches with required pipeline checks:

1. Go to **Repos** → **Branches**
2. Click **...** next to `main` → **Branch policies**
3. Configure policies:

#### Required Settings

- ✅ **Require a minimum number of reviewers**: 1 or more
- ✅ **Check for linked work items**: Recommended
- ✅ **Build validation**: Add your pipeline
  - Build pipeline: Select `azure-pipelines.yml`
  - Trigger: Automatic
  - Policy requirement: Required
  - Build expiration: Immediately
  - Display name: "Azure Pipeline Validation"

#### Optional Settings

- ✅ **Limit merge types**: Squash merge only (recommended)
- ✅ **Check for comment resolution**: Require all comments resolved
- ✅ **Automatically include reviewers**: Add team members

Repeat the same for `develop` branch.

---

## Approval Gates

### Configure Environment Approvals

Set up approval gates for production deployments:

#### Create Environments

1. Go to **Pipelines** → **Environments**
2. Create three environments:

   **Development Environment**
   - Name: `development`
   - Description: "Development environment (auto-deploy from develop branch)"
   - No approvals required

   **Staging Environment**
   - Name: `staging`
   - Description: "Staging environment (auto-deploy from main branch)"
   - Optional: Add approvers for extra safety

   **Production Environment**
   - Name: `production`
   - Description: "Production environment (manual approval required)"
   - **Approvals**: Required

#### Configure Production Approvals

1. Open `production` environment
2. Click **Approvals and checks** → **Approvals**
3. Add approvers:
   - Select users or groups who can approve
   - Recommended: Require at least 2 approvers
4. Configure options:
   - ✅ **Instructions for approvers**: "Verify staging deployment before approving"
   - ✅ **Timeout**: 30 days (or as needed)
   - ✅ **Approvers can approve their own runs**: Disable for production
5. Click **Save**

#### Additional Checks (Optional)

Add more checks to production environment:

- **Invoke REST API**: Health check on staging before production
- **Query Azure Monitor alerts**: Ensure no active alerts
- **Business hours**: Only allow deployments during business hours

---

## Running the Pipeline

### Trigger Pipeline Automatically

Pipeline triggers automatically on:

1. **Push to main or develop**:
   ```bash
   git checkout develop
   git add .
   git commit -m "Your changes"
   git push origin develop
   ```

2. **Pull Request to main or develop**:
   - Create PR in Azure Repos
   - Pipeline runs for validation
   - Merge after approval and successful pipeline run

### Trigger Pipeline Manually

1. Go to **Pipelines** → **Pipelines**
2. Select your pipeline
3. Click **Run pipeline**
4. Configure:
   - **Branch**: Select branch to run
   - **Variables**: Override variables if needed
5. Click **Run**

### Monitor Pipeline Execution

1. Go to **Pipelines** → **Pipelines**
2. Click on running pipeline
3. View:
   - **Summary**: Overall pipeline status
   - **Jobs**: Individual job status
   - **Tests**: Test results and coverage
   - **Artifacts**: Download artifacts (JAR, reports, etc.)

---

## Monitoring and Troubleshooting

### Common Issues and Solutions

#### Issue 1: Java Version Not Found

**Error**: "Java version 21 not found"

**Solution**:
```yaml
# Update JavaToolInstaller task in pipeline
- task: JavaToolInstaller@0
  inputs:
    versionSpec: '21'
    jdkArchitectureOption: 'x64'
    jdkSourceOption: 'PreInstalled'  # or 'AzureStorage'
```

If `PreInstalled` doesn't work, use Azure storage or download from URL.

#### Issue 2: Docker Push Failed

**Error**: "unauthorized: authentication required"

**Solution**:
1. Verify Docker Hub credentials in service connection
2. Check Docker Hub access token is valid
3. Ensure repository exists: `todo-backend`, `todo-frontend`
4. Test Docker login locally:
   ```bash
   docker login -u <username>
   ```

#### Issue 3: PostgreSQL Service Not Ready

**Error**: "Connection refused to localhost:5432"

**Solution**:
```yaml
# Add health check wait in pipeline
- script: |
    until pg_isready -h localhost -p 5432; do
      echo "Waiting for PostgreSQL..."
      sleep 2
    done
  displayName: 'Wait for PostgreSQL'
```

#### Issue 4: Coverage Threshold Not Met

**Error**: "Coverage 75% is below threshold 80%"

**Solution**:
1. Add more unit tests to increase coverage
2. Temporarily lower threshold (not recommended):
   ```yaml
   variables:
     jacocoThreshold: 75
   ```
3. Exclude generated code from coverage:
   ```xml
   <!-- In pom.xml jacoco plugin -->
   <excludes>
     <exclude>**/config/**</exclude>
     <exclude>**/dto/**</exclude>
   </excludes>
   ```

#### Issue 5: Node Modules Cache Issues

**Error**: "npm ci failed with exit code 1"

**Solution**:
1. Clear cache and retry
2. Update cache key in pipeline:
   ```yaml
   - task: Cache@2
     inputs:
       key: 'npm | "$(Agent.OS)" | frontend/package-lock.json | v2'  # Add version
   ```

### Debugging Tips

1. **Enable Debug Logging**:
   - Edit pipeline → Variables
   - Add: `System.Debug = true`
   - Run pipeline to see detailed logs

2. **Check Job Logs**:
   - Click on failed job
   - Expand failed task
   - Review error messages and stack traces

3. **Download Artifacts**:
   - Download test reports for detailed failure info
   - Review coverage reports to identify untested code

4. **Run Locally**:
   - Test commands locally before adding to pipeline:
     ```bash
     cd backend && mvn clean test
     cd frontend && npm test
     ```

---

## Maintenance

### Regular Maintenance Tasks

#### Weekly

- ✅ Review pipeline run history
- ✅ Check security scan reports for new vulnerabilities
- ✅ Monitor pipeline execution times
- ✅ Review failed builds and identify patterns

#### Monthly

- ✅ Update dependencies (npm, Maven)
- ✅ Review and update security scan thresholds
- ✅ Check for pipeline optimization opportunities
- ✅ Update documentation with any changes
- ✅ Review and rotate secrets/credentials

#### Quarterly

- ✅ Update Java and Node.js versions
- ✅ Review and update build tool versions (Maven, npm)
- ✅ Audit access permissions and approvers
- ✅ Review pipeline architecture for improvements
- ✅ Update security scanning tools (Trivy, OWASP)

### Updating Pipeline

To update the pipeline configuration:

1. **Edit Pipeline File**:
   ```bash
   # Make changes to azure-pipelines.yml
   git checkout -b update-pipeline
   # Edit azure-pipelines.yml
   git add azure-pipelines.yml
   git commit -m "Update pipeline configuration"
   git push origin update-pipeline
   ```

2. **Create Pull Request**:
   - Create PR from `update-pipeline` to `develop`
   - Pipeline runs for validation
   - Review changes with team
   - Merge after approval

3. **Monitor Changes**:
   - Watch first run after merge
   - Verify all stages complete successfully
   - Check logs for any warnings

### Dependency Updates

#### Backend Dependencies

```bash
cd backend

# Check for updates
mvn versions:display-dependency-updates

# Update dependencies in pom.xml
# Test locally
mvn clean test

# Commit changes
git add pom.xml
git commit -m "Update backend dependencies"
```

#### Frontend Dependencies

```bash
cd frontend

# Check for updates
npm outdated

# Update dependencies
npm update
npm audit fix

# Test locally
npm test

# Commit changes
git add package.json package-lock.json
git commit -m "Update frontend dependencies"
```

---

## Best Practices

### Security Best Practices

1. **Never Commit Secrets**
   - Use Azure Key Vault or pipeline variables
   - Add `.env` files to `.gitignore`
   - Rotate credentials regularly

2. **Least Privilege Access**
   - Grant minimum required permissions
   - Use service principals for automation
   - Review access regularly

3. **Security Scanning**
   - Run OWASP and Trivy scans on every build
   - Set appropriate thresholds (CVSS >= 8)
   - Address critical vulnerabilities promptly

4. **Image Security**
   - Use minimal base images (Alpine)
   - Run containers as non-root user
   - Scan images before pushing to registry

### Pipeline Performance

1. **Use Caching**
   - Cache Maven repository (`~/.m2`)
   - Cache npm packages (`node_modules`)
   - Cache Docker layers

2. **Parallel Execution**
   - Run backend and frontend jobs in parallel
   - Use parallel test execution where possible

3. **Optimize Docker Builds**
   - Use multi-stage builds
   - Leverage build cache
   - Minimize layer count

4. **Conditional Execution**
   - Skip stages when files haven't changed
   - Use path filters in triggers

### Code Quality

1. **Maintain Test Coverage**
   - Aim for >80% code coverage
   - Write meaningful tests, not just coverage
   - Review coverage reports regularly

2. **Consistent Code Style**
   - Enforce linting rules (ESLint, Checkstyle)
   - Use code formatters (Prettier, Google Java Format)
   - Fail builds on style violations

3. **Code Reviews**
   - Require PR reviews before merge
   - Use branch protection policies
   - Review pipeline changes carefully

### Deployment Safety

1. **Progressive Deployment**
   - Deploy to dev → staging → production
   - Validate each environment before proceeding
   - Use feature flags for risky changes

2. **Rollback Strategy**
   - Keep previous Docker images
   - Document rollback procedure
   - Test rollback process regularly

3. **Monitoring**
   - Monitor application health after deployment
   - Set up alerts for failures
   - Review deployment logs

---

## Additional Resources

### Documentation

- [Azure Pipelines Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Azure Key Vault Integration](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/azure-key-vault)
- [Docker Hub Integration](https://docs.docker.com/ci-cd/azure-devops/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [Trivy Security Scanner](https://aquasecurity.github.io/trivy/)

### Related Documentation

- [Architecture Documentation](Architecture.md)
- [API Specification](API-Spec.md)
- [Deployment Guide](Deployment-Guide.md)
- [Docker Guide](Docker-Guide.md)

### Support

For issues or questions:
- Open an issue in the repository
- Contact DevOps team
- Email: congdinh2008@gmail.com

---

**Last Updated**: 2024  
**Maintained By**: DevOps Team
