"use client";

import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function BotonCerrarSesion() {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={cerrarSesion}>
      Cerrar sesión
    </button>
  );
}
