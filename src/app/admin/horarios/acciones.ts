"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function crearFranja(formData: FormData) {
  const supabase = await crearClienteServidor();

  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio"));
  const horaFin = String(formData.get("hora_fin"));

  const { error } = await supabase.from("horario_semanal").insert({
    dia_semana: diaSemana,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/horarios");
}

export async function eliminarFranja(formData: FormData) {
  const supabase = await crearClienteServidor();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("horario_semanal").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/horarios");
}

export async function alternarActivo(formData: FormData) {
  const supabase = await crearClienteServidor();
  const id = String(formData.get("id"));
  const activo = formData.get("activo") === "true";

  const { error } = await supabase
    .from("horario_semanal")
    .update({ activo: !activo })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/horarios");
}
