import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
        <LogoutButton />
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Nome</Label>
            <p className="text-lg">{session.user.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">E-mail</Label>
            <p className="text-lg">{session.user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Função</Label>
            <p className="text-lg capitalize">{session.user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 