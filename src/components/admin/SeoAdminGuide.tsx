export default function SeoAdminGuide() {
  return (
    <aside
      className="admin-form-section"
      style={{
        background: 'var(--color-surface-muted, #f8fafc)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 'var(--space-lg)',
      }}
    >
      <h2 className="admin-form-section-title" style={{ marginBottom: 'var(--space-sm)' }}>
        Que puedes gestionar desde el panel
      </h2>
      <ul className="text-muted" style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.75, fontSize: '0.9rem' }}>
        <li>
          <strong>SEO global</strong> (esta pagina): dominio canonico, indexacion, metadatos por defecto, idioma ingles, regiones atendidas, robots y medicion.
        </li>
        <li>
          <strong>Propiedades y proyectos</strong>: titulo/descripcion SEO ES+EN, canonical y OG por ficha.
        </li>
        <li>
          <strong>Paginas estaticas / landings</strong> (CMS): slugs integrados como <code>terrenos</code>, <code>comprar</code>, <code>topografia</code> sobreescriben el SEO de esa ruta.
        </li>
        <li>
          <strong>FAQs de landings</strong>: hoy estan en codigo; el schema FAQPage se genera automaticamente en esas paginas.
        </li>
        <li>
          El sitio publica <code>hreflang</code> (<code>es-CL</code> + <code>en</code> con <code>?lang=en</code>) y un sitemap con propiedades, landings y <code>/proyectos/[slug]</code>.
        </li>
      </ul>
    </aside>
  );
}
