# Todo Frontend - React + TypeScript + Vite

Modern, enterprise-grade frontend for Todo Application built with React 18, TypeScript, and Vite.

## 🏗️ Architecture

This frontend follows a **feature-based architecture** with clear separation of concerns:

### Directory Structure

```
src/
├── features/           # Feature modules
│   ├── todos/          # Todo feature
│   │   ├── components/ # Todo-specific components
│   │   ├── hooks/      # Todo-specific hooks
│   │   ├── services/   # Todo API services
│   │   ├── types/      # Todo types/interfaces
│   │   └── tests/      # Todo tests
│   └── auth/           # Authentication feature
│       ├── components/ # Auth components
│       ├── hooks/      # Auth hooks
│       ├── services/   # Auth services
│       ├── types/      # Auth types
│       └── tests/      # Auth tests
├── shared/             # Shared resources
│   ├── components/     # Reusable components
│   ├── hooks/          # Reusable hooks
│   ├── utils/          # Utility functions
│   └── types/          # Shared types
├── api/                # API client configuration
├── config/             # App configuration
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## 🛠️ Tech Stack

- **React 18** - UI library with Hooks and Context API
- **TypeScript 5.3** - Type safety (strict mode enabled)
- **Vite 5** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **TanStack Query (React Query)** - Server state management
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Backend API running on `http://localhost:8080`

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Todo Application
```

### 3. Development Server

```bash
# Start dev server with hot reload
npm run dev

# The app will be available at http://localhost:3000
```

### 4. Build for Production

```bash
# Type-check and build
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🎨 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📦 Project Structure Details

### Features
Each feature is self-contained with its own:
- **Components**: UI components specific to the feature
- **Hooks**: Custom React hooks for the feature
- **Services**: API integration layer
- **Types**: TypeScript interfaces and types
- **Tests**: Unit and integration tests

### Shared Resources
Reusable code across features:
- **Components**: Common UI components (Button, Input, Modal, etc.)
- **Hooks**: Reusable custom hooks (useDebounce, useLocalStorage, etc.)
- **Utils**: Helper functions and utilities
- **Types**: Common TypeScript definitions

### API Layer
Centralized API configuration:
- Axios instance setup
- Request/response interceptors
- Error handling
- Authentication token management

## 🔧 Configuration

### TypeScript
- **Strict mode enabled** for maximum type safety
- **Path aliases** for cleaner imports:
  - `@/*` → `src/*`
  - `@features/*` → `src/features/*`
  - `@shared/*` → `src/shared/*`
  - `@api/*` → `src/api/*`
  - `@config/*` → `src/config/*`

### Vite
- **Dev server** on port 3000
- **API proxy** to backend on port 8080
- **Source maps** enabled for debugging
- **Hot Module Replacement** for fast development

## 🌐 API Integration

The frontend communicates with the backend API using:
- **Axios** for HTTP requests
- **TanStack Query** for caching and state management
- **JWT tokens** for authentication

Example API call:
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '@features/todos/services/todoService';

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });
  
  // Render logic...
}
```

## 🔒 Security

- JWT token storage and management
- Protected routes with authentication
- XSS prevention with React's built-in escaping
- CSRF protection via tokens
- Secure HTTP headers

## 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints
- Touch-friendly interactions
- Progressive Web App (PWA) ready

## 🚀 Deployment

See `/docs/Deployment-Guide.md` for production deployment instructions.

## 📖 Additional Documentation

- [Software Requirements Specification](/docs/SRS.md)
- [API Specification](/docs/API-Spec.md)
- [Architecture Document](/docs/Architecture.md)
- [Setup Guide](/docs/Setup-Guide.md)
- [Deployment Guide](/docs/Deployment-Guide.md)

## 🤝 Contributing

1. Follow feature-based structure
2. Write tests for new components
3. Maintain TypeScript strict mode
4. Use ESLint and Prettier
5. Update documentation as needed

## 📝 License

See [LICENSE](/LICENSE) in the root directory.
