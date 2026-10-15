"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { buscarReservasAfectadasPorFranjaSemanal } from "@/lib/avisos";
import type { EstadoAviso } from "@/components/BotonConAviso";

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

export async function eliminarFranja(
  _estadoPrevio: EstadoAviso,
  formData: FormData,
): Promise<EstadoAviso> {
  const id = String(formData.get("id"));
  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio"));
  const horaFin = String(formData.get("hora_fin"));
  const confirmar = formData.get("confirmar") === "true";

  const supabase = await crearClienteServidor();

  if (!confirmar) {
    const reservas = await buscarReservasAfectadasPorFranjaSemanal(
      supabase,
      diaSemana,
      horaInicio,
      horaFin,
    );
    if (reservas.length > 0) {
      return { ok: false, reservas };
    }
  }

  const { error } = await supabase.from("horario_semanal").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/horarios");
  return { ok: true };
}

export async function alternarActivo(
  _estadoPrevio: EstadoAviso,
  formData: FormData,
): Promise<EstadoAviso> {
  const id = String(formData.get("id"));
  const activo = formData.get("activo") === "true";
  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio"));
  const horaFin = String(formData.get("hora_fin"));
  const confirmar = formData.get("confirmar") === "true";

  const supabase = await crearClienteServidor();

  if (activo && !confirmar) {
    const reservas = await buscarReservasAfectadasPorFranjaSemanal(
      supabase,
      diaSemana,
      horaInicio,
      horaFin,
    );
    if (reservas.length > 0) {
      return { ok: false, reservas };
    }
  }

  const { error } = await supabase
    .from("horario_semanal")
    .update({ activo: !activo })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/horarios");
  return { ok: true };
}
