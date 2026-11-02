import { NextResponse } from "next/server";
import { redis, checkPw, clean, publicMemo } from "@/lib/db";

async function load(params, password) {
  const { id } = await params;
  const memo = await redis.get(`memo:${id}`);
  if (!memo) return { error: "메모를 찾을 수 없어요.", status: 404 };
  if (!password || !checkPw(password, memo.pw))
    return { error: "비밀번호가 맞지 않아요.", status: 403 };
  return { memo, id };
}

export async function PUT(req, { params }) {
  const { name, content, password } = clean(await req.json());
  const r = await load(params, password);
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  if (!name || !content)
    return NextResponse.json({ error: "이름과 내용을 입력해 주세요." }, { status: 400 });
  const updated = { ...r.memo, name, content, updatedAt: Date.now() };
  await redis.set(`memo:${r.id}`, updated);
  return NextResponse.json(publicMemo(updated));
}

export async function DELETE(req, { params }) {
  const { password } = clean(await req.json());
  const r = await load(params, password);
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  await redis.del(`memo:${r.id}`);
  await redis.zrem("memos", r.id);
  return NextResponse.json({ ok: true });
}
