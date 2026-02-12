"use client";

import { useEffect, useMemo, useState } from "react";

type VideoItem = {
  id: string;
  title: string;
  url: string;
  note?: string;
  createdAt: string;
  thumbnailUrl?: string;
};

const STORAGE_KEY = "my-video-notes";

function loadItems(): VideoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VideoItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveItems(items: VideoItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function extractYouTubeId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1) || null;
    }
    if (
      url.hostname.includes("youtube.com") &&
      (url.pathname === "/watch" || url.pathname === "/shorts")
    ) {
      if (url.pathname === "/shorts") {
        const id = url.pathname.split("/")[2];
        return id || null;
      }
      const v = url.searchParams.get("v");
      return v || null;
    }
  } catch {
    return null;
  }
  return null;
}

function buildThumbnailUrl(link: string): string | undefined {
  const youtubeId = extractYouTubeId(link);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  return undefined;
}

export default function HomePage() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setItems(loadItems());
  }, []);

  useEffect(() => {
    if (items.length) {
      saveItems(items);
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.note ?? "").toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
    );
  }, [items, search]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    const newItem: VideoItem = {
      id: crypto.randomUUID(),
      title: title.trim() || url.trim(),
      url: url.trim(),
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
      thumbnailUrl: buildThumbnailUrl(url.trim()),
    };

    setItems((prev) => [newItem, ...prev]);
    setTitle("");
    setUrl("");
    setNote("");
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">
            คลิปที่อยากเก็บไว้ดูทีหลัง
          </h1>
          <p className="text-slate-300 text-sm">
            บันทึกแค่ลิงก์ + โน้ตสั้นๆ แล้วกลับมาดูภายหลังได้ (ข้อมูลเก็บใน
            browser ของเราเอง)
          </p>
        </header>

        <section className="mb-8 bg-slate-800/70 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <form
            onSubmit={handleAdd}
            className="flex flex-col gap-3 md:flex-row md:items-end md:flex-wrap"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ชื่อคลิป (ไม่ใส่ก็ได้)
              </label>
              <input
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="เช่น คลิปสอน React ที่ชอบมาก"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ลิงก์คลิป *
              </label>
              <input
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="วาง URL จาก YouTube / TikTok / ฯลฯ"
                value={url}
                required
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                โน้ตสั้นๆ (ไว้กันลืมว่าเพราะอะไรถึงชอบ)
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                rows={2}
                placeholder="เช่น สอน concept ดีมาก นาทีที่ 12:30 ต้องกลับมาดูอีก"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-500 text-slate-950 font-medium text-sm px-4 py-2.5 transition-colors w-full md:w-auto"
            >
              บันทึกคลิปนี้
            </button>
          </form>
        </section>

        <section className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-300">
            ทั้งหมด {items.length} คลิป
          </div>
          <div className="w-full md:w-72">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="ค้นจากชื่อ / โน้ต / ลิงก์"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-sm text-slate-400 border border-dashed border-slate-700 rounded-2xl p-6 text-center">
              ยังไม่มีคลิปที่บันทึก ลองวางลิงก์อันแรกด้านบนได้เลย 🙂
            </div>
          ) : (
            filteredItems.map((item) => (
              <article
                key={item.id}
                className="group bg-slate-800/70 border border-slate-700 hover:border-cyan-400/60 rounded-2xl p-4 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-50 text-sm truncate hover:text-cyan-300"
                    >
                      {item.title}
                    </a>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-300/80 break-all hover:text-cyan-200"
                  >
                    {item.url}
                  </a>
                  {item.thumbnailUrl ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block w-full max-w-xs md:max-w-sm aspect-video overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 hover:border-cyan-400/80 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex w-full max-w-xs md:max-w-sm aspect-video rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 items-center justify-center text-[11px] text-slate-500 hover:border-cyan-400/60 transition-colors"
                    >
                      ไม่มีปกแสดง
                    </a>
                  )}
                  {item.note && (
                    <p className="text-sm text-slate-200 mt-2 whitespace-pre-wrap">
                      {item.note}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-2">
                    บันทึกเมื่อ{" "}
                    {new Date(item.createdAt).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-[11px] text-slate-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <footer className="mt-10 text-xs text-slate-500">
          ข้อมูลทั้งหมดเก็บใน browser เครื่องนี้เท่านั้น (localStorage) ถ้าเคลียร์
          cache / เปลี่ยนเครื่อง ข้อมูลจะหายไป
        </footer>
      </div>
    </main>
  );
}


