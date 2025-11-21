'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary Component
 * 
 * Captures React component errors and displays a user-friendly error UI.
 * This prevents the entire app from crashing when a component throws an error.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging (in production, you might want to log to an error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // In production, you could send this to an error reporting service:
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  handleReset = () => {
    // Reset error state to allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-red-800 dark:text-red-200">
                  An unexpected error occurred
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
                </AlertDescription>
              </Alert>

              {/* Error details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                  <details className="space-y-2">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Error Message:
                        </p>
                        <pre className="text-xs bg-gray-200 dark:bg-gray-900 p-2 rounded overflow-auto text-red-600 dark:text-red-400">
                          {this.state.error?.toString()}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Component Stack:
                        </p>
                        <pre className="text-xs bg-gray-200 dark:bg-gray-900 p-2 rounded overflow-auto text-gray-700 dark:text-gray-300 max-h-48">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              </div>

              {/* Help text */}
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 pt-2">
                If this problem persists, please try refreshing the page or contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    // If no error, render children normally
    return this.props.children
  }
}

