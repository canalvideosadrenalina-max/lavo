import { Skeleton } from "@/components/ui/skeleton";
import { HomeListSkeleton } from "@/components/ui/card-skeleton";

export function HomePageLoading() {
  return (
    <div className="flex flex-1 flex-col px-4 pt-5 pb-2">
      <h1 className="text-[1.35rem] font-bold leading-tight tracking-tight text-[#0F172A] sm:text-xl">
        Olá! Onde quer lavar seu carro?
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">Encontre lava-jatos disponíveis perto de você</p>

      <div className="mt-5">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          <Skeleton className="h-10 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full" />
        </div>
      </div>

      <HomeListSkeleton count={4} />
    </div>
  );
}
