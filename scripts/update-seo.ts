import { getPrismaClient } from '../src/lib/db/prisma';

const prisma = getPrismaClient();

async function main() {
  const keywords = JSON.stringify([
    'Parcelas en el sur de Chile',
    'Loteos en el sur de Chile',
    'Terrenos en el sur de Chile',
    'Calafate Propiedades',
    'proyectos inmobiliarios',
    'parcelas en venta',
    'Los Lagos',
    'Los Ríos',
    'Maule',
  ]);

  await prisma.siteSeoSettings.upsert({
    where: { id: 'main' },
    update: {
      defaultTitleEs: 'Parcelas, loteos y terrenos en el sur de Chile | Calafate Propiedades',
      defaultDescriptionEs: 'Encuentra parcelas, loteos y terrenos en el sur de Chile. Compra propiedades y proyectos inmobiliarios seleccionados con información clara, tours 360 y asesoría directa con Calafate Propiedades.',
      keywords,
    },
    create: {
      id: 'main',
      defaultTitleEs: 'Parcelas, loteos y terrenos en el sur de Chile | Calafate Propiedades',
      defaultDescriptionEs: 'Encuentra parcelas, loteos y terrenos en el sur de Chile. Compra propiedades y proyectos inmobiliarios seleccionados con información clara, tours 360 y asesoría directa con Calafate Propiedades.',
      keywords,
    }
  });

  console.log("SEO settings updated in database");
}

main().catch(console.error).finally(() => prisma.$disconnect());
