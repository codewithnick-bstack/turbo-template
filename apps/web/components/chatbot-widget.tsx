"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { chatWithSite, submitContact } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import { ANALYTICS_EVENTS, trackClarityEvent, trackEvent } from "@/lib/analytics";

const GREETING = "Hi! How can I help you today?";
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "";

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

type LeadForm = { name: string; email: string; note: string };

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [captureMode, setCaptureMode] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: "", email: "", note: "" });
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
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
    if (captureMode) nameRef.current?.focus();
  }, [captureMode]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (captureMode) { setCaptureMode(false); return; }
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, captureMode]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    trackEvent(ANALYTICS_EVENTS.CHAT_MESSAGE_SENT);
    try {
      const data = await chatWithSite(next);
      setMessages([...next, { role: "assistant", content: data.text ?? "Sorry, I'm unavailable right now." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I'm unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleBookCall = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.PRICING_CTA_CLICKED, { source: "chatbot_book_call" });
    if (BOOKING_URL) {
      window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
    } else {
      setLeadForm((f) => ({
        ...f,
        note: messages.filter((m) => m.role === "user").at(-1)?.content ?? "",
      }));
      setCaptureMode(true);
    }
  }, [messages]);

  const submitLead = useCallback(async () => {
    const { name, email, note } = leadForm;
    if (!name.trim() || !email.trim()) return;
    setLeadSubmitting(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: "Chat lead",
        message: note.trim() || "Requested via chat widget",
      });
      trackEvent(ANALYTICS_EVENTS.LEAD_CAPTURED, { source: "chatbot" });
      trackClarityEvent(ANALYTICS_EVENTS.LEAD_CAPTURED);
      setCaptureMode(false);
      setLeadForm({ name: "", email: "", note: "" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thanks ${name.trim()}! We'll reach out to ${email.trim()} shortly. Talk soon!`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, we couldn't save your details. Please email us directly." },
      ]);
    } finally {
      setLeadSubmitting(false);
    }
  }, [leadForm]);

  const primary = "var(--color-primary, #6366f1)";
  const showBookChip = !captureMode && !loading && messages.length <= 3;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          className="fixed bottom-20 right-4 z-[9999] flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900"
          style={{ height: "min(520px,calc(100dvh - 6rem))" }}
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleBookCall}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/25 transition-colors"
                aria-label="Book a free call"
              >
                Book a call
              </button>
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
              {showBookChip && (
                <div className="flex justify-start pl-8">
                  <button
                    onClick={handleBookCall}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{ borderColor: primary, color: primary }}
                  >
                    📅 Book a free call
                  </button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Lead capture form */}
          {captureMode ? (
            <div className="border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your details</p>
              <input
                ref={nameRef}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Your name *"
                value={leadForm.name}
                onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                disabled={leadSubmitting}
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Email address *"
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                disabled={leadSubmitting}
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Brief note (optional)"
                value={leadForm.note}
                onChange={(e) => setLeadForm((f) => ({ ...f, note: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void submitLead()}
                disabled={leadSubmitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => void submitLead()}
                  disabled={!leadForm.name.trim() || !leadForm.email.trim() || leadSubmitting}
                  className="flex-1 rounded-xl py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: primary }}
                >
                  {leadSubmitting ? "Sending…" : "Send request"}
                </button>
                <button
                  onClick={() => setCaptureMode(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Normal input */
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
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        ref={toggleButtonRef}
        onClick={() => {
          setOpen((v) => {
            if (!v) {
              trackEvent(ANALYTICS_EVENTS.CHATBOT_OPENED);
              trackClarityEvent(ANALYTICS_EVENTS.CHATBOT_OPENED);
            }
            return !v;
          });
        }}
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
