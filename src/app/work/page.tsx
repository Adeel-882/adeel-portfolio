import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { WorkArchive } from '@/components/WorkArchive';

export const metadata = {
  title: 'All projects — Adeel',
  description:
    'Explore dashboards, applications and connected automation workflows built by Adeel.',
};
export default function WorkPage() {
  return (
    <>
      <Header />
      <main id="main" className="work-archive section-pad">
        <Link href="/#work" className="text-link">
          <ArrowLeft size={17} />
          Back to selected work
        </Link>
        <div className="archive-heading">
          <span className="micro">THE PROJECT COLLECTION</span>
          <h1>
            BUILT TO
            <br />
            MAKE IT <span className="accent">WORK.</span>
          </h1>
          <p>
            Dashboards, apps and automations.
            <br />
            Different problems. Thoughtful solutions.
          </p>
        </div>
        <WorkArchive />
        <div className="case-footer">
          <span>Have a system in mind?</span>
          <Link href="/#contact" className="text-link">
            Let’s build it
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </main>
    </>
  );
}
