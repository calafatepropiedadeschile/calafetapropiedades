# SEO avanzado y preparacion para dominio final

Este proyecto queda preparado para operar primero en Vercel y despues migrar el dominio canonico a `https://calafatepropiedades.com` sin rehacer la logica SEO.

## Capa tecnica implementada

- Metadata dinamica por pagina con `generateMetadata`.
- `metadataBase` resuelto desde configuracion SEO y variables de entorno.
- Canonicals por ruta y soporte para canonicals personalizados desde admin.
- Sitemap dinamico con paginas estaticas, landings SEO y fichas publicadas.
- Robots autogestionable desde el panel SEO.
- Open Graph y Twitter Cards por sitio, propiedad, proyecto y paginas CMS.
- JSON-LD global para `RealEstateAgent` y `WebSite`.
- JSON-LD de propiedades y proyectos con `RealEstateListing`, `Offer`, direccion, imagenes y seller.
- Breadcrumb JSON-LD en fichas de propiedad y landings de proyecto.
- hreflang `en` solo si hay contenido EN en admin (global, CMS o ficha).
- Proyectos de parcelas: canónico en `/proyectos/[slug]` con ficha completa; `/propiedades/[slug]` redirige 301 para esos slugs; el sitemap no duplica la ruta antigua.
- Catálogo `/propiedades`: SEO editable con página CMS slug `propiedades`.

## Variables que se cambiaran cuando el dominio este listo

Actualizar en Vercel cuando DNS y SSL esten activos:

```env
NEXT_PUBLIC_SITE_URL=https://calafatepropiedades.com
APP_ORIGIN=https://calafatepropiedades.com
AUTH_URL=https://calafatepropiedades.com
NEXTAUTH_URL=https://calafatepropiedades.com
```

Despues de guardar variables, hacer redeploy.

## Panel admin

En `/admin/seo` actualizar:

- Dominio canonico: `https://calafatepropiedades.com`
- Titulo por defecto.
- Descripcion por defecto.
- Imagen OG por defecto.
- Google Search Console.
- Google Analytics 4.
- Meta Pixel, si aplica.
- Rutas bloqueadas en `robots.txt`.

## Validacion despues del cambio de dominio

Revisar estas URLs:

- `/`
- `/propiedades`
- `/proyectos`
- `/propiedades/{slug}`
- `/proyectos/{slug}`
- `/robots.txt`
- `/sitemap.xml`
- `/admin/login`

Confirmar en el HTML:

- `<link rel="canonical">` apunta al dominio final.
- Open Graph `og:url` apunta al dominio final.
- JSON-LD `url`, `@id` y `item` usan el dominio final.
- Sitemap usa solo URLs del dominio final.
- Robots apunta al sitemap del dominio final.

## Recomendaciones de indexacion

- Mantener una sola version canonica: root o `www`, no ambas.
- Enviar `https://calafatepropiedades.com/sitemap.xml` a Google Search Console.
- Solicitar indexacion manual para home, catalogo, proyectos y fichas principales.
- Evitar cambiar slugs despues de indexar; si se cambia un slug, crear redireccion 301.
