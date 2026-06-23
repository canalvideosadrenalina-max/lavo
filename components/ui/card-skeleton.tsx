import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="relative h-40 bg-gradient-to-br from-[#06B6D4]/40 via-[#0891b2]/35 to-[#1E3A5F]/40 px-4 pb-3">
        <div className="flex h-full flex-col items-center justify-center">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="mt-3 h-5 w-3/5 max-w-[200px]" />
          <Skeleton className="mt-2 h-4 w-2/5 max-w-[120px]" />
        </div>
        <Skeleton className="absolute bottom-3 left-4 h-3 w-16" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </div>
    </article>
  );
}

export function HomeListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="mt-5 flex flex-1 flex-col gap-4 pb-4">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <CardSkeleton />
        </li>
      ))}
    </ul>
  );
}
