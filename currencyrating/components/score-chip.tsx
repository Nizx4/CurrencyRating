export default function ScoreChip({ score, delta30 }: { score: number; delta30?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-[var(--cr-border)] text-xs font-tabular"
      title={delta30 !== undefined ? `Δ30d ${delta30 > 0 ? "+" : ""}${delta30.toFixed(1)}` : undefined}
    >
      {score.toFixed(1)}
    </span>
  );
}
