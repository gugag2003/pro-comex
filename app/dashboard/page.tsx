// app/dashboard/page.tsx
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
  // Verificar autenticação no servidor
  const session = await getServerSession();
  
  // Se não houver sessão, redirecionar para login
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p>Bem-vindo, {session.user.name}!</p>
      
      {/* Este componente cliente manipulará a interatividade */}
      <DashboardClient user={session.user} />
    </div>
  );
}