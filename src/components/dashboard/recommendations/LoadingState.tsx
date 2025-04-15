
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="w-full transition-opacity duration-300 opacity-90" style={{ minHeight: '70vh' }}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-64" />
          <div className="flex-1"></div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        
        <Skeleton className="h-4 w-full max-w-md" />
        
        {/* Simplified loading skeleton with fewer elements */}
        <div className="space-y-6 mt-8">
          <Skeleton className="h-[80px] w-full rounded-lg" />
          <Skeleton className="h-[80px] w-full rounded-lg" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden border border-muted">
              <CardHeader className="p-0">
                <Skeleton className="h-24 w-full rounded-none" />
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
