import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  message?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, className, icon }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16', className)}>
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
