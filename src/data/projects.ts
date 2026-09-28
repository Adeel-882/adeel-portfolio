import { screenshotProjects } from './screenshot-projects';

export type Project = {
  kind?: 'Dashboard' | 'App' | 'Workflow';
  slug: string;
  name: string;
  number: string;
  status: 'pending' | 'published';
  description: string;
  role: string;
  problem: string;
  challenge: string;
  system: string;
  build: string;
  technologies: string[];
  outcome: string;
  gallery: { src: string; alt: string }[];
  cover: string | null;
  theme: 'cobalt' | 'graphite';
  coverTitle: string;
  category: string;
};
export const projects: Project[] = screenshotProjects.map((project, index) => ({
  ...project,
  number: String(index + 1).padStart(2, '0'),
}));
