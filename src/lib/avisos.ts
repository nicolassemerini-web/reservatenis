import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sumarDias,
  diaSemanaDe,
  obtenerFechaYHoraActualMadrid,
  horaAMinutos,
} from "./disponibilidad";

export type ReservaAfectada = {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_contacto: string;
  medio_contacto: string;
};

const COLUMNAS = "fecha,hora_inicio,hora_fin,nombre_contacto,medio_contacto";

async function reservasConfirmadasEnFecha(
  supabase: SupabaseClient,
  fecha: string,
): Promise<ReservaAfectada[]> {
  const { data, error } = await supabase
    .from("reservas")
    .select(COLUMNAS)
    .eq("fecha", fecha)
    .eq("estado", "confirmada");

  if (error || !data) return [];
  return data;
}

/** Reservas de una fecha que quedarían fuera de un nuevo rango horario (o todas, si se cierra el día entero). */
export async function buscarReservasFueraDeRango(
  supabase: SupabaseClient,
  fecha: string,
  rango: { horaInicio: string; horaFin: string } | null,
): Promise<ReservaAfectada[]> {
  const reservas = await reservasConfirmadasEnFecha(supabase, fecha);
  if (!rango) return reservas;

  const inicioMin = horaAMinutos(rango.horaInicio);
  const finMin = horaAMinutos(rango.horaFin);

  return reservas.filter((r) => {
    const ri = horaAMinutos(r.hora_inicio);
    const rf = horaAMinutos(r.hora_fin);
    return ri < inicioMin || rf > finMin;
  });
}

/** Reservas de una fecha que se solapan con un rango que se va a bloquear (o todas, si se bloquea el día entero). */
export async function buscarReservasDentroDeRango(
  supabase: SupabaseClient,
  fecha: string,
  rango: { horaInicio: string; horaFin: string } | null,
): Promise<ReservaAfectada[]> {
  const reservas = await reservasConfirmadasEnFecha(supabase, fecha);
  if (!rango) return reservas;

  const inicioMin = horaAMinutos(rango.horaInicio);
  const finMin = horaAMinutos(rango.horaFin);

  return reservas.filter((r) => {
    const ri = horaAMinutos(r.hora_inicio);
    const rf = horaAMinutos(r.hora_fin);
    return ri < finMin && rf > inicioMin;
  });
}

/** Reservas futuras (próximos 7 días, que es la única ventana reservable) que se solapan con una franja semanal que se va a eliminar o desactivar. */
export async function buscarReservasAfectadasPorFranjaSemanal(
  supabase: SupabaseClient,
  diaSemana: number,
  horaInicio: string,
  horaFin: string,
): Promise<ReservaAfectada[]> {
  const { fecha: hoy } = obtenerFechaYHoraActualMadrid();
  const fechas: string[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = sumarDias(hoy, i);
    if (diaSemanaDe(fecha) === diaSemana) fechas.push(fecha);
  }
  if (fechas.length === 0) return [];

  const { data, error } = await supabase
    .from("reservas")
    .select(COLUMNAS)
    .in("fecha", fechas)
    .eq("estado", "confirmada");

  if (error || !data) return [];

  const inicioMin = horaAMinutos(horaInicio);
  const finMin = horaAMinutos(horaFin);

  return data.filter((r) => {
    const ri = horaAMinutos(r.hora_inicio);
    const rf = horaAMinutos(r.hora_fin);
    return ri < finMin && rf > inicioMin;
  });
}
