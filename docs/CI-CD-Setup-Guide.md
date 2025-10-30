# CI/CD Setup Guide - GitHub Actions

## 📋 Overview

This document provides comprehensive instructions for setting up and using the GitHub Actions CI/CD pipelines for the Todo DevOps project.

## 🏗️ Pipeline Architecture

### Backend Pipeline (`backend-ci.yml`)
- **Build & Test**: Maven compilation, JUnit tests with PostgreSQL
- **Coverage**: JaCoCo code coverage reporting
- **Security**: OWASP Dependency Check and Trivy scanning
- **Docker**: Build and push images to Docker Hub
- **Artifacts**: Test results, coverage reports, security scan results

### Frontend Pipeline (`frontend-ci.yml`)
- **Build & Test**: npm build, Vitest unit tests
- **Linting**: ESLint code quality checks
- **Formatting**: Prettier code formatting validation
- **Coverage**: Vitest coverage reporting
- **Security**: npm audit and Trivy scanning
- **Docker**: Build and push images to Docker Hub
- **Artifacts**: Test results, coverage reports, security scan results

### PR Validation Pipeline (`pr-validation.yml`)
- **Quick Validation**: Fast compilation and build checks
- **Change Detection**: Automatically detects which components changed
- **Status Reporting**: Comments on PR with validation summary
- **Branch Protection**: Ensures tests pass before merging

## 🔐 Required Secrets

Configure the following secrets in your GitHub repository:

### Docker Hub Credentials
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `your-dockerhub-username` |
| `DOCKER_PASSWORD` | Docker Hub password or access token | `your-dockerhub-token` |

### Creating Docker Hub Access Token (Recommended)
1. Log in to [Docker Hub](https://hub.docker.com/)
2. Go to **Account Settings** → **Security** → **Access Tokens**
3. Click **New Access Token**
4. Name: `github-actions-todo-devops`
5. Permissions: **Read, Write, Delete**
6. Copy the token and use it as `DOCKER_PASSWORD`

⚠️ **Important**: Never commit secrets to your repository. Always use GitHub Secrets.

## 🚀 Workflow Triggers

### Backend CI/CD
- **Push** to `main` or `develop` branches with changes in `backend/` directory
- **Pull Request** to `main` or `develop` branches with changes in `backend/` directory
- Docker push only happens on push to main/develop (not on PRs)

### Frontend CI/CD
- **Push** to `main` or `develop` branches with changes in `frontend/` directory
- **Pull Request** to `main` or `develop` branches with changes in `frontend/` directory
- Docker push only happens on push to main/develop (not on PRs)

### PR Validation
- Automatically runs on all **Pull Requests** to `main` or `develop`
- Validates changed components only for fast feedback
- Provides PR comment with validation summary

## 📊 Pipeline Stages

### 1. Test Stage
**Backend:**
```yaml
- Checkout code
- Set up JDK 21
- Start PostgreSQL service
- Cache Maven dependencies
- Build with Maven
- Run unit tests
- Generate JaCoCo coverage
- Upload test results & coverage artifacts
```

**Frontend:**
```yaml
- Checkout code
- Set up Node.js 20
- Cache npm dependencies
- Install dependencies
- Lint with ESLint
- Check formatting with Prettier
- Run unit tests
- Generate coverage report
- Build application
- Upload test results & build artifacts
```

### 2. Security Scan Stage
**Backend:**
```yaml
- OWASP Dependency Check (CVSS ≥ 8)
- Trivy filesystem scan
- Upload SARIF to GitHub Security
- Upload security reports as artifacts
```

**Frontend:**
```yaml
- npm audit (moderate+ vulnerabilities)
- Trivy filesystem scan
- Upload SARIF to GitHub Security
- Upload security reports as artifacts
```

### 3. Docker Build & Push Stage
**Requirements:**
- Only runs on push to `main` or `develop`
- Requires successful test and security stages
- Requires Docker Hub credentials

**Actions:**
```yaml
- Build Docker image with Buildx
- Tag with branch name and commit SHA
- Push to Docker Hub
- Scan image with Trivy
- Cache layers for faster builds
```

### 4. Notification Stage
- Runs only on pipeline failure
- Logs failure details (branch, commit, author)
- Can be extended with Slack/Teams webhooks

## 🐳 Docker Image Tags

### Backend Images
```
docker pull <DOCKER_USERNAME>/todo-backend:latest      # Latest from main
docker pull <DOCKER_USERNAME>/todo-backend:main        # Main branch
docker pull <DOCKER_USERNAME>/todo-backend:develop     # Develop branch
docker pull <DOCKER_USERNAME>/todo-backend:main-abc123 # Specific commit
```

### Frontend Images
```
docker pull <DOCKER_USERNAME>/todo-frontend:latest      # Latest from main
docker pull <DOCKER_USERNAME>/todo-frontend:main        # Main branch
docker pull <DOCKER_USERNAME>/todo-frontend:develop     # Develop branch
docker pull <DOCKER_USERNAME>/todo-frontend:main-abc123 # Specific commit
```

## 📦 Artifacts

All pipeline runs generate artifacts that are stored for 30 days (test/coverage/security) or 7 days (build artifacts):

### Backend Artifacts
- `backend-test-results`: JUnit test results
- `backend-coverage-report`: JaCoCo HTML coverage report
- `backend-jar`: Compiled JAR file
- `backend-owasp-report`: OWASP dependency check HTML report
- `backend-trivy-report`: Trivy security scan results

### Frontend Artifacts
- `frontend-test-results`: Vitest test results
- `frontend-coverage-report`: Coverage HTML report
- `frontend-build`: Production build files
- `frontend-trivy-report`: Trivy security scan results

### Accessing Artifacts
1. Go to the **Actions** tab in your repository
2. Click on a workflow run
3. Scroll down to the **Artifacts** section
4. Download any artifact by clicking on it

## 🔍 Code Coverage

Code coverage is automatically uploaded to:
- **Codecov** (if configured): View detailed coverage reports
- **GitHub Artifacts**: Download HTML reports locally
- **Pull Requests**: Coverage changes are visible in PR checks

### Coverage Thresholds
- Both backend and frontend aim for **>80% coverage**
- Coverage reports are generated but don't fail builds
- Use reports to identify untested code

## 🛡️ Security Scanning

### Backend Security Tools
1. **OWASP Dependency Check**
   - Scans Maven dependencies for known vulnerabilities
   - Fails if CVSS score ≥ 8 (HIGH or CRITICAL)
   - Generates detailed HTML report

2. **Trivy**
   - Scans filesystem for vulnerabilities
   - Scans Docker images after build
   - Results uploaded to GitHub Security tab

### Frontend Security Tools
1. **npm audit**
   - Checks npm packages for vulnerabilities
   - Warns on moderate+ severity issues
   - Non-blocking but generates report

2. **Trivy**
   - Scans filesystem for vulnerabilities
   - Scans Docker images after build
   - Results uploaded to GitHub Security tab

### Viewing Security Results
1. Go to **Security** → **Code scanning alerts**
2. View Trivy findings categorized by severity
3. Review and dismiss false positives as needed

## 🔄 Branch Protection Rules

Recommended branch protection settings for `main` and `develop`:

1. **Require pull request reviews**
   - Number of approvals: 1+

2. **Require status checks to pass**
   - ✅ Backend tests (if backend changed)
   - ✅ Frontend tests (if frontend changed)
   - ✅ PR validation checks

3. **Require branches to be up to date**

4. **Include administrators**

5. **Require linear history**

### Setting Up Branch Protection
1. Go to **Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. Branch name pattern: `main` (create another for `develop`)
4. Configure the checkboxes as recommended above
5. Click **Create** or **Save changes**

## 🐛 Troubleshooting

### Pipeline Fails to Start
**Problem**: Workflow doesn't trigger on push/PR
**Solution**:
- Verify the file is in `.github/workflows/`
- Check YAML syntax (use yamllint)
- Ensure path filters match your changes
- Check if GitHub Actions is enabled for your repo

### Docker Push Fails
**Problem**: "authentication required" or "unauthorized"
**Solution**:
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set
- Check that Docker Hub credentials are correct
- Use access token instead of password for better security
- Ensure the repository exists on Docker Hub

### Tests Fail in CI but Pass Locally
**Problem**: Tests pass on local machine but fail in GitHub Actions
**Solution**:
- Check environment variables (database URLs, etc.)
- Verify PostgreSQL service is healthy before tests run
- Review test logs in artifacts
- Ensure timezone/locale settings match
- Check for test isolation issues (parallel execution)

### Build Takes Too Long
**Problem**: Pipeline runs for >10 minutes
**Solution**:
- Verify Maven/npm caching is working
- Check cache hit/miss rates in logs
- Consider using `--quiet` or `--batch-mode` flags
- Remove unnecessary dependencies
- Use matrix builds for parallel execution

### Security Scan Failures
**Problem**: OWASP or Trivy reports HIGH/CRITICAL issues
**Solution**:
- Review the security report artifact
- Update dependencies to patched versions
- If false positive, configure suppression rules
- For OWASP: Edit `dependency-check-suppressions.xml`
- For Trivy: Use `.trivyignore` file

### Merge Conflicts in PR
**Problem**: PR validation fails due to conflicts
**Solution**:
- Rebase your branch on latest main/develop
- Resolve conflicts locally
- Push updated branch
- PR validation will re-run automatically

## 📈 Monitoring Pipeline Health

### GitHub Actions Insights
1. Go to **Insights** → **Actions**
2. View success/failure rates
3. Monitor average run times
4. Identify frequently failing workflows

### Workflow Status Badge
Add badges to your README.md:

```markdown
![Backend CI](https://github.com/<username>/todo-devops/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/<username>/todo-devops/actions/workflows/frontend-ci.yml/badge.svg)
![PR Validation](https://github.com/<username>/todo-devops/actions/workflows/pr-validation.yml/badge.svg)
```

## 🔧 Local Testing

### Test Backend Build Locally
```bash
cd backend
mvn clean test
mvn jacoco:report
mvn org.owasp:dependency-check-maven:check

# View coverage report
open target/site/jacoco/index.html
```

### Test Frontend Build Locally
```bash
cd frontend
npm ci
npm run lint
npm run format -- --check
npm test -- --run
npm run test:coverage -- --run
npm run build

# View coverage report
open coverage/index.html
```

### Test Docker Builds Locally
```bash
# Backend
cd backend
docker build -t todo-backend:local .
docker run --rm todo-backend:local

# Frontend
cd frontend
docker build -t todo-frontend:local --build-arg VITE_API_BASE_URL=http://localhost:8080/api .
docker run --rm -p 3000:3000 todo-frontend:local
```

## 🚀 Deployment

After successful CI/CD pipeline execution:

1. **Docker images are available on Docker Hub**
2. **Pull and run images**:
   ```bash
   docker pull <DOCKER_USERNAME>/todo-backend:latest
   docker pull <DOCKER_USERNAME>/todo-frontend:latest
   
   # Or use docker-compose with specific tags
   docker-compose up -d
   ```

3. **For production deployments**:
   - Use specific version tags (not `latest`)
   - Implement rolling updates or blue-green deployment
   - Set up monitoring and alerting
   - Configure auto-rollback on health check failures

## 📞 Support

If you encounter issues:
1. Check this guide for troubleshooting steps
2. Review GitHub Actions logs and artifacts
3. Open an issue with:
   - Workflow run URL
   - Error message
   - Steps to reproduce
   - Environment details

## 📝 Maintenance

### Regular Tasks
- **Weekly**: Review security scan results
- **Monthly**: Update dependencies and action versions
- **Quarterly**: Review and optimize pipeline performance
- **As needed**: Update branch protection rules

### Updating Action Versions
Monitor for updates to GitHub Actions:
- `actions/checkout@v4`
- `actions/setup-java@v4`
- `actions/setup-node@v4`
- `docker/build-push-action@v5`
- `aquasecurity/trivy-action@master`

## 🎯 Best Practices

1. **Keep pipelines fast**: Aim for <5 minute feedback
2. **Fail fast**: Run quick checks first
3. **Cache dependencies**: Reduce download time
4. **Parallel execution**: Run independent jobs concurrently
5. **Meaningful notifications**: Alert on failures only
6. **Secure secrets**: Never log or expose secrets
7. **Version control workflows**: Treat them as code
8. **Regular maintenance**: Keep dependencies updated

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [JaCoCo Maven Plugin](https://www.jacoco.org/jacoco/trunk/doc/maven.html)

---

**Last Updated**: 2024
**Maintained by**: Cong Dinh
