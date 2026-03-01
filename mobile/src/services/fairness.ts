export function computeFairnessScore({
  offersGiven,
  completedMatches,
  activeRequests,
}: {
  offersGiven: number;
  completedMatches: number;
  activeRequests: number;
}) {
  const raw =
    50 +
    10 * offersGiven +
    5 * completedMatches -
    5 * activeRequests;

  return Math.max(0, Math.min(100, raw));
}