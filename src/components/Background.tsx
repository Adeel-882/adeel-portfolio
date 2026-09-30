import { site } from '@/data/site';
import { experience, education } from '@/data/experience';
import { toolkit } from '@/data/toolkit';
import { SectionLabel } from './SectionLabel';
export function Background() {
  return (
    <>
      <section
        id="background"
        className="background section-pad"
        aria-labelledby="background-title"
      >
        <SectionLabel number="05">BACKGROUND</SectionLabel>
        <h2 id="background-title" className="background-title">
          BUILT ON CURIOSITY.
          <br />
          <span className="muted">DRIVEN BY PRACTICE.</span>
        </h2>
        <div className="background-columns">
          <div className="experience-column">
            <h3>Experience</h3>
            {experience.some((x) => x.published) ? (
              experience
                .filter((x) => x.published)
                .map((x) => (
                  <article className="timeline-entry" key={x.role}>
                    <span className="motion-divider" aria-hidden="true" />
                    <h4>{x.role}</h4>
                    <p>{x.organization}</p>
                    <p>{x.description}</p>
                  </article>
                ))
            ) : (
              <p className="pending-note">Professional background to follow.</p>
            )}
          </div>
          <div className="education-column">
            <h3>Education</h3>
            {education.some((x) => x.published) ? (
              education
                .filter((x) => x.published)
                .map((x) => (
                  <article className="timeline-entry" key={x.degree}>
                    <span className="motion-divider" aria-hidden="true" />
                    <span className="micro">{x.year}</span>
                    <h4>{x.degree}</h4>
                    <p>{x.institution}</p>
                  </article>
                ))
            ) : (
              <p className="pending-note">Education details to follow.</p>
            )}
          </div>
        </div>
      </section>
      <section className="toolkit section-pad" id="toolkit" aria-labelledby="toolkit-title">
        <div>
          <SectionLabel number="06">TOOLKIT</SectionLabel>
          <h2 id="toolkit-title">
            THE RIGHT TOOLS.
            <br />
            THE WHOLE SYSTEM.
          </h2>
          <p>
            Technology serves the process.
            <br />
            Every piece needs a purpose.
          </p>
        </div>
        <div className="toolkit-list">
          {toolkit.map((group) => (
            <div className="toolkit-row" key={group.category}>
              <span className="motion-divider" aria-hidden="true" />
              <h3>{group.category}</h3>
              <p>
                {group.items.map((tool, i) => (
                  <span className="tool-label" key={tool}>
                    {i > 0 && <span className="tool-separator"> / </span>}
                    <span className="tool-name">{tool}</span>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="about section-pad" id="about" aria-labelledby="about-title">
        <div className="ambient-light" aria-hidden="true" />
        <SectionLabel number="07">THE PERSON BEHIND THE SYSTEM</SectionLabel>
        <div className="about-grid">
          <div className="about-mark" aria-hidden="true">
            a<span>.</span>
            <div className="micro">HUMAN BY DESIGN.</div>
          </div>
          <div className="about-copy">
            <h2 id="about-title">
              {site.about.title.split('\n').map((s) => (
                <span className="motion-mask" key={s}>
                  <span className="motion-line">{s}</span>
                </span>
              ))}
            </h2>
            <h3>{site.about.lead}</h3>
            <p>{site.about.body}</p>
            <p>{site.about.secondary}</p>
            <a className="text-link" href="#contact">
              Let’s put your ideas to work <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
