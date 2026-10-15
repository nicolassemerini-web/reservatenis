"use client";

import { useState } from "react";

export function CampoFechaConToggle({
  idPrefijo,
  nombreCheckbox,
  etiquetaCheckbox,
  nombreDesde,
  nombreHasta,
  claseCasilla,
  claseCampo,
  claseEtiqueta,
  claseInput,
}: {
  idPrefijo: string;
  nombreCheckbox: string;
  etiquetaCheckbox: string;
  nombreDesde: string;
  nombreHasta: string;
  claseCasilla: string;
  claseCampo: string;
  claseEtiqueta: string;
  claseInput: string;
}) {
  const [marcado, setMarcado] = useState(false);
  const idDesde = `${idPrefijo}-${nombreDesde}`;
  const idHasta = `${idPrefijo}-${nombreHasta}`;

  return (
    <>
      <label className={claseCasilla}>
        <input
          type="checkbox"
          name={nombreCheckbox}
          checked={marcado}
          onChange={(e) => setMarcado(e.target.checked)}
        />
        {etiquetaCheckbox}
      </label>

      <div className={claseCampo}>
        <label className={claseEtiqueta} htmlFor={idDesde}>
          Desde
        </label>
        <input
          id={idDesde}
          name={nombreDesde}
          type="time"
          className={claseInput}
          disabled={marcado}
          required={!marcado}
        />
      </div>

      <div className={claseCampo}>
        <label className={claseEtiqueta} htmlFor={idHasta}>
          Hasta
        </label>
        <input
          id={idHasta}
          name={nombreHasta}
          type="time"
          className={claseInput}
          disabled={marcado}
          required={!marcado}
        />
      </div>
    </>
  );
}
