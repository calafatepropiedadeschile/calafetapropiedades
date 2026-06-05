export function parseYoutubeVideoId(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?/]+)/);
  return match?.[1] ?? null;
}

export function getYoutubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYoutubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}

export function getYoutubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
