# GitLab CI/CD Quick Reference

A handy quick reference for the Todo Application GitLab CI/CD pipeline.

---

## 🚀 Quick Start

### 1️⃣ Setup CI/CD Variables

**Navigate to:** Settings → CI/CD → Variables

Add these two variables:

```
DOCKER_USERNAME = your-docker-username
DOCKER_PASSWORD = your-docker-access-token (masked ✓)
```

### 2️⃣ Push to Trigger

```bash
git add .
git commit -m "your changes"
git push origin main    # or develop
```

### 3️⃣ Monitor Pipeline

**Navigate to:** CI/CD → Pipelines → Click latest pipeline

---

## 📊 Pipeline Stages

```
┌──────────────┐
│     TEST     │  ← Build, test, lint (3-5 min)
├──────────────┤
│ SECURITY-SCAN│  ← OWASP, Trivy, npm audit (2-4 min)
├──────────────┤
│ BUILD-IMAGE  │  ← Docker build & push (3-6 min)
├──────────────┤
│    DEPLOY    │  ← Environment deployment (1-2 min)
└──────────────┘
```

---

## 🎯 Jobs Overview

### Backend Jobs

| Job | Stage | Triggers | Duration |
|-----|-------|----------|----------|
| `backend:test` | test | backend/**/* changes | 3-5 min |
| `backend:security-scan` | security-scan | After test | 2-4 min |
| `backend:build-image` | build-image | main/develop | 3-6 min |
| `backend:deploy-dev` | deploy | develop (auto) | 1-2 min |
| `backend:deploy-staging` | deploy | main (auto) | 1-2 min |
| `backend:deploy-prod` | deploy | main (manual) | 1-2 min |

### Frontend Jobs

| Job | Stage | Triggers | Duration |
|-----|-------|----------|----------|
| `frontend:test` | test | frontend/**/* changes | 3-5 min |
| `frontend:security-scan` | security-scan | After test | 2-3 min |
| `frontend:build-image` | build-image | main/develop | 4-7 min |
| `frontend:deploy-dev` | deploy | develop (auto) | 1-2 min |
| `frontend:deploy-staging` | deploy | main (auto) | 1-2 min |
| `frontend:deploy-prod` | deploy | main (manual) | 1-2 min |

---

## 🌍 Deployment Environments

| Environment | Branch | Trigger | Manual Approval |
|------------|--------|---------|----------------|
| Development | `develop` | Automatic | ❌ No |
| Staging | `main` | Automatic | ❌ No |
| Production | `main` | Manual | ✅ Yes |

**To deploy to production:**
1. Navigate to: CI/CD → Pipelines
2. Click on latest successful pipeline
3. Click ▶️ Play button on `backend:deploy-prod` or `frontend:deploy-prod`

---

## 🔧 Common Commands

### View Pipeline Status
```bash
# Using GitLab CLI (glab)
glab ci status

# View pipeline list
glab ci list
```

### Run Jobs Locally
```bash
# Install gitlab-runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

# Test specific job
gitlab-runner exec docker backend:test
gitlab-runner exec docker frontend:test
```

### Clear Cache
1. Navigate to: Settings → CI/CD → Runners
2. Click "Clear runner caches"

Or in job configuration:
```yaml
cache:
  policy: pull  # Don't push to cache (read-only)
```

---

## 🐳 Docker Images

### Image Naming Convention

**Backend:**
```
$DOCKER_USERNAME/todo-backend:main           # Main branch
$DOCKER_USERNAME/todo-backend:develop        # Develop branch
$DOCKER_USERNAME/todo-backend:abc1234        # Commit SHA
$DOCKER_USERNAME/todo-backend:latest         # Latest from main
```

**Frontend:**
```
$DOCKER_USERNAME/todo-frontend:main          # Main branch
$DOCKER_USERNAME/todo-frontend:develop       # Develop branch
$DOCKER_USERNAME/todo-frontend:abc1234       # Commit SHA
$DOCKER_USERNAME/todo-frontend:latest        # Latest from main
```

### Pull Images Locally

```bash
# Backend
docker pull $DOCKER_USERNAME/todo-backend:latest

# Frontend
docker pull $DOCKER_USERNAME/todo-frontend:latest

# Run locally
docker run -p 8080:8080 $DOCKER_USERNAME/todo-backend:latest
docker run -p 3000:3000 $DOCKER_USERNAME/todo-frontend:latest
```

---

## 📦 Artifacts

### Available Artifacts

**Backend:**
- Test results: `backend/target/surefire-reports/`
- Coverage: `backend/target/site/jacoco/`
- JAR file: `backend/target/*.jar`
- OWASP report: `backend/target/dependency-check-report.html`
- Trivy results: `backend-trivy-results.json`

**Frontend:**
- Coverage: `frontend/coverage/`
- Build output: `frontend/dist/`
- Trivy results: `frontend-trivy-results.json`

### Download Artifacts

1. Navigate to: CI/CD → Pipelines
2. Click on pipeline
3. Click on job
4. Click "Browse" or "Download" in right sidebar

---

## 🔍 Troubleshooting

### Pipeline Not Starting?

✅ Check:
- Runner is active: Settings → CI/CD → Runners
- File changes match rules: `backend/**/*` or `frontend/**/*`
- `.gitlab-ci.yml` syntax is valid

### Docker Login Failed?

✅ Check:
- `DOCKER_USERNAME` variable is set
- `DOCKER_PASSWORD` variable is set and masked
- Docker Hub token is valid

### Tests Failing?

✅ Debug:
```bash
# Run tests locally
cd backend && mvn test
cd frontend && npm test
```

### Cache Issues?

✅ Solutions:
- Clear runner cache: Settings → CI/CD → Runners → Clear cache
- Change cache key in `.gitlab-ci.yml`
- Use `-U` flag for Maven: `mvn clean install -U`

### Job Timeout?

✅ Solutions:
```yaml
# Increase timeout in job
timeout: 2h  # Default is 1h
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] ✅ All secrets in CI/CD variables (not hardcoded)
- [ ] ✅ `DOCKER_PASSWORD` is masked
- [ ] ✅ Production variables are protected
- [ ] ✅ Security scans pass (no critical/high CVEs)
- [ ] ✅ Manual approval for production deployment
- [ ] ✅ Protected branches configured (main)
- [ ] ✅ Review deployment history regularly

---

## 📝 Branch Strategy

```
┌─────────────┐
│   Feature   │─┐
│  Branches   │ │
└─────────────┘ │
                ├──► merge to ──► develop ──► Auto Deploy to Dev
                │
                ├──► merge to ──► main ──────► Auto Deploy to Staging
                │                              Manual Deploy to Prod
                │
┌─────────────┐ │
│   Hotfix    │─┘
│  Branches   │
└─────────────┘
```

---

## 📊 Key Metrics

### Pipeline Performance

| Metric | Target | Current |
|--------|--------|---------|
| Success Rate | >95% | Track in Analytics |
| Average Duration | <15 min | Track in Analytics |
| Cache Hit Rate | >80% | Check logs |
| Security Issues | 0 Critical | Review reports |

**View Analytics:** Navigate to Analytics → CI/CD Analytics

---

## 🆘 Getting Help

1. **Documentation**: Check `docs/GitLab-CI-CD-Setup-Guide.md`
2. **Job Logs**: CI/CD → Pipelines → Job → View logs
3. **Runner Logs**: Settings → CI/CD → Runners → View logs
4. **Support**: Open issue in project repository

---

## 🔗 Useful Links

- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [.gitlab-ci.yml Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [GitLab Runner Docs](https://docs.gitlab.com/runner/)
- [CI Lint Tool](https://gitlab.com/ci/lint)

---

## 🎓 Pro Tips

1. **Use CI Lint** to validate `.gitlab-ci.yml` before committing
2. **Enable Auto DevOps** for automatic best practices
3. **Set up Merge Request Pipelines** for PR validation
4. **Use job artifacts** to pass data between stages
5. **Leverage caching** for faster builds (already configured!)
6. **Monitor pipeline analytics** to identify bottlenecks
7. **Use `only/except` or `rules`** to control when jobs run
8. **Schedule pipelines** for nightly builds/tests

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** DevOps Team

---

### 📄 Print This Page

Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac) to print this quick reference for your desk!
