import { redis, KEY, hashPw, parse, pub, validate } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const all = (await redis.hgetall(KEY)) || {};
      const list = Object.values(all).map(parse).map(pub)
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const { name, password, content, createdAt } = req.body || {};
      const err = validate({ name, content });
      if (err) return res.status(400).json({ error: err });
      if (!password || password.length < 4) {
        return res.status(400).json({ error: '수정 비밀번호는 4자 이상이어야 해요.' });
      }
      const now = Date.now();
      let created = now;
      if (createdAt !== undefined && createdAt !== null && createdAt !== '') {
        created = Number(createdAt);
        if (!Number.isFinite(created) || created < Date.UTC(2000, 0, 1) || created > Date.UTC(2100, 0, 1)) {
          return res.status(400).json({ error: '작성일이 올바르지 않아요.' });
        }
      }
      const id = `${now}-${Math.random().toString(36).slice(2, 7)}`;
      const note = { id, name: name.trim(), content: content.trim(), pw: hashPw(password), createdAt: created, updatedAt: created };
      await redis.hset(KEY, { [id]: JSON.stringify(note) });
      return res.status(201).json(pub(note));
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '서버 오류가 발생했어요.' });
  }
}
