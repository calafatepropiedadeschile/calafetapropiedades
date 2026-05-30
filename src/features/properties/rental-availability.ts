import { unstable_cache } from 'next/cache';
import { getRentalsNavMode } from '@/config/rentals';
import { getPrismaClient } from '@/lib/db/prisma';

export async function getPublishedRentalCount() {
  if (!process.env.DATABASE_URL) return 0;

  return unstable_cache(
    async () => {
      const db = getPrismaClient();
      return db.property.count({
        where: { published: true, priceType: 'arriendo' },
      });
    },
    ['published-rental-count-v1'],
    { revalidate: 60, tags: ['properties'] },
  )();
}

/** Menú y footer: visible salvo modo hidden. La landing /arriendos funciona aun sin stock. */
export async function shouldShowRentalsNavigation() {
  return getRentalsNavMode() !== 'hidden';
}

export async function hasPublishedRentals() {
  const count = await getPublishedRentalCount();
  return count > 0;
}
