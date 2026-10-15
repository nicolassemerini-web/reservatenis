import { Resend } from "resend";

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

function obtenerUrlBase() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function enviarCorreoConfirmacion(datos: {
  destinatario: string;
  nombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const remitente = process.env.RESEND_FROM;

  // Si no hay credenciales de correo configuradas, no se envía nada: el
  // enlace de cancelación ya se muestra en pantalla como alternativa.
  if (!apiKey || !remitente) {
    return { enviado: false, motivo: "Resend no está configurado." };
  }

  // El destinatario tiene que parecer un email para poder enviarle algo;
  // si alguien reservó con un teléfono, simplemente no hay correo que mandar.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.destinatario)) {
    return { enviado: false, motivo: "El contacto no es un correo electrónico." };
  }

  const enlaceCancelacion = `${obtenerUrlBase()}/cancelar/${datos.token}`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: remitente,
    to: datos.destinatario,
    subject: "Confirmación de tu reserva de pista de tenis",
    html: `
      <p>Hola ${datos.nombre},</p>
      <p>Tu reserva quedó confirmada:</p>
      <p>
        <strong>${formatearFecha(datos.fecha)}</strong>,
        de <strong>${datos.horaInicio}</strong> a <strong>${datos.horaFin}</strong>
      </p>
      <p>
        Si necesitas cancelarla, usa este enlace:<br />
        <a href="${enlaceCancelacion}">${enlaceCancelacion}</a>
      </p>
    `,
  });

  if (error) {
    return { enviado: false, motivo: error.message };
  }

  return { enviado: true };
}
