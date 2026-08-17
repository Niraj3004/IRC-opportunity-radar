export const SourceTypes = [
  'rss',
  'api',
  'html',
  'browser'
] as const;

export type SourceType = typeof SourceTypes[number];
