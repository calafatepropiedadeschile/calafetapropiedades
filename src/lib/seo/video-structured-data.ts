type VideoStructuredDataInput = {
  name: string;
  description: string;
  watchPageUrl: string;
  thumbnailUrl: string;
  embedUrl: string;
  contentUrl: string;
  uploadDate: string;
};

export function buildVideoObjectJsonLd(input: VideoStructuredDataInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${input.watchPageUrl}#video`,
    name: input.name,
    description: input.description,
    thumbnailUrl: [input.thumbnailUrl],
    uploadDate: input.uploadDate,
    embedUrl: input.embedUrl,
    contentUrl: input.contentUrl,
    url: input.watchPageUrl,
    isFamilyFriendly: true,
    publisher: {
      '@type': 'Organization',
      name: 'Calafate Propiedades',
    },
  };
}
