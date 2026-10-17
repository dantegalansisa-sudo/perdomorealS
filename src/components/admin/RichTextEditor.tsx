"use client";
import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2Off, Link as LinkIcon, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { I18nText } from "@/lib/types";

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (label: string, icon: React.ReactNode, onClick: () => void, active = false, disabled = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-navy-soft transition-colors hover:bg-sand-2 hover:text-navy disabled:opacity-30",
        active && "bg-navy text-white hover:bg-navy hover:text-white"
      )}
    >
      {icon}
    </button>
  );
  const chain = () => editor.chain().focus();
  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-white/95 p-1.5 backdrop-blur">
      {btn("Título H2", <Heading2 className="size-4" />, () => chain().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {btn("Subtítulo H3", <Heading3 className="size-4" />, () => chain().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
      <span className="mx-1 h-5 w-px bg-line" />
      {btn("Negrita", <Bold className="size-4" />, () => chain().toggleBold().run(), editor.isActive("bold"))}
      {btn("Cursiva", <Italic className="size-4" />, () => chain().toggleItalic().run(), editor.isActive("italic"))}
      <span className="mx-1 h-5 w-px bg-line" />
      {btn("Lista", <List className="size-4" />, () => chain().toggleBulletList().run(), editor.isActive("bulletList"))}
      {btn("Lista numerada", <ListOrdered className="size-4" />, () => chain().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {btn("Cita", <Quote className="size-4" />, () => chain().toggleBlockquote().run(), editor.isActive("blockquote"))}
      <span className="mx-1 h-5 w-px bg-line" />
      {btn(
        "Enlace",
        <LinkIcon className="size-4" />,
        () => {
          const prev = (editor.getAttributes("link").href as string | undefined) ?? "https://";
          const url = window.prompt("URL del enlace", prev);
          if (url === null) return;
          if (url === "" || url === "https://") return chain().extendMarkRange("link").unsetLink().run();
          chain().extendMarkRange("link").setLink({ href: url }).run();
        },
        editor.isActive("link")
      )}
      {btn("Quitar enlace", <Link2Off className="size-4" />, () => chain().unsetLink().run(), false, !editor.isActive("link"))}
      <span className="ml-auto" />
      {btn("Deshacer", <Undo2 className="size-4" />, () => chain().undo().run(), false, !editor.can().undo())}
      {btn("Rehacer", <Redo2 className="size-4" />, () => chain().redo().run(), false, !editor.can().redo())}
    </div>
  );
}

function SingleEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-perdomo min-h-[320px] px-4 py-4 focus:outline-none sm:px-6",
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChangeRef.current(html === "<p></p>" ? "" : html);
    },
  });

  if (!editor) return <div className="min-h-[360px] animate-pulse bg-sand/50" />;
  return (
    <>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
}

/** Bilingual rich text editor with ES/EN tabs (both editors stay mounted). */
export function RichTextEditor({ value, onChange, label = "Contenido" }: { value: I18nText; onChange: (v: I18nText) => void; label?: string }) {
  const [tab, setTab] = useState<"es" | "en">("es");
  const valueRef = useRef(value);
  valueRef.current = value;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="label !mb-0">{label}</span>
        <div className="flex rounded-full border border-line bg-sand p-0.5">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setTab(l)}
              className={cn("rounded-full px-3 py-1 text-xs font-extrabold transition-colors", tab === l ? "bg-navy text-white" : "text-stone hover:text-navy")}
            >
              {l === "es" ? "Español" : "English"}
              {!value[l] && <span className="ml-1 text-gold">•</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white focus-within:border-gold">
        <div className={tab === "es" ? "block" : "hidden"}>
          <SingleEditor value={value.es} onChange={(html) => onChange({ ...valueRef.current, es: html })} />
        </div>
        <div className={tab === "en" ? "block" : "hidden"}>
          <SingleEditor value={value.en} onChange={(html) => onChange({ ...valueRef.current, en: html })} />
        </div>
      </div>
    </div>
  );
}
