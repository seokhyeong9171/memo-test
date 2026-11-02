import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

// Vercel 마켓플레이스(Upstash)가 넣어주는 환경변수 이름 두 가지를 모두 지원
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPw(pw, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pw, salt, 32);
  return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}

export function clean(body) {
  return {
    name: String(body.name ?? "").trim().slice(0, 20),
    content: String(body.content ?? "").trim().slice(0, 2000),
    password: String(body.password ?? ""),
  };
}

// 비밀번호 해시는 절대 클라이언트로 내보내지 않음
export function publicMemo({ pw, ...rest }) {
  return rest;
}
