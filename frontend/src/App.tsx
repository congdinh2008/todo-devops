import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <h1>Todo Application</h1>
          <p>Enterprise Todo App with Clean Architecture</p>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
