import * as React from 'react';
import { cn } from '@/lib/utils';

const variantStyles: Record<string, string> = {
  default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent/10 hover:text-accent',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles: Record<string, string> = {
  default: 'h-10 px-5 py-2',
  sm: 'h-9 rounded-md px-3 text-xs',
  lg: 'h-11 rounded-lg px-8 text-base',
  icon: 'h-10 w-10',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { className, variant = 'default', size = 'default', children, ...rest } = props;
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      ref={ref}
      {...rest}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export { Button, type ButtonProps };
