import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('🚀 Todo Application')).toBeInTheDocument()
  })

  it('renders the system status section', () => {
    render(<App />)
    expect(screen.getByText('System Status')).toBeInTheDocument()
  })

  it('shows frontend as running', () => {
    render(<App />)
    expect(screen.getByText('✓ Running')).toBeInTheDocument()
  })

  it('displays Docker setup information', () => {
    render(<App />)
    expect(screen.getByText('🐳 Docker Setup Complete!')).toBeInTheDocument()
  })
})
