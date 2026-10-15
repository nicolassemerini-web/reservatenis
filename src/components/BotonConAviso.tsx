"use client";

import { useActionState } from "react";
import type { ReservaAfectada } from "@/lib/avisos";

export type EstadoAviso =
  | null
  | { ok: true }
  | { ok: false; reservas: ReservaAfectada[] };

export function BotonConAviso({
  accion,
  camposOcultos,
  etiqueta,
  etiquetaEnviando,
  claseBoton,
  claseAviso,
  claseAvisoLista,
  claseAvisoBoton,
}: {
  accion: (
    estadoPrevio: EstadoAviso,
    formData: FormData,
  ) => Promise<EstadoAviso>;
  camposOcultos: Record<string, string>;
  etiqueta: string;
  etiquetaEnviando: string;
  claseBoton: string;
  claseAviso: string;
  claseAvisoLista: string;
  claseAvisoBoton: string;
}) {
  const [estado, formAction, enviando] = useActionState(accion, null);

  if (estado && !estado.ok) {
    return (
      <div className={claseAviso}>
        <p>
          Esto afecta a {estado.reservas.length} reserva
          {estado.reservas.length === 1 ? "" : "s"} ya confirmada
          {estado.reservas.length === 1 ? "" : "s"}:
        </p>
        <ul className={claseAvisoLista}>
          {estado.reservas.map((r, indice) => (
            <li key={indice}>
              {r.fecha} {r.hora_inicio.slice(0, 5)}-{r.hora_fin.slice(0, 5)} —{" "}
              {r.nombre_contacto} ({r.medio_contacto})
            </li>
          ))}
        </ul>
        <form action={formAction}>
          {Object.entries(camposOcultos).map(([nombre, valor]) => (
            <input key={nombre} type="hidden" name={nombre} value={valor} />
          ))}
          <input type="hidden" name="confirmar" value="true" />
          <button type="submit" className={claseAvisoBoton} disabled={enviando}>
            {enviando ? etiquetaEnviando : "Continuar de todas formas"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {Object.entries(camposOcultos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <button type="submit" className={claseBoton} disabled={enviando}>
        {enviando ? etiquetaEnviando : etiqueta}
      </button>
    </form>
  );
}
