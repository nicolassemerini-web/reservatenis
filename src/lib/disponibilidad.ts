const ZONA_HORARIA = "Europe/Madrid";
const DIAS_A_MOSTRAR = 7;

export type Rango = { inicio: number; fin: number };

export type HorarioSemanalFila = {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
};

export type ExcepcionFila = {
  fecha: string;
  cerrado: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
};

export type BloqueoFila = {
  fecha: string;
  dia_completo: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
};

export type ReservaExistente = {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export type Turno = { inicio: string; fin: string };

export type DisponibilidadDia = {
  fecha: string;
  diaSemana: number;
  turnos: Turno[];
};

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function obtenerFechaYHoraActualMadrid(ahora: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const partes = formatter.formatToParts(ahora);
  const obtener = (tipo: string) =>
    partes.find((p) => p.type === tipo)?.value ?? "00";

  return {
    fecha: `${obtener("year")}-${obtener("month")}-${obtener("day")}`,
    minutos: Number(obtener("hour")) * 60 + Number(obtener("minute")),
  };
}

export function sumarDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

export function diaSemanaDe(fechaISO: string): number {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function restarRango(rangos: Rango[], aQuitar: Rango): Rango[] {
  const resultado: Rango[] = [];

  for (const r of rangos) {
    if (aQuitar.fin <= r.inicio || aQuitar.inicio >= r.fin) {
      resultado.push(r);
      continue;
    }
    if (aQuitar.inicio > r.inicio) {
      resultado.push({ inicio: r.inicio, fin: Math.min(aQuitar.inicio, r.fin) });
    }
    if (aQuitar.fin < r.fin) {
      resultado.push({ inicio: Math.max(aQuitar.fin, r.inicio), fin: r.fin });
    }
  }

  return resultado.filter((r) => r.fin > r.inicio);
}

export function calcularDisponibilidad(params: {
  horarioSemanal: HorarioSemanalFila[];
  excepciones: ExcepcionFila[];
  bloqueos: BloqueoFila[];
  reservasExistentes: ReservaExistente[];
  duracionTurnoMinutos: number;
  fechaHoy?: string;
  minutosAhora?: number;
}): DisponibilidadDia[] {
  const { fecha: fechaHoyCalculada, minutos: minutosAhoraCalculados } =
    obtenerFechaYHoraActualMadrid();
  const fechaHoy = params.fechaHoy ?? fechaHoyCalculada;
  const minutosAhora = params.minutosAhora ?? minutosAhoraCalculados;

  const dias: DisponibilidadDia[] = [];

  for (let i = 0; i < DIAS_A_MOSTRAR; i++) {
    const fecha = sumarDias(fechaHoy, i);
    const diaSemana = diaSemanaDe(fecha);

    const excepcion = params.excepciones.find((e) => e.fecha === fecha);

    let rangos: Rango[];
    if (excepcion) {
      rangos = excepcion.cerrado
        ? []
        : [
            {
              inicio: horaAMinutos(excepcion.hora_inicio!),
              fin: horaAMinutos(excepcion.hora_fin!),
            },
          ];
    } else {
      rangos = params.horarioSemanal
        .filter((h) => h.dia_semana === diaSemana && h.activo)
        .map((h) => ({
          inicio: horaAMinutos(h.hora_inicio),
          fin: horaAMinutos(h.hora_fin),
        }));
    }

    for (const bloqueo of params.bloqueos.filter((b) => b.fecha === fecha)) {
      if (bloqueo.dia_completo) {
        rangos = [];
      } else {
        rangos = restarRango(rangos, {
          inicio: horaAMinutos(bloqueo.hora_inicio!),
          fin: horaAMinutos(bloqueo.hora_fin!),
        });
      }
    }

    const reservasDelDia = params.reservasExistentes.filter(
      (r) => r.fecha === fecha,
    );

    const turnos: Turno[] = [];
    for (const rango of rangos) {
      for (
        let inicio = rango.inicio;
        inicio + params.duracionTurnoMinutos <= rango.fin;
        inicio += params.duracionTurnoMinutos
      ) {
        const fin = inicio + params.duracionTurnoMinutos;

        if (fecha === fechaHoy && inicio <= minutosAhora) {
          continue;
        }

        const ocupado = reservasDelDia.some(
          (r) =>
            inicio < horaAMinutos(r.hora_fin) && fin > horaAMinutos(r.hora_inicio),
        );
        if (ocupado) {
          continue;
        }

        turnos.push({ inicio: minutosAHora(inicio), fin: minutosAHora(fin) });
      }
    }

    dias.push({ fecha, diaSemana, turnos });
  }

  return dias;
}
