import crypto from 'crypto';

export const contentHash = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};
