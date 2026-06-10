"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export function TopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/premios", label: "Premios" },
    { href: "/retos", label: "Retos" },
    { href: "/actividad", label: "Actividad" },
    { href: "/resumen", label: "Resumen" },
    { href: "/niveles", label: "Niveles" },
  ];

  if (session?.user?.role === "ADMIN") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-surface/70 shadow-sm flex items-center justify-between px-gutter h-16">
      <div className="flex items-center gap-6">
        <div className="h-8 relative w-32">
          <Image 
            src="/logo-onlinemente.png" 
            alt="Onlinemente Logo" 
            fill 
            className="object-contain"
            sizes="128px"
          />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full font-label-tech transition-all ${
                  isActive 
                    ? "bg-primary-container text-on-primary-container" 
                    : "text-on-surface hover:bg-surface-variant/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <span className="hidden md:block font-body-md text-on-surface-variant mr-2 border-r border-outline-variant/30 pr-4">
            {session.user.name}
          </span>
        )}
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-on-surface-variant hover:text-primary active:scale-95 transition-transform flex items-center gap-2"
          title="Cerrar sesión"
        >
          <span className="hidden md:block font-label-tech text-sm uppercase">Salir</span>
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/dashboard", icon: "dashboard", label: "Home" },
    { href: "/premios", icon: "redeem", label: "Premios" },
    { href: "/retos", icon: "emoji_events", label: "Retos" },
    { href: "/actividad", icon: "calendar_today", label: "Actividad" },
    { href: "/resumen", icon: "grid_on", label: "Resumen" },
    { href: "/niveles", icon: "leaderboard", label: "Niveles", fill: true },
  ];

  if (session?.user?.role === "ADMIN") {
    links.push({ href: "/admin", icon: "admin_panel_settings", label: "Admin" });
  }

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-xl backdrop-blur-md border-t border-outline-variant/20 shadow-[0_-4px_20px_0_rgba(80,92,115,0.1)] bg-surface/80 flex justify-around items-center px-4 py-2 pb-safe-area md:hidden">
      {links.map((link) => {
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 active:scale-90 ${
              isActive 
                ? "bg-primary-container text-on-primary-container rounded-full" 
                : "text-on-surface-variant hover:bg-surface-variant/50"
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={link.fill && isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {link.icon}
            </span>
            <span className="font-label-tech text-label-tech mt-1">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
