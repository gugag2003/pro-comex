"use client";

import React, { createContext, useContext, useState } from "react";
import { Sidebar } from "@/components/sidebar";

type SidebarContextType = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
}