export function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="index">{number} /</span>
      <span>{children}</span>
    </div>
  );
}
