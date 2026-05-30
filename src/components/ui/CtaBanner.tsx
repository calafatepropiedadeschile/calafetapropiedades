// CtaBanner.tsx
// Componente CTA reutilizable con 3 variantes visuales:
//   'subtle'  — franja clara con borde izquierdo de color primario (entre secciones)
//   'dark'    — fondo oscuro del brand, alto contraste (cierre de sección)
//   'inline'  — compacto horizontal, integrado dentro de contenido (SEO landing)
//
// Uso: <CtaBanner variant="subtle" headline="..." sub="..." ctas={[...]} />

import Link from 'next/link';

export interface CtaItem {
  label: string;
  href: string;
  primary?: boolean;
}

interface CtaBannerProps {
  variant: 'subtle' | 'dark' | 'inline';
  eyebrow?: string;
  headline: string;
  sub?: string;
  ctas: CtaItem[];
  id?: string;
}

export default function CtaBanner({ variant, eyebrow, headline, sub, ctas, id }: CtaBannerProps) {
  return (
    <div id={id} className={`cta-banner cta-banner--${variant}`} role="complementary">
      <div className={`cta-banner__inner ${variant === 'inline' ? '' : 'container'}`}>

        {/* Contenido textual */}
        <div className="cta-banner__copy">
          {eyebrow && (
            <span className="cta-banner__eyebrow">{eyebrow}</span>
          )}
          <p className="cta-banner__headline">{headline}</p>
          {sub && (
            <p className="cta-banner__sub">{sub}</p>
          )}
        </div>

        {/* Botones */}
        <div className="cta-banner__actions">
          {ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={
                cta.primary
                  ? 'btn btn-primary'
                  : variant === 'dark'
                  ? 'btn btn-outline cta-btn-outline-dark'
                  : 'btn btn-outline'
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
