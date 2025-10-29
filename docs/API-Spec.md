# API Specification

**Project:** Todo Application  
**Version:** v1  
**Base URL:** `http://localhost:8080/api/v1`  
**Protocol:** REST (HTTP/HTTPS)

---

## 1. Overview

### 1.1 Introduction
This document specifies the RESTful API for the Todo Application. All endpoints follow REST principles and return JSON responses.

### 1.2 Base URL
- **Development:** `http://localhost:8080/api/v1`
- **Production:** `https://api.todo-app.com/api/v1`

### 1.3 Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### 1.4 Content Type
All requests and responses use JSON:
```
Content-Type: application/json
```

---

## 2. Authentication Endpoints

### 2.1 Register User

**Endpoint:** `POST /auth/register`  
**Authentication:** Not required  
**Description:** Create a new user account

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

#### Validation Rules
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number, special character
- `displayName`: Required, 2-100 characters

#### Success Response (201 Created)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Error Responses

**400 Bad Request** - Validation errors
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is already registered"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### 2.2 Login

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required  
**Description:** Authenticate user and receive JWT tokens

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER"
  }
}
```

#### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

### 2.3 Refresh Token

**Endpoint:** `POST /auth/refresh`  
**Authentication:** Required (Refresh Token)  
**Description:** Get new access token using refresh token

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

### 2.4 Logout

**Endpoint:** `POST /auth/logout`  
**Authentication:** Required  
**Description:** Invalidate refresh token

#### Success Response (204 No Content)
No response body

---

## 3. User Endpoints

### 3.1 Get Current User Profile

**Endpoint:** `GET /users/me`  
**Authentication:** Required  
**Description:** Get authenticated user's profile

#### Success Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 3.2 Update User Profile

**Endpoint:** `PUT /users/me`  
**Authentication:** Required  
**Description:** Update authenticated user's profile

#### Request Body
```json
{
  "displayName": "John Smith"
}
```

#### Success Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "displayName": "John Smith",
  "role": "USER",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

### 3.3 Change Password

**Endpoint:** `PUT /users/me/password`  
**Authentication:** Required  
**Description:** Change user's password

#### Request Body
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### Success Response (204 No Content)
No response body

#### Error Responses

**400 Bad Request** - Current password incorrect
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Current password is incorrect"
}
```

---

## 4. Todo Endpoints

### 4.1 Get All Todos

**Endpoint:** `GET /todos`  
**Authentication:** Required  
**Description:** Get paginated list of user's todos

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 0 | Page number (0-indexed) |
| size | integer | No | 20 | Items per page (max 100) |
| status | string | No | all | Filter by status (all, completed, incomplete) |
| search | string | No | - | Search in title and description |
| sortBy | string | No | createdAt | Sort field (createdAt, dueDate, title) |
| sortDir | string | No | desc | Sort direction (asc, desc) |

#### Example Request
```
GET /todos?page=0&size=20&status=incomplete&sortBy=dueDate&sortDir=asc
```

#### Success Response (200 OK)
```json
{
  "content": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "INCOMPLETE",
      "dueDate": "2024-01-20",
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
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true,
  "numberOfElements": 1
}
```

### 4.2 Get Todo by ID

**Endpoint:** `GET /todos/{id}`  
**Authentication:** Required  
**Description:** Get a specific todo by ID

#### Path Parameters
- `id` (UUID): Todo identifier

#### Success Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "INCOMPLETE",
  "dueDate": "2024-01-20",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Error Responses

**404 Not Found** - Todo not found or doesn't belong to user
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Todo not found with id: 123e4567-e89b-12d3-a456-426614174000"
}
```

### 4.3 Create Todo

**Endpoint:** `POST /todos`  
**Authentication:** Required  
**Description:** Create a new todo

#### Request Body
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "dueDate": "2024-01-20"
}
```

#### Validation Rules
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `dueDate`: Optional, ISO date format, must be today or future

#### Success Response (201 Created)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "INCOMPLETE",
  "dueDate": "2024-01-20",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 4.4 Update Todo

**Endpoint:** `PUT /todos/{id}`  
**Authentication:** Required  
**Description:** Update an existing todo

#### Path Parameters
- `id` (UUID): Todo identifier

#### Request Body
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED",
  "dueDate": "2024-01-25"
}
```

#### Validation Rules
- All fields optional, but at least one must be provided
- Same validation rules as create

#### Success Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED",
  "dueDate": "2024-01-25",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

#### Error Responses

**403 Forbidden** - User doesn't own the todo
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied to this resource"
}
```

### 4.5 Delete Todo

**Endpoint:** `DELETE /todos/{id}`  
**Authentication:** Required  
**Description:** Soft delete a todo

#### Path Parameters
- `id` (UUID): Todo identifier

#### Success Response (204 No Content)
No response body

#### Error Responses

**403 Forbidden** - User doesn't own the todo
**404 Not Found** - Todo not found

---

## 5. Admin Endpoints

### 5.1 Get All Users (Admin Only)

**Endpoint:** `GET /admin/users`  
**Authentication:** Required (Admin role)  
**Description:** Get paginated list of all users

#### Query Parameters
- `page` (integer): Page number (default: 0)
- `size` (integer): Items per page (default: 20)

#### Success Response (200 OK)
```json
{
  "content": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "pageNumber": 0,
  "pageSize": 20
}
```

### 5.2 Get User Statistics (Admin Only)

**Endpoint:** `GET /admin/statistics`  
**Authentication:** Required (Admin role)  
**Description:** Get system statistics

#### Success Response (200 OK)
```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "totalTodos": 5420,
  "completedTodos": 3210,
  "incompleteTodos": 2210,
  "todosCreatedToday": 45,
  "todosCompletedToday": 38
}
```

---

## 6. Error Response Format

All error responses follow this standard format:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "path": "/api/v1/todos",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field specific error message"
    }
  ]
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE, operations with no response body |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 500 | Internal Server Error | Server-side errors |

---

## 7. Rate Limiting

### 7.1 Limits
- **Authenticated users:** 1000 requests per hour
- **Unauthenticated users:** 100 requests per hour

### 7.2 Response Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642252800
```

### 7.3 Rate Limit Exceeded (429)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 3600 seconds"
}
```

---

## 8. Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (0-indexed)
- `size`: Items per page (default: 20, max: 100)
- `sort`: Sort specification (e.g., `createdAt,desc`)

Response includes pagination metadata:
```json
{
  "content": [],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## 9. Filtering and Search

### 9.1 Filter Operators
- Exact match: `field=value`
- Greater than: `field>value`
- Less than: `field<value`
- Contains: `field~value`

### 9.2 Search
Full-text search available on specific endpoints:
```
GET /todos?search=documentation
```

---

## 10. API Versioning

### 10.1 URL Versioning
Version included in URL path: `/api/v1/`

### 10.2 Version Support
- Current version: v1
- Previous versions supported for 6 months after new version release
- Deprecation notices provided 3 months in advance

---

## 11. CORS Configuration

### 11.1 Allowed Origins
- Development: `http://localhost:3000`
- Production: `https://app.todo-app.com`

### 11.2 Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS

### 11.3 Allowed Headers
- Content-Type, Authorization, X-Requested-With

---

## 12. Security Headers

All responses include security headers:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## 13. WebSocket Support (Future)

Future versions will support WebSocket for real-time updates:
```
ws://localhost:8080/ws
```

Planned events:
- `todo.created`
- `todo.updated`
- `todo.deleted`
- `todo.completed`

---

## 14. API Client Examples

### 14.1 cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

**Get Todos:**
```bash
curl -X GET http://localhost:8080/api/v1/todos \
  -H "Authorization: Bearer <token>"
```

### 14.2 JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Get todos
const getTodos = async (params) => {
  const response = await api.get('/todos', { params });
  return response.data;
};
```

---

## 15. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial API specification |
