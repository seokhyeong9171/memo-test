import { redis, KEY, checkPw, parse, pub, validate } from '../_lib.js';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    const raw = await redis.hget(KEY, id);
    if (!raw) return res.status(404).json({ error: '메모를 찾을 수 없어요.' });
    const note = parse(raw);

    const { password, name, content } = req.body || {};
    if (!password || !checkPw(password, note.pw)) {
      return res.status(403).json({ error: '비밀번호가 일치하지 않아요.' });
    }

    if (req.method === 'PUT') {
      const err = validate({ name: name ?? note.name, content });
      if (err) return res.status(400).json({ error: err });
      const next = { ...note, name: (name ?? note.name).trim(), content: content.trim(), updatedAt: Date.now() };
      await redis.hset(KEY, { [id]: JSON.stringify(next) });
      return res.status(200).json(pub(next));
    }

    if (req.method === 'DELETE') {
      await redis.hdel(KEY, id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '서버 오류가 발생했어요.' });
  }
}
