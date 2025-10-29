# Entity Relationship Diagram (ERD)
# Todo Application Database Schema

**Database**: PostgreSQL 16  
**Schema Version**: 1.0  
**Date**: 2024

---

## Overview

The database schema is designed to support a multi-user todo application with authentication and role-based access control.

---

## Database Diagram

```
┌─────────────────────────┐
│       users             │
├─────────────────────────┤
│ PK  id (BIGSERIAL)      │
│     email (VARCHAR)     │
│     password (VARCHAR)  │
│     full_name (VARCHAR) │
│ FK  role_id (BIGINT)    │
│     created_at (TS)     │
│     updated_at (TS)     │
│     is_active (BOOLEAN) │
└─────────────────────────┘
            │
            │ 1
            │
            │
            │ N
┌─────────────────────────┐
│       todos             │
├─────────────────────────┤
│ PK  id (BIGSERIAL)      │
│     title (VARCHAR)     │
│     description (TEXT)  │
│     priority (VARCHAR)  │
│     due_date (DATE)     │
│     completed (BOOLEAN) │
│     completed_at (TS)   │
│ FK  user_id (BIGINT)    │
│     created_at (TS)     │
│     updated_at (TS)     │
└─────────────────────────┘

            ┌─────────────────────────┐
            │       roles             │
            ├─────────────────────────┤
            │ PK  id (BIGSERIAL)      │
            │     name (VARCHAR)      │
            │     description (TEXT)  │
            │     created_at (TS)     │
            └─────────────────────────┘
```

---

## Table Definitions

### 1. users

Stores user account information and authentication credentials.

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    role_id         BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Columns:**
- `id`: Unique identifier (auto-generated)
- `email`: User's email address (unique, used for login)
- `password`: Hashed password (BCrypt)
- `full_name`: User's full name
- `role_id`: Reference to user's role
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `is_active`: Account status flag

**Constraints:**
- Primary key on `id`
- Unique constraint on `email`
- Foreign key to `roles` table
- Not null constraints on essential fields

---

### 2. roles

Defines user roles for role-based access control.

```sql
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO roles (name, description) VALUES
    ('ROLE_USER', 'Standard user with basic permissions'),
    ('ROLE_ADMIN', 'Administrator with full system access');
```

**Columns:**
- `id`: Unique identifier
- `name`: Role name (e.g., ROLE_USER, ROLE_ADMIN)
- `description`: Role description
- `created_at`: Creation timestamp

**Constraints:**
- Primary key on `id`
- Unique constraint on `name`

---

### 3. todos

Stores todo items created by users.

```sql
CREATE TABLE todos (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    priority        VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    due_date        DATE,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMP,
    user_id         BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_todo_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Indexes
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

**Columns:**
- `id`: Unique identifier (auto-generated)
- `title`: Todo title (required, max 200 chars)
- `description`: Detailed description (optional)
- `priority`: Priority level (LOW, MEDIUM, HIGH)
- `due_date`: Optional due date
- `completed`: Completion status
- `completed_at`: Timestamp when completed
- `user_id`: Owner of the todo (foreign key)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Constraints:**
- Primary key on `id`
- Foreign key to `users` table (cascade delete)
- Check constraint on `priority` values
- Not null constraints on essential fields

---

## Relationships

### 1. users ↔ roles (Many-to-One)
- **Cardinality**: Many users to one role
- **Foreign Key**: users.role_id → roles.id
- **Delete Rule**: RESTRICT (cannot delete role if users exist)
- **Description**: Each user has exactly one role

### 2. users ↔ todos (One-to-Many)
- **Cardinality**: One user to many todos
- **Foreign Key**: todos.user_id → users.id
- **Delete Rule**: CASCADE (delete todos when user is deleted)
- **Description**: Each user can have multiple todos

---

## Indexes Strategy

### Purpose
Indexes are created to optimize common query patterns:

1. **Email lookup** (idx_users_email)
   - Used in: User login, registration validation
   - Query: `SELECT * FROM users WHERE email = ?`

2. **User's todos** (idx_todos_user_id)
   - Used in: Fetching user's todo list
   - Query: `SELECT * FROM todos WHERE user_id = ?`

3. **Completed filter** (idx_todos_completed)
   - Used in: Filtering by completion status
   - Query: `SELECT * FROM todos WHERE completed = ?`

4. **Priority filter** (idx_todos_priority)
   - Used in: Filtering by priority
   - Query: `SELECT * FROM todos WHERE priority = ?`

5. **Due date sorting** (idx_todos_due_date)
   - Used in: Sorting by due date
   - Query: `SELECT * FROM todos ORDER BY due_date`

6. **Recent todos** (idx_todos_created_at)
   - Used in: Sorting by creation date
   - Query: `SELECT * FROM todos ORDER BY created_at DESC`

---

## Data Integrity Rules

### 1. Referential Integrity
- All foreign keys enforce referential integrity
- Orphaned records are prevented
- Cascade deletes for dependent data (todos)

### 2. Domain Constraints
- Email must be valid format (application layer)
- Password must meet strength requirements (application layer)
- Priority must be LOW, MEDIUM, or HIGH (database constraint)
- Dates must be valid (database type constraint)

### 3. Business Rules
- Users cannot delete their own role
- Completed todos must have completed_at timestamp
- Due date should be in the future (application layer)
- Titles must not be empty or whitespace only

---

## Sample Data

### Roles
```sql
-- Already inserted in table creation
SELECT * FROM roles;
```
| id | name | description |
|----|------|-------------|
| 1 | ROLE_USER | Standard user with basic permissions |
| 2 | ROLE_ADMIN | Administrator with full system access |

### Users (Sample)
```sql
INSERT INTO users (email, password, full_name, role_id) VALUES
    ('john.doe@example.com', '$2a$10$...', 'John Doe', 1),
    ('admin@example.com', '$2a$10$...', 'Admin User', 2);
```

### Todos (Sample)
```sql
INSERT INTO todos (title, description, priority, due_date, user_id) VALUES
    ('Complete project documentation', 
     'Write comprehensive documentation for the todo app', 
     'HIGH', '2024-12-31', 1),
    ('Review pull requests', 
     'Review and approve pending pull requests', 
     'MEDIUM', '2024-12-15', 1);
```

---

## Database Migrations

### Version 1.0 - Initial Schema
```sql
-- File: V1.0__initial_schema.sql

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_USER', 'Standard user with basic permissions'),
    ('ROLE_ADMIN', 'Administrator with full system access');

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

-- Create todos table
CREATE TABLE todos (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    due_date DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_todo_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

---

## Performance Considerations

### 1. Query Optimization
- All foreign keys are indexed
- Frequently filtered columns have indexes
- Avoid SELECT * in production queries
- Use prepared statements to prevent SQL injection

### 2. Connection Pooling
- Configure appropriate pool size (e.g., HikariCP)
- Recommended: 10-20 connections for small-medium apps

### 3. Partitioning (Future)
- Consider partitioning `todos` table by date if data grows large
- Archive old completed todos

---

## Backup and Recovery

### Backup Strategy
- Daily full backups
- Continuous WAL archiving
- Point-in-time recovery capability
- Test restores regularly

### Commands
```bash
# Backup
pg_dump -U todouser -d tododb > backup.sql

# Restore
psql -U todouser -d tododb < backup.sql
```

---

**Document Version Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Dev Team | Initial schema design |
