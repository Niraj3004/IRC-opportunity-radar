export const OpportunityTypes = [
  'grant',
  'cfp',
  'conference',
  'hackathon',
  'competition',
  'workshop',
  'fellowship',
  'scholarship'
] as const;

export type OpportunityType = typeof OpportunityTypes[number];
