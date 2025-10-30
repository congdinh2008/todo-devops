# Azure DevOps PR Validation Workflow

**Purpose:** Automated validation of Pull Requests to ensure code quality before merging.

---

## Overview

The Azure DevOps pipeline automatically validates Pull Requests (PRs) to `main` and `develop` branches. This ensures that only code that passes all quality gates can be merged.

---

## PR Validation Process

### Automatic Triggers

PR validation runs automatically when:

1. **Pull Request is Created**
   - Against `main` or `develop` branch
   - Changes in `backend/`, `frontend/`, or `azure-pipelines.yml`

2. **Pull Request is Updated**
   - New commits are pushed to the PR branch
   - PR is synchronized

### Validation Stages

```
PR Created/Updated
       │
       ▼
┌─────────────────────┐
│  Changed Files      │
│  Detection          │
└──────┬──────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌──────────────┐    ┌──────────────┐
│   Backend    │    │   Frontend   │
│   Changed?   │    │   Changed?   │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Backend    │    │   Frontend   │
│ Build & Test │    │ Build & Test │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Backend    │    │   Frontend   │
│  Security    │    │  Security    │
│    Scan      │    │    Scan      │
└──────┬───────┘    └──────┬───────┘
       │                   │
       └─────────┬─────────┘
                 ▼
         ┌──────────────┐
         │  Validation  │
         │   Complete   │
         └──────────────┘
```

---

## What Gets Validated

### Backend Validation

✅ **Code Compilation**
- Maven clean compile
- Java 21 compatibility check

✅ **Unit Tests**
- JUnit 5 test execution
- PostgreSQL integration tests
- Test coverage report

✅ **Code Coverage**
- JaCoCo coverage check
- Minimum 80% threshold enforced
- Coverage report published

✅ **Security Scanning**
- OWASP Dependency Check
- Trivy filesystem scan
- Security report artifacts

### Frontend Validation

✅ **Code Quality**
- ESLint linting (max warnings = 0)
- Prettier formatting check
- TypeScript compilation

✅ **Build**
- Vite production build
- Build artifacts generated

✅ **Unit Tests**
- Vitest test execution
- Test coverage report

✅ **Security Scanning**
- npm audit
- Trivy filesystem scan
- Security report artifacts

---

## PR Status Checks

### Required Checks

The following checks must pass before a PR can be merged:

| Check Name | Description | Failure Impact |
|------------|-------------|----------------|
| **Backend Build & Test** | Backend compilation and tests | ❌ Blocks merge |
| **Frontend Build & Test** | Frontend linting, build, and tests | ❌ Blocks merge |
| **Backend Security Scan** | OWASP + Trivy scans | ⚠️ Warning only* |
| **Frontend Security Scan** | npm audit + Trivy scans | ⚠️ Warning only* |

*Security scans are set to `continueOnError: true` to avoid blocking on non-critical issues, but should be reviewed.

### Optional Checks

| Check Name | Description | Failure Impact |
|------------|-------------|----------------|
| **Code Coverage Report** | Coverage percentage | 📊 Informational |
| **Artifacts Upload** | Test results and reports | 📦 Informational |

---

## Viewing PR Validation Results

### In Azure DevOps

1. **Navigate to Pull Request**
   - Go to Repos → Pull Requests
   - Click on your PR

2. **View Pipeline Status**
   - Check **Checks** section
   - See real-time status of each stage
   - Click on stage for detailed logs

3. **Review Test Results**
   - Go to **Tests** tab
   - View pass/fail status
   - Click on failed test for details

4. **Check Code Coverage**
   - Go to **Code Coverage** tab
   - View coverage percentage
   - Compare with baseline

5. **Download Artifacts**
   - Click on completed pipeline run
   - Navigate to **Artifacts**
   - Download reports for review

### Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| **Pending** | ⏳ | Validation is running |
| **Success** | ✅ | All checks passed |
| **Failed** | ❌ | One or more checks failed |
| **Canceled** | ⊘ | Validation was canceled |

---

## Common PR Validation Failures

### 1. Build Failure

**Symptom**: "Maven/npm build failed"

**Common Causes**:
- Syntax errors in code
- Missing dependencies
- Incompatible dependency versions
- Import errors

**How to Fix**:
1. Review build logs in pipeline
2. Fix compilation errors locally:
   ```bash
   # Backend
   cd backend && mvn clean compile
   
   # Frontend
   cd frontend && npm run build
   ```
3. Push fix to PR branch

### 2. Test Failure

**Symptom**: "Tests failed with X failures"

**Common Causes**:
- Logic errors in code
- Test data issues
- Environment configuration problems
- Flaky tests

**How to Fix**:
1. Download test reports from artifacts
2. Run tests locally:
   ```bash
   # Backend
   cd backend && mvn test
   
   # Frontend
   cd frontend && npm test
   ```
3. Fix failing tests
4. Push fix to PR branch

### 3. Coverage Below Threshold

**Symptom**: "Coverage 75% is below threshold 80%"

**Common Causes**:
- New code not covered by tests
- Removed tests without removing code
- Changed logic not tested

**How to Fix**:
1. Check coverage report in artifacts
2. Identify uncovered lines
3. Add tests for uncovered code:
   ```bash
   # Generate local coverage report
   cd backend && mvn test jacoco:report
   # Open: backend/target/site/jacoco/index.html
   
   cd frontend && npm run test:coverage
   # Open: frontend/coverage/index.html
   ```
4. Push new tests to PR branch

### 4. Linting Errors

**Symptom**: "ESLint found errors/warnings"

**Common Causes**:
- Code style violations
- Unused variables
- Missing imports
- TypeScript errors

**How to Fix**:
1. Run linting locally:
   ```bash
   cd frontend
   npm run lint
   npm run format -- --check
   ```
2. Auto-fix issues:
   ```bash
   npm run lint -- --fix
   npm run format
   ```
3. Fix remaining issues manually
4. Push fix to PR branch

### 5. Security Vulnerabilities

**Symptom**: "High/Critical vulnerabilities found"

**Common Causes**:
- Outdated dependencies with known CVEs
- Direct dependencies with vulnerabilities
- Transitive dependencies with vulnerabilities

**How to Fix**:
1. Review security report in artifacts
2. Update vulnerable dependencies:
   ```bash
   # Backend
   mvn versions:display-dependency-updates
   # Update dependencies in pom.xml
   
   # Frontend
   npm audit fix
   npm audit fix --force  # If needed
   ```
3. Test after updates
4. Push fix to PR branch

---

## Best Practices for PR Validation

### Before Creating PR

1. **Run Tests Locally**
   ```bash
   # Backend
   cd backend
   mvn clean test
   
   # Frontend
   cd frontend
   npm run lint
   npm run format -- --check
   npm test
   npm run build
   ```

2. **Check Coverage**
   ```bash
   # Backend
   mvn test jacoco:report
   
   # Frontend
   npm run test:coverage
   ```

3. **Verify Build**
   ```bash
   # Backend
   mvn clean package
   
   # Frontend
   npm run build
   ```

### During PR Review

1. **Monitor Pipeline Status**
   - Watch for failures
   - Review logs immediately
   - Fix issues promptly

2. **Review Test Results**
   - Check for new test failures
   - Verify coverage didn't decrease
   - Review security scan results

3. **Address Feedback**
   - Respond to review comments
   - Fix identified issues
   - Update PR description if scope changed

### After Validation Passes

1. **Wait for Code Review**
   - Get required approvals
   - Address reviewer feedback
   - Re-validate after changes

2. **Verify Branch Protection**
   - Ensure all required checks passed
   - Confirm no merge conflicts
   - Check branch is up-to-date

3. **Merge PR**
   - Use squash merge (recommended)
   - Write clear merge commit message
   - Delete feature branch after merge

---

## Skipping Validation (Not Recommended)

In rare cases, you may need to skip validation:

### Skip Security Scans

If security scans are failing on false positives:

1. Document the false positive
2. Create an issue to investigate
3. Security scans already have `continueOnError: true`

### Skip CI Entirely (Emergency Only)

⚠️ **WARNING**: Only use in emergencies with approval

Add to commit message:
```
[skip ci]
```

**This should only be used**:
- For documentation-only changes
- Hotfix deployments (with manual testing)
- With explicit team approval

---

## Troubleshooting PR Validation

### Pipeline Not Triggering

**Check**:
1. PR is against `main` or `develop`
2. Changes affect `backend/`, `frontend/`, or `azure-pipelines.yml`
3. Pipeline is enabled in project settings

**Fix**:
- Close and reopen PR
- Push a new commit to trigger
- Check pipeline permissions

### Validation Takes Too Long

**Typical Times**:
- Backend: 5-10 minutes
- Frontend: 3-5 minutes
- Total: 10-15 minutes

**If Slower**:
- Check agent queue
- Verify caching is working
- Review resource limits

### Cannot Merge After Validation Passes

**Check**:
1. All required checks passed
2. Code review approved
3. No merge conflicts
4. Branch is up-to-date
5. Branch protection policies met

**Fix**:
- Update branch with target
- Get required approvals
- Resolve conflicts

---

## PR Validation Checklist

Use this checklist before creating a PR:

### Code Quality
- [ ] Code compiles without errors
- [ ] All tests pass locally
- [ ] Code coverage >= 80%
- [ ] Linting passes (no errors/warnings)
- [ ] Code formatted correctly
- [ ] No console.log or debug code

### Tests
- [ ] New features have tests
- [ ] Changed code has updated tests
- [ ] Tests are meaningful (not just coverage)
- [ ] Tests run in reasonable time

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Dependencies are up-to-date
- [ ] No known vulnerabilities introduced
- [ ] Sensitive data is handled properly

### Documentation
- [ ] README updated if needed
- [ ] API docs updated if needed
- [ ] Comments added for complex logic
- [ ] CHANGELOG updated if applicable

### Git
- [ ] Commits are atomic and well-described
- [ ] Branch is up-to-date with target
- [ ] No merge conflicts
- [ ] PR description is clear and complete

---

## Additional Resources

### Documentation
- [Azure DevOps Setup Guide](Azure-DevOps-Setup-Guide.md)
- [Quick Reference](Azure-DevOps-Quick-Reference.md)
- [CI/CD Diagram](CI-CD-Diagram.md)

### Azure DevOps Documentation
- [Build validation](https://docs.microsoft.com/en-us/azure/devops/repos/git/branch-policies)
- [PR status checks](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-request-status)
- [Branch policies](https://docs.microsoft.com/en-us/azure/devops/repos/git/branch-policies-overview)

---

**Remember**: PR validation is your safety net. It catches issues before they reach production. Take the time to understand and fix failures rather than trying to bypass them.

---

**Last Updated**: 2024  
**Maintained By**: DevOps Team
