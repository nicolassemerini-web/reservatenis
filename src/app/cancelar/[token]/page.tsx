import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { BotonCancelar } from "./BotonCancelar";
import styles from "./page.module.css";

const NOMBRES_DIA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function formatearFecha(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const diaSemana = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${NOMBRES_DIA[diaSemana]} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export default async function Cancelar({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.rpc("obtener_reserva_por_token", {
    p_token: token,
  });
  const reserva = data?.[0];

  if (!reserva) {
    return (
      <main>
        <section className={styles.tarjeta}>
          <h1 className={styles.titulo}>Enlace no válido</h1>
          <p>Este enlace de cancelación no corresponde a ninguna reserva.</p>
          <p className={styles.volver}>
            <Link href="/">Volver al inicio</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className={styles.tarjeta}>
        <h1 className={styles.titulo}>Cancelar reserva</h1>
        <p className={styles.detalle}>
          {reserva.nombre_contacto}, tu turno es el{" "}
          <strong>{formatearFecha(reserva.fecha)}</strong> de{" "}
          <strong>
            {reserva.hora_inicio.slice(0, 5)} a {reserva.hora_fin.slice(0, 5)}
          </strong>
          .
        </p>

        {reserva.estado === "cancelada" ? (
          <p className={styles.mensajeExito}>Esta reserva ya estaba cancelada.</p>
        ) : (
          <BotonCancelar token={token} />
        )}

        <p className={styles.volver}>
          <Link href="/">Volver al inicio</Link>
        </p>
      </section>
    </main>
  );
}
