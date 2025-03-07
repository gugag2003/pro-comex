import { SidebarProvider } from "@/components/sidebar-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
} 