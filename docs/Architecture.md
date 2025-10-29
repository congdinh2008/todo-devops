# System Architecture Document
# Todo Application - Enterprise Edition

**Version**: 1.0  
**Date**: 2024  
**Status**: Approved

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Clean Architecture Layers](#clean-architecture-layers)
4. [Technology Stack](#technology-stack)
5. [Component Design](#component-design)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)

---

## Executive Summary

The Todo Application is built using **Clean Architecture** principles to ensure maintainability, testability, and scalability. The system separates concerns into distinct layers, with dependencies flowing inward toward the domain layer.

### Key Architectural Principles
- **Independence of Frameworks**: Business logic is not tied to any framework
- **Testability**: Business rules can be tested without UI, database, or external dependencies
- **Independence of UI**: UI can change without affecting business logic
- **Independence of Database**: Can swap database implementations without affecting business rules
- **Independence of External Services**: Business logic doesn't depend on external services

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                    Single Page Application                   │
│          React 18 + TypeScript + Vite + TanStack Query       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS/REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend (Spring Boot)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Presentation Layer (API Controllers)              │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │  Application Layer (Use Cases, Services)           │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │  Domain Layer (Entities, Business Logic)           │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │  Infrastructure Layer (Persistence, Security)      │    │
│  └──────────────────┬─────────────────────────────────┘    │
└────────────────────┬┘──────────────────────────────────────┘
                     │
                     │ JDBC
                     │
┌────────────────────▼──────────────────────────────────────┐
│               Database (PostgreSQL 16)                     │
│                  Relational Database                       │
└────────────────────────────────────────────────────────────┘
```

---

## Clean Architecture Layers

### 1. Domain Layer (Core Business Logic)

**Location**: `com.congdinh.todo.domain`

**Responsibilities**:
- Define business entities
- Define business rules and logic
- Define repository interfaces (contracts)
- Domain exceptions

**Components**:
- **Entities**: Core business objects (Todo, User)
- **Value Objects**: Immutable objects (Email, Priority)
- **Domain Services**: Business logic that doesn't belong to entities
- **Repository Interfaces**: Data access contracts

**Dependencies**: None (most independent layer)

**Example**:
```java
// Domain Entity
public class Todo {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private LocalDate dueDate;
    private boolean completed;
    
    // Business logic
    public void markAsComplete() {
        this.completed = true;
        this.completedAt = LocalDateTime.now();
    }
}
```

---

### 2. Application Layer (Use Cases)

**Location**: `com.congdinh.todo.application`

**Responsibilities**:
- Implement use cases
- Coordinate between domain and infrastructure
- Define DTOs for data transfer
- Map between entities and DTOs

**Components**:
- **Use Cases**: Application-specific business rules
- **DTOs**: Data transfer objects for API
- **Mappers**: Entity-DTO conversion (MapStruct)
- **Service Interfaces**: Application service contracts

**Dependencies**: Domain Layer only

**Example**:
```java
// Use Case
public class CreateTodoUseCase {
    private final TodoRepository repository;
    
    public TodoDTO execute(CreateTodoRequest request) {
        Todo todo = new Todo(request.getTitle(), 
                             request.getDescription());
        Todo saved = repository.save(todo);
        return mapper.toDTO(saved);
    }
}
```

---

### 3. Infrastructure Layer (External Concerns)

**Location**: `com.congdinh.todo.infrastructure`

**Responsibilities**:
- Database implementation (JPA)
- Security configuration
- External service integrations
- Framework configurations

**Components**:
- **Persistence**: JPA repositories, entity mappings
- **Security**: JWT, authentication, authorization
- **Configuration**: Spring configuration classes

**Dependencies**: Domain Layer (implements interfaces)

**Example**:
```java
// Repository Implementation
@Repository
public class TodoRepositoryImpl implements TodoRepository {
    private final TodoJpaRepository jpaRepository;
    
    @Override
    public Todo save(Todo todo) {
        TodoEntity entity = mapper.toEntity(todo);
        TodoEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

---

### 4. Presentation Layer (API)

**Location**: `com.congdinh.todo.api`

**Responsibilities**:
- Handle HTTP requests/responses
- Input validation
- Error handling
- API documentation

**Components**:
- **Controllers**: REST API endpoints
- **Filters**: Request/response processing
- **Exception Handlers**: Global error handling

**Dependencies**: Application Layer

**Example**:
```java
@RestController
@RequestMapping("/api/todos")
public class TodoController {
    private final CreateTodoUseCase createTodoUseCase;
    
    @PostMapping
    public ResponseEntity<TodoDTO> create(
            @Valid @RequestBody CreateTodoRequest request) {
        TodoDTO todo = createTodoUseCase.execute(request);
        return ResponseEntity.status(201).body(todo);
    }
}
```

---

## Technology Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | Java | 21 LTS | Programming language |
| Framework | Spring Boot | 3.2.0 | Application framework |
| ORM | Hibernate | 6.4.x | Object-relational mapping |
| Database | PostgreSQL | 16 | Relational database |
| Security | Spring Security | 3.2.x | Authentication & authorization |
| JWT | JJWT | 0.12.3 | Token generation |
| Validation | Bean Validation | 3.0.x | Input validation |
| Testing | JUnit 5 | 5.10.x | Unit testing |
| Mocking | Mockito | 5.x | Test mocking |
| Coverage | JaCoCo | 0.8.11 | Code coverage |
| Mapping | MapStruct | 1.5.5 | Bean mapping |
| Documentation | SpringDoc | 2.3.0 | API documentation |
| Build Tool | Maven | 3.9+ | Build automation |

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Library | React | 18.2 | UI library |
| Language | TypeScript | 5.3 | Type-safe JavaScript |
| Build Tool | Vite | 5.0 | Fast build tool |
| Routing | React Router | 6.20 | Client-side routing |
| HTTP Client | Axios | 1.6 | API requests |
| State Management | TanStack Query | 5.14 | Server state |
| State Management | Zustand | 4.4 | Client state |
| Testing | Vitest | 1.0 | Unit testing |
| Testing | React Testing Library | 14.1 | Component testing |
| Linting | ESLint | 8.55 | Code linting |
| Formatting | Prettier | 3.1 | Code formatting |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Local development |
| Web Server | Nginx | Reverse proxy (production) |
| CI/CD | GitHub Actions | Continuous integration |

---

## Component Design

### Backend Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Controllers │  │   Filters    │  │    Advice    │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────┐
│              Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Use Cases   │  │     DTOs     │  │   Mappers    │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────┐
│                 Domain Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Entities   │  │Value Objects │  │ Repositories │ │
│  │              │  │              │  │ (Interfaces) │ │
│  └──────────────┘  └──────────────┘  └──────┬───────┘ │
└─────────────────────────────────────────────┼───────────┘
                                              │
┌─────────────────────────────────────────────▼───────────┐
│            Infrastructure Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Persistence  │  │   Security   │  │    Config    │ │
│  │(JPA Repos)   │  │              │  │              │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
└─────────┼───────────────────────────────────────────────┘
          │
          ▼
    PostgreSQL DB
```

### Frontend Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│                   (Root Component)                      │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
┌─────────▼───┐  ┌────▼──────┐  ┌──▼──────────┐
│ Todo Feature│  │Auth Feature│  │Shared Module│
├─────────────┤  ├────────────┤  ├─────────────┤
│ Components  │  │ Components │  │ Components  │
│ Hooks       │  │ Hooks      │  │ Hooks       │
│ Services    │  │ Services   │  │ Utils       │
│ Types       │  │ Types      │  │ Types       │
└─────┬───────┘  └────┬───────┘  └──┬──────────┘
      │               │              │
      └───────────────┼──────────────┘
                      │
              ┌───────▼────────┐
              │   API Client   │
              │    (Axios)     │
              └───────┬────────┘
                      │
                      ▼
                 Backend API
```

---

## Data Flow

### Create Todo Flow

```
1. User Input (Frontend)
   │
   ▼
2. React Component
   │
   ▼
3. React Query Mutation
   │
   ▼
4. Axios HTTP POST /api/todos
   │
   ▼
5. Spring Controller (TodoController.create)
   │ - Validate input
   │ - Extract JWT claims
   ▼
6. Use Case (CreateTodoUseCase)
   │ - Business logic
   │ - Create domain entity
   ▼
7. Repository Interface (TodoRepository)
   │
   ▼
8. JPA Implementation
   │ - Convert to JPA entity
   │ - Save to database
   ▼
9. PostgreSQL Database
   │
   ▼
10. Response flows back through layers
    │ - Entity → DTO conversion
    │ - HTTP 201 Created
    ▼
11. Frontend updates UI
    - Cache invalidation
    - UI refresh
```

---

## Security Architecture

### Authentication Flow (JWT)

```
1. User Login
   │ Email + Password
   ▼
2. AuthController.login()
   │
   ▼
3. AuthenticationManager
   │ - Validate credentials
   │ - Load user details
   ▼
4. JwtTokenProvider
   │ - Generate JWT token
   │ - Set expiration (24h)
   │
   ▼
5. Return Token to Client
   │
   ▼
6. Client stores token
   │ (localStorage/sessionStorage)
   │
   ▼
7. Subsequent requests include token
   │ Authorization: Bearer <token>
   │
   ▼
8. JwtAuthenticationFilter
   │ - Extract token
   │ - Validate signature
   │ - Check expiration
   │
   ▼
9. SecurityContext populated
   │
   ▼
10. Access granted/denied
```

### Security Measures

1. **Password Security**
   - BCrypt hashing (strength 10)
   - Minimum 8 characters
   - Complexity requirements

2. **JWT Token Security**
   - HS256 algorithm
   - 24-hour expiration
   - Secret key rotation support

3. **API Security**
   - HTTPS only in production
   - CORS configuration
   - Rate limiting (100 req/min)

4. **Input Validation**
   - Bean Validation annotations
   - SQL injection prevention (prepared statements)
   - XSS prevention (output encoding)

5. **Authorization**
   - Role-based access control
   - Method-level security
   - Owner-based permissions

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────┐
│        Developer Machine                │
│                                         │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Frontend  │      │   Backend    │  │
│  │   :3000    │◄────►│    :8080     │  │
│  └────────────┘      └──────┬───────┘  │
│                             │          │
│                      ┌──────▼───────┐  │
│                      │  PostgreSQL  │  │
│                      │    :5432     │  │
│                      └──────────────┘  │
└─────────────────────────────────────────┘
```

### Production Environment

```
┌───────────────────────────────────────────────────┐
│               Load Balancer                       │
└───────────────────┬───────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐     ┌────▼───┐     ┌────▼───┐
│ Nginx  │     │ Nginx  │     │ Nginx  │
│ :80/443│     │ :80/443│     │ :80/443│
└───┬────┘     └────┬───┘     └────┬───┘
    │               │               │
    │  ┌────────────┼────────────┐  │
    │  │            │            │  │
┌───▼──▼──┐   ┌─────▼────┐   ┌──▼───▼──┐
│Frontend │   │ Backend  │   │Frontend │
│Container│   │Container │   │Container│
│  :3000  │   │  :8080   │   │  :3000  │
└─────────┘   └────┬─────┘   └─────────┘
                   │
          ┌────────┼────────┐
          │                 │
     ┌────▼────┐      ┌─────▼────┐
     │PostgreSQL│      │PostgreSQL│
     │ Primary  │◄────►│ Replica  │
     └──────────┘      └──────────┘
```

### Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: tododb
      POSTGRES_USER: todouser
      POSTGRES_PASSWORD: todopass

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/tododb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## Performance Considerations

### Backend Optimization
- **Connection Pooling**: HikariCP (20 connections)
- **Caching**: Spring Cache (Redis for production)
- **Query Optimization**: Proper indexing, N+1 prevention
- **Pagination**: Limit result sets (max 100 items)

### Frontend Optimization
- **Code Splitting**: Route-based lazy loading
- **Caching**: React Query (5-minute stale time)
- **Bundling**: Vite for optimized builds
- **Lazy Loading**: Component lazy loading

### Database Optimization
- **Indexes**: On foreign keys and frequently queried columns
- **Connection Pooling**: Reuse connections
- **Query Planning**: EXPLAIN ANALYZE for slow queries

---

## Scalability Strategy

### Horizontal Scaling
- **Stateless Backend**: Multiple instances behind load balancer
- **Database Replication**: Primary-replica setup
- **Frontend**: CDN for static assets

### Vertical Scaling
- Increase server resources as needed
- Database performance tuning

### Caching Strategy
- **Application Level**: Spring Cache
- **Database Level**: Query result caching
- **Frontend Level**: React Query cache

---

## Monitoring and Observability

### Logging
- **Application Logs**: SLF4J + Logback
- **Access Logs**: Nginx access logs
- **Error Logs**: Centralized error tracking

### Metrics
- **Application Metrics**: Spring Actuator
- **Database Metrics**: PostgreSQL stats
- **Frontend Metrics**: Browser performance API

### Health Checks
- **Backend**: `/actuator/health`
- **Database**: Connection check
- **Dependencies**: External service checks

---

**Document Version Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial architecture document |
