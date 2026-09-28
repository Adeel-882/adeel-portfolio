'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { ProjectPreview } from './ProjectPreview';

const filters = ['All', 'Dashboard', 'App', 'Workflow'] as const;
export function WorkArchive() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const visible = projects.filter((project) => filter === 'All' || project.kind === filter);
  return (
    <>
      <div className="archive-toolbar">
        <div className="archive-filters" role="group" aria-label="Filter projects">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item === 'App'
                ? 'Apps'
                : item === 'Workflow'
                  ? 'Workflows'
                  : item === 'Dashboard'
                    ? 'Dashboards'
                    : 'All projects'}
              <span>{projects.filter((p) => item === 'All' || p.kind === item).length}</span>
            </button>
          ))}
        </div>
        <span className="micro" role="status">
          {visible.length} PROJECT{visible.length === 1 ? '' : 'S'}
        </span>
      </div>
      <div className="archive-grid">
        {visible.map((project) => (
          <article className="archive-card" key={project.slug}>
            <Link href={`/work/${project.slug}`} aria-label={`Explore ${project.name}`}>
              <ProjectPreview project={project} compact />
              <div className="archive-card-copy">
                <span className="micro">{project.category}</span>
                <h2>
                  {project.name}
                  <ArrowUpRight size={20} />
                </h2>
                <p>{project.description}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
