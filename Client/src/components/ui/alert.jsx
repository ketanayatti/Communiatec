import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg+div]:translate-y-[-3px]",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-green-500/50 text-green-700 dark:border-green-500/40 dark:text-green-400 [&>svg]:text-green-500",
        warning: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500/40 dark:text-yellow-400 [&>svg]:text-yellow-500",
        info: "border-blue-500/50 text-blue-700 dark:border-blue-500/40 dark:text-blue-400 [&>svg]:text-blue-500"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, alertVariants };