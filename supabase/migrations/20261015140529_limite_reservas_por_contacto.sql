-- Limita cuántas reservas activas (confirmadas y futuras) puede tener
-- un mismo contacto a la vez. No hay cuentas de usuario, así que el
-- contacto (email o teléfono que la persona escribe al reservar) es lo
-- único que identifica "quién" está reservando.

alter table public.configuracion
  add column limite_reservas_por_contacto integer not null default 2
    check (limite_reservas_por_contacto > 0);

create or replace function public.verificar_limite_reservas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limite integer;
  v_activas integer;
begin
  if new.estado <> 'confirmada' then
    return new;
  end if;

  select limite_reservas_por_contacto into v_limite
  from configuracion
  where id = 1;

  select count(*) into v_activas
  from reservas
  where estado = 'confirmada'
    and fecha >= current_date
    and lower(trim(medio_contacto)) = lower(trim(new.medio_contacto));

  if v_activas >= v_limite then
    raise exception
      'Ya tienes % reservas activas. Cancela alguna antes de crear una nueva.',
      v_limite
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger reservas_limite_por_contacto
  before insert on public.reservas
  for each row
  execute function public.verificar_limite_reservas();
