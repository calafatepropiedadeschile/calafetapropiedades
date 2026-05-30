export function buildGraciasUrl(params: {
  tipo: 'lead' | 'contacto';
  proyecto?: string;
  slug?: string;
}) {
  const search = new URLSearchParams();
  search.set('tipo', params.tipo);

  if (params.proyecto) {
    search.set('proyecto', params.proyecto);
  }

  if (params.slug) {
    search.set('slug', params.slug);
  }

  return `/gracias?${search.toString()}`;
}
