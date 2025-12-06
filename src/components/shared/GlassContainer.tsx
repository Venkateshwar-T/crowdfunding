import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type GlassContainerProps = {
    children: ReactNode;
    className?: string;
};

export function GlassContainer({ children, className }: GlassContainerProps) {
    return (
        <div
            className={cn(
                "rounded-xl border bg-background/50 shadow-sm transition-all duration-300",
                "dark:bg-white/5 dark:backdrop-blur-xl dark:border-white/10",
                "hover:shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
}
