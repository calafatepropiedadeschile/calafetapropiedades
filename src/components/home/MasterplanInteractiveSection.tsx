'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import VirtualTour from '../properties/VirtualTour';
import PropertyCard from '../properties/PropertyCard';
import type { PropertyCard as PropertyCardType } from '@/types/property';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { formatTranslation } from '@/lib/i18n/dictionaries';

interface ProyectoTour {
  id: string;
  name: string;
  tourUrl: string;
  description: string;
  slugFilter: string;
  projectHref: string;
  amenities: string[];
}

const PROJECTS_DATA: ProyectoTour[] = [
  {
    id: 'portal-los-muermos',
    name: 'Portal Los Muermos',
    tourUrl: 'https://vtour.cl/360/portallosmuermos/tour',
    description: '81 parcelas de 5.000 m2 en Los Muermos, con foco en naturacion, acceso y conectividad hacia Puerto Montt.',
    slugFilter: 'portal-los-muermos',
    projectHref: '/proyectos/portal-los-muermos',
    amenities: ['Agua potable en proyecto', 'Electricidad en red', 'Acceso pavimentado', 'Topografia disponible', 'Parcelas desde 5.000 m2'],
  },
  {
    id: 'praderas-del-maule',
    name: 'Praderas del Maule',
    tourUrl: 'https://vtour.cl/360/praderasdelmaule/tour',
    description: 'Parcelas con entorno rural y buena conexion en la Region del Maule, pensadas para segunda vivienda o inversion.',
    slugFilter: 'praderas-del-maule',
    projectHref: '/proyectos/praderas-del-maule',
    amenities: ['Entorno rural y tranquilo', 'Conexion a ruta principal', 'Factibilidad de servicios', 'Ideal segunda vivienda', 'Etapas en desarrollo'],
  },
  {
    id: 'vive-puquila',
    name: 'Vive Puquila',
    tourUrl: 'https://vtour.cl/360/vivepuquila/tour',
    description: 'Proyecto con etapas activas en el sector Puquila, ideal para revisar ubicacion y entorno antes de coordinar visita.',
    slugFilter: 'vive-puquila',
    projectHref: '/proyectos/vive-puquila',
    amenities: ['Sector Puquila', 'Etapas con disponibilidad', 'Recorrido 360 por lote', 'Cercania a servicios', 'Asesoria comercial directa'],
  },
  {
    id: 'altos-del-tepual',
    name: 'Altos del Tepual',
    tourUrl: 'https://vtour.cl/360/altosdeltepual/tour',
    description: 'Parcelas en el sector Tepual, cercanas a Puerto Montt, con recorrido virtual disponible y unidades identificadas.',
    slugFilter: 'altos-del-tepual',
    projectHref: '/proyectos/altos-del-tepual',
    amenities: ['Cercania a Puerto Montt', 'Lotes identificados en tour', 'Agua y electricidad en evaluacion', 'Camino de acceso', 'Condiciones de pago flexibles'],
  },
];

interface Props {
  allProperties: PropertyCardType[];
}

export default function MasterplanInteractiveSection({ allProperties }: Props) {
  const { locale, t } = useI18n();
  const [activeProject, setActiveProject] = useState<ProyectoTour>(PROJECTS_DATA[0]);
  const [loadedTourIds, setLoadedTourIds] = useState<Set<string>>(() => new Set([PROJECTS_DATA[0].id]));

  const filteredProperties = useMemo(() => (
    allProperties
      .filter((property) => {
        const slug = property.slug.toLowerCase();
        const zone = property.zone.toLowerCase();
        return slug.includes(activeProject.slugFilter)
          || zone.includes(activeProject.slugFilter.replaceAll('-', ' '));
      })
      .slice(0, 4)
  ), [allProperties, activeProject.slugFilter]);

  function selectProject(project: ProyectoTour) {
    setActiveProject(project);
    setLoadedTourIds((current) => {
      const next = new Set(current);
      next.add(project.id);
      return next;
    });
  }

  return (
    <section className="section container masterplan-section" style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-4xl)', position: 'relative', zIndex: 10 }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: 'var(--space-xs)' }}>
          {t('masterplan.toursEyebrow')}
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-dark)', margin: '0 0 var(--space-xs)', lineHeight: '1.2' }}>
          {t('masterplan.toursTitle')}
        </h2>

        <div className="masterplan-project-tabs">
          {PROJECTS_DATA.map((project) => {
            const isActive = project.id === activeProject.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => selectProject(project)}
                className={`masterplan-project-tab${isActive ? ' is-active' : ''}`}
              >
                {project.name}
              </button>
            );
          })}
        </div>

        <p className="text-muted masterplan-project-description">
          {activeProject.description}
        </p>
      </div>

      <div className="masterplan-tour-wrapper">
        <div className="masterplan-tour-chrome">
          <div className="masterplan-tour-bar">
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-dark)' }}>
              {t('masterplan.tourBarLabel')}: {activeProject.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>{t('masterplan.tourAvailable')}</span>
          </div>
          <div className="masterplan-tour-frame">
            {PROJECTS_DATA.map((project) => (
              loadedTourIds.has(project.id) ? (
                <VirtualTour
                  key={project.id}
                  src={project.tourUrl}
                  title={`Tour virtual 360 ${project.name}`}
                  visible={project.id === activeProject.id}
                  eager={project.id === PROJECTS_DATA[0].id}
                />
              ) : null
            ))}
          </div>
        </div>
      </div>

      <div className="masterplan-commercial-section">
        <div className="masterplan-commercial-header">
          <div>
            <h3 className="masterplan-commercial-title">
              {formatTranslation(locale, 'masterplan.commercialTitle', { name: activeProject.name })}
            </h3>
            <p className="text-muted masterplan-commercial-subtitle">
              {t('masterplan.commercialSubtitle')}
            </p>
          </div>
        </div>

        <div className="masterplan-commercial-grid">
          <div className="masterplan-commercial-main">
            {filteredProperties.length > 0 ? (
              <div className="masterplan-cards-grid">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="masterplan-commercial-placeholder">
                <h4>{t('masterplan.placeholderTitle')}</h4>
                <p>
                  {formatTranslation(locale, 'masterplan.placeholderCopy', { name: activeProject.name })}
                </p>
                <Link href="/contacto" className="btn btn-primary btn-sm">
                  {t('masterplan.placeholderCta')}
                </Link>
              </div>
            )}
          </div>

          <aside className="masterplan-commercial-aside">
            <p className="masterplan-aside-eyebrow">{t('masterplan.asideEyebrow')}</p>
            <h4 className="masterplan-aside-title">{t('masterplan.asideTitle')}</h4>
            <ul className="masterplan-amenities-list">
              {activeProject.amenities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={activeProject.projectHref} className="btn btn-outline btn-sm masterplan-aside-cta">
              {t('masterplan.asideCta')}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
