import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { Header } from '@/components/Header';
import { ProjectArtwork } from '@/components/Projects';
import { ProjectPreview } from '@/components/ProjectPreview';

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);
  return { title: project ? `${project.name} — Adeel` : 'Project not found — Adeel' };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);
  if (!project) notFound();
  return (
    <>
      <Header />
      <main id="main" className="case-study section-pad">
        <Link className="text-link" href="/work">
          <ArrowLeft size={17} /> All work
        </Link>
        <div className="case-title">
          <span className="micro">PROJECT / {project.number}</span>
          <h1>
            {project.name}
            <span className="accent">.</span>
          </h1>
          <p>{project.status === 'pending' ? 'Case study in preparation' : project.description}</p>
        </div>
        {project.cover ? (
          <div className="case-preview">
            <ProjectPreview project={project} />
          </div>
        ) : (
          <ProjectArtwork project={project} />
        )}
        {project.status === 'pending' ? (
          <section className="case-pending">
            <span className="micro">A CLOSER LOOK, COMING SOON.</span>
            <h2>
              The story behind
              <br />
              the system.
            </h2>
            <p>
              This is a visual preview. The project’s scope, build details and outcomes are being
              documented. A full case study will be published here when those details are ready.
            </p>
            <Link className="text-link" href="/#contact">
              Discuss a system of your own
              <ArrowUpRight size={17} />
            </Link>
          </section>
        ) : (
          <div className="case-sections">
            {(project.cover
              ? [
                  ['The idea', project.problem],
                  ['The challenge', project.challenge],
                  ['The system', project.system],
                  ['What I built', project.build],
                  ...(project.technologies.length
                    ? [['Tools', project.technologies.join(' / ')]]
                    : []),
                  ['The outcome', project.outcome],
                ]
              : [
                  ['Overview', project.description],
                  ['Role', project.role],
                  ['Problem', project.problem],
                  ['Challenge', project.challenge],
                  ['System', project.system],
                  ['Build', project.build],
                  ['Technology', project.technologies.join(' / ')],
                  ['Outcome', project.outcome],
                ]
            ).map(([title, body]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </section>
            ))}
            {project.gallery.length > 0 && (
              <section className="case-gallery-section">
                <h2>Gallery</h2>
                <div
                  className={`case-gallery ${project.slug === 'gym-app' ? 'phone-gallery' : ''}`}
                >
                  {project.gallery.map((img) => (
                    <figure key={img.src}>
                      <a
                        href={img.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open full-size: ${img.alt}`}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={1400}
                          height={900}
                          sizes="(max-width: 640px) 90vw, 45vw"
                        />
                      </a>
                      <figcaption>{img.alt}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        <nav className="case-footer" aria-label="Project navigation">
          <Link className="text-link" href="/work">
            <ArrowLeft size={17} /> All projects
          </Link>
          <Link className="text-link" href="/#contact">
            Let’s build a system
            <ArrowUpRight size={17} />
          </Link>
        </nav>
      </main>
    </>
  );
}
