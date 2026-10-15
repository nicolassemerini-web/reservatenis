import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { actualizarConfiguracion } from "./acciones";
import styles from "../admin.module.css";

export default async function Configuracion() {
  const supabase = await crearClienteServidor();
  const { data: configuracion, error } = await supabase
    .from("configuracion")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <main>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Configuración</h1>
        <Link className={styles.volver} href="/admin">
          Volver a administración
        </Link>
      </header>

      <section className={styles.seccion}>
        {error && <p className={styles.vacio}>Error al cargar: {error.message}</p>}

        {!error && configuracion && (
          <form action={actualizarConfiguracion} className={styles.formulario}>
            <div className={styles.campo}>
              <label className={styles.etiqueta} htmlFor="duracion_turno_minutos">
                Duración de cada turno (minutos)
              </label>
              <input
                id="duracion_turno_minutos"
                name="duracion_turno_minutos"
                type="number"
                min={1}
                className={styles.input}
                defaultValue={configuracion.duracion_turno_minutos}
                required
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.etiqueta} htmlFor="plazo_cancelacion_horas">
                Plazo límite de cancelación (horas antes del turno)
              </label>
              <input
                id="plazo_cancelacion_horas"
                name="plazo_cancelacion_horas"
                type="number"
                min={0}
                className={styles.input}
                defaultValue={configuracion.plazo_cancelacion_horas}
                required
              />
            </div>

            <button type="submit" className={styles.boton}>
              Guardar
            </button>
          </form>
        )}

        <p className={styles.ayuda}>
          Cambiar la duración de los turnos no modifica las reservas ya
          existentes, solo los huecos que se calculen a partir de ahora.
        </p>
      </section>
    </main>
  );
}
