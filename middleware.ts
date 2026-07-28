// Arquivo: middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('fase_rh_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  // Se não tem token e não está na página de login, manda pro login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'chave_secreta_padrao_fase_ma');
      await jwtVerify(token, secret);
      // Se está logado e tenta ir pro login, manda pro Dashboard
      if (isLoginPage) return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Token inválido/expirado
      request.cookies.delete('fase_rh_token');
      if (!isLoginPage) return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Protege o sistema inteiro, exceto imagens e arquivos estáticos
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};