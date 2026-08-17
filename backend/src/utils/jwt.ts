import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
