import type { TranslationKey } from '@/lib/i18n/dictionaries';
import type { Property } from '@/types/property';
import { isLandProject } from './property-land-options';

export type LandProjectHighlight = {
  id: string;
  labelKey: TranslationKey;
  value: string;
};

export function buildLandProjectHighlights(property: Property): LandProjectHighlight[] {
  const highlights: LandProjectHighlight[] = [];

  if (property.lotSurfaceM2) {
    highlights.push({
      id: 'lot-surface',
      labelKey: 'property.lotSurface',
      value: `${property.lotSurfaceM2.toLocaleString('es-CL')} m²`,
    });
  }

  if (property.totalLots != null) {
    highlights.push({
      id: 'total-lots',
      labelKey: 'property.totalLots',
      value: `${property.totalLots}`,
    });
  }

  if (property.availableLots != null) {
    highlights.push({
      id: 'available-lots',
      labelKey: 'property.availableLots',
      value: `${property.availableLots}`,
    });
  }

  if (property.stageName) {
    highlights.push({
      id: 'stage',
      labelKey: 'property.projectStage',
      value: property.stageName,
    });
  }

  return highlights;
}

export function getLandProjectSummary(property: Property) {
  return {
    isProject: isLandProject(property),
    isLand: property.type === 'terreno',
    hasTour: Boolean(property.virtualTourUrl),
    hasMapLink: Boolean(property.mapUrl),
    hasCoordinates: property.latitude != null && property.longitude != null,
    hasCommercialTerms: Boolean(
      property.paymentTerms
      || property.commercialNotes
      || property.availabilityNotes
      || property.distanceHighlights.length > 0
    ),
    hasLandSpecs: Boolean(
      property.lotSurfaceM2
      || property.waterStatus
      || property.electricityStatus
      || property.roadType
      || property.services.length > 0
      || property.amenities.length > 0
    ),
  };
}
