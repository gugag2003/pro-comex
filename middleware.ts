// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que estarão protegidas
const protectedRoutes = ['/dashboard', '/processos', '/clientes'];

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/cadastro', '/recuperar-senha'];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  // Verificar se é uma rota que requer autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    currentPath === route || currentPath.startsWith(`${route}/`)
  );
  
  // Se não for uma rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Verificar se há um token de autenticação
  const authToken = request.cookies.get('authToken')?.value;
  
  // Se não houver token, redirecionar para o login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', currentPath);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se houver token, permitir acesso
  return NextResponse.next();
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Correspondência de todas as rotas de request excluindo:
     * 1. Todas as rotas de API (_next, api)
     * 2. Arquivos estáticos (_next/static, favicon.ico, etc.)
     * 3. Imagens (_next/image, .jpg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};