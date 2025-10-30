# Azure DevOps Pipeline - Quick Reference

**Quick access guide for common tasks and troubleshooting**

---

## Quick Links

- **Azure DevOps**: https://dev.azure.com
- **Docker Hub**: https://hub.docker.com
- **Pipeline File**: `/azure-pipelines.yml`
- **Full Documentation**: [Azure-DevOps-Setup-Guide.md](Azure-DevOps-Setup-Guide.md)

---

## Pipeline Stages at a Glance

| Stage | Jobs | Triggers | Approvals |
|-------|------|----------|-----------|
| **1. Build and Test** | Backend, Frontend | All branches | None |
| **2. Security Scan** | Backend, Frontend | All branches | None |
| **3. Build Docker Images** | Backend, Frontend | main, develop | None |
| **4. Deploy to Dev** | Backend, Frontend | develop only | None |
| **5. Deploy to Staging** | Backend, Frontend | main only | None |
| **6. Deploy to Production** | Backend, Frontend | main only | **Required** |

---

## Essential Commands

### Run Pipeline Manually
```bash
# Via Azure DevOps Portal
1. Go to Pipelines → Select pipeline
2. Click "Run pipeline"
3. Select branch and click "Run"
```

### Check Pipeline Status
```bash
# Via Azure CLI
az pipelines runs list --organization https://dev.azure.com/<org> \
  --project <project> --pipeline-ids <pipeline-id>
```

### Download Artifacts
```bash
# Via Azure CLI
az pipelines runs artifact download --run-id <run-id> \
  --artifact-name backend-jar --path ./artifacts
```

---

## Required Secrets

| Secret Name | Description | Where to Add |
|-------------|-------------|--------------|
| `DOCKER-USERNAME` | Docker Hub username | Azure Key Vault or Pipeline Variables |
| `DOCKER-PASSWORD` | Docker Hub password/token | Azure Key Vault or Pipeline Variables |

### Add Secrets to Pipeline Variables

1. Pipeline → Edit → Variables
2. Add variable: `DOCKER-USERNAME` = `your-username`
3. Add variable: `DOCKER-PASSWORD` = `your-password` (mark as secret ✓)
4. Save

### Add Secrets to Azure Key Vault

```bash
# Create Key Vault
az keyvault create --name todo-keyvault --resource-group todo-rg --location eastus

# Add secrets
az keyvault secret set --vault-name todo-keyvault --name DOCKER-USERNAME --value "username"
az keyvault secret set --vault-name todo-keyvault --name DOCKER-PASSWORD --value "password"
```

---

## Configuration Variables

### Pipeline Variables (Edit pipeline → Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `javaVersion` | `21` | Java version for backend build |
| `nodeVersion` | `20.x` | Node.js version for frontend build |
| `jacocoThreshold` | `80` | Minimum code coverage percentage |
| `owaspFailThreshold` | `8` | OWASP CVSS score threshold |
| `backendImageName` | `todo-backend` | Docker image name for backend |
| `frontendImageName` | `todo-frontend` | Docker image name for frontend |

---

## Common Tasks

### 1. Trigger Build on Push

```bash
git add .
git commit -m "Your changes"
git push origin develop  # or main
```

### 2. Create Pull Request

```bash
# Create feature branch
git checkout -b feature/your-feature
git add .
git commit -m "Add feature"
git push origin feature/your-feature

# Create PR in Azure DevOps
# Pipeline will run automatically for validation
```

### 3. Approve Production Deployment

1. Go to Pipelines → Runs → Select run
2. Wait for staging deployment to complete
3. Review staging environment
4. Click "Review" on Production stage
5. Add comment and click "Approve"

### 4. View Test Results

1. Pipeline run → Tests tab
2. View pass/fail status
3. Click on failed test for details
4. Download artifacts for full reports

### 5. View Coverage Reports

1. Pipeline run → Code Coverage tab
2. View summary (line, branch, method coverage)
3. Download `backend-coverage-report` artifact
4. Open `index.html` in browser

### 6. Review Security Scans

1. Pipeline run → Extensions → Security
2. Review OWASP report
3. Download artifacts:
   - `backend-owasp-report`
   - `backend-trivy-report`
   - `frontend-trivy-report`

---

## Troubleshooting

### Build Fails: "Java version not found"

**Fix**: Update Java version or use different source

```yaml
- task: JavaToolInstaller@0
  inputs:
    versionSpec: '21'
    jdkSourceOption: 'PreInstalled'  # Try 'AzureStorage' if this fails
```

### Build Fails: "Docker push unauthorized"

**Fix**: Check Docker credentials

1. Verify service connection: Project Settings → Service connections
2. Test locally: `docker login -u <username>`
3. Regenerate Docker Hub access token if needed

### Build Fails: "Coverage below threshold"

**Fix**: Add more tests or adjust threshold

```yaml
# Option 1: Add more tests (recommended)
# Option 2: Temporarily lower threshold
variables:
  jacocoThreshold: 75
```

### Build Fails: "PostgreSQL connection refused"

**Fix**: Wait for service to be ready

```yaml
- script: |
    until pg_isready -h localhost -p 5432; do
      echo "Waiting for PostgreSQL..."
      sleep 2
    done
  displayName: 'Wait for PostgreSQL'
```

### Build Slow: Cache not working

**Fix**: Update cache key

```yaml
- task: Cache@2
  inputs:
    key: 'maven | "$(Agent.OS)" | **/pom.xml | v2'  # Add version suffix
```

---

## Pipeline Optimization Tips

### 1. Use Caching
- Maven: Cache `~/.m2/repository`
- npm: Cache `node_modules`
- Docker: Use layer caching

### 2. Run Jobs in Parallel
- Backend and frontend jobs run simultaneously
- Reduces total pipeline time by ~50%

### 3. Skip Unchanged Components
- Pipeline automatically detects changes
- Only runs jobs for changed components on PRs

### 4. Optimize Docker Builds
```dockerfile
# Use multi-stage builds
# Copy dependencies before source code
# Leverage build cache
```

---

## Branch Protection Setup

### Main Branch Protection

1. Repos → Branches → main → Branch policies
2. Enable:
   - ✅ Require minimum reviewers: 1
   - ✅ Build validation: azure-pipelines.yml
   - ✅ Check for linked work items
   - ✅ Limit merge types: Squash merge

### Develop Branch Protection

Same as main, but can be less strict:
- Minimum reviewers: 1 (optional)
- Build validation: Required

---

## Monitoring Checklist

### Daily
- ✅ Check pipeline run status
- ✅ Review failed builds
- ✅ Monitor security scan results

### Weekly
- ✅ Review coverage trends
- ✅ Check for security vulnerabilities
- ✅ Monitor pipeline performance

### Monthly
- ✅ Update dependencies
- ✅ Review access permissions
- ✅ Rotate secrets/credentials
- ✅ Update documentation

---

## Docker Image Tags

| Branch | Image Tags | When |
|--------|------------|------|
| `develop` | `develop`, `<commit-sha>` | On push to develop |
| `main` | `main`, `latest`, `<commit-sha>` | On push to main |

### Pull Images

```bash
# Latest from main branch
docker pull <username>/todo-backend:latest
docker pull <username>/todo-frontend:latest

# Specific version
docker pull <username>/todo-backend:develop
docker pull <username>/todo-backend:<commit-sha>
```

---

## Useful Azure CLI Commands

### List Pipelines
```bash
az pipelines list --organization https://dev.azure.com/<org> \
  --project <project>
```

### Show Pipeline Runs
```bash
az pipelines runs list --organization https://dev.azure.com/<org> \
  --project <project> --pipeline-ids <id> --top 5
```

### Show Run Details
```bash
az pipelines runs show --organization https://dev.azure.com/<org> \
  --project <project> --id <run-id>
```

### Cancel Running Build
```bash
az pipelines run cancel --organization https://dev.azure.com/<org> \
  --project <project> --run-id <run-id>
```

---

## Support and Resources

### Documentation
- 📘 [Full Setup Guide](Azure-DevOps-Setup-Guide.md)
- 📘 [Architecture Documentation](Architecture.md)
- 📘 [CI/CD Diagram](CI-CD-Diagram.md)

### External Resources
- [Azure Pipelines Docs](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [YAML Schema Reference](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema)
- [Docker Hub Documentation](https://docs.docker.com/)

### Get Help
- Open an issue in the repository
- Contact DevOps team
- Email: congdinh2008@gmail.com

---

**Pro Tips:**
- 💡 Use pipeline templates for reusable code
- 💡 Enable System.Debug for detailed logs
- 💡 Test pipeline changes in feature branch first
- 💡 Monitor pipeline execution time and optimize
- 💡 Keep secrets in Azure Key Vault, not pipeline variables
- 💡 Set up notifications for pipeline failures
- 💡 Review security scan results regularly
- 💡 Document any custom changes to pipeline

---

**Last Updated**: 2024  
**Version**: 1.0.0
