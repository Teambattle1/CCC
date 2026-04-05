import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-battle-black flex items-center justify-center p-8">
          <div className="bg-battle-grey border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Noget gik galt</h1>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || 'En uventet fejl opstod'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-battle-orange hover:bg-battle-orange/80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Genindlæs siden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
