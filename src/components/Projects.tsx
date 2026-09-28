import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { projects, type Project } from '@/data/projects';
import { SectionLabel } from './SectionLabel';
import ScrollableCardStack from './ui/scrollable-card-stack';
import { ProjectCardContent, ProjectPreview } from './ProjectPreview';

export function ProjectArtwork({
  project,
  interactive = false,
}: {
  project: Project;
  interactive?: boolean;
}) {
  return (
    <div className={`project-artwork ${project.theme}`}>
      <div className="project-visual">
        <div className="project-hover">
          {project.cover ? (
            <Image
              src={project.cover}
              alt={project.name}
              fill
              sizes="(max-width: 720px) 100vw, 90vw"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <>
              <div
                className={`project-sculpture ${project.theme} ${project.slug === 'dental-voice-agent' ? 'voice' : ''}`}
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </>
          )}
        </div>
      </div>
      <span className="project-cover-label micro">
        {project.category} / {project.number}
      </span>
      {!project.cover && (
        <span className="project-cover-word motion-mask" aria-hidden="true">
          <span className="cover-line">{project.coverTitle}</span>
        </span>
      )}
      <span className="project-cover-footer micro">
        {project.cover ? 'PROJECT SCREENSHOT' : 'SYSTEM ILLUSTRATION'} <span>{project.name}</span>
      </span>
      {interactive && (
        <span className="project-open">
          <ArrowUpRight size={25} />
        </span>
      )}
    </div>
  );
}
export function Projects() {
  const featured = projects.slice(0, 3);
  const items = featured.map((project, index) => ({
    id: project.slug,
    label: ['Dashboard', 'App', 'Workflow'][index],
    name: project.name,
    content: (
      <Link
        href={`/work/${project.slug}`}
        className="stack-card-link"
        aria-label={`Explore ${project.name}`}
      >
        <ProjectCardContent project={project} />
      </Link>
    ),
  }));
  items.push({
    id: 'all-work',
    label: 'All work',
    name: 'The complete collection',
    content: (
      <Link
        href="/work"
        className="stack-card-link collection-card"
        aria-label={`View all ${projects.length} projects`}
      >
        <div className="stack-card-top">
          <span className="micro">THE COMPLETE COLLECTION</span>
          <span className="micro">{projects.length} PROJECTS</span>
        </div>
        <div className="collection-content">
          <span className="micro">DASHBOARDS / APPS / AUTOMATIONS</span>
          <h3>
            More work.
            <br />
            <span>Same curiosity.</span>
          </h3>
          <p>A closer look at every system, from the first screen to the final workflow.</p>
          <div className="collection-thumbnails">
            {[projects[0], projects[3], projects[4]].map((project) => (
              <ProjectPreview key={project.slug} project={project} compact />
            ))}
          </div>
        </div>
        <div className="stack-card-caption">
          <span>Explore all projects</span>
          <span className="stack-open" aria-hidden="true">
            <ArrowUpRight size={24} />
          </span>
        </div>
      </Link>
    ),
  });
  return (
    <section id="work" className="work section-pad" aria-labelledby="work-title">
      <span className="boundary-scan" aria-hidden="true" />
      <div className="section-heading work-heading">
        <SectionLabel number="03">PROJECT INDEX</SectionLabel>
        <h2 id="work-title">
          <span className="work-title-line">SELECTED</span>
          <span className="work-title-line">
            WORK<span className="accent">↘</span>
          </span>
        </h2>
        <p>
          Real screens. Connected systems. A few things I’ve built to make everyday work easier.
          <span className="muted">DASHBOARDS / APPS / WORKFLOWS</span>
        </p>
      </div>
      <ScrollableCardStack items={items} />
    </section>
  );
}
