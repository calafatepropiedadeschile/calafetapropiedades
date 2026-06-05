import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('parcelas-en-valdivia');

export default function ParcelasEnValdiviaPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="parcelas-en-valdivia" searchParams={searchParams} />;
}
