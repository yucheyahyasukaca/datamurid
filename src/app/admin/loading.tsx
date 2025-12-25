
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            {/* Sidebar Skeleton */}
            <div className="w-64 border-r border-white/10 hidden md:block p-4 space-y-4">
                <Skeleton className="h-8 w-32 bg-white/5" />
                <div className="space-y-2 mt-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 p-8 space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48 bg-white/5" />
                    <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />
                    ))}
                </div>

                <Skeleton className="h-64 w-full bg-white/5 rounded-xl mt-8" />
            </div>
        </div>
    )
}
