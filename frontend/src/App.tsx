import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

  useEffect(() => {
    fetch(`${apiBaseUrl}/health`)
      .then((response) => response.json())
      .then((data) => {
        setBackendStatus(`Connected - ${data.message}`)
      })
      .catch(() => {
        setBackendStatus('Backend not available')
      })
  }, [apiBaseUrl])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Todo Application</h1>
        <p>Enterprise DevOps Project</p>
        <div className="status-card">
          <h2>System Status</h2>
          <div className="status-item">
            <span className="status-label">Frontend:</span>
            <span className="status-value success">✓ Running</span>
          </div>
          <div className="status-item">
            <span className="status-label">Backend:</span>
            <span
              className={`status-value ${backendStatus.includes('Connected') ? 'success' : 'error'}`}
            >
              {backendStatus}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">API URL:</span>
            <span className="status-value">{apiBaseUrl}</span>
          </div>
        </div>
        <div className="info-card">
          <h3>🐳 Docker Setup Complete!</h3>
          <ul>
            <li>
              ✓ Multi-stage builds (Backend: Maven + JRE, Frontend: Node +
              Nginx)
            </li>
            <li>✓ Non-root users for security</li>
            <li>✓ Health checks configured</li>
            <li>✓ Environment variables support</li>
            <li>✓ Docker Compose orchestration</li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default App
