-- Permite leer los datos mínimos de UNA reserva a partir de su token de
-- cancelación (no del id, que es adivinable/enumerable). Quien tiene el
-- enlace de cancelación puede ver esto; nadie más, porque no hay forma
-- de listar tokens ni de buscar por otra columna.
create or replace function public.obtener_reserva_por_token(p_token text)
returns table (
  fecha date,
  hora_inicio time,
  hora_fin time,
  estado text,
  nombre_contacto text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select r.fecha, r.hora_inicio, r.hora_fin, r.estado, r.nombre_contacto
  from reservas r
  where r.token_cancelacion = p_token;
end;
$$;

grant execute on function public.obtener_reserva_por_token(text) to anon, authenticated;
