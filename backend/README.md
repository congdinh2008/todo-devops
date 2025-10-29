# Todo Backend - Clean Architecture

Enterprise-grade backend for Todo Application built with Java 21 and Spring Boot 3.x following Clean Architecture principles.

## 🏗️ Architecture

This backend follows **Clean Architecture** with clear separation of concerns across 4 layers:

### 1. Domain Layer (`domain/`)
The core business logic layer, framework-independent.
- **Entities**: Core business objects (Todo, User, etc.)
- **Value Objects**: Immutable objects representing domain concepts
- **Repositories**: Repository interfaces (implementations in infrastructure layer)
- **Exceptions**: Domain-specific exceptions

### 2. Application Layer (`application/`)
Use cases and application business rules.
- **Use Cases**: Application-specific business rules
- **DTOs**: Data Transfer Objects for API communication
- **Mappers**: Object mapping between layers
- **Services**: Application services coordinating use cases

### 3. Infrastructure Layer (`infrastructure/`)
External concerns and framework-specific code.
- **Persistence**: JPA entities, repository implementations
- **Config**: Spring configuration classes
- **Security**: Authentication and authorization implementation

### 4. API Layer (`api/`)
Entry points for external interaction.
- **Controllers**: REST API endpoints
- **Filters**: Request/response filters
- **Advice**: Global exception handlers

## 🛠️ Tech Stack

- **Java 21** (LTS)
- **Spring Boot 3.2.0**
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Spring Validation
- **Hibernate ORM**
- **PostgreSQL 16**
- **Lombok** - Boilerplate reduction
- **MapStruct** - Object mapping
- **SpringDoc OpenAPI** - API documentation (Swagger)
- **JWT** - Authentication tokens
- **JUnit 5** - Unit testing
- **Mockito** - Mocking framework
- **JaCoCo** - Code coverage

## 📋 Prerequisites

- Java 21 or higher
- Maven 3.8+
- PostgreSQL 16
- Docker (optional, for containerized database)

## 🚀 Getting Started

### 1. Database Setup

**Option A: Using Docker**
```bash
docker run --name todo-postgres \
  -e POSTGRES_DB=tododb \
  -e POSTGRES_USER=todouser \
  -e POSTGRES_PASSWORD=todopass \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Local PostgreSQL**
```sql
CREATE DATABASE tododb;
CREATE USER todouser WITH PASSWORD 'todopass';
GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;
```

### 2. Configuration

Create `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tododb
    username: todouser
    password: todopass
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### 3. Build & Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Run tests
mvn test

# Generate code coverage report
mvn clean test jacoco:report
```

The application will start on `http://localhost:8080`

## 📚 API Documentation

Once the application is running, access Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

OpenAPI specification available at:
```
http://localhost:8080/v3/api-docs
```

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run with coverage
mvn clean test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

## 📦 Project Structure

```
backend/
├── src/main/java/com/congdinh/todo/
│   ├── domain/              # Domain Layer
│   │   ├── entities/        # Business entities
│   │   ├── valueobjects/    # Value objects
│   │   ├── exceptions/      # Domain exceptions
│   │   └── repositories/    # Repository interfaces
│   ├── application/         # Application Layer
│   │   ├── usecases/        # Use case implementations
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── mappers/         # DTO-Entity mappers
│   │   └── services/        # Application services
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── persistence/     # JPA entities & repositories
│   │   ├── config/          # Spring configuration
│   │   └── security/        # Security implementation
│   └── api/                 # Presentation Layer
│       ├── controllers/     # REST controllers
│       ├── filters/         # Request/response filters
│       └── advice/          # Exception handlers
├── src/test/                # Test sources
├── pom.xml                  # Maven configuration
└── README.md                # This file
```

## 🔒 Security

- JWT-based authentication
- Password encryption with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- Request validation

## 🚀 Deployment

See `/docs/Deployment-Guide.md` for production deployment instructions.

## 📖 Additional Documentation

- [Software Requirements Specification](/docs/SRS.md)
- [API Specification](/docs/API-Spec.md)
- [Architecture Document](/docs/Architecture.md)
- [Setup Guide](/docs/Setup-Guide.md)
- [Deployment Guide](/docs/Deployment-Guide.md)

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Write unit tests for new features
3. Maintain code coverage above 80%
4. Follow Java code conventions
5. Update documentation as needed

## 📝 License

See [LICENSE](/LICENSE) in the root directory.
