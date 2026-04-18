"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

interface Props {
  siteId: string;
  tenantId: string;
  apiUrl: string;
  primaryColor?: string;
  greeting?: string;
}

export function ChatbotWidget({
  siteId,
  tenantId,
  apiUrl,
  primaryColor = "#4f46e5",
  greeting = "Hi! How can I help you today?",
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/v1/ai/chatbot?tid=${encodeURIComponent(tenantId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, messages: next }),
      });
      const data = (await res.json()) as { text: string };
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I'm unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-20 right-4 w-80 bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-neutral-200"
          style={{ height: "420px", zIndex: 9999 }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 text-white text-sm font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Chat</span>
            <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100 text-lg leading-none">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
                style={m.role === "user" ? { backgroundColor: primaryColor } : {}}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-neutral-100 text-neutral-400 rounded-xl px-3 py-2 max-w-[85%] animate-pulse text-sm">
                …
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-neutral-200 flex">
            <input
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg text-white flex items-center justify-center text-2xl"
        style={{ backgroundColor: primaryColor, zIndex: 9999 }}
        aria-label="Open chat"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
