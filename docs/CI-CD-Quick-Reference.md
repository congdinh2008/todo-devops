# CI/CD Quick Reference

## 🚀 Quick Start

### Required Secrets
Add these secrets in GitHub repository settings (Settings → Secrets and variables → Actions):
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

### Workflow Files
- `.github/workflows/backend-ci.yml` - Backend build, test, security scan, and Docker push
- `.github/workflows/frontend-ci.yml` - Frontend build, test, security scan, and Docker push
- `.github/workflows/pr-validation.yml` - Pull request validation

## 📋 Workflow Triggers

### Backend CI/CD (`backend-ci.yml`)
**Triggers on:**
- Push to `main` or `develop` with changes in `backend/` directory
- Pull request to `main` or `develop` with changes in `backend/` directory

**Jobs:**
1. `test`: Build, test, and generate coverage reports
2. `security-scan`: OWASP dependency check and Trivy scan
3. `docker-build-push`: Build and push Docker image (push only)
4. `notify`: Send notification on failure

### Frontend CI/CD (`frontend-ci.yml`)
**Triggers on:**
- Push to `main` or `develop` with changes in `frontend/` directory
- Pull request to `main` or `develop` with changes in `frontend/` directory

**Jobs:**
1. `test`: Lint, test, format check, and build
2. `security-scan`: npm audit and Trivy scan
3. `docker-build-push`: Build and push Docker image (push only)
4. `notify`: Send notification on failure

### PR Validation (`pr-validation.yml`)
**Triggers on:**
- Pull request to `main` or `develop` branches

**Jobs:**
1. `pr-validation`: Check PR format, detect changes, quick validation
2. `backend-pr-check`: Run backend tests (if backend changed)
3. `frontend-pr-check`: Run frontend tests (if frontend changed)
4. `all-checks-passed`: Verify all checks passed

## 🐳 Docker Images

### Image Tags
Images are automatically tagged with:
- `latest` - Latest from main branch
- `main` - Latest from main branch
- `develop` - Latest from develop branch
- `{branch}-{sha}` - Specific commit (e.g., `main-abc123`)

### Pull Images
```bash
# Backend
docker pull <DOCKER_USERNAME>/todo-backend:latest
docker pull <DOCKER_USERNAME>/todo-backend:main
docker pull <DOCKER_USERNAME>/todo-backend:develop

# Frontend
docker pull <DOCKER_USERNAME>/todo-frontend:latest
docker pull <DOCKER_USERNAME>/todo-frontend:main
docker pull <DOCKER_USERNAME>/todo-frontend:develop
```

## 📦 Artifacts

All workflows generate artifacts available for download:

### Backend
- `backend-test-results` - JUnit test results (30 days)
- `backend-coverage-report` - JaCoCo coverage HTML (30 days)
- `backend-jar` - Compiled JAR file (7 days)
- `backend-owasp-report` - Security scan report (30 days)
- `backend-trivy-report` - Trivy scan SARIF (30 days)

### Frontend
- `frontend-test-results` - Vitest test results (30 days)
- `frontend-coverage-report` - Coverage HTML (30 days)
- `frontend-build` - Production build (7 days)
- `frontend-trivy-report` - Trivy scan SARIF (30 days)

## 🔍 Viewing Results

### Actions Tab
1. Go to repository → **Actions** tab
2. Select workflow (Backend CI/CD, Frontend CI/CD, or PR Validation)
3. Click on a workflow run to see details
4. Download artifacts from the bottom of the page

### Security Tab
1. Go to repository → **Security** tab
2. Click **Code scanning alerts**
3. View Trivy findings by severity

### Pull Requests
- PR comments show validation summary
- Status checks appear at bottom of PR
- All checks must pass before merging

## 🛠️ Local Testing

### Backend
```bash
cd backend

# Compile
mvn clean compile -B

# Run tests
mvn test -B

# Generate coverage
mvn jacoco:report

# Security scan
mvn org.owasp:dependency-check-maven:check

# Build Docker image
docker build -t todo-backend:local .
```

### Frontend
```bash
cd frontend

# Install dependencies
npm ci

# Lint
npm run lint

# Format check
npm run format -- --check

# Run tests
npm test -- --run

# Coverage
npm run test:coverage -- --run

# Build
npm run build

# Build Docker image
docker build -t todo-frontend:local \
  --build-arg VITE_API_BASE_URL=http://localhost:8080/api .
```

## 🐛 Common Issues

### Docker Push Fails
**Error:** "authentication required" or "unauthorized"
**Solution:**
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets exist
- Use Docker Hub access token, not password
- Ensure repository exists on Docker Hub

### Tests Fail in CI but Pass Locally
**Solution:**
- Check environment variables
- Verify PostgreSQL service is healthy (backend)
- Review test logs in artifacts
- Check for test isolation issues

### Workflow Not Triggering
**Solution:**
- Verify file is in `.github/workflows/`
- Check YAML syntax
- Ensure path filters match your changes
- Confirm GitHub Actions is enabled

### Security Scan Finds Issues
**Solution:**
- Review security report artifact
- Update dependencies to patched versions
- Configure suppression for false positives
- Add `.trivyignore` for Trivy exceptions

## 📈 Best Practices

1. **Keep Secrets Safe**: Never commit secrets to repository
2. **Test Locally First**: Run builds and tests before pushing
3. **Meaningful Commits**: Use conventional commit format
4. **Small PRs**: Keep pull requests focused and small
5. **Check Logs**: Review workflow logs for failures
6. **Update Dependencies**: Keep dependencies up to date
7. **Monitor Coverage**: Maintain >80% code coverage
8. **Review Security**: Address HIGH/CRITICAL vulnerabilities

## 🔗 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CI/CD Setup Guide](CI-CD-Setup-Guide.md) - Detailed setup instructions
- [CI/CD Diagram](CI-CD-Diagram.md) - Pipeline architecture
- [Trivy Documentation](https://github.com/aquasecurity/trivy)
- [OWASP Dependency Check](https://jeremylong.github.io/DependencyCheck/)

---

**Need Help?** Check the [CI-CD-Setup-Guide.md](CI-CD-Setup-Guide.md) for detailed troubleshooting steps.
