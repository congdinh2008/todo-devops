# System Architecture Document

**Project:** Todo Application  
**Version:** 1.0.0  
**Date:** 2024  
**Author:** Cong Dinh

---

## 1. Introduction

### 1.1 Purpose
This document describes the system architecture of the Todo Application, including the technology stack, architectural patterns, component design, and deployment architecture.

### 1.2 Scope
This architecture applies to both backend and frontend components of the Todo Application, covering development, testing, staging, and production environments.

### 1.3 Audience
- Development Team
- DevOps Engineers
- System Architects
- Technical Stakeholders

---

## 2. Architectural Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     React SPA (TypeScript + Vite)                   │   │
│  │  - Feature-based structure                          │   │
│  │  - TanStack Query for state management              │   │
│  │  - Axios for HTTP requests                          │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Spring Security + JWT Authentication               │   │
│  │  - Request validation                                │   │
│  │  - CORS configuration                                │   │
│  │  - Rate limiting                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer (Backend)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Clean Architecture Layers                  │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  API Layer (Controllers, Filters, Advice)    │   │  │
│  │  └──────────────────┬───────────────────────────┘   │  │
│  │                     │                                │  │
│  │  ┌──────────────────▼───────────────────────────┐   │  │
│  │  │ Application Layer (Use Cases, DTOs, Mappers) │   │  │
│  │  └──────────────────┬───────────────────────────┘   │  │
│  │                     │                                │  │
│  │  ┌──────────────────▼───────────────────────────┐   │  │
│  │  │ Domain Layer (Entities, Value Objects)       │   │  │
│  │  └──────────────────┬───────────────────────────┘   │  │
│  │                     │                                │  │
│  │  ┌──────────────────▼───────────────────────────┐   │  │
│  │  │ Infrastructure (Persistence, Security)       │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          PostgreSQL 16 Database                      │   │
│  │  - User and Todo tables                              │   │
│  │  - Indexes for performance                           │   │
│  │  - Backup and recovery                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Clean Architecture

### 3.1 Principles

The application follows **Clean Architecture** principles by Robert C. Martin:

1. **Independent of Frameworks**: Business logic doesn't depend on frameworks
2. **Testable**: Business logic can be tested without external dependencies
3. **Independent of UI**: UI can change without affecting business logic
4. **Independent of Database**: Can swap databases without changing business logic
5. **Independent of External Agency**: Business logic doesn't know about external services

### 3.2 Dependency Rule

Dependencies point inward:
```
API → Application → Domain ← Infrastructure
```

The Domain layer has no dependencies on other layers.

### 3.3 Layer Responsibilities

#### 3.3.1 Domain Layer (Core)
**Purpose:** Contains enterprise business rules

**Components:**
- **Entities**: Core business objects (User, Todo)
- **Value Objects**: Immutable objects (Email, TodoStatus)
- **Repository Interfaces**: Contracts for data access
- **Domain Services**: Business logic that doesn't belong to entities
- **Domain Exceptions**: Business rule violations

**Dependencies:** None (pure Java)

**Example:**
```java
package com.congdinh.todo.domain.entities;

public class Todo {
    private UUID id;
    private String title;
    private String description;
    private TodoStatus status;
    private LocalDate dueDate;
    
    // Business logic methods
    public void markAsComplete() {
        this.status = TodoStatus.COMPLETED;
    }
    
    public boolean isOverdue() {
        return dueDate != null && 
               dueDate.isBefore(LocalDate.now()) && 
               !status.isCompleted();
    }
}
```

#### 3.3.2 Application Layer
**Purpose:** Contains application-specific business rules

**Components:**
- **Use Cases**: Application business logic (CreateTodo, UpdateTodo)
- **DTOs**: Data transfer objects for API communication
- **Mappers**: Convert between entities and DTOs
- **Application Services**: Coordinate use cases
- **Ports**: Interfaces for external communication

**Dependencies:** Domain layer only

**Example:**
```java
package com.congdinh.todo.application.usecases;

public class CreateTodoUseCase {
    private final TodoRepository todoRepository;
    private final TodoMapper mapper;
    
    public TodoDTO execute(CreateTodoRequest request, UUID userId) {
        Todo todo = Todo.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .userId(userId)
            .build();
            
        Todo savedTodo = todoRepository.save(todo);
        return mapper.toDTO(savedTodo);
    }
}
```

#### 3.3.3 Infrastructure Layer
**Purpose:** Implements external concerns

**Components:**
- **JPA Entities**: Database mappings
- **Repository Implementations**: Data access implementations
- **Security**: Authentication and authorization
- **Configuration**: Spring configurations
- **External Services**: Third-party integrations

**Dependencies:** Domain, Application layers

**Example:**
```java
package com.congdinh.todo.infrastructure.persistence;

@Entity
@Table(name = "todos")
public class TodoEntity {
    @Id
    private UUID id;
    private String title;
    private String description;
    // JPA annotations and mappings
}

@Repository
public class TodoRepositoryImpl implements TodoRepository {
    private final JpaTodoRepository jpaRepository;
    private final TodoEntityMapper mapper;
    
    @Override
    public Todo save(Todo todo) {
        TodoEntity entity = mapper.toEntity(todo);
        TodoEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

#### 3.3.4 API Layer (Presentation)
**Purpose:** Handles HTTP requests and responses

**Components:**
- **Controllers**: REST endpoints
- **Request/Response DTOs**: API contracts
- **Filters**: Request preprocessing
- **Exception Handlers**: Global error handling
- **Validators**: Input validation

**Dependencies:** Application layer

**Example:**
```java
package com.congdinh.todo.api.controllers;

@RestController
@RequestMapping("/api/v1/todos")
public class TodoController {
    private final CreateTodoUseCase createTodoUseCase;
    
    @PostMapping
    public ResponseEntity<TodoDTO> createTodo(
            @Valid @RequestBody CreateTodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TodoDTO todo = createTodoUseCase.execute(request, 
            UUID.fromString(userDetails.getUsername()));
        return ResponseEntity.status(HttpStatus.CREATED).body(todo);
    }
}
```

---

## 4. Frontend Architecture

### 4.1 Feature-Based Structure

The frontend follows a feature-based architecture:

```
src/
├── features/              # Feature modules
│   ├── todos/             # Todo feature
│   │   ├── components/    # UI components
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoForm.tsx
│   │   ├── hooks/         # Custom hooks
│   │   │   ├── useTodos.ts
│   │   │   └── useCreateTodo.ts
│   │   ├── services/      # API services
│   │   │   └── todoService.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── todo.types.ts
│   │   └── tests/         # Tests
│   └── auth/              # Auth feature
│       └── ...
├── shared/                # Shared resources
│   ├── components/        # Common components
│   ├── hooks/             # Common hooks
│   ├── utils/             # Utilities
│   └── types/             # Common types
├── api/                   # API configuration
│   └── client.ts
└── config/                # App configuration
```

### 4.2 State Management

**TanStack Query (React Query)** for server state:
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

**React Context** for client state:
- Authentication state
- Theme preferences
- UI state

### 4.3 Component Pattern

```typescript
// Feature component example
export const TodoList: React.FC = () => {
  // Data fetching with React Query
  const { data, isLoading, error } = useTodos();
  
  // Local state
  const [filter, setFilter] = useState<TodoFilter>('all');
  
  // Derived state
  const filteredTodos = useMemo(() => 
    filterTodos(data?.todos, filter), [data, filter]
  );
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <TodoFilter value={filter} onChange={setFilter} />
      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};
```

---

## 5. Data Flow

### 5.1 Request Flow

```
User Action → React Component → API Service → HTTP Request
                                                    ↓
Backend Controller ← Response ← Use Case ← Repository
       ↓
   Validation → Use Case Execution → Database
       ↓                ↓
  Exception?      Success? → Response
```

### 5.2 Authentication Flow

```
1. User Login Request
   ↓
2. Validate Credentials (Spring Security)
   ↓
3. Generate JWT Token
   ↓
4. Return Token to Client
   ↓
5. Client Stores Token (localStorage/memory)
   ↓
6. Include Token in Authorization Header
   ↓
7. Backend Validates Token on Each Request
   ↓
8. Extract User Info from Token
   ↓
9. Authorize Request
```

---

## 6. Security Architecture

### 6.1 Authentication
- **JWT Tokens**: Stateless authentication
- **Access Token**: Short-lived (24 hours)
- **Refresh Token**: Long-lived (7 days)
- **BCrypt**: Password hashing (cost factor 10)

### 6.2 Authorization
- **Role-Based Access Control (RBAC)**
- Roles: USER, ADMIN
- Method-level security with `@PreAuthorize`
- Resource ownership validation

### 6.3 Security Layers

```
┌──────────────────────────────────────┐
│   HTTPS/TLS Transport Security       │
├──────────────────────────────────────┤
│   CORS Configuration                 │
├──────────────────────────────────────┤
│   JWT Token Validation               │
├──────────────────────────────────────┤
│   Role-Based Authorization           │
├──────────────────────────────────────┤
│   Input Validation                   │
├──────────────────────────────────────┤
│   SQL Injection Prevention           │
├──────────────────────────────────────┤
│   XSS Protection                     │
└──────────────────────────────────────┘
```

### 6.4 Security Headers

```java
http.headers()
    .contentSecurityPolicy("default-src 'self'")
    .frameOptions().deny()
    .xssProtection().block(true)
    .contentTypeOptions()
    .httpStrictTransportSecurity()
        .maxAgeInSeconds(31536000);
```

---

## 7. Database Architecture

### 7.1 Schema Design
- **Normalized** to 3NF
- **UUID** primary keys
- **Timestamps** for audit trail
- **Soft deletes** for data retention
- **Indexes** on frequently queried columns

### 7.2 Connection Pooling
- **HikariCP** for connection pooling
- Pool size: 10 connections (development), 20 (production)
- Connection timeout: 30 seconds
- Idle timeout: 10 minutes

### 7.3 Transaction Management
- **Declarative transactions** with `@Transactional`
- Read-only transactions for queries
- Proper isolation levels
- Rollback on exceptions

---

## 8. Technology Stack Justification

### 8.1 Backend Technologies

#### Java 21
**Why:**
- LTS release with long-term support
- Virtual threads for improved concurrency
- Pattern matching and sealed classes
- Strong ecosystem and tooling

#### Spring Boot 3.x
**Why:**
- Production-ready framework
- Extensive Spring ecosystem
- Built-in security, data access, testing
- Easy configuration and setup
- Large community support

#### PostgreSQL 16
**Why:**
- ACID compliance
- Advanced features (JSON, full-text search)
- Excellent performance
- Strong reliability and data integrity
- Open source with active community

### 8.2 Frontend Technologies

#### React 18
**Why:**
- Mature and stable framework
- Large ecosystem of libraries
- Concurrent rendering features
- Strong community and job market
- Excellent documentation

#### TypeScript
**Why:**
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring
- Growing industry adoption

#### Vite
**Why:**
- Fast HMR (Hot Module Replacement)
- Lightning-fast build times
- Native ES modules
- Optimized production builds
- Modern and actively maintained

---

## 9. Deployment Architecture

### 9.1 Container Architecture

```
┌─────────────────────────────────────────┐
│         Docker Host / Kubernetes        │
│                                         │
│  ┌────────────────┐  ┌───────────────┐ │
│  │   Frontend     │  │   Backend     │ │
│  │   Container    │  │   Container   │ │
│  │  (Nginx/Node)  │  │  (Java 21)    │ │
│  │   Port 3000    │  │  Port 8080    │ │
│  └────────────────┘  └───────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │      PostgreSQL Container          │ │
│  │          Port 5432                 │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │      Volume Mounts                 │ │
│  │  - Database data                   │ │
│  │  - Application logs                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 9.2 Production Environment

```
┌──────────────────────────────────────────────┐
│              Load Balancer                   │
│           (Nginx/CloudFlare)                 │
└───────────────┬──────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
   ┌────▼────┐    ┌────▼────┐
   │ App     │    │ App     │
   │ Server 1│    │ Server 2│
   └────┬────┘    └────┬────┘
        │               │
        └───────┬───────┘
                │
        ┌───────▼────────┐
        │   Database     │
        │   (Primary)    │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │   Database     │
        │  (Read Replica)│
        └────────────────┘
```

### 9.3 Cloud Deployment Options

#### AWS Architecture
- **EC2**: Application servers
- **RDS**: Managed PostgreSQL
- **S3**: Static asset hosting
- **CloudFront**: CDN for frontend
- **ELB**: Load balancing
- **Route 53**: DNS management

#### Azure Architecture
- **App Service**: Backend hosting
- **Azure Database for PostgreSQL**: Managed database
- **Static Web Apps**: Frontend hosting
- **Application Gateway**: Load balancing
- **Azure CDN**: Content delivery

---

## 10. Performance Considerations

### 10.1 Backend Optimization
- **Database indexing** on frequently queried columns
- **Connection pooling** with HikariCP
- **Lazy loading** for JPA relationships
- **Caching** with Spring Cache (Redis in future)
- **Pagination** for large result sets

### 10.2 Frontend Optimization
- **Code splitting** with dynamic imports
- **Lazy loading** of routes and components
- **React Query caching** reduces API calls
- **Memoization** of expensive computations
- **Virtual scrolling** for large lists

### 10.3 Network Optimization
- **GZIP compression** for responses
- **HTTP/2** for multiplexing
- **CDN** for static assets
- **API response caching** with ETags
- **Request batching** where applicable

---

## 11. Scalability Strategy

### 11.1 Horizontal Scaling
- **Stateless application** design
- **Load balancer** distribution
- **Session data in JWT** (not server)
- **Database connection pooling**

### 11.2 Database Scaling
- **Read replicas** for query scaling
- **Connection pooling** for efficiency
- **Query optimization** and indexing
- **Partitioning** strategy for growth

### 11.3 Caching Strategy
- **Browser caching** for static assets
- **API response caching** (future)
- **Database query caching** (future)
- **Redis** for distributed cache (future)

---

## 12. Monitoring and Observability

### 12.1 Logging
- **SLF4J + Logback** for backend logging
- **Log levels**: ERROR, WARN, INFO, DEBUG
- **Structured logging** with JSON format
- **Log aggregation** (future: ELK stack)

### 12.2 Metrics
- **Spring Boot Actuator** for metrics
- **Micrometer** for metrics collection
- **Prometheus** for monitoring (future)
- **Grafana** for visualization (future)

### 12.3 Health Checks
- **Liveness probe**: Application is running
- **Readiness probe**: Ready to accept traffic
- **Database health**: Connection status
- **Disk space**: Available storage

---

## 13. Disaster Recovery

### 13.1 Backup Strategy
- **Daily automated backups**
- **Point-in-time recovery** capability
- **30-day retention** period
- **Off-site backup** storage

### 13.2 Recovery Procedures
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Documented recovery** procedures
- **Quarterly recovery** testing

---

## 14. Future Enhancements

### 14.1 Planned Features
- **Real-time updates** with WebSocket
- **File attachments** for todos
- **Tags and categories**
- **Todo sharing** and collaboration
- **Mobile applications** (React Native)

### 14.2 Technical Improvements
- **Microservices** architecture
- **Event-driven** architecture
- **GraphQL** API option
- **Redis caching** layer
- **Elasticsearch** for full-text search

---

## 15. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial architecture document |
