// Ratings thresholds and helpers

export function scoreToGrade(score: number): string {
  if (score >= 90) return "AAA";
  if (score >= 86) return "AA+";
  if (score >= 82) return "AA";
  if (score >= 78) return "AA-";
  if (score >= 74) return "A+";
  if (score >= 70) return "A";
  if (score >= 66) return "A-";
  if (score >= 62) return "BBB+";
  if (score >= 58) return "BBB";
  if (score >= 54) return "BBB-";
  if (score >= 50) return "BB+";
  if (score >= 46) return "BB";
  if (score >= 42) return "BB-";
  if (score >= 38) return "B+";
  if (score >= 34) return "B";
  if (score >= 30) return "B-";
  if (score >= 20) return "CCC";
  if (score >= 10) return "CC";
  return "D";
}

export function gradeColor(grade: string): string {
  // Greens for AA and above; ambers for A/BBB; reds for BB and below
  const g = grade.toUpperCase();
  if (["AAA", "AA+", "AA", "AA-"].includes(g)) return "bg-green-500/20 text-green-300 border-green-600/40";
  if (["A+", "A", "A-", "BBB+", "BBB", "BBB-"].includes(g))
    return "bg-amber-500/20 text-amber-300 border-amber-600/40";
  return "bg-rose-500/20 text-rose-300 border-rose-600/40";
}
