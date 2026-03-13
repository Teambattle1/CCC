/** Canonical activity slug → display name mapping */
export const ACTIVITY_NAMES: Record<string, string> = {
  A1: 'TeamChallenge',
  A2: 'TeamLazer',
  A3: 'TeamRobin',
  A4: 'TeamBox',
  A5: 'TeamConnect',
  A6: 'TeamPlay',
  A8: 'TeamSegway',
  A9: 'TeamControl',
  A10: 'TeamConstruct',
  A12: 'TeamRace',
  teamlazer: 'TeamLazer (Gevær)',
  teamtaste: 'TeamTaste',
  teamaction: 'TeamAction',
};

/** All known activity slugs in display order */
export const ACTIVITY_SLUGS = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
  'A8', 'A9', 'A10', 'A12',
  'teamlazer', 'teamtaste', 'teamaction',
] as const;

export function getActivityName(slug: string): string {
  return ACTIVITY_NAMES[slug] || slug;
}
