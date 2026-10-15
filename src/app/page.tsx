import Link from "next/link";
import styles from "./page.module.css";

export default function Inicio() {
  return (
    <main>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Reservas Pista de Tenis</h1>
        <p className={styles.subtitulo}>
          Consulta la disponibilidad y reserva tu turno de forma gratuita
        </p>
      </header>

      <nav className={styles.navegacion}>
        <Link href="/reservar" className={styles.tarjeta}>
          <span className={styles.tarjetaTitulo}>Reservar pista</span>
          <span className={styles.tarjetaDescripcion}>
            Consulta los horarios disponibles de los próximos siete días y
            reserva tu turno sin necesidad de crear una cuenta.
          </span>
        </Link>

        <Link href="/admin" className={styles.tarjeta}>
          <span className={styles.tarjetaTitulo}>Administración</span>
          <span className={styles.tarjetaDescripcion}>
            Acceso privado para gestionar horarios, excepciones y reservas.
          </span>
        </Link>
      </nav>

      <footer className={styles.pie}>
        Zona horaria: Europe/Madrid
      </footer>
    </main>
  );
}
