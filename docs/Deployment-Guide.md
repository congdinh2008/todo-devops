# Production Deployment Guide

**Project:** Todo Application  
**Version:** 1.0.0  
**Date:** 2024

---

## 1. Overview

This guide covers deploying the Todo Application to production environments, including cloud platforms (AWS, Azure, GCP), containerized deployments, and traditional server deployments.

---

## 2. Pre-Deployment Checklist

### 2.1 Code Quality

- [ ] All tests passing (backend and frontend)
- [ ] Code coverage meets minimum threshold (80%)
- [ ] Security vulnerabilities addressed
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Database migrations tested

### 2.2 Configuration

- [ ] Production environment variables configured
- [ ] Database credentials secured (use secrets management)
- [ ] JWT secret generated (strong, random)
- [ ] CORS origins configured for production domain
- [ ] SSL/TLS certificates obtained
- [ ] Domain names configured
- [ ] Email service configured (if applicable)

### 2.3 Infrastructure

- [ ] Production database provisioned
- [ ] Database backups configured
- [ ] Monitoring and logging setup
- [ ] CDN configured for static assets
- [ ] Load balancer configured
- [ ] Auto-scaling policies defined
- [ ] Firewall rules configured

---

## 3. Docker Deployment

### 3.1 Build Docker Images

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/todo-backend-*.jar app.jar

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 3.2 Build Images

```bash
# Build backend image
docker build -t todo-backend:latest ./backend

# Build frontend image
docker build -t todo-frontend:latest ./frontend

# Tag for registry
docker tag todo-backend:latest yourdockerhub/todo-backend:1.0.0
docker tag todo-frontend:latest yourdockerhub/todo-frontend:1.0.0

# Push to registry
docker push yourdockerhub/todo-backend:1.0.0
docker push yourdockerhub/todo-frontend:1.0.0
```

### 3.3 Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: todo-postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - todo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    image: yourdockerhub/todo-backend:1.0.0
    container_name: todo-backend-prod
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - todo-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  frontend:
    image: yourdockerhub/todo-frontend:1.0.0
    container_name: todo-frontend-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - todo-network
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  postgres-data:
    driver: local

networks:
  todo-network:
    driver: bridge
```

### 3.4 Deploy with Docker Compose

```bash
# Create .env file
cat > .env << EOF
DB_NAME=tododb
DB_USER=todouser
DB_PASSWORD=your-secure-password
JWT_SECRET=your-secure-jwt-secret-minimum-256-bits
JWT_EXPIRATION=86400000
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 4. Kubernetes Deployment

### 4.1 Namespace

Create `k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: todo-app
```

### 4.2 Secrets

Create `k8s/secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
stringData:
  DB_NAME: tododb
  DB_USER: todouser
  DB_PASSWORD: your-secure-password
  JWT_SECRET: your-secure-jwt-secret
```

### 4.3 Database Deployment

Create `k8s/postgres-deployment.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: todo-app
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: todo-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: DB_NAME
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: DB_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: todo-app
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### 4.4 Backend Deployment

Create `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: todo-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: yourdockerhub/todo-backend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: SPRING_DATASOURCE_URL
          value: "jdbc:postgresql://postgres:5432/$(DB_NAME)"
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: DB_USER
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: DB_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: todo-app
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### 4.5 Frontend Deployment

Create `k8s/frontend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: todo-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: yourdockerhub/todo-frontend:1.0.0
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: todo-app
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 4.6 Ingress

Create `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  namespace: todo-app
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - todo-app.com
    - www.todo-app.com
    secretName: todo-tls
  rules:
  - host: todo-app.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### 4.7 Deploy to Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get all -n todo-app

# View logs
kubectl logs -f deployment/backend -n todo-app
kubectl logs -f deployment/frontend -n todo-app

# Scale deployment
kubectl scale deployment backend --replicas=5 -n todo-app
```

---

## 5. Cloud Platform Deployments

### 5.1 AWS Deployment

#### Using AWS ECS

```bash
# Install AWS CLI
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name todo-backend
aws ecr create-repository --repository-name todo-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag todo-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest

# Create ECS cluster, task definitions, and services using AWS Console or CLI
```

#### Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init -p docker todo-app

# Create environment
eb create production

# Deploy
eb deploy

# Open application
eb open
```

### 5.2 Azure Deployment

#### Using Azure App Service

```bash
# Install Azure CLI
az login

# Create resource group
az group create --name todo-app-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name todo-app-plan \
  --resource-group todo-app-rg \
  --sku B1 \
  --is-linux

# Create web apps
az webapp create \
  --resource-group todo-app-rg \
  --plan todo-app-plan \
  --name todo-backend-app \
  --deployment-container-image yourdockerhub/todo-backend:1.0.0

# Configure environment variables
az webapp config appsettings set \
  --resource-group todo-app-rg \
  --name todo-backend-app \
  --settings SPRING_PROFILES_ACTIVE=production
```

### 5.3 GCP Deployment

#### Using Google Cloud Run

```bash
# Install gcloud CLI
gcloud init

# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/todo-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT-ID/todo-frontend ./frontend

# Deploy to Cloud Run
gcloud run deploy backend \
  --image gcr.io/PROJECT-ID/todo-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy frontend \
  --image gcr.io/PROJECT-ID/todo-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 6. Database Migration

### 6.1 Backup Production Database

```bash
# Docker backup
docker exec todo-postgres-prod pg_dump -U todouser tododb > backup.sql

# Kubernetes backup
kubectl exec -n todo-app postgres-0 -- pg_dump -U todouser tododb > backup.sql

# Compress backup
gzip backup.sql
```

### 6.2 Restore Database

```bash
# Docker restore
docker exec -i todo-postgres-prod psql -U todouser tododb < backup.sql

# Kubernetes restore
kubectl exec -i -n todo-app postgres-0 -- psql -U todouser tododb < backup.sql
```

---

## 7. Monitoring and Logging

### 7.1 Application Monitoring

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

### 7.2 Log Aggregation

```bash
# Install ELK Stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging
helm install kibana elastic/kibana -n logging
helm install filebeat elastic/filebeat -n logging
```

---

## 8. SSL/TLS Configuration

### 8.1 Let's Encrypt with Cert-Manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

---

## 9. Performance Optimization

### 9.1 Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_todos_user_status ON todos(user_id, status);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

-- Analyze tables
ANALYZE todos;
ANALYZE users;

-- Vacuum database
VACUUM ANALYZE;
```

### 9.2 Application Optimization

```yaml
# Backend JVM options
JAVA_OPTS: >-
  -Xms512m
  -Xmx1024m
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
```

---

## 10. Rollback Procedures

### 10.1 Docker Rollback

```bash
# Redeploy previous version
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### 10.2 Kubernetes Rollback

```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n todo-app
kubectl rollout undo deployment/frontend -n todo-app

# Check rollout status
kubectl rollout status deployment/backend -n todo-app
```

---

## 11. Health Checks

### 11.1 Application Health

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Expected response
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

---

## 12. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial deployment guide |
