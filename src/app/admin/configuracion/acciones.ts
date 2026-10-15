"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function actualizarConfiguracion(formData: FormData) {
  const supabase = await crearClienteServidor();

  const duracionTurnoMinutos = Number(formData.get("duracion_turno_minutos"));
  const plazoCancelacionHoras = Number(formData.get("plazo_cancelacion_horas"));

  const { error } = await supabase
    .from("configuracion")
    .update({
      duracion_turno_minutos: duracionTurnoMinutos,
      plazo_cancelacion_horas: plazoCancelacionHoras,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/configuracion");
}
