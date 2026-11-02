"use client";
import { useEffect, useState } from "react";

const fmt = (t) =>
  new Date(t).toLocaleString("ko-KR", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "문제가 생겼어요. 다시 시도해 주세요.");
  return data;
}

export default function Home() {
  const [memos, setMemos] = useState(null);
  const [form, setForm] = useState({ name: "", password: "", content: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api("/api/memos", "GET").then(setMemos).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("/api/memos", "POST", form);
      setForm({ ...form, content: "" });
      await load();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <main>
      <h1>공용 메모장</h1>

      <form className="compose" onSubmit={submit}>
        <div className="row">
          <input placeholder="이름" maxLength={20} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="password" placeholder="수정 비밀번호 (4자 이상)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <textarea placeholder="남기고 싶은 내용을 적어 주세요" rows={4} maxLength={2000}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })} />
        {err && <p className="err" role="alert">{err}</p>}
        <button disabled={busy}>{busy ? "저장 중…" : "메모 남기기"}</button>
      </form>

      <section>
        {memos === null && <p className="empty">불러오는 중…</p>}
        {memos?.length === 0 && <p className="empty">아직 메모가 없어요. 첫 메모를 남겨 보세요.</p>}
        {memos?.map((m) => <Memo key={m.id} memo={m} onChange={load} />)}
      </section>
    </main>
  );
}

function Memo({ memo, onChange }) {
  const [mode, setMode] = useState(null); // null | "edit" | "delete"
  const [f, setF] = useState({ name: memo.name, content: memo.content, password: "" });
  const [err, setErr] = useState("");

  const run = async () => {
    setErr("");
    try {
      if (mode === "edit") await api(`/api/memos/${memo.id}`, "PUT", f);
      else await api(`/api/memos/${memo.id}`, "DELETE", { password: f.password });
      setMode(null); setF({ ...f, password: "" });
      onChange();
    } catch (e) { setErr(e.message); }
  };

  return (
    <article className="memo">
      <header>
        <strong>{memo.name}</strong>
        <time>{fmt(memo.updatedAt)}{memo.updatedAt !== memo.createdAt && " (수정됨)"}</time>
      </header>

      {mode === "edit" ? (
        <>
          <input value={f.name} maxLength={20} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <textarea rows={4} value={f.content} maxLength={2000}
            onChange={(e) => setF({ ...f, content: e.target.value })} />
        </>
      ) : (
        <p className="body">{memo.content}</p>
      )}

      {mode && (
        <div className="row">
          <input type="password" placeholder="비밀번호" value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })} />
          <button className={mode === "delete" ? "danger" : ""} onClick={run}>
            {mode === "edit" ? "수정 저장" : "삭제 확인"}
          </button>
          <button className="ghost" onClick={() => { setMode(null); setErr(""); }}>취소</button>
        </div>
      )}
      {err && <p className="err" role="alert">{err}</p>}

      {!mode && (
        <footer>
          <button className="ghost" onClick={() => setMode("edit")}>수정</button>
          <button className="ghost" onClick={() => setMode("delete")}>삭제</button>
        </footer>
      )}
    </article>
  );
}
