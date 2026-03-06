import React from 'react'
import { AlertCircleIcon } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ backgroundColor: 'var(--eqx-base)' }}
        >
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="flex justify-center"><AlertCircleIcon size={40} strokeWidth={1.5} style={{ color: 'var(--eqx-coral)' }} /></div>
            <h1
              className="text-xl font-bold"
              style={{ color: 'var(--eqx-primary)' }}
            >
              Something went wrong
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--eqx-secondary)' }}
            >
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--eqx-mint)',
                color: 'var(--eqx-base)',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
