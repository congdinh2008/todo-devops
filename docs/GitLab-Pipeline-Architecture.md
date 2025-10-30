# GitLab CI/CD Pipeline Architecture

**Project:** Todo Application  
**Pipeline Type:** Monorepo with Parallel Jobs  
**Last Updated:** 2024

---

## Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GIT PUSH / MERGE REQUEST                      │
│                      (main, develop, or feature branch)                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHANGE DETECTION                                │
│  • Backend changes: backend/**/* → Trigger backend jobs                │
│  • Frontend changes: frontend/**/* → Trigger frontend jobs             │
│  • Both changed: Run all jobs in parallel                              │
└─────────────────────┬───────────────────────┬───────────────────────────┘
                      │                       │
        ┌─────────────┴─────────────┐        │
        │                           │        │
        ▼                           ▼        ▼
┌──────────────────┐      ┌──────────────────────┐
│  BACKEND TRACK   │      │   FRONTEND TRACK     │
└──────────────────┘      └──────────────────────┘

╔═══════════════════════════════════════════════════════════════════════╗
║                          STAGE 1: TEST                                ║
║                      Duration: 3-5 minutes                            ║
╚═══════════════════════════════════════════════════════════════════════╝

    BACKEND                                  FRONTEND
    ───────                                  ────────
    
┌──────────────────┐                    ┌──────────────────┐
│  backend:test    │                    │  frontend:test   │
├──────────────────┤                    ├──────────────────┤
│ Image:           │                    │ Image:           │
│  maven:3.9       │                    │  node:20-alpine  │
│  temurin-21      │                    │                  │
├──────────────────┤                    ├──────────────────┤
│ Services:        │                    │ Steps:           │
│  - PostgreSQL 16 │                    │  1. npm ci       │
├──────────────────┤                    │  2. npm lint     │
│ Steps:           │                    │  3. npm format   │
│  1. mvn compile  │                    │  4. npm test     │
│  2. mvn test     │                    │  5. coverage     │
│  3. jacoco report│                    │  6. npm build    │
│  4. mvn package  │                    │                  │
├──────────────────┤                    ├──────────────────┤
│ Artifacts:       │                    │ Artifacts:       │
│  • Test reports  │                    │  • Coverage      │
│  • Coverage      │                    │  • Build output  │
│  • JAR file      │                    │    (dist/)       │
├──────────────────┤                    ├──────────────────┤
│ Coverage: 80%+   │                    │ Coverage: 80%+   │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │    ╔════════════════════════════╗    │
         └───▶║   Cache Dependencies       ║◀───┘
              ║   • .m2/repository         ║
              ║   • node_modules           ║
              ║   • npm cache              ║
              ╚════════════════════════════╝
         │                                       │
         ▼                                       ▼

╔═══════════════════════════════════════════════════════════════════════╗
║                    STAGE 2: SECURITY-SCAN                             ║
║                      Duration: 2-4 minutes                            ║
╚═══════════════════════════════════════════════════════════════════════╝

    BACKEND                                  FRONTEND
    ───────                                  ────────
    
┌──────────────────┐                    ┌──────────────────┐
│backend:security  │                    │frontend:security │
│     -scan        │                    │     -scan        │
├──────────────────┤                    ├──────────────────┤
│ Scans:           │                    │ Scans:           │
│  1. OWASP        │                    │  1. npm audit    │
│     Dependency   │                    │     (moderate+)  │
│     Check        │                    │  2. Trivy FS     │
│  2. Trivy FS     │                    │     scan         │
│     scan         │                    │                  │
├──────────────────┤                    ├──────────────────┤
│ Severity:        │                    │ Severity:        │
│  CRITICAL, HIGH  │                    │  CRITICAL, HIGH  │
├──────────────────┤                    ├──────────────────┤
│ Artifacts:       │                    │ Artifacts:       │
│  • OWASP report  │                    │  • Trivy JSON    │
│  • Trivy JSON    │                    │                  │
├──────────────────┤                    ├──────────────────┤
│ allow_failure:   │                    │ allow_failure:   │
│      true        │                    │      true        │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
         
╔═══════════════════════════════════════════════════════════════════════╗
║                    STAGE 3: BUILD-IMAGE                               ║
║                      Duration: 3-6 minutes                            ║
║              Only runs on: main, develop branches                     ║
╚═══════════════════════════════════════════════════════════════════════╝

    BACKEND                                  FRONTEND
    ───────                                  ────────
    
┌──────────────────┐                    ┌──────────────────┐
│backend:build     │                    │frontend:build    │
│   -image         │                    │   -image         │
├──────────────────┤                    ├──────────────────┤
│ Services:        │                    │ Services:        │
│  docker:24-dind  │                    │  docker:24-dind  │
├──────────────────┤                    ├──────────────────┤
│ Steps:           │                    │ Steps:           │
│  1. docker login │                    │  1. docker login │
│  2. docker build │                    │  2. docker build │
│  3. docker tag   │                    │     --build-arg  │
│  4. docker push  │                    │     VITE_API_URL │
│  5. trivy scan   │                    │  3. docker tag   │
│     image        │                    │  4. docker push  │
│                  │                    │  5. trivy scan   │
├──────────────────┤                    ├──────────────────┤
│ Image Tags:      │                    │ Image Tags:      │
│  • :main         │                    │  • :main         │
│  • :develop      │                    │  • :develop      │
│  • :commit-sha   │                    │  • :commit-sha   │
│  • :latest       │                    │  • :latest       │
│    (main only)   │                    │    (main only)   │
├──────────────────┤                    ├──────────────────┤
│ Push to:         │                    │ Push to:         │
│  Docker Hub      │                    │  Docker Hub      │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │  ╔════════════════════════════╗      │
         └─▶║    Docker Hub Registry     ║◀─────┘
            ║  • todo-backend:*          ║
            ║  • todo-frontend:*         ║
            ╚════════════════════════════╝
         │                                       │
         ▼                                       ▼

╔═══════════════════════════════════════════════════════════════════════╗
║                      STAGE 4: DEPLOY                                  ║
║                      Duration: 1-2 minutes                            ║
╚═══════════════════════════════════════════════════════════════════════╝

         ENVIRONMENT ROUTING
         ──────────────────
         
┌──────────────────────────────────────────────────────────────────────┐
│                     Branch: develop                                  │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │backend:deploy│          │frontend:deploy│
    │    -dev      │          │    -dev       │
    ├──────────────┤          ├──────────────┤
    │ Trigger: AUTO│          │ Trigger: AUTO │
    │ URL: dev.ex..│          │ URL: dev.ex.. │
    └──────────────┘          └──────────────┘
            │                         │
            └────────────┬────────────┘
                         ▼
            ┌────────────────────────┐
            │  DEVELOPMENT ENV       │
            │  https://dev.ex.com    │
            └────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       Branch: main                                   │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ├─────── Automatic ──────┐
                         │                        │
                         ▼                        ▼
                 ┌──────────────┐        ┌──────────────┐
                 │backend:deploy│        │frontend:deploy│
                 │   -staging   │        │   -staging    │
                 ├──────────────┤        ├──────────────┤
                 │ Trigger: AUTO│        │ Trigger: AUTO │
                 └──────────────┘        └──────────────┘
                         │                        │
                         └───────┬────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │   STAGING ENV          │
                    │   https://staging...   │
                    └────────────────────────┘
                         │
                         ├─────── Manual ─────────┐
                         │                        │
                         ▼                        ▼
                 ┌──────────────┐        ┌──────────────┐
                 │backend:deploy│        │frontend:deploy│
                 │    -prod  🔒 │        │    -prod  🔒  │
                 ├──────────────┤        ├──────────────┤
                 │ Trigger:     │        │ Trigger:      │
                 │   MANUAL ▶️  │        │   MANUAL ▶️   │
                 └──────────────┘        └──────────────┘
                         │                        │
                         └───────┬────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │   PRODUCTION ENV       │
                    │   https://example.com  │
                    └────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════╗
║                    STAGE 5: .POST (Notify)                            ║
║                      Duration: < 1 minute                             ║
║                      Runs: Always (success/failure)                   ║
╚═══════════════════════════════════════════════════════════════════════╝

                    ┌──────────────────┐
                    │ pipeline:notify  │
                    ├──────────────────┤
                    │ • Log status     │
                    │ • Send webhooks  │
                    │   (Slack/Teams)  │
                    └──────────────────┘

═══════════════════════════════════════════════════════════════════════

```

## Pipeline Features

### ⚡ Performance Optimizations

```
┌─────────────────────────────────────────┐
│         CACHING STRATEGY                │
├─────────────────────────────────────────┤
│ Backend:                                │
│  • Maven dependencies (.m2/repository)  │
│  • Compiled classes (target/)           │
│                                         │
│ Frontend:                               │
│  • npm cache (.npm/)                    │
│  • node_modules/                        │
│  • Build output (dist/)                 │
│                                         │
│ Cache Key: {branch}-{component}         │
│ Result: 2-3x faster builds              │
└─────────────────────────────────────────┘
```

### 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│        SECURITY SCANNING                │
├─────────────────────────────────────────┤
│ Layer 1: Dependency Scanning            │
│  • OWASP Dependency Check (Backend)     │
│  • npm audit (Frontend)                 │
│                                         │
│ Layer 2: Filesystem Scanning            │
│  • Trivy FS scan (Both)                 │
│  • Severity: CRITICAL, HIGH             │
│                                         │
│ Layer 3: Image Scanning                 │
│  • Trivy Docker image scan              │
│  • Post-build verification              │
│                                         │
│ Reports: Artifacts (30 days retention)  │
└─────────────────────────────────────────┘
```

### 🎯 Change Detection

```
┌─────────────────────────────────────────┐
│       SMART JOB TRIGGERING              │
├─────────────────────────────────────────┤
│ Backend jobs run when:                  │
│  • backend/**/* files change            │
│  • .gitlab-ci.yml changes               │
│  • Branch: main, develop                │
│  • Merge requests                       │
│                                         │
│ Frontend jobs run when:                 │
│  • frontend/**/* files change           │
│  • .gitlab-ci.yml changes               │
│  • Branch: main, develop                │
│  • Merge requests                       │
│                                         │
│ Result: Faster pipelines, less waste    │
└─────────────────────────────────────────┘
```

### 📦 Artifact Management

```
┌─────────────────────────────────────────┐
│        ARTIFACT RETENTION               │
├─────────────────────────────────────────┤
│ Test Results:        30 days            │
│ Coverage Reports:    30 days            │
│ Security Reports:    30 days            │
│ Build Artifacts:     7 days             │
│ Docker Images:       90 days (Hub)      │
│                                         │
│ Download: CI/CD → Pipelines → Job      │
└─────────────────────────────────────────┘
```

## Pipeline Metrics

### Expected Performance

| Metric | Target | Notes |
|--------|--------|-------|
| **Full Pipeline** | 10-18 min | All stages complete |
| **Test Stage** | 3-5 min | Per component |
| **Security Stage** | 2-4 min | Per component |
| **Build Stage** | 3-6 min | Per component |
| **Deploy Stage** | 1-2 min | Per environment |
| **Cache Hit Rate** | >80% | With proper cache |
| **Success Rate** | >95% | Target reliability |

### Resource Usage

| Resource | Backend | Frontend | Notes |
|----------|---------|----------|-------|
| **CPU** | 2 cores | 2 cores | Minimum |
| **Memory** | 4 GB | 2 GB | Minimum |
| **Disk** | 10 GB | 5 GB | For cache/artifacts |
| **Network** | 1 Gbps | 1 Gbps | For downloads |

## Pipeline Variables

### Required Variables (Set in GitLab)

```yaml
DOCKER_USERNAME     # Docker Hub username
DOCKER_PASSWORD     # Docker Hub access token (masked)
```

### Predefined CI Variables (Auto-set by GitLab)

```yaml
CI_COMMIT_REF_SLUG   # Branch name (sanitized)
CI_COMMIT_SHORT_SHA  # Short commit SHA
CI_COMMIT_BRANCH     # Current branch
CI_PROJECT_DIR       # Project directory path
CI_PIPELINE_SOURCE   # Pipeline trigger source
```

### Custom Variables (In .gitlab-ci.yml)

```yaml
BACKEND_IMAGE       # $DOCKER_USERNAME/todo-backend
FRONTEND_IMAGE      # $DOCKER_USERNAME/todo-frontend
MAVEN_OPTS          # Maven configuration
NPM_CONFIG_CACHE    # npm cache location
TRIVY_CACHE_DIR     # Trivy cache location
```

## Deployment Flow

```
Development:    feature → develop → auto-deploy → dev.example.com
                  │
                  └─ Automatic deployment
                  └─ No approval needed
                  └─ Latest develop branch

Staging:        main → auto-deploy → staging.example.com
                  │
                  └─ Automatic deployment
                  └─ No approval needed
                  └─ Release candidates

Production:     main → manual-deploy → example.com
                  │
                  └─ Manual trigger ▶️
                  └─ Approval required
                  └─ Stable releases
```

## Best Practices

### ✅ Do's

- ✅ Use CI/CD variables for all secrets
- ✅ Mark sensitive variables as "masked"
- ✅ Enable "protected" flag for production vars
- ✅ Review security scan reports
- ✅ Monitor pipeline analytics
- ✅ Use specific image versions
- ✅ Clear cache when dependencies update
- ✅ Test locally before pushing

### ❌ Don'ts

- ❌ Never hardcode credentials
- ❌ Don't commit .env files
- ❌ Don't skip security scans
- ❌ Don't use :latest in production
- ❌ Don't ignore failing tests
- ❌ Don't deploy without manual review (prod)

---

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** DevOps Team
