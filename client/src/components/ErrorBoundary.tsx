import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="border-destructive/30 max-w-md w-full text-center p-8">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">页面异常</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              应用发生了意外错误，请尝试刷新页面。
            </p>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              刷新页面
            </Button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  查看错误详情
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
