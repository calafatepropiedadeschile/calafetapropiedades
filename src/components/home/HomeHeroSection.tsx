import type { HomeHeroContent } from '@/features/site-content/home-hero';

interface Props {
  hero: HomeHeroContent;
}

export default function HomeHeroSection({ hero }: Props) {
  return (
    <section id="hero" className="hero home-hero" aria-label="Presentacion Calafate Propiedades">
      <div
        className="home-hero__media"
        style={{ backgroundImage: `url("${hero.imageUrl}")` }}
        aria-hidden
      />
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
