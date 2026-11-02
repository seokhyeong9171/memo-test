import { Redis } from '@upstash/redis';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const KEY = 'memos';

export function hashPw(pw) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
}

export function checkPw(pw, stored) {
  const [salt, hash] = stored.split(':');
  const a = Buffer.from(hash, 'hex');
  const b = scryptSync(String(pw), salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
export const pub = ({ pw, ...rest }) => rest;

export function validate({ name, content }) {
  if (!name || name.trim().length < 1 || name.length > 20) return '이름은 1~20자로 입력해 주세요.';
  if (!content || content.trim().length < 1 || content.length > 1000) return '내용은 1~1000자로 입력해 주세요.';
  return null;
}
