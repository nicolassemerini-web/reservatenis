"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearClienteNavegador } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);

    const supabase = crearClienteNavegador();
    const { error: errorInicioSesion } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    });

    setEnviando(false);

    if (errorInicioSesion) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className={styles.contenedor}>
      <form className={styles.tarjeta} onSubmit={alEnviar}>
        <h1 className={styles.titulo}>Acceso de administración</h1>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.etiqueta} htmlFor="contrasena">
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            className={styles.input}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.boton} disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className={styles.volver}>
          <Link href="/">Volver al inicio</Link>
        </p>
      </form>
    </main>
  );
}
