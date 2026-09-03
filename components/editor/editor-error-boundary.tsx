'use client';

import React from 'react';

type EditorErrorBoundaryProps = {
  serviceName: string;
  children: React.ReactNode;
};

type EditorErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class EditorErrorBoundary extends React.Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Editor error in ${this.props.serviceName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
          <div className="max-w-md rounded-xl border border-rose-500/40 bg-rose-500/10 p-6 space-y-3">
            <h2 className="text-sm font-mono font-bold text-rose-300">Editor Error</h2>
            <p className="text-[11px] font-mono text-rose-200/80">
              Something went wrong while loading the {this.props.serviceName} editor.
            </p>
            <details className="text-[10px] font-mono text-rose-300/90">
              <summary className="cursor-pointer hover:text-rose-200">Technical details</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded bg-black/30 p-2">
                {this.state.error?.message}
              </pre>
            </details>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1.5 rounded border border-rose-500/40 bg-rose-500/15 text-[10px] font-mono text-rose-300 hover:bg-rose-500/25"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
