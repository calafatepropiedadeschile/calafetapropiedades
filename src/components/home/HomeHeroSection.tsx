import Image from 'next/image';
import type { HomeHeroContent } from '@/features/site-content/home-hero';
import { isOptimizableLocalImage, resolveHeroImageUrl } from '@/lib/images/resolve-hero-image';

interface Props {
  hero: HomeHeroContent;
}

export default function HomeHeroSection({ hero }: Props) {
  const imageSrc = resolveHeroImageUrl(hero.imageUrl);
  const isLocal = isOptimizableLocalImage(imageSrc);

  return (
    <section id="hero" className="hero home-hero" aria-label="Presentacion Calafate Propiedades">
      <div className="home-hero__media" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={isLocal ? 82 : 75}
          sizes="100vw"
          className="home-hero__image"
        />
      </div>
      <div className="home-hero__overlay" aria-hidden />
      <div className="container home-hero__content">
        <div className="hero-content home-hero__copy">
          <h1 className="hero-title">
            {hero.titleLine1}
            <br />
            {hero.titleLine2}
          </h1>
          <p className="home-hero__subtitle">{hero.subtitle}</p>
        </div>
      </div>
    </section>
  );
}
