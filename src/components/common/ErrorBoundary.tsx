import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  isModal?: boolean;
  onReset?: () => void;
  resetKey?: any;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError) {
      if (prevProps.resetKey !== this.props.resetKey || prevProps.children !== this.props.children) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.isModal) {
        return (
          <div 
            onClick={this.handleReset}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="p-6 max-w-sm w-full bg-white border border-rose-200 rounded-3xl text-center shadow-2xl relative"
            >
              <button
                type="button"
                onClick={this.handleReset}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">
                {this.props.fallbackTitle || 'Unable to open event details'}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                {this.state.error?.message || 'A temporary error occurred loading this event.'}
              </p>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="p-6 my-4 mx-auto max-w-lg bg-rose-50/90 border border-rose-200 rounded-2xl text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-950 mb-1">
            {this.props.fallbackTitle || 'Something went wrong displaying this section'}
          </h3>
          <p className="text-xs text-rose-700/90 mb-4 max-w-sm mx-auto">
            {this.state.error?.message || 'A temporary display error occurred. Please click below to restore the view.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
