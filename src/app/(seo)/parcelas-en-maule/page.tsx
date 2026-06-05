import type { CatalogPageParams } from '@/features/properties/property.service';
import SeoLandingPage, { generateMetadataForSeoLanding } from '../seo-page';

export const generateMetadata = () => generateMetadataForSeoLanding('parcelas-en-maule');

export default function ParcelasEnMaulePage({ searchParams }: { searchParams: Promise<CatalogPageParams> }) {
  return <SeoLandingPage pageKey="parcelas-en-maule" searchParams={searchParams} />;
}
