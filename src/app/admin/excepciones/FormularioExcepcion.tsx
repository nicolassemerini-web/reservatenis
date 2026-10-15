"use client";

import { useActionState, useState } from "react";
import { crearExcepcion } from "./acciones";
import styles from "../admin.module.css";

export function FormularioExcepcion() {
  const [estado, formAction, enviando] = useActionState(crearExcepcion, null);

  const [fecha, setFecha] = useState("");
  const [cerrado, setCerrado] = useState(false);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");

  // Limpia el formulario cuando la accion termina en exito. Se ajusta
  // durante el renderizado (no en un efecto) para evitar un repintado
  // adicional, siguiendo el patron recomendado por React para resetear
  // estado cuando cambia una entrada externa.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado?.ok) {
      setFecha("");
      setCerrado(false);
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
    }
  }

  const hayAviso = estado !== null && !estado.ok;

  return (
    <>
      {hayAviso && (
        <div className={styles.aviso}>
          <p>
            Esto afecta a {estado.reservas.length} reserva
            {estado.reservas.length === 1 ? "" : "s"} ya confirmada
            {estado.reservas.length === 1 ? "" : "s"}:
          </p>
          <ul className={styles.avisoLista}>
            {estado.reservas.map((r, indice) => (
              <li key={indice}>
                {r.fecha} {r.hora_inicio.slice(0, 5)}-{r.hora_fin.slice(0, 5)} —{" "}
                {r.nombre_contacto} ({r.medio_contacto})
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={formAction} className={styles.formulario}>
        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="fecha-excepcion">
            Fecha
          </label>
          <input
            id="fecha-excepcion"
            name="fecha"
            type="date"
            className={styles.input}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        <label className={styles.checkboxCampo}>
          <input
            type="checkbox"
            name="cerrado"
            checked={cerrado}
            onChange={(e) => setCerrado(e.target.checked)}
          />
          Cerrado todo el día
        </label>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="hora_inicio-excepcion">
            Desde
          </label>
          <input
            id="hora_inicio-excepcion"
            name="hora_inicio"
            type="time"
            className={styles.input}
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            disabled={cerrado}
            required={!cerrado}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="hora_fin-excepcion">
            Hasta
          </label>
          <input
            id="hora_fin-excepcion"
            name="hora_fin"
            type="time"
            className={styles.input}
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            disabled={cerrado}
            required={!cerrado}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="motivo-excepcion">
            Motivo (opcional)
          </label>
          <input
            id="motivo-excepcion"
            name="motivo"
            type="text"
            className={styles.input}
            placeholder="Festivo local"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        {hayAviso && <input type="hidden" name="confirmar" value="true" />}

        <button type="submit" className={styles.boton} disabled={enviando}>
          {hayAviso
            ? "Confirmar de todas formas"
            : enviando
              ? "Guardando..."
              : "Añadir excepción"}
        </button>
      </form>
    </>
  );
}
