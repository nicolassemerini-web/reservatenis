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
        <div className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Horarios semanales</h2>
          <p className={styles.tarjetaDescripcion}>
            Próximamente: configurar los días y franjas de apertura.
          </p>
        </div>

        <div className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Excepciones y bloqueos</h2>
          <p className={styles.tarjetaDescripcion}>
            Próximamente: cerrar fechas concretas o bloquear turnos puntuales.
          </p>
        </div>

        <div className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Reservas</h2>
          <p className={styles.tarjetaDescripcion}>
            Próximamente: consultar, modificar y cancelar reservas.
          </p>
        </div>

        <div className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Configuración</h2>
          <p className={styles.tarjetaDescripcion}>
            Próximamente: duración de los turnos y plazo de cancelación.
          </p>
        </div>
      </section>
    </main>
  );
}
