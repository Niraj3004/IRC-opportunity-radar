import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashString = async (text: string): Promise<string> => {
  return await bcrypt.hash(text, SALT_ROUNDS);
};

export const compareHash = async (text: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(text, hash);
};
