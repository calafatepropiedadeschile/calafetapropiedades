import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('parcelas-baratas-valdivia');

export default function ParcelasBaratasValdiviaPage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="parcelas-baratas-valdivia" searchParams={searchParams} />;
}
