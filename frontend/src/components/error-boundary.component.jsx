import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught application error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background text-foreground">
                    <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-3xl shadow-xl">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold font-inter tracking-tight">Something went wrong</h1>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                An unexpected issue occurred while loading this view. You can reload or head back to the main feed.
                            </p>
                        </div>
                        {this.state.error?.message && (
                            <details className="text-left text-xs bg-muted/50 p-3 rounded-xl border border-border text-muted-foreground font-mono overflow-auto max-h-32">
                                <summary className="cursor-pointer font-semibold mb-1 select-none">Error details</summary>
                                <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                            </details>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button
                                onClick={this.handleReload}
                                className="gap-2 bg-purple hover:bg-purple/90 text-white rounded-xl shadow-sm"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Reload Page
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                variant="outline"
                                className="gap-2 border-border rounded-xl"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
