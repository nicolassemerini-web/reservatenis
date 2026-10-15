"use server";

import { crearClienteServidor } from "@/lib/supabase/server";

export type EstadoCancelacion = { ok: boolean; mensaje: string } | null;

export async function confirmarCancelacion(
  _estadoPrevio: EstadoCancelacion,
  formData: FormData,
): Promise<EstadoCancelacion> {
  const token = String(formData.get("token") || "");

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("cancelar_reserva", {
    p_token: token,
  });

  if (error) {
    return { ok: false, mensaje: "No se pudo procesar la cancelación." };
  }

  const resultado = data?.[0];
  return {
    ok: Boolean(resultado?.ok),
    mensaje: resultado?.mensaje ?? "No se pudo procesar la cancelación.",
  };
}
