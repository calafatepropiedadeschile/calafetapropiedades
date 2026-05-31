import { siteConfig } from '@/config/site';
import type { SiteSettingsPayload } from '@/features/site-content/site-settings';

export type OrganizationPostalAddress = {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
};

function stripOfficePrefix(value: string, prefix: RegExp) {
  return value.replace(prefix, '').trim();
}

/** Dirección postal para JSON-LD: campos estructurados del panel, texto libre o config. */
export function resolveOrganizationPostalAddress(
  settings: SiteSettingsPayload,
): OrganizationPostalAddress {
  const office = siteConfig.offices[0];
  const fallbackLines = office.addressLines;

  if (settings.officeStreetAddress.trim()) {
    return {
      streetAddress: settings.officeStreetAddress.trim(),
      addressLocality: settings.officeLocality.trim() || 'Los Muermos',
      addressRegion: settings.officeRegion.trim() || 'Los Lagos',
      addressCountry: 'CL',
    };
  }

  const configured = settings.officeAddress.trim();
  const lines = configured
    ? configured.split(',').map((part) => part.trim()).filter(Boolean)
    : fallbackLines;

  const streetAddress = lines[0] ?? fallbackLines[0];
  const localityRaw = lines[1] ?? fallbackLines[1] ?? '';
  const regionRaw = lines[2] ?? fallbackLines[2] ?? '';

  return {
    streetAddress,
    addressLocality: stripOfficePrefix(localityRaw, /^comuna de\s+/i) || 'Los Muermos',
    addressRegion: stripOfficePrefix(regionRaw, /^regi[oó]n de\s+/i).replace(/,?\s*chile$/i, '').trim()
      || 'Los Lagos',
    addressCountry: 'CL',
  };
}

export function resolveOrganizationAreaServed(serviceAreas?: string[]) {
  const areas = serviceAreas?.length ? serviceAreas : siteConfig.serviceAreas;
  return areas.map((name) => ({
    '@type': 'AdministrativeArea' as const,
    name,
  }));
}
