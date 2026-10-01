import Link from 'next/link';
import type { ReactNode } from 'react';
import { site } from '@/data/site';
import { projects, type Project } from '@/data/projects';
import { experience, education } from '@/data/experience';
import { toolkit } from '@/data/toolkit';
import { clientReviews } from '@/data/reviews';

function Fields({ entries }: { entries: [string, ReactNode][] }) {
  return (
    <dl className="machine-fields">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProjectManifest({ project }: { project: Project }) {
  return (
    <article className="machine-project" id={`machine-project-${project.slug}`}>
      <h3>
        <span aria-hidden="true"># </span>project / {project.number}
      </h3>
      <Fields
        entries={[
          ['name', project.name],
          ['category', project.category],
          ['role', project.role],
          ['overview', project.description],
          ['problem', project.problem],
          ['challenge', project.challenge],
          ['system', project.system],
          ['build', project.build],
          ...(project.technologies.length
            ? [['stack', project.technologies.join(' / ')] as [string, ReactNode]]
            : []),
          ['outcome', project.outcome],
          [
            'details',
            <Link key="details" href={`/work/${project.slug}`}>
              → Open {project.name}
            </Link>,
          ],
          [
            'screens',
            <ul key="screens">
              {project.gallery.map((image) => (
                <li key={image.src}>
                  <a href={image.src} target="_blank" rel="noopener noreferrer">
                    ↗ {image.alt}
                  </a>
                </li>
              ))}
            </ul>,
          ],
        ]}
      />
    </article>
  );
}

export function MachinePortfolio({ pathname }: { pathname: string }) {
  const project = projects.find((item) => pathname === `/work/${item.slug}`);
  const home = pathname === '/';
  const shownProjects = project
    ? [project]
    : projects.filter((item) => item.status === 'published');
  return (
    <div className="machine-view">
      <a className="skip-link" href="#machine-main">
        Skip to machine content
      </a>
      <header className="machine-header">
        <Link href="/" aria-label="Adeel home">
          portfolio://adeel
        </Link>
        <span>
          <span className="machine-status" aria-hidden="true" />
          mode / machine
        </span>
      </header>
      <main id="machine-main" className="machine-main">
        <h1>
          {project
            ? `project / ${project.slug}`
            : home
              ? 'adeel-portfolio'
              : 'adeel-portfolio / work'}
        </h1>
        <nav className="machine-nav" aria-label="Machine portfolio navigation">
          {home ? (
            <>
              <a href="#machine-identity">Identity</a>
              <a href="#machine-work">Work</a>
              <a href="#machine-experience">Experience</a>
              <a href="#machine-about">About</a>
            </>
          ) : (
            <>
              <Link href="/">→ Portfolio</Link>
              <Link href="/work">→ All projects</Link>
            </>
          )}
          <a href="#machine-contact">Contact</a>
        </nav>
        {home && (
          <>
            <section id="machine-identity">
              <h2># identity</h2>
              <Fields
                entries={[
                  ['name', site.name],
                  ['role', site.role],
                  ['positioning', site.headline.join(' ')],
                  ['focus', site.description],
                  ['philosophy', site.intro.body],
                ]}
              />
            </section>
            <section id="machine-capabilities">
              <h2># capabilities</h2>
              {site.capabilities.map((capability) => (
                <article key={capability.number}>
                  <h3>
                    {capability.number} / {capability.title}
                  </h3>
                  <p>{capability.description}</p>
                  <ul>
                    {capability.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          </>
        )}
        <section id="machine-work">
          <h2>{project ? '# project-manifest' : '# selected-work'}</h2>
          {shownProjects.map((item) => (
            <ProjectManifest key={item.slug} project={item} />
          ))}
        </section>
        {home && (
          <>
            <section id="machine-approach">
              <h2># system-approach</h2>
              <p>{site.approach.description}</p>
              <ol>
                {site.approach.steps.map((step) => (
                  <li key={step.title}>
                    <strong>{step.title}</strong> / {step.detail}
                  </li>
                ))}
              </ol>
            </section>
            <section id="machine-feedback">
              <h2># feedback</h2>
              {clientReviews.map((review) => (
                <article key={review.name}>
                  <Fields
                    entries={[
                      ['name', review.name],
                      ['context', review.context],
                      ['feedback', <q key="feedback">{review.quote}</q>],
                    ]}
                  />
                </article>
              ))}
            </section>
            <section id="machine-experience">
              <h2># experience</h2>
              {experience
                .filter((item) => item.published)
                .map((item) => (
                  <article key={item.role}>
                    <Fields
                      entries={[
                        ['role', item.role],
                        ['organization', item.organization],
                        ['focus', item.description],
                      ]}
                    />
                  </article>
                ))}
            </section>
            <section id="machine-education">
              <h2># education</h2>
              {education
                .filter((item) => item.published)
                .map((item) => (
                  <article key={item.degree}>
                    <Fields
                      entries={[
                        ['degree', item.degree],
                        ['institution', item.institution],
                        ['years', item.year],
                      ]}
                    />
                  </article>
                ))}
            </section>
            <section id="machine-toolkit">
              <h2># toolkit</h2>
              <Fields
                entries={toolkit.map((group) => [
                  group.category,
                  <ul key={group.category}>
                    {group.items.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>,
                ])}
              />
            </section>
            <section id="machine-about">
              <h2># about</h2>
              <p>{site.about.lead}</p>
              <p>{site.about.body}</p>
              <p>{site.about.secondary}</p>
            </section>
          </>
        )}
        <section id="machine-contact">
          <h2># contact</h2>
          <p>{site.contact.description}</p>
          <Fields
            entries={[
              [
                'email',
                <a key="email" href={`mailto:${site.email}`}>
                  {site.email} ↗
                </a>,
              ],
              [
                'whatsapp',
                <a key="whatsapp" href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                  {site.whatsapp} ↗
                </a>,
              ],
              [
                'instagram',
                <a key="instagram" href={site.instagram} target="_blank" rel="noopener noreferrer">
                  {new URL(site.instagram).pathname.replaceAll('/', '')} ↗
                </a>,
              ],
              ...(site.linkedin
                ? [
                    [
                      'linkedin',
                      <a
                        key="linkedin"
                        href={site.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {site.linkedin} ↗
                      </a>,
                    ] as [string, ReactNode],
                  ]
                : []),
            ]}
          />
        </section>
        <footer className="machine-footer">
          <a href="#machine-main">↑ Back to top</a>
          <span>end / {site.name}</span>
        </footer>
      </main>
    </div>
  );
}
