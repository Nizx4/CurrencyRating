import { gradeColor } from "@/lib/ratings";

export default function RatingPill({ grade, score }: { grade: string; score?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${gradeColor(
        grade
      )}`}
      title={score !== undefined ? `Score ${score.toFixed(1)}/100` : undefined}
      aria-label={`Grade ${grade}`}
    >
      {grade}
    </span>
  );
}
