import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="micro">404 / CONNECTION NOT FOUND</span>
      <h1>
        Let’s get you
        <br />
        back on track.
      </h1>
      <Link className="button button-primary" href="/">
        Return to Adeel’s portfolio ↗
      </Link>
    </main>
  );
}
