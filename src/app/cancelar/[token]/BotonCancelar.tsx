"use client";

import { useActionState } from "react";
import { confirmarCancelacion } from "./acciones";
import styles from "./page.module.css";

export function BotonCancelar({ token }: { token: string }) {
  const [estado, formAction, enviando] = useActionState(
    confirmarCancelacion,
    null,
  );

  if (estado?.ok) {
    return <p className={styles.mensajeExito}>{estado.mensaje}</p>;
  }

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className={styles.boton} disabled={enviando}>
          {enviando ? "Cancelando..." : "Cancelar esta reserva"}
        </button>
      </form>
      {estado && !estado.ok && (
        <p className={styles.mensajeError}>{estado.mensaje}</p>
      )}
    </>
  );
}
