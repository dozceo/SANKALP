/**
 * Global Error Boundary for React Application
 * Catches runtime errors and displays fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        logger.error(error, {
            componentStack: errorInfo.componentStack
        });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="flex justify-center">
                            <AlertTriangle className="h-16 w-16 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                            <p className="text-muted-foreground">
                                We apologize for the inconvenience. The error has been logged and we'll look into it.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-left">
                                <p className="font-mono text-sm text-destructive">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm font-semibold">
                                            Stack trace
                                        </summary>
                                        <pre className="mt-2 text-xs overflow-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
