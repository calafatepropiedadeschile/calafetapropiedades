# Reutilizacion para Calafate Propiedades

## Reutilizable sin cambios

- Infraestructura Next.js 16 App Router, Prisma 7, Postgres/Supabase, Auth.js y Vercel.
- Panel de administracion: propiedades, leads, login, acciones y subidas de imagenes.
- Modelo de datos, migraciones, servicios de propiedades/leads y rutas API.
- Catalogo publico, busqueda, detalle de propiedad, formularios y notificaciones.
- Sistema i18n ES/EN y preferencias de moneda/idioma.

## Parametrizado

La marca y los datos de contacto se centralizan en `src/config/site.ts`:

- Nombre comercial y logo textual.
- Metadata SEO.
- Email, telefono, redes sociales y mailto de ventas/asesoria.
- Oficinas/contactos usados por footer, contacto, WhatsApp y nosotros.
- Textos base de presentacion corporativa.

## Ajustes aplicados

- Reemplazo visible de Dahuss Homes por Calafate Propiedades.
- Actualizacion de metadata, README, env examples, seed admin y scripts de importacion.
- Navbar, footer, WhatsApp, contacto, home, nosotros, admin login y tarjetas de propiedad ahora leen desde `siteConfig`.
- Se mantiene el sistema de DB, admin, auth, rutas y flujos principales.

## Pendiente para datos reales

- Sustituir telefono placeholder `+34 000 000 000`.
- Sustituir `contacto@calafatepropiedades.com` si el correo final cambia.
- Confirmar URLs reales de Instagram, LinkedIn y Facebook.
- Reemplazar direccion placeholder de la oficina.
- Cambiar imagenes de marca/propiedades si el cliente entrega material propio.

## Nota de base de datos

Las migraciones historicas crean roles internos `dahuss_*_runtime`. Se conservaron para no romper bases ya migradas. Si se quiere una DB nueva completamente renombrada a Calafate, conviene hacerlo como una migracion especifica y probar grants/RLS antes de cambiar `src/lib/db/rls.ts`.
