import { Suspense } from "react";
import { HomePageContent } from "@/components/cliente/home-page-content";
import { HomePageLoading } from "@/components/cliente/home-page-loading";

export default async function ClienteHome({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;
  const filtroCidade = cidade?.trim();

  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent filtroCidade={filtroCidade} />
    </Suspense>
  );
}
