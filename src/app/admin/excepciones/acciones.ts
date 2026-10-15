"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function crearExcepcion(formData: FormData) {
  const supabase = await crearClienteServidor();

  const fecha = String(formData.get("fecha"));
  const cerrado = formData.get("cerrado") === "on";
  const horaInicio = String(formData.get("hora_inicio") || "");
  const horaFin = String(formData.get("hora_fin") || "");
  const motivo = String(formData.get("motivo") || "");

  const { error } = await supabase.from("excepciones_fecha").insert({
    fecha,
    cerrado,
    hora_inicio: cerrado ? null : horaInicio || null,
    hora_fin: cerrado ? null : horaFin || null,
    motivo: motivo || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/excepciones");
}

export async function eliminarExcepcion(formData: FormData) {
  const supabase = await crearClienteServidor();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("excepciones_fecha").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/excepciones");
}

export async function crearBloqueo(formData: FormData) {
  const supabase = await crearClienteServidor();

  const fecha = String(formData.get("fecha"));
  const diaCompleto = formData.get("dia_completo") === "on";
  const horaInicio = String(formData.get("hora_inicio") || "");
  const horaFin = String(formData.get("hora_fin") || "");
  const motivo = String(formData.get("motivo") || "");

  const { error } = await supabase.from("bloqueos").insert({
    fecha,
    dia_completo: diaCompleto,
    hora_inicio: diaCompleto ? null : horaInicio || null,
    hora_fin: diaCompleto ? null : horaFin || null,
    motivo: motivo || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/excepciones");
}

export async function eliminarBloqueo(formData: FormData) {
  const supabase = await crearClienteServidor();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("bloqueos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/excepciones");
}
