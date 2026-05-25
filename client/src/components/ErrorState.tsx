import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/30 max-w-md mx-auto text-center p-8">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">加载失败</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        重试
      </Button>
    </Card>
  );
}
