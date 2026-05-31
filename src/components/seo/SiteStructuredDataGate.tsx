import { headers } from 'next/headers';
import SiteStructuredData from '@/components/seo/SiteStructuredData';
import type { SiteSeoSettingsView } from '@/features/site-content/seo-settings';
import type { SiteSettingsPayload } from '@/features/site-content/site-settings';

type SiteStructuredDataGateProps = {
  seo: SiteSeoSettingsView | null;
  settings: SiteSettingsPayload;
  baseUrl: string;
};

export default async function SiteStructuredDataGate(props: SiteStructuredDataGateProps) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return <SiteStructuredData {...props} />;
}
