import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.componentName || 'a component'}` , error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg border bg-card text-card-foreground">
          <h2 className="text-base font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-2">Please try again or refresh the page.</p>
          {this.state.error?.message && (
            <pre className="mt-3 text-xs text-destructive/80 whitespace-pre-wrap break-words">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
