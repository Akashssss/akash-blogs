import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground shadow",
                secondary: "border-transparent bg-secondary text-secondary-foreground",
                destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
                outline: "text-foreground",
                purple: "border-purple/20 bg-purple/10 text-purple",
                success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                warning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
