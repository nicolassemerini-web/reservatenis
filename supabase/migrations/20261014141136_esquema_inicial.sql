-- Esquema inicial: reservas de una única pista de tenis.
-- Zona horaria de la aplicación: Europe/Madrid (las fechas/horas se guardan
-- como date/time "naive" y se interpretan siempre en esa zona desde la app).

-- ============================================================
-- configuracion: fila única con los parámetros globales del sistema
-- ============================================================
create table public.configuracion (
  id smallint primary key default 1 check (id = 1),
  duracion_turno_minutos integer not null default 60 check (duracion_turno_minutos > 0),
  plazo_cancelacion_horas integer not null default 24 check (plazo_cancelacion_horas >= 0),
  actualizado_en timestamptz not null default now()
);

insert into public.configuracion (id) values (1);

-- ============================================================
-- horario_semanal: franjas de apertura recurrentes por día de la semana
-- dia_semana sigue la convención de JS Date.getDay(): 0 = domingo ... 6 = sábado
-- ============================================================
create table public.horario_semanal (
  id uuid primary key default gen_random_uuid(),
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  constraint horario_rango_valido check (hora_fin > hora_inicio)
);

create index horario_semanal_dia_idx on public.horario_semanal (dia_semana);

-- ============================================================
-- excepciones_fecha: sobrescriben el horario semanal para una fecha concreta
-- (cierre total o apertura con horario especial)
-- ============================================================
create table public.excepciones_fecha (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  cerrado boolean not null default false,
  hora_inicio time,
  hora_fin time,
  motivo text,
  creado_en timestamptz not null default now(),
  constraint excepcion_rango_valido check (
    cerrado = true
    or (hora_inicio is not null and hora_fin is not null and hora_fin > hora_inicio)
  )
);

create index excepciones_fecha_idx on public.excepciones_fecha (fecha);

-- Solo puede existir una excepción de "cerrado" por fecha
create unique index excepciones_fecha_cerrado_unico
  on public.excepciones_fecha (fecha)
  where cerrado = true;

-- ============================================================
-- bloqueos: bloqueos puntuales de horario o de jornada completa
-- (p.ej. mantenimiento), independientes de las excepciones de horario
-- ============================================================
create table public.bloqueos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  dia_completo boolean not null default false,
  hora_inicio time,
  hora_fin time,
  motivo text,
  creado_en timestamptz not null default now(),
  constraint bloqueo_rango_valido check (
    dia_completo = true
    or (hora_inicio is not null and hora_fin is not null and hora_fin > hora_inicio)
  )
);

create index bloqueos_fecha_idx on public.bloqueos (fecha);

-- ============================================================
-- reservas: turnos reservados por los jugadores
-- ============================================================
create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  nombre_contacto text not null check (char_length(trim(nombre_contacto)) > 0),
  medio_contacto text not null check (char_length(trim(medio_contacto)) > 0),
  token_cancelacion text not null unique
    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  creado_en timestamptz not null default now(),
  cancelado_en timestamptz,
  constraint reserva_rango_valido check (hora_fin > hora_inicio)
);

create index reservas_fecha_idx on public.reservas (fecha);
create index reservas_token_idx on public.reservas (token_cancelacion);

-- Evita que dos reservas confirmadas se solapen en el tiempo (la pista es única).
-- No requiere la extensión btree_gist porque el rango es homogéneo (solo tsrange).
alter table public.reservas
  add constraint reservas_sin_solape
  exclude using gist (
    tsrange(fecha + hora_inicio, fecha + hora_fin) with &&
  )
  where (estado = 'confirmada');

comment on column public.reservas.token_cancelacion is
  'Token aleatorio usado en el enlace de cancelación enviado por correo. No es el id de la reserva para que no se pueda adivinar ni enumerar.';

-- ============================================================
-- Vista pública de disponibilidad: expone solo lo necesario para calcular
-- huecos libres, sin datos personales de otros jugadores.
-- ============================================================
create view public.reservas_disponibilidad
  with (security_invoker = true) as
  select fecha, hora_inicio, hora_fin
  from public.reservas
  where estado = 'confirmada';

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.configuracion enable row level security;
alter table public.horario_semanal enable row level security;
alter table public.excepciones_fecha enable row level security;
alter table public.bloqueos enable row level security;
alter table public.reservas enable row level security;

-- Lectura pública de lo necesario para mostrar horarios y disponibilidad
create policy "configuracion: lectura publica"
  on public.configuracion for select
  to anon, authenticated
  using (true);

create policy "horario_semanal: lectura publica"
  on public.horario_semanal for select
  to anon, authenticated
  using (true);

create policy "excepciones_fecha: lectura publica"
  on public.excepciones_fecha for select
  to anon, authenticated
  using (true);

create policy "bloqueos: lectura publica"
  on public.bloqueos for select
  to anon, authenticated
  using (true);

-- Cualquiera puede crear una reserva (sin cuenta), pero no puede leer,
-- modificar ni borrar reservas directamente: la lectura de disponibilidad
-- pasa por la vista "reservas_disponibilidad" y la cancelación por la
-- función "cancelar_reserva" definida más abajo.
-- El límite estricto de "próximos 7 días" se valida en el servidor de la
-- aplicación (que conoce la fecha actual en Europe/Madrid). Aquí solo se
-- aplica un margen de seguridad amplio como defensa adicional.
create policy "reservas: creacion publica"
  on public.reservas for insert
  to anon
  with check (
    estado = 'confirmada'
    and fecha between current_date - 1 and current_date + 8
  );

-- Administración (usuarios autenticados en Supabase Auth): acceso completo
create policy "configuracion: gestion admin"
  on public.configuracion for all
  to authenticated
  using (true)
  with check (true);

create policy "horario_semanal: gestion admin"
  on public.horario_semanal for all
  to authenticated
  using (true)
  with check (true);

create policy "excepciones_fecha: gestion admin"
  on public.excepciones_fecha for all
  to authenticated
  using (true)
  with check (true);

create policy "bloqueos: gestion admin"
  on public.bloqueos for all
  to authenticated
  using (true)
  with check (true);

create policy "reservas: gestion admin"
  on public.reservas for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Función de cancelación pública mediante token (RPC)
-- Se ejecuta con los privilegios del propietario (security definer) para
-- poder actualizar la reserva sin dar permisos de UPDATE públicos sobre
-- toda la tabla. Verifica el token y el plazo límite de cancelación.
-- ============================================================
create function public.cancelar_reserva(p_token text)
returns table (ok boolean, mensaje text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reserva reservas%rowtype;
  v_plazo_horas integer;
  v_limite timestamptz;
begin
  select * into v_reserva from reservas where token_cancelacion = p_token;

  if not found then
    return query select false, 'Enlace de cancelación no válido.';
    return;
  end if;

  if v_reserva.estado = 'cancelada' then
    return query select false, 'Esta reserva ya estaba cancelada.';
    return;
  end if;

  select plazo_cancelacion_horas into v_plazo_horas from configuracion where id = 1;
  v_limite := (v_reserva.fecha::timestamp + v_reserva.hora_inicio) - make_interval(hours => v_plazo_horas);

  if now() > v_limite then
    return query select false, 'Ya no se puede cancelar: se superó el plazo límite.';
    return;
  end if;

  update reservas
  set estado = 'cancelada', cancelado_en = now()
  where token_cancelacion = p_token;

  return query select true, 'Reserva cancelada correctamente.';
end;
$$;

grant execute on function public.cancelar_reserva(text) to anon, authenticated;
