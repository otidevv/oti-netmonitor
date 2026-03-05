"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, Monitor, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/access-points", label: "Access Points", icon: Wifi },
  { href: "/verificaciones", label: "Aulas Digitales", icon: Monitor },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">OTI NetMonitor</span>
        </Link>
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
