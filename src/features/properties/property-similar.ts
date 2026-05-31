type SimilarSource = {
  id: string;
  price: number;
  type: string;
  zoneEs: string;
  zoneEn: string | null;
  cityEs: string;
  cityEn: string | null;
  bedrooms: number | null;
  lotSurfaceM2: number | null;
  builtArea: number | null;
  area: number | null;
  totalArea: number | null;
  featured: boolean;
  sortOrder: number;
};

type SimilarCandidate = SimilarSource & {
  createdAt: Date;
};

function normalizeLocation(value: string) {
  return value.trim().toLowerCase();
}

function getEffectiveSurface(property: Pick<SimilarSource, 'lotSurfaceM2' | 'builtArea' | 'area' | 'totalArea'>) {
  return property.lotSurfaceM2 ?? property.builtArea ?? property.totalArea ?? property.area ?? null;
}

function isWithinPriceBand(price: number, reference: number, tolerance: number) {
  if (reference <= 0) return true;

  const min = reference * (1 - tolerance);
  const max = reference * (1 + tolerance);
  return price >= min && price <= max;
}

export function scoreSimilarProperty<T extends SimilarCandidate>(
  candidate: T,
  source: SimilarSource,
  priceTolerance: number,
) {
  let score = 0;

  const sourceZones = [source.zoneEs, source.zoneEn].filter(Boolean).map((value) => normalizeLocation(value!));
  const sourceCities = [source.cityEs, source.cityEn].filter(Boolean).map((value) => normalizeLocation(value!));
  const candidateZones = [candidate.zoneEs, candidate.zoneEn].filter(Boolean).map((value) => normalizeLocation(value!));
  const candidateCities = [candidate.cityEs, candidate.cityEn].filter(Boolean).map((value) => normalizeLocation(value!));

  if (candidateZones.some((zone) => sourceZones.includes(zone))) {
    score += 100;
  } else if (candidateCities.some((city) => sourceCities.includes(city))) {
    score += 60;
  }

  if (isWithinPriceBand(candidate.price, source.price, priceTolerance)) {
    score += 40;
  } else if (source.price > 0) {
    const priceDiffRatio = Math.abs(candidate.price - source.price) / source.price;
    score += Math.max(0, 20 - priceDiffRatio * 20);
  }

  if (source.type === 'casa' && source.bedrooms != null && candidate.bedrooms != null) {
    const bedroomDiff = Math.abs(candidate.bedrooms - source.bedrooms);
    if (bedroomDiff === 0) score += 20;
    else if (bedroomDiff === 1) score += 10;
  }

  if (source.type === 'terreno') {
    const sourceSurface = getEffectiveSurface(source);
    const candidateSurface = getEffectiveSurface(candidate);

    if (sourceSurface && candidateSurface) {
      const ratio = candidateSurface / sourceSurface;
      if (ratio >= 0.6 && ratio <= 1.4) score += 20;
      else if (ratio >= 0.5 && ratio <= 1.5) score += 10;
    }
  }

  if (candidate.featured) score += 5;
  score += candidate.sortOrder / 1000;

  return score;
}

export function rankSimilarProperties<T extends SimilarCandidate>(
  candidates: T[],
  source: SimilarSource,
  limit: number,
  priceTolerance: number,
) {
  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreSimilarProperty(candidate, source, priceTolerance),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.candidate.sortOrder !== left.candidate.sortOrder) {
        return right.candidate.sortOrder - left.candidate.sortOrder;
      }
      if (right.candidate.featured !== left.candidate.featured) {
        return Number(right.candidate.featured) - Number(left.candidate.featured);
      }
      return right.candidate.createdAt.getTime() - left.candidate.createdAt.getTime();
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function pickSimilarProperties<T extends SimilarCandidate>(
  candidates: T[],
  source: SimilarSource,
  limit: number,
) {
  const strict = rankSimilarProperties(candidates, source, limit, 0.35);
  if (strict.length >= limit) return strict;

  const relaxed = rankSimilarProperties(candidates, source, limit, 0.5);
  const seen = new Set(strict.map((property) => property.id));

  for (const property of relaxed) {
    if (seen.has(property.id)) continue;
    strict.push(property);
    seen.add(property.id);
    if (strict.length >= limit) break;
  }

  return strict;
}
