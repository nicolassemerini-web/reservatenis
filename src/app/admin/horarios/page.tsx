import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearFranja, eliminarFranja, alternarActivo } from "./acciones";
import { BotonConAviso } from "@/components/BotonConAviso";
import styles from "../admin.module.css";

const NOMBRES_DIA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default async function Horarios() {
  const supabase = await crearClienteServidor();
  const { data: franjas, error } = await supabase
    .from("horario_semanal")
    .select("*")
    .order("dia_semana")
    .order("hora_inicio");

  return (
    <main>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Horarios semanales</h1>
        <Link className={styles.volver} href="/admin">
          Volver a administración
        </Link>
      </header>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Franjas de apertura</h2>

        {error && <p className={styles.vacio}>Error al cargar: {error.message}</p>}

        {!error && (!franjas || franjas.length === 0) && (
          <p className={styles.vacio}>
            Todavía no hay ninguna franja de apertura configurada. La pista
            aparecerá como cerrada todos los días hasta que añadas alguna.
          </p>
        )}

        {!error && franjas && franjas.length > 0 && (
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Día</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {franjas.map((franja) => (
                <tr key={franja.id}>
                  <td>{NOMBRES_DIA[franja.dia_semana]}</td>
                  <td>{franja.hora_inicio.slice(0, 5)}</td>
                  <td>{franja.hora_fin.slice(0, 5)}</td>
                  <td>
                    <BotonConAviso
                      accion={alternarActivo}
                      camposOcultos={{
                        id: franja.id,
                        activo: String(franja.activo),
                        dia_semana: String(franja.dia_semana),
                        hora_inicio: franja.hora_inicio,
                        hora_fin: franja.hora_fin,
                      }}
                      etiqueta={
                        franja.activo ? "Activa (desactivar)" : "Inactiva (activar)"
                      }
                      etiquetaEnviando="Guardando..."
                      claseBoton={styles.botonSecundario}
                      claseAviso={styles.aviso}
                      claseAvisoLista={styles.avisoLista}
                      claseAvisoBoton={styles.avisoBoton}
                    />
                  </td>
                  <td>
                    <BotonConAviso
                      accion={eliminarFranja}
                      camposOcultos={{
                        id: franja.id,
                        dia_semana: String(franja.dia_semana),
                        hora_inicio: franja.hora_inicio,
                        hora_fin: franja.hora_fin,
                      }}
                      etiqueta="Eliminar"
                      etiquetaEnviando="Eliminando..."
                      claseBoton={styles.botonPeligro}
                      claseAviso={styles.aviso}
                      claseAvisoLista={styles.avisoLista}
                      claseAvisoBoton={styles.avisoBoton}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form action={crearFranja} className={styles.formulario}>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="dia_semana">
              Día
            </label>
            <select id="dia_semana" name="dia_semana" className={styles.select} required>
              {NOMBRES_DIA.map((nombre, indice) => (
                <option key={indice} value={indice}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="hora_inicio">
              Desde
            </label>
            <input
              id="hora_inicio"
              name="hora_inicio"
              type="time"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="hora_fin">
              Hasta
            </label>
            <input
              id="hora_fin"
              name="hora_fin"
              type="time"
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.boton}>
            Añadir franja
          </button>
        </form>

        <p className={styles.ayuda}>
          Puedes añadir varias franjas al mismo día (por ejemplo, mañana y
          tarde con un descanso entre medias).
        </p>
      </section>
    </main>
  );
}
