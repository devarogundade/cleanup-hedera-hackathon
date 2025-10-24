import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "skew-parallelogram bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md hover:opacity-90",
        destructive: "skew-parallelogram bg-destructive text-destructive-foreground shadow-md hover:opacity-90",
        outline: "skew-parallelogram border-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary backdrop-blur-sm",
        secondary: "skew-parallelogram bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-md hover:opacity-90",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
        gaming: "skew-parallelogram bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-md hover:opacity-90 animate-shimmer bg-[length:200%_100%]",
        glass: "skew-parallelogram glass-card text-foreground hover:bg-white/60 dark:hover:bg-black/40",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const needsUnskew = variant !== "ghost" && variant !== "link" && size !== "icon";
    
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {needsUnskew ? (
          <span className="unskew-parallelogram inline-flex items-center justify-center gap-2">
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
