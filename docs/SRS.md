# Software Requirements Specification (SRS)

**Project:** Todo Application  
**Version:** 1.0.0  
**Date:** 2024  
**Author:** Cong Dinh

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Todo Application, an enterprise-grade task management system built with Clean Architecture principles.

### 1.2 Scope
The Todo Application allows users to create, manage, and track their tasks with features including user authentication, task CRUD operations, and role-based access control.

### 1.3 Definitions and Acronyms
- **Todo**: A task or item to be completed
- **CRUD**: Create, Read, Update, Delete
- **JWT**: JSON Web Token
- **RBAC**: Role-Based Access Control
- **API**: Application Programming Interface
- **SPA**: Single Page Application

### 1.4 References
- Clean Architecture by Robert C. Martin
- RESTful API Design Best Practices
- OAuth 2.0 / JWT Authentication Standards

---

## 2. Overall Description

### 2.1 Product Perspective
The Todo Application is a standalone web application consisting of:
- RESTful Backend API (Java Spring Boot)
- Single Page Application Frontend (React + TypeScript)
- PostgreSQL Database
- JWT-based authentication system

### 2.2 Product Functions
- User registration and authentication
- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Filter and search todos
- Role-based access control (Admin, User)
- User profile management

### 2.3 User Classes and Characteristics
1. **Guest User**: Can view public information, register for an account
2. **Registered User**: Can manage their own todos
3. **Administrator**: Can manage all users and todos, view system statistics

### 2.4 Operating Environment
- **Client**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server**: Java 21 runtime environment
- **Database**: PostgreSQL 16+
- **Deployment**: Docker containers, cloud platforms (AWS, Azure, GCP)

---

## 3. Functional Requirements

### 3.1 User Management

#### FR-1.1: User Registration
**Priority:** High  
**Description:** Users can create a new account with email and password.

**Acceptance Criteria:**
- User provides valid email, password, and display name
- Email must be unique in the system
- Password must be at least 8 characters with complexity requirements
- System sends verification email (future sprint)
- User account is created with default "USER" role

#### FR-1.2: User Login
**Priority:** High  
**Description:** Registered users can authenticate using email and password.

**Acceptance Criteria:**
- User provides email and password
- System validates credentials
- On success, system returns JWT access token and refresh token
- Token expires after configured duration (default: 24 hours)
- Failed login attempts are logged

#### FR-1.3: User Logout
**Priority:** High  
**Description:** Authenticated users can logout from the system.

**Acceptance Criteria:**
- User initiates logout
- Client removes stored tokens
- System invalidates refresh token

#### FR-1.4: User Profile Management
**Priority:** Medium  
**Description:** Users can view and update their profile information.

**Acceptance Criteria:**
- User can view their profile (email, display name, created date)
- User can update display name
- User can change password (requires old password confirmation)
- Email cannot be changed (future sprint for email change verification)

### 3.2 Todo Management

#### FR-2.1: Create Todo
**Priority:** High  
**Description:** Authenticated users can create new todo items.

**Acceptance Criteria:**
- User provides title (required), description (optional), due date (optional)
- Title must be between 1-200 characters
- Description can be up to 2000 characters
- Created todo is associated with the authenticated user
- Todo status defaults to "incomplete"
- System returns created todo with unique ID

#### FR-2.2: View Todos
**Priority:** High  
**Description:** Users can view their todo list.

**Acceptance Criteria:**
- User can view all their todos
- Todos are paginated (default: 20 per page)
- User can filter by status (all, completed, incomplete)
- User can search by title/description
- User can sort by creation date, due date, title

#### FR-2.3: Update Todo
**Priority:** High  
**Description:** Users can update their existing todos.

**Acceptance Criteria:**
- User can update title, description, due date
- User can mark todo as complete/incomplete
- User cannot update todos belonging to other users
- System validates all input constraints
- Updated timestamp is recorded

#### FR-2.4: Delete Todo
**Priority:** High  
**Description:** Users can delete their todos.

**Acceptance Criteria:**
- User can delete their own todos
- System performs soft delete (marks as deleted, not physical removal)
- Deleted todos are not returned in standard queries
- Admin can view deleted todos for audit purposes

### 3.3 Authorization

#### FR-3.1: Role-Based Access Control
**Priority:** High  
**Description:** System enforces role-based permissions.

**Roles:**
- **USER**: Can manage only their own todos
- **ADMIN**: Can manage all todos and users

**Acceptance Criteria:**
- User role is assigned during registration (default: USER)
- System validates user permissions for each operation
- Admin can promote users to admin role
- Admin can view system-wide statistics

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-1.1: Response Time
- API responses must be delivered within 200ms for 95% of requests
- Page load time should not exceed 2 seconds on standard broadband

#### NFR-1.2: Throughput
- System must handle at least 1000 concurrent users
- API should support minimum 10,000 requests per minute

#### NFR-1.3: Database Performance
- Database queries should execute within 100ms for 95% of queries
- Proper indexing on frequently queried fields (user_id, status, created_at)

### 4.2 Security Requirements

#### NFR-2.1: Authentication
- Passwords must be encrypted using BCrypt (minimum cost factor: 10)
- JWT tokens must be signed with strong secret key (minimum 256 bits)
- Refresh tokens must be stored securely and rotated

#### NFR-2.2: Authorization
- All API endpoints must enforce proper authorization
- Sensitive operations require valid JWT token
- Token must be validated on every request

#### NFR-2.3: Data Protection
- All API communication must use HTTPS in production
- SQL injection prevention through prepared statements
- XSS protection through input sanitization and output encoding
- CSRF protection enabled for state-changing operations

#### NFR-2.4: Password Policy
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Cannot be same as previous 3 passwords (future sprint)

### 4.3 Scalability Requirements

#### NFR-3.1: Horizontal Scaling
- Application must be stateless to support horizontal scaling
- Session data stored in JWT, not server memory
- Database connection pooling configured appropriately

#### NFR-3.2: Database Scalability
- Database must support replication for read scaling
- Prepare for sharding strategy for future growth

### 4.4 Availability Requirements

#### NFR-4.1: Uptime
- System should maintain 99.9% uptime (allowing ~8.76 hours downtime per year)
- Planned maintenance during low-traffic periods

#### NFR-4.2: Fault Tolerance
- Application should handle database connection failures gracefully
- Implement circuit breaker pattern for external service calls

### 4.5 Maintainability Requirements

#### NFR-5.1: Code Quality
- Maintain minimum 80% code coverage with unit tests
- Follow Clean Architecture principles
- Code must pass linting rules (ESLint for frontend, Checkstyle for backend)

#### NFR-5.2: Documentation
- All public APIs must be documented with OpenAPI/Swagger
- README files for setup instructions
- Architecture documentation maintained

### 4.6 Usability Requirements

#### NFR-6.1: User Interface
- Interface must be intuitive and require minimal training
- Responsive design supporting desktop, tablet, and mobile devices
- Accessibility compliance (WCAG 2.1 Level AA)

#### NFR-6.2: Error Handling
- User-friendly error messages
- Validation errors clearly indicated on forms
- Loading states for async operations

### 4.7 Compatibility Requirements

#### NFR-7.1: Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

#### NFR-7.2: API Versioning
- API endpoints must be versioned (e.g., /api/v1/)
- Backward compatibility maintained for at least one major version

---

## 5. Use Cases

### 5.1 Use Case: Register New User

**Actor:** Guest User  
**Preconditions:** None  
**Main Flow:**
1. User navigates to registration page
2. User enters email, password, and display name
3. System validates input
4. System creates user account with hashed password
5. System returns success message
6. User is redirected to login page

**Alternative Flows:**
- 3a. Email already exists → Show error message
- 3b. Password doesn't meet requirements → Show validation errors

### 5.2 Use Case: User Login

**Actor:** Registered User  
**Preconditions:** User has a registered account  
**Main Flow:**
1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System generates JWT access and refresh tokens
5. System returns tokens to client
6. User is redirected to todo list page

**Alternative Flows:**
- 3a. Invalid credentials → Show error message and increment failed login attempts

### 5.3 Use Case: Create Todo

**Actor:** Authenticated User  
**Preconditions:** User is logged in  
**Main Flow:**
1. User clicks "Add Todo" button
2. User enters title and optional description/due date
3. User submits form
4. System validates input
5. System creates todo associated with user
6. System returns created todo
7. Todo list is refreshed showing new item

**Alternative Flows:**
- 4a. Title is empty → Show validation error
- 4b. Title exceeds 200 characters → Show validation error

### 5.4 Use Case: Update Todo

**Actor:** Authenticated User  
**Preconditions:** User is logged in and owns the todo  
**Main Flow:**
1. User clicks edit button on a todo
2. System loads todo details in edit form
3. User modifies fields
4. User submits form
5. System validates input and ownership
6. System updates todo
7. Todo list is refreshed showing updated item

**Alternative Flows:**
- 5a. User doesn't own the todo → Return 403 Forbidden
- 5b. Validation fails → Show validation errors

### 5.5 Use Case: Delete Todo

**Actor:** Authenticated User  
**Preconditions:** User is logged in and owns the todo  
**Main Flow:**
1. User clicks delete button on a todo
2. System shows confirmation dialog
3. User confirms deletion
4. System validates ownership
5. System soft-deletes todo
6. Todo is removed from list

**Alternative Flows:**
- 3a. User cancels → No action taken
- 4a. User doesn't own the todo → Return 403 Forbidden

---

## 6. Data Requirements

### 6.1 Data Entities

#### User Entity
- id (UUID, Primary Key)
- email (String, Unique, Not Null)
- password (String, Hashed, Not Null)
- displayName (String, Not Null)
- role (Enum: USER, ADMIN)
- createdAt (Timestamp)
- updatedAt (Timestamp)

#### Todo Entity
- id (UUID, Primary Key)
- userId (UUID, Foreign Key to User)
- title (String, Not Null)
- description (Text, Nullable)
- status (Enum: INCOMPLETE, COMPLETED)
- dueDate (Date, Nullable)
- createdAt (Timestamp)
- updatedAt (Timestamp)
- deletedAt (Timestamp, Nullable)

### 6.2 Data Retention
- Active todos: Retained indefinitely
- Soft-deleted todos: Retained for 30 days, then permanently deleted
- User accounts: Retained until user requests deletion

---

## 7. User Stories (Sprint 1)

### US-1: Project Structure Setup ✓
**As a** developer  
**I want** a well-structured project following Clean Architecture  
**So that** the codebase is maintainable and scalable

**Acceptance Criteria:**
- Backend structure with domain, application, infrastructure, and API layers
- Frontend structure with feature-based organization
- Comprehensive documentation
- Docker setup for local development

### US-2: User Registration (Upcoming)
**As a** guest user  
**I want** to register for an account  
**So that** I can use the todo application

### US-3: User Authentication (Upcoming)
**As a** registered user  
**I want** to login with my credentials  
**So that** I can access my todos

### US-4: Todo CRUD Operations (Upcoming)
**As an** authenticated user  
**I want** to create, view, update, and delete todos  
**So that** I can manage my tasks

### US-5: Todo Filtering and Sorting (Upcoming)
**As an** authenticated user  
**I want** to filter and sort my todos  
**So that** I can find specific tasks easily

---

## 8. Constraints and Assumptions

### 8.1 Constraints
- Must use Java 21 and Spring Boot 3.x for backend
- Must use React 18 and TypeScript for frontend
- Must use PostgreSQL as primary database
- Must follow Clean Architecture principles
- Must maintain minimum 80% code coverage

### 8.2 Assumptions
- Users have modern web browsers with JavaScript enabled
- Users have stable internet connection
- PostgreSQL database is available and properly configured
- Development team is familiar with Spring Boot and React

---

## 9. Appendices

### 9.1 Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial SRS document for Sprint 1 |

### 9.2 Approval

This document requires approval from:
- Project Manager: _________________
- Technical Lead: _________________
- Product Owner: _________________
