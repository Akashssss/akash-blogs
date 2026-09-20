import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostSkeleton({ count = 3 }) {
    return (
        <div className="space-y-6 w-full">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="w-full block border-b border-border/60 pb-6 mb-5 p-3 sm:p-4 rounded-2xl"
                >
                    {/* Author line */}
                    <div className="flex items-center gap-2.5 mb-3">
                        <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                        <Skeleton className="w-24 h-4 rounded" />
                        <Skeleton className="w-16 h-3 rounded opacity-50" />
                    </div>

                    <div className="flex items-start justify-between gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0 space-y-2.5">
                            {/* Title */}
                            <Skeleton className="w-5/6 h-6 rounded-lg" />

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Skeleton className="w-full h-4 rounded" />
                                <Skeleton className="w-4/6 h-4 rounded" />
                            </div>

                            {/* Badges line */}
                            <div className="flex items-center gap-3 pt-2">
                                <Skeleton className="w-16 h-5 rounded-full" />
                                <Skeleton className="w-20 h-4 rounded" />
                                <Skeleton className="w-12 h-4 rounded" />
                            </div>
                        </div>

                        {/* Thumbnail banner skeleton */}
                        <div className="w-20 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 shrink-0">
                            <Skeleton className="w-full h-full rounded-xl sm:rounded-2xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
