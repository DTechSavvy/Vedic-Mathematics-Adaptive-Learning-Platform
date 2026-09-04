export interface ActionVerb {
  verb: string;
  weight: number;
}

export const ACTION_VERBS: ActionVerb[] = [
  { verb: 'explain', weight: 3 },
  { verb: 'solve', weight: 4 },
  { verb: 'practice', weight: 4 },
  { verb: 'learn', weight: 3 },
  { verb: 'teach', weight: 3 },
  { verb: 'recommend', weight: 2 },
  { verb: 'plan', weight: 3 },
  { verb: 'compare', weight: 3 },
  { verb: 'calculate', weight: 4 },
  { verb: 'find', weight: 2 },
  { verb: 'identify', weight: 2 },
  { verb: 'derive', weight: 4 },
  { verb: 'simplify', weight: 3 },
];
