"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  LayoutDashboard,
  Layers,
  Menu,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  const routes = [
    {
      label: "Fluxo",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Processos",
      icon: <Layers className="w-5 h-5" />,
      href: "/processos",
      active: pathname === "/processos",
    },
  ];

  return (
    <div
      className={cn(
        "relative h-full bg-muted border-r pt-16 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        onClick={toggleSidebar}
        variant="ghost"
        className="absolute right-2 top-2"
        size="icon"
      >
        {collapsed ? <Menu /> : <ChevronLeft />}
      </Button>

      <div className="flex flex-col gap-2 px-2 py-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors",
              route.active
                ? "bg-emerald-900/50 text-emerald-500"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
          >
            {route.icon}
            {!collapsed && <span>{route.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}