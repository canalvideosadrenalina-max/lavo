import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let perfilHref = "/login";

  if (user) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role === "LAVAJATO") {
      perfilHref = "/painel";
    } else {
      perfilHref = "/reservas";
    }
  }

  return (
    <div
      className="flex min-h-dvh flex-1 flex-col bg-[#F0F4F8]"
      style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomNav perfilHref={perfilHref} homeHref="/" />
    </div>
  );
}
