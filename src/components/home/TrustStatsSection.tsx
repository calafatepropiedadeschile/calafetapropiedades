import Link from 'next/link';

const REVIEW_ITEMS = [
  {
    step: '01',
    title: 'Ubicacion y accesos',
    description: 'Sector, comuna, conectividad y referencias cercanas para entender el entorno antes de visitar.',
  },
  {
    step: '02',
    title: 'Valor y condiciones',
    description: 'Precio desde, moneda, forma de pago y datos comerciales que conviene revisar desde el primer contacto.',
  },
  {
    step: '03',
    title: 'Disponibilidad vigente',
    description: 'Confirmacion de lotes o etapas disponibles antes de coordinar agenda con el comprador.',
  },
  {
    step: '04',
    title: 'Siguiente paso',
    description: 'Ficha del proyecto, consulta directa o visita, segun el nivel de decision del interesado.',
  },
];

export default function TrustStatsSection() {
  return (
    <section className="trust-stats-section" aria-labelledby="trust-section-title">
      <div className="container trust-stats-inner">
        <div className="trust-stats-header scroll-reveal">
          <span className="trust-stats-eyebrow">Criterio comercial</span>
          <h2 id="trust-section-title" className="trust-stats-title">
            Informacion util antes de coordinar una visita
          </h2>
          <p className="trust-stats-subtitle">
            En terrenos y loteos, la decision no depende de una vitrina enorme. Depende de revisar bien
            ubicacion, accesos, superficie, valor y disponibilidad real.
          </p>
          <div className="trust-stats-cta-buttons">
            <Link href="/proyectos" className="btn btn-primary btn-lg">
              Ver proyectos
            </Link>
            <Link href="/contacto" className="btn btn-outline btn-lg">
              Consultar disponibilidad
            </Link>
          </div>
        </div>

        <div className="trust-stats-grid" aria-label="Puntos de revision comercial">
          {REVIEW_ITEMS.map((item, index) => (
            <div
              key={item.step}
              className="trust-stat-card scroll-reveal"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="trust-stat-number">{item.step}</span>
              <div>
                <h3 className="trust-stat-label">{item.title}</h3>
                <p className="trust-stat-sublabel">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="trust-stats-cta scroll-reveal" aria-label="Resumen de cartera">
          <span className="trust-stats-cta-kicker">Cartera actual</span>
          <p className="trust-stats-cta-text">
            Proyectos en Maule, Los Rios y Los Lagos, con foco en parcelas, loteos y terrenos.
            La disponibilidad se confirma antes de agendar una visita.
          </p>
        </aside>
      </div>
    </section>
  );
}
