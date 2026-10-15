import { NextResponse, type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { respuesta, user } = await actualizarSesion(request);

  const { pathname } = request.nextUrl;
  const esRutaAdmin = pathname.startsWith("/admin");
  const esPaginaLogin = pathname === "/admin/login";

  if (esRutaAdmin && !esPaginaLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (esPaginaLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return respuesta;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
