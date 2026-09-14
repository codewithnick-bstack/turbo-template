"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Node, mergeAttributes } from "@tiptap/core";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link2, Image as ImageIcon,
  Youtube as YoutubeIcon, FrameIcon, Code2,
} from "lucide-react";

const lowlight = createLowlight(common);

const IframeNode = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      height: { default: "400" },
    };
  },
  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "div",
      { class: "iframe-wrapper" },
      ["iframe", mergeAttributes(HTMLAttributes as Record<string, string>, {
        frameborder: "0",
        allowfullscreen: "true",
        style: `width:100%;height:${HTMLAttributes["height"] ?? 400}px;border:0;`,
      })],
    ];
  },
  addCommands() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIframe: (attrs: { src: string; height?: string }) => ({ commands }: any) =>
        commands.insertContent({ type: this.name, attrs }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  },
});

type UrlInputProps = {
  placeholder: string;
  onConfirm: (url: string) => void;
  onCancel: () => void;
};

function UrlInput({ placeholder, onConfirm, onCancel }: UrlInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="flex items-center gap-1">
      <input
        ref={ref}
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input h-7 min-w-[220px] text-xs"
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); if (value) onConfirm(value); }
          if (e.key === "Escape") onCancel();
        }}
      />
      <button
        type="button"
        disabled={!value}
        onClick={() => onConfirm(value)}
        className="rounded bg-[var(--primary)] px-2 py-1 text-xs font-medium text-[var(--primary-foreground)] disabled:opacity-40"
      >
        Insert
      </button>
      <button type="button" onClick={onCancel} className="rounded px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
        ✕
      </button>
    </div>
  );
}

type ActiveInput = "image" | "youtube" | "iframe" | "link" | null;

type ToolbarProps = { editor: Editor };

function Toolbar({ editor }: ToolbarProps) {
  const [activeInput, setActiveInput] = useState<ActiveInput>(null);

  function btn(
    label: string,
    icon: React.ReactNode,
    action: () => void,
    active?: boolean,
    inputKey?: ActiveInput,
  ) {
    const isOpen = inputKey && activeInput === inputKey;
    return (
      <button
        key={label}
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={active}
        onClick={() => {
          if (inputKey) {
            setActiveInput(isOpen ? null : inputKey);
          } else {
            action();
          }
        }}
        className={`rounded p-1.5 transition-colors hover:bg-[var(--muted)] ${
          active || isOpen
            ? "bg-[var(--muted)] text-[var(--primary)]"
            : "text-[var(--muted-foreground)]"
        }`}
      >
        {icon}
      </button>
    );
  }

  function sep() {
    return <span className="mx-0.5 h-5 w-px bg-[var(--border)]" />;
  }

  return (
    <div className="border-b border-[var(--border)] bg-[var(--muted)]/30">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5">
        {btn("Heading 1", <Heading1 size={15} />, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
        {btn("Heading 2", <Heading2 size={15} />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
        {btn("Heading 3", <Heading3 size={15} />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
        {sep()}
        {btn("Bold", <Bold size={15} />, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("Italic", <Italic size={15} />, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("Strikethrough", <Strikethrough size={15} />, () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
        {btn("Inline code", <Code size={15} />, () => editor.chain().focus().toggleCode().run(), editor.isActive("code"))}
        {sep()}
        {btn("Bullet list", <List size={15} />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
        {btn("Ordered list", <ListOrdered size={15} />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
        {btn("Blockquote", <Quote size={15} />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
        {btn("Code block", <Code2 size={15} />, () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
        {btn("Horizontal rule", <Minus size={15} />, () => editor.chain().focus().setHorizontalRule().run())}
        {sep()}
        {btn("Link", <Link2 size={15} />, () => {}, editor.isActive("link"), "link")}
        {btn("Image (URL)", <ImageIcon size={15} />, () => {}, false, "image")}
        {btn("YouTube / Vimeo", <YoutubeIcon size={15} />, () => {}, false, "youtube")}
        {btn("Embed iframe", <FrameIcon size={15} />, () => {}, false, "iframe")}
      </div>

      {activeInput === "link" && (
        <div className="border-t border-[var(--border)] px-2 py-1.5">
          <UrlInput
            placeholder="https://example.com"
            onConfirm={(url) => {
              editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
              setActiveInput(null);
            }}
            onCancel={() => setActiveInput(null)}
          />
        </div>
      )}
      {activeInput === "image" && (
        <div className="border-t border-[var(--border)] px-2 py-1.5">
          <UrlInput
            placeholder="https://example.com/image.png"
            onConfirm={(url) => {
              editor.chain().focus().setImage({ src: url }).run();
              setActiveInput(null);
            }}
            onCancel={() => setActiveInput(null)}
          />
        </div>
      )}
      {activeInput === "youtube" && (
        <div className="border-t border-[var(--border)] px-2 py-1.5">
          <UrlInput
            placeholder="https://www.youtube.com/watch?v=..."
            onConfirm={(url) => {
              editor.chain().focus().setYoutubeVideo({ src: url }).run();
              setActiveInput(null);
            }}
            onCancel={() => setActiveInput(null)}
          />
        </div>
      )}
      {activeInput === "iframe" && (
        <div className="border-t border-[var(--border)] px-2 py-1.5">
          <UrlInput
            placeholder="https://example.com/embed"
            onConfirm={(url) => {
              (editor.chain().focus() as unknown as { setIframe: (a: { src: string }) => { run: () => void } })
                .setIframe({ src: url })
                .run();
              setActiveInput(null);
            }}
            onCancel={() => setActiveInput(null)}
          />
        </div>
      )}
    </div>
  );
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder = "Write your post…" }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[var(--primary)] underline" } }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: "w-full rounded" } }),
      Placeholder.configure({ placeholder }),
      IframeNode,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[320px] p-3 focus:outline-none prose prose-sm max-w-none dark:prose-invert [&_iframe]:w-full [&_iframe]:rounded [&_.iframe-wrapper]:w-full",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });


  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
