/// <reference types="gtag.js" />

type ClarityMethod = "consent" | "identify" | "set" | "event" | "upgrade";

interface Window {
  clarity: (method: ClarityMethod, ...args: string[]) => void;
}
