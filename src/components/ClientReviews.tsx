import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { clientReviews } from '@/data/reviews';
import { projects } from '@/data/projects';
import { ProjectPreview } from './ProjectPreview';

export function ClientReviews() {
  const [angela, mobi] = clientReviews;
  const photo = (slug: string, className: string, label: string) => {
    const project = projects.find((item) => item.slug === slug)!;
    return (
      <Link
        href={`/work/${slug}`}
        className={`review-image ${className}`}
        aria-label={`Explore ${project.name}`}
      >
        <ProjectPreview project={project} compact />
        <span className="review-image-label">
          <span>{label}</span>
          <ArrowUpRight size={18} />
        </span>
      </Link>
    );
  };
  const quote = (review: typeof angela, className: string) => (
    <figure className={`review-quote ${className}`}>
      <figcaption>
        <strong>{review.name}</strong>
        <span>{review.context}</span>
      </figcaption>
      <blockquote>“{review.quote}”</blockquote>
      <span className="review-quote-mark" aria-hidden="true">
        ↗
      </span>
    </figure>
  );
  return (
    <section id="reviews" className="client-reviews section-pad" aria-labelledby="reviews-title">
      <div className="review-mosaic">
        <div className="review-title-tile">
          <span className="micro">PEOPLE / PROJECTS</span>
          <h2 id="reviews-title">
            Real
            <br />
            feedback.
          </h2>
          <span className="micro">FROM THE PEOPLE USING THE SYSTEMS</span>
        </div>
        {photo('company-dashboard', 'review-dashboard', 'Company command center')}
        {quote(angela, 'review-angela')}
        {quote(mobi, 'review-mobi')}
        {photo('leadsedge-voice-workflow', 'review-workflow', 'Voice & text bot')}
        {photo('gym-app', 'review-fitness', 'Daily fitness')}
      </div>
    </section>
  );
}
