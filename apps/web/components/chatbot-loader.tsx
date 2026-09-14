"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(
  () => import("@/components/chatbot-widget").then((m) => m.ChatbotWidget),
  { ssr: false }
);

export function ChatbotLoader() {
  return <ChatbotWidget />;
}
