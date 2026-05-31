import {
  MapPin,
  ClipboardCheck,
  Compass,
  MessageCircle,
  Camera,
  FileText,
  Megaphone,
  LineChart,
  type LucideIcon,
} from 'lucide-react';
import type { SeoInfoGridConfig, SeoInfoGridIcon } from '@/config/seo-pages';

const ICON_MAP: Record<SeoInfoGridIcon, LucideIcon> = {
  map: MapPin,
  clipboard: ClipboardCheck,
  compass: Compass,
  message: MessageCircle,
  camera: Camera,
  file: FileText,
  megaphone: Megaphone,
  chart: LineChart,
};

interface Props {
  grid: SeoInfoGridConfig;
  className?: string;
}

export default function SeoInfoGridSection({ grid, className = '' }: Props) {
  return (
    <section
      className={`section services-section ${className}`.trim()}
      aria-labelledby={`seo-info-grid-${grid.gridLabel.replace(/\s+/g, '-')}`}
    >
      <div className="container">
        <div className="services-header">
          <span className="section-eyebrow">{grid.eyebrow}</span>
          <div className="services-header-grid">
            <h2
              id={`seo-info-grid-${grid.gridLabel.replace(/\s+/g, '-')}`}
              className="heading-2 services-title"
            >
              {grid.title}
            </h2>
            <p className="text-muted services-subtitle">{grid.subtitle}</p>
          </div>
        </div>

        <ul className="services-card-grid" role="list" aria-label={grid.gridLabel}>
          {grid.steps.map((step, index) => {
            const Icon = ICON_MAP[step.icon] ?? MapPin;

            return (
              <li
                key={step.title}
                className="service-card"
                style={{ animationDelay: `${index * 80}ms` }}
                role="listitem"
              >
                <div className="service-card-icon-badge" aria-hidden>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="service-card-title">{step.title}</h3>
                <p className="service-card-description">{step.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
