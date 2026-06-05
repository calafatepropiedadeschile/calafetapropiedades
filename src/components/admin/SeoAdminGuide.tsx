import Link from 'next/link';
import {
  ADMIN_PROJECT_LANDING_SLUGS,
  ADMIN_REGIONAL_LANDING_PATHS,
  ADMIN_SEO_DISCOVERY_LINKS,
} from '@/config/admin-seo-reference';

const guideAsideStyle = {
  background: 'var(--color-surface-muted, #f8fafc)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 'var(--radius-md, 8px)',
  padding: 'var(--space-lg)',
  marginBottom: 'var(--space-lg)',
} as const;

const listStyle = {
  margin: '0 0 var(--space-md)',
  paddingLeft: '1.2rem',
  lineHeight: 1.75,
  fontSize: '0.9rem',
} as const;

const headingStyle = {
  fontSize: '0.95rem',
  fontWeight: 600,
  margin: 'var(--space-md) 0 var(--space-xs)',
} as const;

export default function SeoAdminGuide() {
  return (
    <aside className="admin-form-section" style={guideAsideStyle}>
      <h2 className="admin-form-section-title" style={{ marginBottom: 'var(--space-sm)' }}>
        Que puedes gestionar desde el panel
      </h2>
      <ul className="text-muted" style={listStyle}>
        <li>
          <strong>SEO global</strong> (formularios de esta pagina): dominio canonico, indexacion, metadatos por defecto, idioma ingles, regiones atendidas (<code>areaServed</code>), robots y medicion (GSC, GA4, Meta Pixel).
        </li>
        <li>
          <strong>Organizacion en Google</strong>: direccion postal para JSON-LD <code>RealEstateAgent</code> (telefono, email y redes en <Link href="/admin/ajustes">Ajustes</Link>).
        </li>
        <li>
          <strong>Fichas en Propiedades</strong>: titulo/descripcion SEO ES+EN, canonical, OG, tour 360 y video YouTube por proyecto o terreno.
        </li>
        <li>
          <strong>Paginas CMS</strong> (<Link href="/admin/paginas">Paginas del sitio</Link>): slugs integrados (<code>terrenos</code>, <code>comprar</code>, landings regionales, etc.) sobreescriben titulo y contenido de esa ruta.
        </li>
      </ul>

      <h3 style={headingStyle}>URLs canonicas (proyectos vs fichas)</h3>
      <ul className="text-muted" style={listStyle}>
        <li>
          Los <strong>6 proyectos de parcelas</strong> publican en <code>/proyectos/[slug]</code> con ficha completa.{' '}
          <code>/propiedades/[slug]</code> redirige 301 al proyecto correspondiente.
        </li>
        <li>
          Slugs de proyecto actuales:{' '}
          {ADMIN_PROJECT_LANDING_SLUGS.map((slug, index) => (
            <span key={slug}>
              {index > 0 ? ', ' : null}
              <code>{slug}</code>
            </span>
          ))}
        </li>
        <li>
          Terrenos y casas individuales siguen en <code>/propiedades/[slug]</code>. Usa campanas y enlaces con esa ruta.
        </li>
        <li>
          Tour 360 y video YouTube generan paginas de reproduccion en{' '}
          <code>/proyectos/[slug]/tour-virtual</code> o <code>/video</code> (proyectos) y{' '}
          <code>/propiedades/[slug]/...</code> (fichas sueltas).
        </li>
      </ul>

      <h3 style={headingStyle}>Landings regionales y schema automatico</h3>
      <ul className="text-muted" style={listStyle}>
        <li>
          Landings por zona en codigo (editables via CMS si el slug esta integrado):{' '}
          {ADMIN_REGIONAL_LANDING_PATHS.map((path, index) => (
            <span key={path}>
              {index > 0 ? ', ' : null}
              <code>{path}</code>
            </span>
          ))}
        </li>
        <li>
          Cada landing genera <code>CollectionPage</code>, <code>ItemList</code>, <code>FAQPage</code> y breadcrumbs. Las FAQs del bloque estan en codigo (no en este panel).
        </li>
        <li>
          <code>hreflang</code> en ingles (<code>?lang=en</code>) solo si hay titulo/descripcion EN (global, CMS o ficha).
        </li>
      </ul>

      <h3 style={headingStyle}>Visibilidad para IA y buscadores generativos</h3>
      <ul className="text-muted" style={listStyle}>
        <li>
          <code>/llms.txt</code> y <code>/llms-full.txt</code> resumen el sitio para asistentes de IA (proyectos, zonas, contacto).
        </li>
        <li>
          <code>/sobre-calafate</code> es una guia HTML indexable con JSON-LD; tiene ruta propia (no se edita desde Paginas CMS).
        </li>
        <li>
          <code>robots.txt</code> permite crawlers IA (GPTBot, ClaudeBot, PerplexityBot, etc.) ademas del sitio publico.
        </li>
      </ul>

      <h3 style={headingStyle}>Solo en codigo / despliegue</h3>
      <ul className="text-muted" style={{ ...listStyle, marginBottom: 'var(--space-md)' }}>
        <li>Redirects 301 del WordPress anterior (<code>/propiedad/</code>, <code>/wp-content/</code>).</li>
        <li>Lista de slugs de proyecto y clusters regionales (cambios requieren desarrollo).</li>
        <li>Contenido de <code>llms.txt</code> y FAQs de landings.</li>
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <span className="text-muted text-sm">Verificar en produccion:</span>
        {ADMIN_SEO_DISCOVERY_LINKS.map((item) => (
          <a key={item.path} href={item.path} className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">
            {item.label}
          </a>
        ))}
        <Link href="/admin/campanas" className="btn btn-outline btn-sm">
          Campanas y UTM
        </Link>
      </div>
    </aside>
  );
}
