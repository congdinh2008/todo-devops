# Production Deployment Guide
# Todo Application

**Version**: 1.0  
**Last Updated**: 2024

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

This guide covers deploying the Todo Application to production environments using Docker, Kubernetes, and cloud platforms.

### Deployment Options

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| Docker Compose | Simple, fast setup | Limited scalability | Small deployments |
| Kubernetes | Highly scalable, robust | Complex setup | Enterprise production |
| Cloud (AWS/Azure/GCP) | Managed services | Vendor lock-in | Cloud-native apps |

---

## Prerequisites

### Required Tools
- Docker 20+
- Docker Compose 2+
- kubectl (for Kubernetes)
- Cloud CLI (AWS CLI, Azure CLI, or gcloud)

### Required Accounts
- Docker Hub or private registry
- Cloud provider account (optional)
- Domain name and SSL certificate

### Environment Preparation
- Production database (PostgreSQL 16)
- SSL/TLS certificates
- Secrets management system
- Monitoring tools

---

## Docker Deployment

### 1. Build Docker Images

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy JAR file
COPY target/todo-backend-*.jar app.jar

# Expose port
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build backend image:
```bash
cd backend
mvn clean package -DskipTests
docker build -t todo-backend:1.0.0 .
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

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
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://backend:8080/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

Build frontend image:
```bash
cd frontend
npm run build
docker build -t todo-frontend:1.0.0 .
```

---

### 2. Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: todo-postgres
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - todo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: todo-backend:1.0.0
    container_name: todo-backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    networks:
      - todo-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/api/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: todo-frontend:1.0.0
    container_name: todo-frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - todo-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres-data:
    driver: local

networks:
  todo-network:
    driver: bridge
```

Create `.env.prod`:

```env
DB_NAME=tododb_prod
DB_USER=todouser_prod
DB_PASSWORD=<strong-password>
JWT_SECRET=<strong-jwt-secret-min-256-bits>
```

Deploy:

```bash
# Load environment variables
export $(cat .env.prod | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

#### Namespace

Create `k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: todo-prod
```

#### ConfigMap

Create `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
  namespace: todo-prod
data:
  SPRING_PROFILES_ACTIVE: "prod"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "tododb"
```

#### Secrets

Create `k8s/secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-prod
type: Opaque
stringData:
  DB_USER: "todouser"
  DB_PASSWORD: "<base64-encoded-password>"
  JWT_SECRET: "<base64-encoded-jwt-secret>"
```

#### PostgreSQL Deployment

Create `k8s/postgres-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: todo-prod
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
                configMapKeyRef:
                  name: todo-config
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
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: todo-prod
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: todo-prod
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

#### Backend Deployment

Create `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: todo-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
        - name: backend
          image: todo-backend:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_DATASOURCE_URL
              value: "jdbc:postgresql://$(DB_HOST):$(DB_PORT)/$(DB_NAME)"
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: todo-config
                  key: DB_HOST
            - name: DB_PORT
              valueFrom:
                configMapKeyRef:
                  name: todo-config
                  key: DB_PORT
            - name: DB_NAME
              valueFrom:
                configMapKeyRef:
                  name: todo-config
                  key: DB_NAME
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
          livenessProbe:
            httpGet:
              path: /api/actuator/health/liveness
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: todo-prod
spec:
  selector:
    app: todo-backend
  ports:
    - port: 8080
      targetPort: 8080
  type: ClusterIP
```

#### Frontend Deployment

Create `k8s/frontend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  namespace: todo-prod
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
        - name: frontend
          image: todo-frontend:1.0.0
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
  name: frontend-service
  namespace: todo-prod
spec:
  selector:
    app: todo-frontend
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

#### Ingress

Create `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  namespace: todo-prod
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - todo-app.com
      secretName: todo-tls
  rules:
    - host: todo-app.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets (encode values first)
echo -n 'your-password' | base64
kubectl apply -f k8s/secret.yaml

# Create config
kubectl apply -f k8s/configmap.yaml

# Deploy database
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for database
kubectl wait --for=condition=ready pod -l app=postgres -n todo-prod --timeout=300s

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Create ingress
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get all -n todo-prod
```

---

## Cloud Deployment

### AWS Deployment (ECS/EKS)

#### Using AWS ECS

```bash
# Create ECR repositories
aws ecr create-repository --repository-name todo-backend
aws ecr create-repository --repository-name todo-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag todo-backend:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/todo-backend:1.0.0
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/todo-backend:1.0.0

# Create ECS cluster
aws ecs create-cluster --cluster-name todo-prod-cluster

# Create task definition and service (use AWS Console or CloudFormation)
```

### Azure Deployment (AKS)

```bash
# Create resource group
az group create --name todo-prod-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group todo-prod-rg \
  --name todo-aks-cluster \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group todo-prod-rg --name todo-aks-cluster

# Deploy using kubectl
kubectl apply -f k8s/
```

### GCP Deployment (GKE)

```bash
# Create GKE cluster
gcloud container clusters create todo-prod-cluster \
  --num-nodes=3 \
  --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials todo-prod-cluster --zone=us-central1-a

# Deploy using kubectl
kubectl apply -f k8s/
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl https://todo-app.com/api/actuator/health

# Check Kubernetes pods
kubectl get pods -n todo-prod

# View logs
kubectl logs -f deployment/todo-backend -n todo-prod
```

### Backup Database

```bash
# Kubernetes backup
kubectl exec -n todo-prod postgres-0 -- pg_dump -U todouser tododb > backup.sql

# Docker backup
docker exec todo-postgres pg_dump -U todouser tododb > backup.sql
```

### Scaling

```bash
# Scale backend
kubectl scale deployment todo-backend --replicas=5 -n todo-prod

# Auto-scaling
kubectl autoscale deployment todo-backend --cpu-percent=50 --min=3 --max=10 -n todo-prod
```

### Updates

```bash
# Rolling update
kubectl set image deployment/todo-backend backend=todo-backend:1.1.0 -n todo-prod

# Rollback
kubectl rollout undo deployment/todo-backend -n todo-prod
```

---

## Security Checklist

- [ ] Use HTTPS/TLS encryption
- [ ] Store secrets in secure vault (AWS Secrets Manager, Azure Key Vault)
- [ ] Enable firewall rules
- [ ] Use strong passwords and JWT secrets
- [ ] Enable database encryption at rest
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Implement rate limiting
- [ ] Use least privilege access
- [ ] Keep images updated

---

**Document Version**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial deployment guide |
