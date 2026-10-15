"use client";

import { useActionState, useState } from "react";
import { crearBloqueo } from "./acciones";
import styles from "../admin.module.css";

export function FormularioBloqueo() {
  const [estado, formAction, enviando] = useActionState(crearBloqueo, null);

  const [fecha, setFecha] = useState("");
  const [diaCompleto, setDiaCompleto] = useState(false);
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
      setDiaCompleto(false);
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
          <label className={styles.etiqueta} htmlFor="fecha-bloqueo">
            Fecha
          </label>
          <input
            id="fecha-bloqueo"
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
            name="dia_completo"
            checked={diaCompleto}
            onChange={(e) => setDiaCompleto(e.target.checked)}
          />
          Jornada completa
        </label>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="hora_inicio-bloqueo">
            Desde
          </label>
          <input
            id="hora_inicio-bloqueo"
            name="hora_inicio"
            type="time"
            className={styles.input}
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            disabled={diaCompleto}
            required={!diaCompleto}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="hora_fin-bloqueo">
            Hasta
          </label>
          <input
            id="hora_fin-bloqueo"
            name="hora_fin"
            type="time"
            className={styles.input}
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            disabled={diaCompleto}
            required={!diaCompleto}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="motivo-bloqueo">
            Motivo (opcional)
          </label>
          <input
            id="motivo-bloqueo"
            name="motivo"
            type="text"
            className={styles.input}
            placeholder="Mantenimiento de la pista"
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
              : "Añadir bloqueo"}
        </button>
      </form>
    </>
  );
}
