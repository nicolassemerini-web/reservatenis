import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { BotonCerrarSesion } from "@/components/BotonCerrarSesion";
import styles from "./page.module.css";

export default async function Administracion() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Administración</h1>
          <p className={styles.correo}>{user?.email}</p>
        </div>
        <BotonCerrarSesion />
      </header>

      <section className={styles.secciones}>
        <Link href="/admin/horarios" className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Horarios semanales</h2>
          <p className={styles.tarjetaDescripcion}>
            Configurar los días y franjas de apertura.
          </p>
        </Link>

        <Link href="/admin/excepciones" className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Excepciones y bloqueos</h2>
          <p className={styles.tarjetaDescripcion}>
            Cerrar fechas concretas o bloquear turnos puntuales.
          </p>
        </Link>

        <Link href="/admin/reservas" className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Reservas</h2>
          <p className={styles.tarjetaDescripcion}>
            Consultar, cancelar o eliminar reservas.
          </p>
        </Link>

        <Link href="/admin/configuracion" className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Configuración</h2>
          <p className={styles.tarjetaDescripcion}>
            Duración de los turnos y plazo de cancelación.
          </p>
        </Link>
      </section>
    </main>
  );
}
