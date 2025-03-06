// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Dados de exemplo para ambiente de desenvolvimento
const users = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@exemplo.com",
    password: "senha123", // Em produção, use hashes de senha
    role: "admin"
  },
  {
    id: 2,
    name: "Operador",
    email: "operador@exemplo.com",
    password: "senha456",
    role: "operator"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar campos
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Encontrar usuário
    const user = users.find(u => u.email === email);
    
    // Verificar se o usuário existe e a senha está correta
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Criar um objeto de usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    // Em produção, você usaria JWT e cookies HttpOnly
    return NextResponse.json({
      user: userWithoutPassword,
      token: `token-simulado-${user.id}`,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro durante o login:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}