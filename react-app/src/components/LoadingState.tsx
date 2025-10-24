import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

interface LoadingStateProps {
  variant?: "skeleton" | "spinner" | "card";
  count?: number;
}

export const LoadingState = ({ variant = "skeleton", count = 1 }: LoadingStateProps) => {
  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-6 animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]" />
      ))}
    </div>
  );
};

export const FractionsLoadingState = () => (
  <Card className="p-6 animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]">
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  </Card>
);

export const StatsLoadingState = () => (
  <Card className="p-4 animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]">
    <div className="flex items-center justify-between gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  </Card>
);

export const TableLoadingState = ({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <TableCell key={j}>
            <div className="animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]">
              <Skeleton className={j === 0 ? "h-10 w-10 rounded-full" : "h-4 w-full"} />
            </div>
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
