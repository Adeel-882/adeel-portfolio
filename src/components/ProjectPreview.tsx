import Image from 'next/image';
import { ArrowUpRight, Layers, AudioLines, Workflow } from 'lucide-react';
import type { Project } from '@/data/projects';

export function ProjectPreview({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  if (project.slug === 'gym-app')
    return (
      <div className={`project-preview fitness-preview ${compact ? 'compact-preview' : ''}`}>
        {[2, 1, 3].map((frame, index) => (
          <div className="fitness-screen" key={frame}>
            <Image
              src={`/projects/gym-app/${frame}-focus.webp`}
              alt={['Meal schedule', 'Daily fitness overview', 'Workout exercise log'][index]}
              fill
              sizes="(max-width: 640px) 30vw, 230px"
            />
          </div>
        ))}
      </div>
    );
  if (project.cover)
    return (
      <div
        className={`project-preview screenshot-preview ${project.kind === 'Workflow' ? 'workflow-preview' : ''}`}
      >
        <Image
          src={project.cover}
          alt={`${project.name} project screenshot`}
          fill
          sizes={compact ? '(max-width: 640px) 90vw, 45vw' : '(max-width: 800px) 90vw, 1000px'}
        />
      </div>
    );
  const Icon =
    project.slug === 'dental-voice-agent'
      ? AudioLines
      : project.kind === 'Workflow'
        ? Workflow
        : Layers;
  return (
    <div className={`project-preview archive-illustration ${project.theme}`}>
      <Icon size={70} strokeWidth={1} />
      <span>{project.coverTitle}</span>
      <span className="micro">SYSTEM OVERVIEW</span>
    </div>
  );
}

export function ProjectCardContent({ project }: { project: Project }) {
  return (
    <>
      <div className="stack-card-top">
        <span className="micro">{project.category}</span>
        <span className="micro">SELECTED / {project.number}</span>
      </div>
      <ProjectPreview project={project} />
      <div className="stack-card-caption">
        <div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
        <span className="stack-open" aria-hidden="true">
          <ArrowUpRight size={24} />
        </span>
      </div>
    </>
  );
}
