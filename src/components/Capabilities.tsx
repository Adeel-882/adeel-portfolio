import { ArrowUpRight, Braces, Workflow, PanelsTopLeft } from 'lucide-react';
import { site } from '@/data/site';
import { SectionLabel } from './SectionLabel';
export function Capabilities() {
  const icons = [Workflow, Braces, PanelsTopLeft];
  return (
    <section
      id="capabilities"
      className="capabilities section-pad"
      aria-labelledby="capabilities-title"
    >
      <div className="section-heading">
        <SectionLabel number="02">CAPABILITIES</SectionLabel>
        <h2 id="capabilities-title">
          WHAT I BUILD<span className="accent">.</span>
        </h2>
        <p>
          Different tools.
          <br />
          One connected way of working.
        </p>
      </div>
      <div className="capability-list">
        {site.capabilities.map((item, i) => {
          const Icon = icons[i];
          return (
            <article key={item.number} className="capability-row">
              <span className="motion-divider" aria-hidden="true" />
              <span className="micro capability-number">{item.number}</span>
              <div className="capability-name">
                <Icon size={27} strokeWidth={1.2} />
                <h3>{item.title}</h3>
              </div>
              <div className="capability-detail">
                <p>{item.description}</p>
                <ul>
                  {item.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <a
                href="#contact"
                className="round-link"
                aria-label={`Discuss ${item.title.toLowerCase()}`}
              >
                <ArrowUpRight size={23} />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
