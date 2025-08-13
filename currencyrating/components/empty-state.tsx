export default function EmptyState({ title = "No results", subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="cr-card p-8 text-center text-[var(--cr-muted)]">
      <div className="font-semibold mb-1">{title}</div>
      {subtitle && <div className="text-sm">{subtitle}</div>}
    </div>
  );
}
