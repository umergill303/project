export function getCompareLabel(start: Date, end: Date): string {
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

  if (diff <= 7) return 'vs. last 7 days'
  if (diff <= 14) return 'vs. last 14 days'
  if (diff <= 30) return 'vs. last 30 days'
  if (diff <= 90) return 'vs. last 3 months'
  if (diff <= 180) return 'vs. last 6 months'
  return 'vs. last year'
}
