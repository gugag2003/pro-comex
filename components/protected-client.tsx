// components/protected-client.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedClient({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Mostrar loader enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}