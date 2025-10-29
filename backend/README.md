# Todo Backend

Enterprise Todo Application Backend built with Clean Architecture principles.

## Tech Stack

- **Java 21** (LTS)
- **Spring Boot 3.2.0** (Web, Data JPA, Security, Validation)
- **Hibernate ORM** - Object-relational mapping
- **PostgreSQL 16** - Primary database
- **JUnit 5** - Unit testing framework
- **Mockito** - Mocking framework for tests
- **JaCoCo** - Code coverage tool
- **Lombok** - Reduces boilerplate code
- **MapStruct** - Type-safe bean mapping
- **SpringDoc OpenAPI** - API documentation (Swagger)
- **JWT** - JSON Web Token for authentication

## Architecture

This project follows **Clean Architecture** principles with four distinct layers:

### 1. Domain Layer (`com.congdinh.todo.domain`)
Core business logic and entities. This layer is independent of frameworks and external concerns.

- **entities/** - Business entities (Todo, User, etc.)
- **valueobjects/** - Value objects and domain primitives
- **exceptions/** - Domain-specific exceptions
- **repositories/** - Repository interfaces (contracts)

### 2. Application Layer (`com.congdinh.todo.application`)
Application-specific business rules and use cases.

- **usecases/** - Use case implementations
- **dto/** - Data Transfer Objects for API communication
- **mappers/** - MapStruct mappers for entity-DTO conversion
- **services/** - Application services orchestrating use cases

### 3. Infrastructure Layer (`com.congdinh.todo.infrastructure`)
External concerns like database, security, and third-party services.

- **persistence/** - JPA repositories, database implementations
- **config/** - Spring configuration classes
- **security/** - Security configurations, JWT handling

### 4. API/Presentation Layer (`com.congdinh.todo.api`)
REST API controllers and request/response handling.

- **controllers/** - REST controllers
- **filters/** - Request/response filters
- **advice/** - Global exception handlers

## Prerequisites

- **Java 21** or higher
- **Maven 3.9+**
- **PostgreSQL 16**
- **Docker** (optional, for containerized database)

## Getting Started

### 1. Setup Database

Create a PostgreSQL database:

```bash
createdb tododb
createuser todouser --password todopass
```

Or use Docker:

```bash
docker run --name todo-postgres \
  -e POSTGRES_DB=tododb \
  -e POSTGRES_USER=todouser \
  -e POSTGRES_PASSWORD=todopass \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Build the Project

```bash
mvn clean install
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

### 4. Access API Documentation

Open Swagger UI: `http://localhost:8080/api/swagger-ui.html`

## Testing

### Run all tests
```bash
mvn test
```

### Run tests with coverage
```bash
mvn clean test jacoco:report
```

Coverage report will be available at: `target/site/jacoco/index.html`

## Building for Production

```bash
mvn clean package -DskipTests
```

The executable JAR will be created at: `target/todo-backend-1.0.0-SNAPSHOT.jar`

## Configuration

Main configuration file: `src/main/resources/application.properties`

Key configurations:
- Server port: `server.port=8080`
- Database URL: `spring.datasource.url`
- JWT secret: `jwt.secret` (change in production!)
- JWT expiration: `jwt.expiration`

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/congdinh/todo/
│   │   │   ├── domain/          # Domain layer
│   │   │   ├── application/     # Application layer
│   │   │   ├── infrastructure/  # Infrastructure layer
│   │   │   └── api/             # Presentation layer
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/congdinh/todo/
├── pom.xml
└── README.md
```

## Development Guidelines

1. **Follow Clean Architecture** - Keep layers separated and dependencies pointing inward
2. **Write tests** - Aim for high test coverage (>80%)
3. **Use Lombok** - Reduce boilerplate with annotations
4. **Document APIs** - Use OpenAPI/Swagger annotations
5. **Handle exceptions** - Use proper exception handling and error responses
6. **Validate inputs** - Use Bean Validation annotations

## Contributing

See the main project [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## License

See [LICENSE](../LICENSE) file in the root directory.
