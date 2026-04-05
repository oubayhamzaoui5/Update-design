"use client"

import { useEffect } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import type { InitialConfigType } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HeadingNode, QuoteNode, $createHeadingNode, $isHeadingNode } from "@lexical/rich-text"
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical"
import { FORMAT_TEXT_COMMAND } from "lexical"
import { Bold, Italic, List, ListOrdered } from "lucide-react"
import { useState } from "react"

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "mb-2",
  text: { bold: "font-bold", italic: "italic" },
  list: { ul: "ml-6 list-disc", ol: "ml-6 list-decimal", listItem: "pl-1" },
  heading: { h1: "mb-3 text-2xl font-bold", h2: "mb-2 text-xl font-semibold" },
}

const initialConfig: InitialConfigType = {
  namespace: "CategoryEditor",
  theme,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  onError: (err: Error) => console.error(err),
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [activeBlock, setActiveBlock] = useState<"h1" | "h2" | "p" | null>(null)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        setIsBold(selection.hasFormat("bold"))
        setIsItalic(selection.hasFormat("italic"))
        const top = selection.anchor.getNode().getTopLevelElementOrThrow()
        if ($isHeadingNode(top)) {
          const tag = top.getTag()
          setActiveBlock(tag === "h1" || tag === "h2" ? tag : null)
        } else if (top.getType() === "paragraph") {
          setActiveBlock("p")
        } else {
          setActiveBlock(null)
        }
      })
    })
  }, [editor])

  function setBlock(tag: "h1" | "h2" | "p") {
    editor.update(() => {
      const sel = $getSelection()
      if (!$isRangeSelection(sel)) return
      sel.insertNodes([tag === "p" ? $createParagraphNode() : $createHeadingNode(tag)])
    })
  }

  const blockBtn = (active: boolean) =>
    `rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
      active
        ? "border-blue-300 bg-blue-100 text-blue-700"
        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    }`

  const fmtBtn = (active: boolean) =>
    `rounded-lg border p-1.5 transition ${
      active
        ? "border-blue-300 bg-blue-100 text-blue-700"
        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    }`

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2 rounded-t-xl">
      <button type="button" onClick={() => setBlock("h1")} className={blockBtn(activeBlock === "h1")}>H1</button>
      <button type="button" onClick={() => setBlock("h2")} className={blockBtn(activeBlock === "h2")}>H2</button>
      <button type="button" onClick={() => setBlock("p")}  className={blockBtn(activeBlock === "p")}>P</button>
      <div className="h-4 w-px bg-slate-300 mx-0.5" />
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}   className={fmtBtn(isBold)}>
        <Bold size={14} />
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} className={fmtBtn(isItalic)}>
        <Italic size={14} />
      </button>
      <div className="h-4 w-px bg-slate-300 mx-0.5" />
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className={fmtBtn(false)}>
        <List size={14} />
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className={fmtBtn(false)}>
        <ListOrdered size={14} />
      </button>
    </div>
  )
}

// ── InitialContent ────────────────────────────────────────────────────────────
function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!html) return
    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(html, "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      root.append(...nodes)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount only
  return null
}

// ── OnChange ──────────────────────────────────────────────────────────────────
function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        onChange($generateHtmlFromNodes(editor, null))
      })
    })
  }, [editor, onChange])
  return null
}

// ── Public component ──────────────────────────────────────────────────────────
export default function RichTextEditor({
  initialHtml = "",
  onChange,
  minHeight = 220,
  placeholder = "Rédigez une description...",
}: {
  initialHtml?: string
  onChange: (html: string) => void
  minHeight?: number
  placeholder?: string
}) {
  return (
    <LexicalComposer initialConfig={{ ...initialConfig, namespace: `CategoryEditor-${Math.random()}` }}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-[#4F46E5] focus-within:ring-4 focus-within:ring-[#4F46E5]/5">
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none"
                style={{ minHeight }}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <InitialContentPlugin html={initialHtml} />
          <OnChangePlugin onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  )
}
