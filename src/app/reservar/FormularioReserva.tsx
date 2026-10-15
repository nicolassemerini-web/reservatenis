"use client";

import { useActionState, useState } from "react";
import type { DisponibilidadDia } from "@/lib/disponibilidad";
import { crearReserva } from "./acciones";
import styles from "./page.module.css";

const NOMBRES_DIA_CORTOS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function formatearEtiquetaDia(fecha: string, diaSemana: number) {
  const [, mes, dia] = fecha.split("-");
  return `${NOMBRES_DIA_CORTOS[diaSemana]} ${dia}/${mes}`;
}

export function FormularioReserva({ dias }: { dias: DisponibilidadDia[] }) {
  const [indiceDia, setIndiceDia] = useState(0);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<{
    inicio: string;
    fin: string;
  } | null>(null);
  const [estado, formAction, enviando] = useActionState(crearReserva, null);
  const [nombreContacto, setNombreContacto] = useState("");
  const [medioContacto, setMedioContacto] = useState("");

  const diaActivo = dias[indiceDia];

  function seleccionarDia(indice: number) {
    setIndiceDia(indice);
    setTurnoSeleccionado(null);
  }

  return (
    <>
      <div className={styles.dias}>
        {dias.map((dia, indice) => (
          <button
            key={dia.fecha}
            type="button"
            onClick={() => seleccionarDia(indice)}
            className={
              indice === indiceDia
                ? `${styles.diaBoton} ${styles.diaBotonActivo}`
                : styles.diaBoton
            }
          >
            {formatearEtiquetaDia(dia.fecha, dia.diaSemana)}
          </button>
        ))}
      </div>

      {diaActivo.turnos.length === 0 ? (
        <p className={styles.vacio}>No hay turnos disponibles ese día.</p>
      ) : (
        <div className={styles.turnos}>
          {diaActivo.turnos.map((turno) => (
            <button
              key={turno.inicio}
              type="button"
              onClick={() => setTurnoSeleccionado(turno)}
              className={
                turnoSeleccionado?.inicio === turno.inicio
                  ? `${styles.turnoBoton} ${styles.turnoBotonActivo}`
                  : styles.turnoBoton
              }
            >
              {turno.inicio}
            </button>
          ))}
        </div>
      )}

      {turnoSeleccionado && (
        <form action={formAction} className={styles.formulario}>
          <p className={styles.resumen}>
            {formatearEtiquetaDia(diaActivo.fecha, diaActivo.diaSemana)},{" "}
            {turnoSeleccionado.inicio} - {turnoSeleccionado.fin}
          </p>

          <input type="hidden" name="fecha" value={diaActivo.fecha} />
          <input type="hidden" name="hora_inicio" value={turnoSeleccionado.inicio} />
          <input type="hidden" name="hora_fin" value={turnoSeleccionado.fin} />

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="nombre_contacto">
              Nombre
            </label>
            <input
              id="nombre_contacto"
              name="nombre_contacto"
              type="text"
              className={styles.input}
              value={nombreContacto}
              onChange={(e) => setNombreContacto(e.target.value)}
              required
            />
          </div>

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="medio_contacto">
              Correo electrónico o teléfono
            </label>
            <input
              id="medio_contacto"
              name="medio_contacto"
              type="text"
              className={styles.input}
              value={medioContacto}
              onChange={(e) => setMedioContacto(e.target.value)}
              required
            />
          </div>

          {estado?.error && <p className={styles.error}>{estado.error}</p>}

          <button type="submit" className={styles.boton} disabled={enviando}>
            {enviando ? "Reservando..." : "Confirmar reserva"}
          </button>
        </form>
      )}
    </>
  );
}
