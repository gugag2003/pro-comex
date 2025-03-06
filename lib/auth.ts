// lib/auth.ts
import { cookies } from 'next/headers';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Função para verificar autenticação no servidor
export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;
  
  if (!token) {
    return null;
  }
  
  // Em um ambiente real, você verificaria este token com seu backend
  // e obteria as informações do usuário
  
  // Simulação para desenvolvimento local
  if (token.includes('1')) {
    return {
      user: {
        id: 1,
        name: "Administrador",
        email: "admin@exemplo.com",
        role: "admin"
      }
    };
  } else if (token.includes('2')) {
    return {
      user: {
        id: 2,
        name: "Operador",
        email: "operador@exemplo.com",
        role: "operator"
      }
    };
  }
  
  return null;
}