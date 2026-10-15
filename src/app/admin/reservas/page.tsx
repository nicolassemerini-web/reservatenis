import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { cancelarReserva, eliminarReserva } from "./acciones";
import styles from "../admin.module.css";

function formatearFecha(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function Reservas() {
  const supabase = await crearClienteServidor();
  const { data: reservas, error } = await supabase
    .from("reservas")
    .select("*")
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: false });

  return (
    <main>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Reservas</h1>
        <Link className={styles.volver} href="/admin">
          Volver a administración
        </Link>
      </header>

      <section className={styles.seccion}>
        {error && <p className={styles.vacio}>Error al cargar: {error.message}</p>}

        {!error && (!reservas || reservas.length === 0) && (
          <p className={styles.vacio}>Todavía no hay ninguna reserva.</p>
        )}

        {!error && reservas && reservas.length > 0 && (
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{formatearFecha(reserva.fecha)}</td>
                  <td>
                    {reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}
                  </td>
                  <td>{reserva.nombre_contacto}</td>
                  <td>{reserva.medio_contacto}</td>
                  <td>
                    {reserva.estado === "confirmada" ? "Confirmada" : "Cancelada"}
                  </td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    {reserva.estado === "confirmada" && (
                      <form action={cancelarReserva}>
                        <input type="hidden" name="id" value={reserva.id} />
                        <button type="submit" className={styles.botonSecundario}>
                          Cancelar
                        </button>
                      </form>
                    )}
                    <form action={eliminarReserva}>
                      <input type="hidden" name="id" value={reserva.id} />
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
      </section>
    </main>
  );
}
