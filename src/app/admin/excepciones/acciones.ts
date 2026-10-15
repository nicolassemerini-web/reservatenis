"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import {
  buscarReservasFueraDeRango,
  buscarReservasDentroDeRango,
} from "@/lib/avisos";
import type { EstadoAviso } from "@/components/BotonConAviso";

export async function crearExcepcion(
  _estadoPrevio: EstadoAviso,
  formData: FormData,
): Promise<EstadoAviso> {
  const fecha = String(formData.get("fecha"));
  const cerrado = formData.get("cerrado") === "on";
  const horaInicio = String(formData.get("hora_inicio") || "");
  const horaFin = String(formData.get("hora_fin") || "");
  const motivo = String(formData.get("motivo") || "");
  const confirmar = formData.get("confirmar") === "true";

  const supabase = await crearClienteServidor();

  if (!confirmar) {
    const reservas = await buscarReservasFueraDeRango(
      supabase,
      fecha,
      cerrado ? null : { horaInicio, horaFin },
    );
    if (reservas.length > 0) {
      return { ok: false, reservas };
    }
  }

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
  return { ok: true };
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

export async function crearBloqueo(
  _estadoPrevio: EstadoAviso,
  formData: FormData,
): Promise<EstadoAviso> {
  const fecha = String(formData.get("fecha"));
  const diaCompleto = formData.get("dia_completo") === "on";
  const horaInicio = String(formData.get("hora_inicio") || "");
  const horaFin = String(formData.get("hora_fin") || "");
  const motivo = String(formData.get("motivo") || "");
  const confirmar = formData.get("confirmar") === "true";

  const supabase = await crearClienteServidor();

  if (!confirmar) {
    const reservas = await buscarReservasDentroDeRango(
      supabase,
      fecha,
      diaCompleto ? null : { horaInicio, horaFin },
    );
    if (reservas.length > 0) {
      return { ok: false, reservas };
    }
  }

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
  return { ok: true };
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
