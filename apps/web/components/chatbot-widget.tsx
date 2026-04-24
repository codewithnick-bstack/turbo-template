"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { chatWithSite } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

const GREETING = "Hi! How can I help you today?";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-3" aria-label="Loading response">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const labelId = useId();

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const data = await chatWithSite(next);
      setMessages([...next, { role: "assistant", content: data.text ?? "Sorry, I'm unavailable right now." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I'm unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const primary = "var(--color-primary, #6366f1)";

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          className="fixed bottom-20 right-4 z-[9999] flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900"
          style={{ height: "min(480px,calc(100dvh - 6rem))" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: primary }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p id={labelId} className="text-sm font-semibold text-white leading-none">Chat with us</p>
                <p className="mt-0.5 text-[10px] text-white/70 leading-none">We reply instantly</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex size-6 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/50"
            role="log"
            aria-atomic="false"
            aria-label="Chat messages"
          >
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="mr-2 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: primary }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                    }`}
                    style={m.role === "user" ? { backgroundColor: primary } : {}}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: primary }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
            <label htmlFor={inputId} className="sr-only">Type a message</label>
            <input
              id={inputId}
              ref={inputRef}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
              disabled={loading}
              aria-disabled={loading}
            />
            <button
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: primary }}
              aria-label="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        ref={toggleButtonRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[9999] flex size-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: primary }}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}
