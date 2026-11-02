import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { redis, hashPw, clean, publicMemo } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const ids = await redis.zrange("memos", 0, 99, { rev: true });
  if (!ids.length) return NextResponse.json([]);
  const memos = await redis.mget(...ids.map((id) => `memo:${id}`));
  return NextResponse.json(memos.filter(Boolean).map(publicMemo));
}

export async function POST(req) {
  const { name, content, password } = clean(await req.json());
  if (!name || !content || password.length < 4) {
    return NextResponse.json(
      { error: "이름, 내용, 4자 이상의 비밀번호를 입력해 주세요." },
      { status: 400 }
    );
  }
  const now = Date.now();
  const memo = {
    id: crypto.randomUUID(),
    name,
    content,
    pw: hashPw(password),
    createdAt: now,
    updatedAt: now,
  };
  await redis.set(`memo:${memo.id}`, memo);
  await redis.zadd("memos", { score: now, member: memo.id });
  return NextResponse.json(publicMemo(memo), { status: 201 });
}
