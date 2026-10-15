-- La vista reservas_disponibilidad solo expone fecha/hora_inicio/hora_fin
-- (nunca nombre_contacto ni medio_contacto), así que es segura de mostrar
-- a cualquiera. El problema es que se creó con security_invoker = true,
-- lo que hace que herede el bloqueo de lectura de la tabla "reservas"
-- (que es intencional en la tabla, pero deja la vista siempre vacía para
-- el público). Con security_invoker = false, la vista se ejecuta con los
-- permisos de su propietario y puede leer todas las reservas para
-- calcular la disponibilidad, sin exponer datos personales.
alter view public.reservas_disponibilidad set (security_invoker = false);
