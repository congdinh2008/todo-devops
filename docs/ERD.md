# Entity Relationship Diagram (ERD)

**Project:** Todo Application  
**Database:** PostgreSQL 16  
**Version:** 1.0.0

---

## 1. Database Overview

The Todo Application uses PostgreSQL 16 as the primary database. The schema is designed following normalization principles while maintaining performance through proper indexing.

### Design Principles
- Use UUID for primary keys (better for distributed systems)
- Timestamps for audit trail (created_at, updated_at)
- Soft deletes (deleted_at) for data retention
- Foreign key constraints for referential integrity
- Proper indexing on frequently queried columns

---

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────┐
│            users                │
├─────────────────────────────────┤
│ PK  id (UUID)                   │
│     email (VARCHAR, UNIQUE)     │
│     password (VARCHAR)          │
│     display_name (VARCHAR)      │
│     role (VARCHAR)              │
│     created_at (TIMESTAMP)      │
│     updated_at (TIMESTAMP)      │
│     deleted_at (TIMESTAMP)      │
└─────────────────────────────────┘
          │
          │ 1
          │
          │
          │ N
          ▼
┌─────────────────────────────────┐
│            todos                │
├─────────────────────────────────┤
│ PK  id (UUID)                   │
│ FK  user_id (UUID)              │
│     title (VARCHAR)             │
│     description (TEXT)          │
│     status (VARCHAR)            │
│     due_date (DATE)             │
│     created_at (TIMESTAMP)      │
│     updated_at (TIMESTAMP)      │
│     deleted_at (TIMESTAMP)      │
└─────────────────────────────────┘

Relationship: One User can have Many Todos (1:N)
```

---

## 3. Table Specifications

### 3.1 Table: `users`

**Purpose:** Stores user account information and authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (login identifier) |
| password | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| display_name | VARCHAR(100) | NOT NULL | User's display name |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'USER' | User role (USER, ADMIN) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
```sql
-- Primary key index (automatic)
CREATE INDEX idx_users_id ON users(id);

-- Unique index for email lookup
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Index for role-based queries
CREATE INDEX idx_users_role ON users(role);

-- Index for soft delete queries
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

**Constraints:**
```sql
-- Check constraint for role
ALTER TABLE users ADD CONSTRAINT chk_users_role 
  CHECK (role IN ('USER', 'ADMIN'));

-- Check constraint for email format
ALTER TABLE users ADD CONSTRAINT chk_users_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

### 3.2 Table: `todos`

**Purpose:** Stores todo items created by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for todo |
| user_id | UUID | NOT NULL, FOREIGN KEY | Reference to users table |
| title | VARCHAR(200) | NOT NULL | Todo title |
| description | TEXT | NULL | Detailed description (optional) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'INCOMPLETE' | Todo status |
| due_date | DATE | NULL | Optional due date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
```sql
-- Primary key index (automatic)
CREATE INDEX idx_todos_id ON todos(id);

-- Foreign key index for user queries
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Index for status filtering
CREATE INDEX idx_todos_status ON todos(status);

-- Index for due date queries
CREATE INDEX idx_todos_due_date ON todos(due_date) WHERE due_date IS NOT NULL;

-- Composite index for user's active todos
CREATE INDEX idx_todos_user_active ON todos(user_id, status) 
  WHERE deleted_at IS NULL;

-- Index for soft delete queries
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at);

-- Index for sorting by creation date
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

**Constraints:**
```sql
-- Foreign key constraint
ALTER TABLE todos ADD CONSTRAINT fk_todos_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Check constraint for status
ALTER TABLE todos ADD CONSTRAINT chk_todos_status 
  CHECK (status IN ('INCOMPLETE', 'COMPLETED'));

-- Check constraint for title length
ALTER TABLE todos ADD CONSTRAINT chk_todos_title_length 
  CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200);
```

---

## 4. Database Schema SQL

### 4.1 Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN')),
    CONSTRAINT chk_users_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create unique index on email (excluding soft-deleted records)
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Create indexes on users table
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Create todos table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'INCOMPLETE',
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_todos_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_todos_status CHECK (status IN ('INCOMPLETE', 'COMPLETED')),
    CONSTRAINT chk_todos_title_length CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)
);

-- Create indexes on todos table
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_due_date ON todos(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_todos_user_active ON todos(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Sample Data

```sql
-- Insert sample users (passwords are 'password123' hashed with BCrypt)
INSERT INTO users (id, email, password, display_name, role) VALUES
(uuid_generate_v4(), 'admin@todo.com', '$2a$10$XQQNvz8g9xnQmPCQHqNV9.FpIl5YhFNMHzCPzOPZ3MxMqQtPZmJCK', 'Admin User', 'ADMIN'),
(uuid_generate_v4(), 'user@todo.com', '$2a$10$XQQNvz8g9xnQmPCQHqNV9.FpIl5YhFNMHzCPzOPZ3MxMqQtPZmJCK', 'Regular User', 'USER');

-- Insert sample todos
INSERT INTO todos (id, user_id, title, description, status, due_date) 
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'user@todo.com'),
    'Complete project documentation',
    'Write comprehensive documentation for all modules',
    'INCOMPLETE',
    CURRENT_DATE + INTERVAL '7 days';

INSERT INTO todos (id, user_id, title, description, status, due_date) 
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'user@todo.com'),
    'Review code changes',
    'Review pull requests from team members',
    'COMPLETED',
    CURRENT_DATE;
```

---

## 5. Query Patterns

### 5.1 Common Queries

#### Get user's active todos
```sql
SELECT * FROM todos 
WHERE user_id = ? 
  AND deleted_at IS NULL 
ORDER BY created_at DESC;
```

#### Get incomplete todos with approaching due dates
```sql
SELECT * FROM todos 
WHERE user_id = ? 
  AND status = 'INCOMPLETE' 
  AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND deleted_at IS NULL
ORDER BY due_date ASC;
```

#### Get user by email
```sql
SELECT * FROM users 
WHERE email = ? 
  AND deleted_at IS NULL 
LIMIT 1;
```

#### Soft delete todo
```sql
UPDATE todos 
SET deleted_at = CURRENT_TIMESTAMP 
WHERE id = ? 
  AND user_id = ?;
```

---

## 6. Data Migration Strategy

### 6.1 Version Control
- Use Flyway or Liquibase for database migrations
- Each migration has a version number (V1__initial_schema.sql)
- Migrations are applied in order and tracked

### 6.2 Rollback Strategy
- Keep rollback scripts for each migration
- Test rollback procedures in staging environment
- Document rollback steps in deployment guide

### 6.3 Data Seeding
- Development: Use sample data for testing
- Staging: Use anonymized production data
- Production: Minimal seed data (admin user only)

---

## 7. Performance Considerations

### 7.1 Indexing Strategy
- Primary keys automatically indexed
- Foreign keys indexed for join performance
- Composite indexes for common query patterns
- Partial indexes for filtered queries

### 7.2 Query Optimization
- Use prepared statements to prevent SQL injection and improve performance
- Implement pagination for large result sets
- Use database connection pooling (HikariCP)
- Monitor slow queries and optimize as needed

### 7.3 Scaling Considerations
- PostgreSQL supports read replicas for read scaling
- Consider partitioning todos table by user_id for very large datasets
- Implement caching layer (Redis) for frequently accessed data

---

## 8. Backup and Recovery

### 8.1 Backup Strategy
- Daily full backups
- Continuous WAL archiving for point-in-time recovery
- Retention: 30 days of backups
- Store backups in geographically separate location

### 8.2 Recovery Procedures
- Document recovery time objective (RTO): 4 hours
- Document recovery point objective (RPO): 1 hour
- Test recovery procedures quarterly

---

## 9. Security Considerations

### 9.1 Data Protection
- Passwords hashed with BCrypt (cost factor 10)
- Sensitive data encrypted at rest
- Database connections use TLS/SSL
- Principle of least privilege for database users

### 9.2 Access Control
- Application uses dedicated database user with limited permissions
- Admin operations require elevated privileges
- Audit logging for sensitive operations

---

## 10. Future Enhancements

### 10.1 Potential Schema Changes
- **Tags Table**: Many-to-many relationship for todo categorization
- **Attachments Table**: Store file metadata for todo attachments
- **Comments Table**: Allow comments on todos
- **Activity Log**: Audit trail for all changes
- **Sharing Table**: Share todos with other users

### 10.2 Example: Tags Feature

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE todo_tags (
    todo_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## 11. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2024 | Cong Dinh | Initial ERD for Sprint 1 |
