import Link from "next/link";
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

export default async function Confirmacion({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    fecha?: string;
    inicio?: string;
    fin?: string;
    nombre?: string;
  }>;
}) {
  const parametros = await searchParams;

  if (!parametros.token || !parametros.fecha) {
    return (
      <main>
        <section className={styles.tarjeta}>
          <h1 className={styles.titulo}>No encontramos esa confirmación</h1>
          <p>
            <Link href="/reservar">Volver a reservar</Link>
          </p>
        </section>
      </main>
    );
  }

  const enlaceCancelacion = `/cancelar/${parametros.token}`;

  return (
    <main>
      <section className={styles.tarjeta}>
        <h1 className={styles.titulo}>Reserva confirmada</h1>
        <p className={styles.detalle}>
          {parametros.nombre}, tu turno es el{" "}
          <strong>{formatearFecha(parametros.fecha)}</strong> de{" "}
          <strong>
            {parametros.inicio} a {parametros.fin}
          </strong>
          .
        </p>

        <div className={styles.cajaEnlace}>
          <p className={styles.cajaEnlaceTitulo}>
            Guarda este enlace para cancelar la reserva si lo necesitas:
          </p>
          <Link href={enlaceCancelacion} className={styles.enlace}>
            {enlaceCancelacion}
          </Link>
        </div>

        <p className={styles.volver}>
          <Link href="/">Volver al inicio</Link>
        </p>
      </section>
    </main>
  );
}
