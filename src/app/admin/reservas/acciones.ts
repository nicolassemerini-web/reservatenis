"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function cancelarReserva(formData: FormData) {
  const supabase = await crearClienteServidor();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("reservas")
    .update({ estado: "cancelada", cancelado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/reservas");
}

export async function eliminarReserva(formData: FormData) {
  const supabase = await crearClienteServidor();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("reservas").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/reservas");
}
