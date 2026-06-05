import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('loteos-en-valdivia');

export default function LoteosEnValdiviaPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="loteos-en-valdivia" searchParams={searchParams} />;
}
