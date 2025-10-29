# Todo Frontend

Enterprise Todo Application Frontend built with React 18, TypeScript, and Vite.

## Tech Stack

- **React 18** - UI library with Hooks and Context API
- **TypeScript** - Type-safe JavaScript (strict mode enabled)
- **Vite** - Fast build tool and development server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state management
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Architecture

This project follows a **feature-based architecture** with clear separation of concerns:

### Feature Structure

Each feature (e.g., `todos`, `auth`) has its own directory containing:

- **components/** - React components specific to the feature
- **hooks/** - Custom React hooks for the feature
- **services/** - API calls and business logic
- **types/** - TypeScript type definitions
- **tests/** - Feature-specific tests

### Shared Resources

- **shared/components/** - Reusable UI components
- **shared/hooks/** - Common custom hooks
- **shared/utils/** - Utility functions
- **shared/types/** - Common type definitions
- **api/** - API client configuration (Axios instance)
- **config/** - Application configuration

## Prerequisites

- **Node.js 20+**
- **npm 10+** or **yarn 1.22+**

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types without emitting files

## Project Structure

```
frontend/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── todos/         # Todo feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   └── auth/          # Authentication feature
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── tests/
│   ├── shared/            # Shared resources
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── api/               # API configuration
│   ├── config/            # App configuration
│   ├── tests/             # Test setup
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── tests/                 # Additional test files
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── .eslintrc.cjs          # ESLint configuration
├── .prettierrc            # Prettier configuration
└── README.md
```

## Development Guidelines

### TypeScript

- **Strict mode is enabled** - All type checks are enforced
- Use explicit types for function parameters and return values
- Avoid using `any` type - use `unknown` instead
- Define interfaces for complex objects

### React Best Practices

- Use functional components with hooks
- Keep components small and focused
- Extract custom hooks for reusable logic
- Use Context API sparingly, prefer React Query for server state
- Memoize expensive computations with `useMemo` and `useCallback`

### Code Style

- Follow ESLint and Prettier configurations
- Use destructuring for props and state
- Use arrow functions for component definitions
- Keep files under 300 lines of code
- Write meaningful variable and function names

### Testing

- Write tests for all components and hooks
- Aim for >80% code coverage
- Use React Testing Library best practices
- Test user behavior, not implementation details

### API Integration

- All API calls should be in `services/` directories
- Use React Query for data fetching and caching
- Handle errors gracefully with try-catch
- Show loading states for async operations

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Proxy Configuration

The Vite development server is configured to proxy API requests to the backend:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Proxy: `/api` → `http://localhost:8080/api`

## Contributing

See the main project [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## License

See [LICENSE](../LICENSE) file in the root directory.
