import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all shadow-sm",
  {
    variants: {
      variant: {
        default: "border-primary/50 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90",
        secondary: "border-secondary/50 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:opacity-90",
        destructive: "border-destructive/50 bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "text-foreground border-primary/30 backdrop-blur-sm bg-white/10 dark:bg-black/10 hover:border-primary/50",
        gaming: "border-transparent bg-gradient-gaming text-white shadow-md hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
