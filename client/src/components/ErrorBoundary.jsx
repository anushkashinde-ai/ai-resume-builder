import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // no-op: avoid logging sensitive info
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-center px-4">
          <p className="text-2xl sm:text-3xl text-slate-600">Something went wrong</p>
          <a
            href="/app"
            className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2 ring-1 ring-green-400 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
