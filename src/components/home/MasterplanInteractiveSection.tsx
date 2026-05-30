'use client';

import { useState } from 'react';
import Link from 'next/link';
import VirtualTour from '../properties/VirtualTour';
import PropertyCard from '../properties/PropertyCard';
import type { PropertyCard as PropertyCardType } from '@/types/property';

interface ProyectoTour {
  id: string;
  name: string;
  tourUrl: string;
  description: string;
  slugFilter: string;
  projectHref: string;
}

const PROJECTS_DATA: ProyectoTour[] = [
  {
    id: 'portal-los-muermos',
    name: 'Portal Los Muermos',
    tourUrl: 'https://vtour.cl/360/portallosmuermos/tour',
    description: '81 parcelas de 5.000 m2 en Los Muermos, con foco en naturaleza, acceso y conectividad hacia Puerto Montt.',
    slugFilter: 'portal-los-muermos',
    projectHref: '/proyectos/portal-los-muermos',
  },
  {
    id: 'praderas-del-maule',
    name: 'Praderas del Maule',
    tourUrl: 'https://vtour.cl/360/praderasdelmaule/tour',
    description: 'Parcelas con entorno rural y buena conexion en la Region del Maule, pensadas para segunda vivienda o inversion.',
    slugFilter: 'praderas-del-maule',
    projectHref: '/proyectos/praderas-del-maule',
  },
  {
    id: 'vive-puquila',
    name: 'Vive Puquila',
    tourUrl: 'https://vtour.cl/360/vivepuquila/tour',
    description: 'Proyecto con etapas activas en el sector Puquila, ideal para revisar ubicacion y entorno antes de coordinar visita.',
    slugFilter: 'vive-puquila',
    projectHref: '/proyectos/vive-puquila',
  },
  {
    id: 'altos-del-tepual',
    name: 'Altos del Tepual',
    tourUrl: 'https://vtour.cl/360/altosdeltepual/tour',
    description: 'Parcelas en el sector Tepual, cercanas a Puerto Montt, con recorrido virtual disponible y unidades identificadas.',
    slugFilter: 'altos-del-tepual',
    projectHref: '/proyectos/altos-del-tepual',
  },
];

interface Props {
  allProperties: PropertyCardType[];
}

export default function MasterplanInteractiveSection({ allProperties }: Props) {
  const [activeProject, setActiveProject] = useState<ProyectoTour>(PROJECTS_DATA[0]);

  const filteredProperties = allProperties
    .filter((property) => {
      const slug = property.slug.toLowerCase();
      const zone = property.zone.toLowerCase();
      return slug.includes(activeProject.slugFilter) || zone.includes(activeProject.slugFilter.replaceAll('-', ' '));
    })
    .slice(0, 4);

  return (
    <section className="section container" style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4xl)', position: 'relative', zIndex: 10 }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: 'var(--space-xs)' }}>
          Tours 360 disponibles
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-dark)', margin: '0 0 var(--space-xs)', lineHeight: '1.2' }}>
          Explora proyectos reales antes de visitar
        </h2>

        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: 'var(--space-lg) auto 0',
          maxWidth: 'fit-content',
          backgroundColor: 'var(--color-surface-2)',
          padding: '6px',
          borderRadius: '100px',
          border: '1px solid var(--color-border-light)'
        }}>
          {PROJECTS_DATA.map((project) => {
            const isActive = project.id === activeProject.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveProject(project)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text-subtle)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {project.name}
              </button>
            );
          })}
        </div>

        <p className="text-muted" style={{ maxWidth: '660px', margin: 'var(--space-md) auto 0', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {activeProject.description}
        </p>
      </div>

      <div className="masterplan-tour-wrapper">
        <div className="masterplan-tour-chrome">
          <div className="masterplan-tour-bar">
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-dark)' }}>
              Tour virtual: {activeProject.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>Disponible</span>
          </div>
          <div className="masterplan-tour-frame">
            <VirtualTour
              key={activeProject.id}
              src={activeProject.tourUrl}
              title={`Tour virtual 360 ${activeProject.name}`}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)', margin: 0 }}>
              Ficha comercial de {activeProject.name}
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              Revisa ubicacion, precio desde, superficie y condiciones del proyecto.
            </p>
          </div>
          <Link href={activeProject.projectHref} className="btn btn-outline btn-sm" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Ver pagina del proyecto
          </Link>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="masterplan-cards-grid">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Proyecto en preparacion</h3>
            <p>La ficha de este proyecto se mostrara cuando quede publicada en el catalogo.</p>
          </div>
        )}
      </div>
    </section>
  );
}
