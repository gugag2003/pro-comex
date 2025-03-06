// app/layout.tsx - Layout principal da aplicação
import "./globals.css";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/sidebar-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema de Despacho Aduaneiro",
  description: "Sistema de gestão para empresa de despacho aduaneiro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  );
}