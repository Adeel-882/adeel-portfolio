'use client';
import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { site } from '@/data/site';
import { SectionLabel } from './SectionLabel';
export function Approach() {
  const [active, setActive] = useState(0);
  return (
    <section className="approach section-pad" id="approach" aria-labelledby="approach-title">
      <SectionLabel number="04">THE SYSTEM APPROACH</SectionLabel>
      <div className="approach-heading">
        <h2 id="approach-title">
          {site.approach.heading.map((s, i) => (
            <span className={`motion-mask ${i === 1 ? 'muted' : ''}`} key={s}>
              <span className="motion-line">{s}</span>
            </span>
          ))}
        </h2>
        <div>
          <Plus className="approach-plus" size={48} strokeWidth={1} />
          <p>{site.approach.description}</p>
        </div>
      </div>
      <div className="process" aria-label="Explore the system approach">
        <div className="process-track" aria-hidden="true">
          <span className="process-progress" />
          <span className="process-pulse" />
        </div>
        {site.approach.steps.map((step, i) => (
          <button
            type="button"
            key={step.title}
            className={`process-step ${active === i ? 'active' : ''}`}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            aria-controls="process-detail"
          >
            <span className="micro">0{i + 1}</span>
            <span className="process-node">
              <span className="node-flash" aria-hidden="true" />
            </span>
            <span className="process-title">{step.title}</span>
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
      <div id="process-detail" className="process-detail" aria-live="polite">
        <span className="micro">
          0{active + 1} / {site.approach.steps[active].title}
        </span>
        <p>{site.approach.steps[active].detail}</p>
      </div>
      <div className="approach-footer micro">
        <span>BUILT AROUND YOUR BUSINESS</span>
        <span>HUMAN JUDGMENT, ALWAYS IN THE LOOP.</span>
      </div>
    </section>
  );
}
