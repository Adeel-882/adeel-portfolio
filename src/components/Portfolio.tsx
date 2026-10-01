import { Header } from './Header';
import { Hero } from './Hero';
import { Capabilities } from './Capabilities';
import { Projects } from './Projects';
import { ClientReviews } from './ClientReviews';
import { Approach } from './Approach';
import { Background } from './Background';
import { Contact } from './Contact';
import { SectionLabel } from './SectionLabel';
import { site } from '@/data/site';
import { Motion } from './Motion';
import { PortfolioBackground } from './PortfolioBackground';
export function Portfolio() {
  return (
    <Motion>
      <PortfolioBackground />
      <Header />
      <main id="main">
        <Hero />
        <section
          id="positioning"
          className="positioning section-pad"
          aria-labelledby="positioning-title"
        >
          <span className="boundary-scan" aria-hidden="true" />
          <SectionLabel number="01">LESS FRICTION. MORE FORWARD.</SectionLabel>
          <h2 id="positioning-title">
            {site.intro.heading.map((s, i) => (
              <span className={i === 2 ? 'muted' : ''} key={s}>
                {s}
              </span>
            ))}
          </h2>
          <div className="positioning-bottom">
            <span className="micro">{site.intro.note}</span>
            <p>{site.intro.body}</p>
          </div>
        </section>
        <Capabilities />
        <Projects />
        <Approach />
        <ClientReviews />
        <Background />
        <Contact />
      </main>
    </Motion>
  );
}
