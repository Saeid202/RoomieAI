
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="container mx-auto py-6 opacity-90" style={{ minHeight: '80vh' }}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-64" />
          <div className="flex-1"></div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        
        <Skeleton className="h-4 w-full max-w-md" />
        
        <div className="space-y-6 mt-8">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border border-muted">
              <CardHeader className="p-0">
                <Skeleton className="h-32 w-full rounded-none" />
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
