import { randomBytes } from 'crypto';

export const generateSessionId = () => {
  return randomBytes(30).toString('base64');
};
