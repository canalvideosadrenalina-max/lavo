"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Search, User, type LucideIcon } from "lucide-react";

type Props = {
  perfilHref?: string;
  homeHref?: string;
};

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
        active ? "text-[#06B6D4]" : "text-[#64748B]"
      }`}
    >
      <Icon size={24} aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

export function BottomNav({ perfilHref = "/login", homeHref = "/" }: Props) {
  const pathname = usePathname();

  const isHome = pathname === homeHref;
  const isReservas = pathname === "/reservas";
  const isPerfil =
    pathname === perfilHref ||
    pathname === "/perfil" ||
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname.startsWith("/painel");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        <NavItem href={homeHref} icon={Home} label="Home" active={isHome} />
        <NavItem href={`${homeHref}#buscar`} icon={Search} label="Buscar" active={false} />
        <NavItem href="/reservas" icon={CalendarCheck} label="Reservas" active={isReservas} />
        <NavItem href={perfilHref} icon={User} label="Perfil" active={isPerfil} />
      </div>
    </nav>
  );
}
