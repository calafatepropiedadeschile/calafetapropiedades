import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import HomePageContent from '@/components/home/HomePageContent';
import { getFeaturedProperties, getStaticPropertyCatalog, getZones } from '@/features/properties/property.service';
import { getHomeHeroContent } from '@/features/site-content/home-hero';
import { HOME_HERO_DEFAULTS } from '@/features/site-content/home-hero.defaults';
import { readCatalogPreferences } from '@/lib/catalog/catalog-preferences';
import { getServerLocale } from '@/lib/i18n/server';
import { cookies } from 'next/headers';

export const revalidate = 300;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function getSafeFeaturedProperties(locale: 'es' | 'en') {
  if (!hasDatabaseUrl) return [];

  try {
    return await getFeaturedProperties(locale);
  } catch (error) {
    console.warn('Skipping featured properties because the datasource is unavailable.', error);
    return [];
  }
}

async function getSafePropertyCatalog(locale: 'es' | 'en') {
  if (!hasDatabaseUrl) return [];

  try {
    return await getStaticPropertyCatalog(locale);
  } catch (error) {
    console.warn('Skipping property catalog because the datasource is unavailable.', error);
    return [];
  }
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const cookieStore = await cookies();
  const catalogPreferences = readCatalogPreferences(cookieStore);

  const [featuredProperties, propertyCatalog, hero, zoneOptions] = await Promise.all([
    getSafeFeaturedProperties(locale),
    getSafePropertyCatalog(locale),
    hasDatabaseUrl
      ? getHomeHeroContent(locale).catch(() => ({
          imageUrl: '/heroe.jpg',
          titleLine1: locale === 'en' ? HOME_HERO_DEFAULTS.titleLine1En : HOME_HERO_DEFAULTS.titleLine1Es,
          titleLine2: locale === 'en' ? HOME_HERO_DEFAULTS.titleLine2En : HOME_HERO_DEFAULTS.titleLine2Es,
          subtitle: locale === 'en' ? HOME_HERO_DEFAULTS.subtitleEn : HOME_HERO_DEFAULTS.subtitleEs,
        }))
      : Promise.resolve({
          imageUrl: '/heroe.jpg',
          titleLine1: locale === 'en' ? HOME_HERO_DEFAULTS.titleLine1En : HOME_HERO_DEFAULTS.titleLine1Es,
          titleLine2: locale === 'en' ? HOME_HERO_DEFAULTS.titleLine2En : HOME_HERO_DEFAULTS.titleLine2Es,
          subtitle: locale === 'en' ? HOME_HERO_DEFAULTS.subtitleEn : HOME_HERO_DEFAULTS.subtitleEs,
        }),
    hasDatabaseUrl ? getZones(locale).catch(() => []) : Promise.resolve([]),
  ]);

  const featured = propertyCatalog.length > 0 ? propertyCatalog : featuredProperties;
  const initialSearchType = catalogPreferences.type === 'casa' ? 'casa' : 'terreno';

  return (
    <>
      <Navbar />
      <main>
        <HomeHeroSection hero={hero} />
        <HomePageContent
          featured={featured}
          propertyCatalog={propertyCatalog}
          initialSearchType={initialSearchType}
          initialSearchZone={catalogPreferences.zone}
          zoneOptions={zoneOptions}
        />
      </main>
      <Footer />
    </>
  );
}
