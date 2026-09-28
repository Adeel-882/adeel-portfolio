import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { HeroSpectralHuman } from './HeroSpectralHuman';
import { site } from '@/data/site';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="ambient-light" aria-hidden="true" />
      <div className="hero-human">
        <div className="human-scroll">
          <div className="human-enter">
            <HeroSpectralHuman />
          </div>
        </div>
      </div>
      <div className="hero-main">
        <div className="eyebrow hero-enter">
          <span className="status-dot" />
          {site.role}
        </div>
        <h1 id="hero-title">
          {site.headline.map((line, i) => (
            <span className="headline-line" key={line}>
              <span className={`hero-line line-${i}`}>{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero-description hero-enter">{site.description}</p>
        <div className="hero-actions hero-enter">
          <a className="button button-primary" href="#work">
            Explore my work <ArrowDown size={17} />
          </a>
          <a className="text-link" href="#contact">
            Let’s build a system <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
      <div className="hero-footer">
        <span className="micro">INDEPENDENT DEVELOPER / SYSTEMS BUILDER</span>
        <a className="scroll-link micro" href="#positioning">
          SCROLL TO EXPLORE <ArrowDown size={15} />
        </a>
      </div>
    </section>
  );
}
