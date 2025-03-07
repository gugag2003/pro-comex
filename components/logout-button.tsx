"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Cookies from 'js-cookie';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Remover o cookie de autenticação
    Cookies.remove('authToken');
    
    // Redirecionar para a página de login
    router.push('/login');
    router.refresh(); // Força atualização para aplicar o novo estado de autenticação
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      className="gap-2"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </Button>
  );
} 