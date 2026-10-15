"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";

export type EstadoReserva = { error: string } | null;

export async function crearReserva(
  _estadoPrevio: EstadoReserva,
  formData: FormData,
): Promise<EstadoReserva> {
  const fecha = String(formData.get("fecha") || "");
  const horaInicio = String(formData.get("hora_inicio") || "");
  const horaFin = String(formData.get("hora_fin") || "");
  const nombreContacto = String(formData.get("nombre_contacto") || "").trim();
  const medioContacto = String(formData.get("medio_contacto") || "").trim();

  if (!fecha || !horaInicio || !horaFin) {
    return { error: "Elige primero un turno disponible." };
  }
  if (!nombreContacto || !medioContacto) {
    return { error: "Completa tu nombre y un medio de contacto." };
  }

  const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("reservas").insert({
    fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    nombre_contacto: nombreContacto,
    medio_contacto: medioContacto,
    token_cancelacion: token,
  });

  if (error) {
    if (error.code === "23P01") {
      return {
        error: "Ese turno acaba de ser reservado por otra persona. Elige otro horario.",
      };
    }
    if (error.code === "P0001") {
      return { error: error.message };
    }
    return { error: "No se pudo completar la reserva. Inténtalo de nuevo." };
  }

  const parametros = new URLSearchParams({
    token,
    fecha,
    inicio: horaInicio,
    fin: horaFin,
    nombre: nombreContacto,
  });
  redirect(`/reservar/confirmacion?${parametros.toString()}`);
}
