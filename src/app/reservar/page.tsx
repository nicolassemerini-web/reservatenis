import { crearClienteServidor } from "@/lib/supabase/server";
import { calcularDisponibilidad } from "@/lib/disponibilidad";
import { FormularioReserva } from "./FormularioReserva";
import styles from "./page.module.css";

export default async function Reservar() {
  const supabase = await crearClienteServidor();

  const [
    { data: horarioSemanal },
    { data: excepciones },
    { data: bloqueos },
    { data: reservasExistentes },
    { data: configuracion },
  ] = await Promise.all([
    supabase.from("horario_semanal").select("dia_semana,hora_inicio,hora_fin,activo"),
    supabase.from("excepciones_fecha").select("fecha,cerrado,hora_inicio,hora_fin"),
    supabase.from("bloqueos").select("fecha,dia_completo,hora_inicio,hora_fin"),
    supabase.from("reservas_disponibilidad").select("fecha,hora_inicio,hora_fin"),
    supabase.from("configuracion").select("duracion_turno_minutos").eq("id", 1).single(),
  ]);

  const dias = calcularDisponibilidad({
    horarioSemanal: horarioSemanal ?? [],
    excepciones: excepciones ?? [],
    bloqueos: bloqueos ?? [],
    reservasExistentes: reservasExistentes ?? [],
    duracionTurnoMinutos: configuracion?.duracion_turno_minutos ?? 60,
  });

  return (
    <main>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Reservar pista</h1>
        <p className={styles.subtitulo}>
          Elige un día y un turno dentro de los próximos siete días.
        </p>
      </header>

      <FormularioReserva dias={dias} />
    </main>
  );
}
