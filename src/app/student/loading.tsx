
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile Skeleton */}
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-16 w-16 rounded-full bg-white/5" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48 bg-white/5" />
                        <Skeleton className="h-4 w-32 bg-white/5" />
                    </div>
                </div>

                {/* Card Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
