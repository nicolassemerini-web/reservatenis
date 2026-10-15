import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { CampoFechaConToggle } from "@/components/CampoFechaConToggle";
import {
  crearExcepcion,
  eliminarExcepcion,
  crearBloqueo,
  eliminarBloqueo,
} from "./acciones";
import styles from "../admin.module.css";

function formatearFecha(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function Excepciones() {
  const supabase = await crearClienteServidor();

  const [{ data: excepciones, error: errorExcepciones }, { data: bloqueos, error: errorBloqueos }] =
    await Promise.all([
      supabase.from("excepciones_fecha").select("*").order("fecha"),
      supabase.from("bloqueos").select("*").order("fecha"),
    ]);

  return (
    <main>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Excepciones y bloqueos</h1>
        <Link className={styles.volver} href="/admin">
          Volver a administración
        </Link>
      </header>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          Excepciones de fecha (cierres u horarios especiales)
        </h2>

        {errorExcepciones && (
          <p className={styles.vacio}>Error al cargar: {errorExcepciones.message}</p>
        )}

        {!errorExcepciones && (!excepciones || excepciones.length === 0) && (
          <p className={styles.vacio}>No hay excepciones configuradas.</p>
        )}

        {!errorExcepciones && excepciones && excepciones.length > 0 && (
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Horario</th>
                <th>Motivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {excepciones.map((excepcion) => (
                <tr key={excepcion.id}>
                  <td>{formatearFecha(excepcion.fecha)}</td>
                  <td>{excepcion.cerrado ? "Cerrado" : "Horario especial"}</td>
                  <td>
                    {excepcion.cerrado
                      ? "—"
                      : `${excepcion.hora_inicio?.slice(0, 5)} - ${excepcion.hora_fin?.slice(0, 5)}`}
                  </td>
                  <td>{excepcion.motivo || "—"}</td>
                  <td>
                    <form action={eliminarExcepcion}>
                      <input type="hidden" name="id" value={excepcion.id} />
                      <button type="submit" className={styles.botonPeligro}>
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={crearExcepcion} className={styles.formulario}>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="fecha-excepcion">
              Fecha
            </label>
            <input
              id="fecha-excepcion"
              name="fecha"
              type="date"
              className={styles.input}
              required
            />
          </div>

          <CampoFechaConToggle
            idPrefijo="excepcion"
            nombreCheckbox="cerrado"
            etiquetaCheckbox="Cerrado todo el día"
            nombreDesde="hora_inicio"
            nombreHasta="hora_fin"
            claseCasilla={styles.checkboxCampo}
            claseCampo={styles.campo}
            claseEtiqueta={styles.etiqueta}
            claseInput={styles.input}
          />

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
            />
          </div>

          <button type="submit" className={styles.boton}>
            Añadir excepción
          </button>
        </form>
      </section>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>
          Bloqueos puntuales (mantenimiento, etc.)
        </h2>

        {errorBloqueos && (
          <p className={styles.vacio}>Error al cargar: {errorBloqueos.message}</p>
        )}

        {!errorBloqueos && (!bloqueos || bloqueos.length === 0) && (
          <p className={styles.vacio}>No hay bloqueos configurados.</p>
        )}

        {!errorBloqueos && bloqueos && bloqueos.length > 0 && (
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Alcance</th>
                <th>Horario</th>
                <th>Motivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bloqueos.map((bloqueo) => (
                <tr key={bloqueo.id}>
                  <td>{formatearFecha(bloqueo.fecha)}</td>
                  <td>{bloqueo.dia_completo ? "Día completo" : "Horario puntual"}</td>
                  <td>
                    {bloqueo.dia_completo
                      ? "—"
                      : `${bloqueo.hora_inicio?.slice(0, 5)} - ${bloqueo.hora_fin?.slice(0, 5)}`}
                  </td>
                  <td>{bloqueo.motivo || "—"}</td>
                  <td>
                    <form action={eliminarBloqueo}>
                      <input type="hidden" name="id" value={bloqueo.id} />
                      <button type="submit" className={styles.botonPeligro}>
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={crearBloqueo} className={styles.formulario}>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="fecha-bloqueo">
              Fecha
            </label>
            <input
              id="fecha-bloqueo"
              name="fecha"
              type="date"
              className={styles.input}
              required
            />
          </div>

          <CampoFechaConToggle
            idPrefijo="bloqueo"
            nombreCheckbox="dia_completo"
            etiquetaCheckbox="Jornada completa"
            nombreDesde="hora_inicio"
            nombreHasta="hora_fin"
            claseCasilla={styles.checkboxCampo}
            claseCampo={styles.campo}
            claseEtiqueta={styles.etiqueta}
            claseInput={styles.input}
          />

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
            />
          </div>

          <button type="submit" className={styles.boton}>
            Añadir bloqueo
          </button>
        </form>
      </section>
    </main>
  );
}
