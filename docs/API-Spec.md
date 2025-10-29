# RESTful API Specification
# Todo Application API

**Version**: 1.0  
**Base URL**: `http://localhost:8080/api`  
**Protocol**: HTTP/HTTPS  
**Format**: JSON

---

## Table of Contents
1. [Authentication](#authentication)
2. [Users API](#users-api)
3. [Todos API](#todos-api)
4. [Error Handling](#error-handling)
5. [Status Codes](#status-codes)

---

## Authentication

### Overview
The API uses JWT (JSON Web Token) for authentication. Clients must include the token in the Authorization header for protected endpoints.

### Authentication Flow
1. User registers or logs in
2. Server returns JWT access token
3. Client includes token in subsequent requests
4. Token expires after 24 hours

### Header Format
```
Authorization: Bearer <jwt_token>
```

---

## Users API

### 1. Register User

**Endpoint**: `POST /auth/register`  
**Authentication**: Not required  
**Description**: Register a new user account

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

#### Validation Rules
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, must contain uppercase, lowercase, and number
- `fullName`: Required, 2-100 characters

#### Success Response (201 Created)
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "ROLE_USER",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Error Response (400 Bad Request)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email already exists",
  "path": "/api/auth/register"
}
```

---

### 2. Login User

**Endpoint**: `POST /auth/login`  
**Authentication**: Not required  
**Description**: Authenticate user and receive JWT token

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

#### Success Response (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "ROLE_USER"
  }
}
```

#### Error Response (401 Unauthorized)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/auth/login"
}
```

---

### 3. Get Current User

**Endpoint**: `GET /users/me`  
**Authentication**: Required  
**Description**: Get current authenticated user's profile

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200 OK)
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "ROLE_USER",
  "createdAt": "2024-01-15T10:30:00Z",
  "isActive": true
}
```

---

### 4. Update User Profile

**Endpoint**: `PUT /users/me`  
**Authentication**: Required  
**Description**: Update current user's profile

#### Request Body
```json
{
  "fullName": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

#### Success Response (200 OK)
```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "fullName": "John Doe Updated",
  "role": "ROLE_USER",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

## Todos API

### 1. Create Todo

**Endpoint**: `POST /todos`  
**Authentication**: Required  
**Description**: Create a new todo item

#### Request Body
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "priority": "HIGH",
  "dueDate": "2024-12-31"
}
```

#### Validation Rules
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `priority`: Optional, must be LOW, MEDIUM, or HIGH (default: MEDIUM)
- `dueDate`: Optional, must be future date (format: YYYY-MM-DD)

#### Success Response (201 Created)
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "priority": "HIGH",
  "dueDate": "2024-12-31",
  "completed": false,
  "completedAt": null,
  "userId": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. Get All Todos

**Endpoint**: `GET /todos`  
**Authentication**: Required  
**Description**: Get paginated list of user's todos with optional filters

#### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `completed` (optional): Filter by completion status (true/false)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH)
- `sortBy` (optional): Sort field (createdAt, dueDate, priority)
- `sortDirection` (optional): Sort direction (ASC, DESC)

#### Example Request
```
GET /todos?page=0&size=20&completed=false&priority=HIGH&sortBy=dueDate&sortDirection=ASC
```

#### Success Response (200 OK)
```json
{
  "content": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for the API",
      "priority": "HIGH",
      "dueDate": "2024-12-31",
      "completed": false,
      "completedAt": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalPages": 1,
  "totalElements": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

---

### 3. Get Todo by ID

**Endpoint**: `GET /todos/{id}`  
**Authentication**: Required  
**Description**: Get a specific todo by ID

#### Path Parameters
- `id`: Todo ID (integer)

#### Success Response (200 OK)
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "priority": "HIGH",
  "dueDate": "2024-12-31",
  "completed": false,
  "completedAt": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Error Response (404 Not Found)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Todo not found with id: 1",
  "path": "/api/todos/1"
}
```

---

### 4. Update Todo

**Endpoint**: `PUT /todos/{id}`  
**Authentication**: Required  
**Description**: Update an existing todo

#### Path Parameters
- `id`: Todo ID (integer)

#### Request Body
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "dueDate": "2024-12-31"
}
```

#### Success Response (200 OK)
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "dueDate": "2024-12-31",
  "completed": false,
  "completedAt": null,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### Error Response (403 Forbidden)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "You don't have permission to update this todo",
  "path": "/api/todos/1"
}
```

---

### 5. Delete Todo

**Endpoint**: `DELETE /todos/{id}`  
**Authentication**: Required  
**Description**: Delete a todo

#### Path Parameters
- `id`: Todo ID (integer)

#### Success Response (204 No Content)
```
(Empty response body)
```

#### Error Response (404 Not Found)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Todo not found with id: 1",
  "path": "/api/todos/1"
}
```

---

### 6. Toggle Todo Completion

**Endpoint**: `PATCH /todos/{id}/toggle`  
**Authentication**: Required  
**Description**: Mark todo as complete/incomplete

#### Path Parameters
- `id`: Todo ID (integer)

#### Success Response (200 OK)
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "completed": true,
  "completedAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

### 7. Search Todos

**Endpoint**: `GET /todos/search`  
**Authentication**: Required  
**Description**: Search todos by keyword

#### Query Parameters
- `q`: Search query string (required)
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)

#### Example Request
```
GET /todos/search?q=documentation&page=0&size=20
```

#### Success Response (200 OK)
```json
{
  "content": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for the API",
      "priority": "HIGH",
      "dueDate": "2024-12-31",
      "completed": false
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "priority",
      "message": "Priority must be LOW, MEDIUM, or HIGH"
    }
  ],
  "path": "/api/todos"
}
```

### Error Types

#### Validation Error (400)
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

#### Authentication Error (401)
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired or invalid"
}
```

#### Authorization Error (403)
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

#### Not Found Error (404)
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Todo not found with id: 1"
}
```

#### Server Error (500)
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

**Limits**: 100 requests per minute per user  
**Header Response**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

**Rate Limit Exceeded (429)**:
```json
{
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds"
}
```

---

## CORS Configuration

**Allowed Origins**: Configurable (default: http://localhost:3000)  
**Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS  
**Allowed Headers**: Authorization, Content-Type  
**Max Age**: 3600 seconds

---

## API Versioning

Current version: **v1**  
Future versions will use URL versioning:
- v1: `/api/v1/todos`
- v2: `/api/v2/todos`

---

## OpenAPI/Swagger Documentation

**Swagger UI**: `http://localhost:8080/api/swagger-ui.html`  
**OpenAPI JSON**: `http://localhost:8080/api/api-docs`

---

## Testing the API

### Using cURL

#### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "fullName": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

#### Create Todo
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Todo",
    "description": "This is a test",
    "priority": "HIGH"
  }'
```

#### Get Todos
```bash
curl -X GET "http://localhost:8080/api/todos?page=0&size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Document Version**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial API specification |
