import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const variantStyles: Record<string, string> = {
  default: 'border-transparent bg-primary/10 text-primary',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive/10 text-destructive',
  outline: 'text-foreground border-border',
  success: 'border-transparent bg-emerald-500/10 text-emerald-400',
  warning: 'border-transparent bg-amber-500/10 text-amber-400',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: string;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
