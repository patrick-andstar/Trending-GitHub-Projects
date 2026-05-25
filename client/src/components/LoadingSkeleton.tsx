import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-5 sm:p-6">
          <div className="flex gap-4">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
