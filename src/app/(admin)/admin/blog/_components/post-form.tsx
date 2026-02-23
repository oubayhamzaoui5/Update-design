"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode, $createHeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  DecoratorNode,
  FORMAT_TEXT_COMMAND,
  createCommand,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { slugify } from "@/utils/slug";
import { AlignCenter, AlignLeft, AlignRight, Bold, ImageIcon, Italic, List, ListOrdered, Minus, Plus, Settings2, Trash2 } from "lucide-react";

type SerializedImageNode = Spread<
  {
    type: "image";
    version: 1;
    src: string;
    altText: string;
    width: number;
    align: "left" | "center" | "right";
  },
  SerializedLexicalNode
>;

type InsertImagePayload = {
  src: string;
  altText?: string;
};

const INSERT_IMAGE_COMMAND = createCommand<InsertImagePayload>("INSERT_IMAGE_COMMAND");

class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;
  __width: number;
  __align: "left" | "center" | "right";

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      { src: node.__src, altText: node.__altText, width: node.__width, align: node.__align },
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      align: serializedNode.align,
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (!(domNode instanceof HTMLImageElement)) return null;

          return {
            node: $createImageNode({
              src: domNode.src,
              altText: domNode.alt || "",
              width: clampWidth(extractWidthFromImageElement(domNode)),
              align: extractAlignFromImageElement(domNode),
            }),
          };
        },
        priority: 1,
      }),
    };
  }

  constructor(
    {
      src,
      altText,
      width,
      align,
    }: { src: string; altText: string; width?: number; align?: "left" | "center" | "right" } = {
      src: "",
      altText: "",
      width: 100,
      align: "center",
    },
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = clampWidth(width ?? 100);
    this.__align = align ?? "center";
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      align: this.__align,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("data-align", this.__align);
    element.setAttribute("data-width", String(this.__width));
    element.style.width = `${this.__width}%`;
    element.style.height = "auto";
    element.style.display = "block";
    element.style.maxWidth = "100%";
    applyAlignStyles(element, this.__align);
    return { element };
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): boolean {
    return false;
  }

  setWidth(width: number): void {
    const writable = this.getWritable();
    writable.__width = clampWidth(width);
  }

  setAlign(align: "left" | "center" | "right"): void {
    const writable = this.getWritable();
    writable.__align = align;
  }

  getWidth(): number {
    return this.getLatest().__width;
  }

  getAlign(): "left" | "center" | "right" {
    return this.getLatest().__align;
  }

  decorate(): React.ReactNode {
    return <ImageNodeView nodeKey={this.getKey()} src={this.__src} altText={this.__altText} width={this.__width} align={this.__align} />;
  }
}

function $createImageNode({
  src,
  altText = "",
  width = 100,
  align = "center",
}: {
  src: string;
  altText?: string;
  width?: number;
  align?: "left" | "center" | "right";
}): ImageNode {
  return new ImageNode({ src, altText, width, align });
}

function clampWidth(value: number): number {
  return Math.max(20, Math.min(100, Math.round(value)));
}

function extractWidthFromImageElement(element: HTMLImageElement): number {
  const dataWidth = Number.parseInt(element.dataset.width ?? "", 10);
  if (!Number.isNaN(dataWidth)) return dataWidth;

  const styleWidth = element.style.width;
  if (styleWidth.endsWith("%")) {
    const parsed = Number.parseInt(styleWidth.replace("%", ""), 10);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return 100;
}

function extractAlignFromImageElement(element: HTMLImageElement): "left" | "center" | "right" {
  const dataAlign = element.dataset.align;
  if (dataAlign === "left" || dataAlign === "center" || dataAlign === "right") return dataAlign;
  if (element.style.float === "left") return "left";
  if (element.style.float === "right") return "right";
  return "center";
}

function applyAlignStyles(element: HTMLImageElement, align: "left" | "center" | "right") {
  element.style.float = "none";
  if (align === "left") {
    element.style.marginLeft = "0";
    element.style.marginRight = "auto";
    return;
  }
  if (align === "right") {
    element.style.marginLeft = "auto";
    element.style.marginRight = "0";
    return;
  }
  element.style.marginLeft = "auto";
  element.style.marginRight = "auto";
}

function ImageNodeView({
  nodeKey,
  src,
  altText,
  width,
  align,
}: {
  nodeKey: NodeKey;
  src: string;
  altText: string;
  width: number;
  align: "left" | "center" | "right";
}) {
  const [editor] = useLexicalComposerContext();

  const updateNode = (updater: (node: ImageNode) => void) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) updater(node);
    });
  };

  const justifyClass =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <div className={`group relative my-4 flex ${justifyClass}`}>
      <div className="relative w-full" style={{ maxWidth: `${width}%` }}>
        <img src={src} alt={altText} className="block h-auto w-full rounded-xl" />
        <div className="pointer-events-none absolute right-2 top-2 rounded bg-black/55 px-2 py-0.5 text-xs text-white">
          {width}%
        </div>
        <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => updateNode((node) => node.setAlign("left"))}
            className="rounded-md bg-zinc-900/75 p-1.5 text-white hover:bg-zinc-900"
            aria-label="Align left"
            title="Align left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => updateNode((node) => node.setAlign("center"))}
            className="rounded-md bg-zinc-900/75 p-1.5 text-white hover:bg-zinc-900"
            aria-label="Align center"
            title="Align center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            onClick={() => updateNode((node) => node.setAlign("right"))}
            className="rounded-md bg-zinc-900/75 p-1.5 text-white hover:bg-zinc-900"
            aria-label="Align right"
            title="Align right"
          >
            <AlignRight size={14} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => updateNode((node) => node.setWidth(node.getWidth() - 10))}
            className="rounded-md bg-zinc-900/75 p-1.5 text-white hover:bg-zinc-900"
            aria-label="Reduce image size"
            title="Reduce image size"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={() => updateNode((node) => node.setWidth(node.getWidth() + 10))}
            className="rounded-md bg-zinc-900/75 p-1.5 text-white hover:bg-zinc-900"
            aria-label="Increase image size"
            title="Increase image size"
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => updateNode((node) => node.remove())}
          className="absolute bottom-2 right-2 rounded-md bg-red-600 p-1.5 text-white opacity-0 transition hover:bg-red-700 group-hover:opacity-100"
          aria-label="Delete image"
          title="Delete image"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const UI_INPUT =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100";

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "text-zinc-400",
  paragraph: "mb-2",
  text: { bold: "font-bold", italic: "italic" },
  list: { ul: "ml-6 list-disc", ol: "ml-6 list-decimal", listItem: "pl-1" },
  heading: { h1: "mb-4 text-3xl font-bold", h2: "mb-3 text-2xl font-semibold" },
};

type PostFormProps = {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    title?: string;
    slug?: string;
    content?: string;
    published?: boolean;
  };
  submitLabel: string;
};

export default function PostForm({ action, initial, submitLabel }: PostFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [editorContent, setEditorContent] = useState(initial?.content ?? "");

  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: "Editor",
      theme,
      nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, ImageNode],
      onError: (err: Error) => console.error(err),
    }),
    []
  );

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("content", editorContent);
    formData.set("title", title);
    formData.set("slug", slug);
    await action(formData);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <form onSubmit={handleFormSubmit} className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 md:px-6">
        <header className="sticky top-4 z-40 mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/80 p-3 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lexical Editor</span>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {submitLabel}
          </button>
        </header>

        <div className="mx-auto w-full max-w-[1000px] space-y-6">
          <section className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={UI_INPUT} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Status</label>
              <label className="flex h-[38px] cursor-pointer items-center justify-between rounded-xl border px-3 dark:border-zinc-800">
                <span className="text-sm">Published</span>
                <input type="checkbox" name="published" defaultChecked={initial?.published} className="accent-blue-600" />
              </label>
            </div>
          </section>

          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!initial?.slug) setSlug(slugify(e.target.value));
            }}
            className="w-full bg-transparent text-5xl font-extrabold outline-none placeholder:text-zinc-200 dark:text-white"
            placeholder="Blog Post Title"
          />

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Toolbar />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[600px] p-8 text-lg leading-relaxed outline-none dark:text-zinc-100" />
                }
                placeholder={
                  <div className="pointer-events-none absolute left-8 top-8 text-lg text-zinc-300">Start your story...</div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <ListPlugin />
              <InitialContentPlugin initialHtml={initial?.content ?? ""} />
              <ImageCommandPlugin />
              <OnChangePlugin onChange={setEditorContent} />
            </div>
          </div>
        </div>
      </form>
    </LexicalComposer>
  );
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const insertImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: "Blog Image" });
    }
  };

  const setHeading = (tag: "h1" | "h2") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createHeadingNode(tag)]);
      }
    });
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-800/50">
      <button
        type="button"
        onClick={() => setHeading("h1")}
        className="rounded-lg p-2 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => setHeading("h2")}
        className="rounded-lg p-2 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        H2
      </button>
      <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className="rounded-lg p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className="rounded-lg p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="rounded-lg p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="rounded-lg p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <ListOrdered size={18} />
      </button>
      <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
      <button
        type="button"
        onClick={insertImage}
        className="rounded-lg p-2 text-blue-600 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <ImageIcon size={18} />
      </button>
    </div>
  );
}

function OnChangePlugin({ onChange }: { onChange: (val: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        onChange($generateHtmlFromNodes(editor, null));
      });
    });
  }, [editor, onChange]);

  return null;
}

function InitialContentPlugin({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!initialHtml) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
  }, [editor, initialHtml]);

  return null;
}

function ImageCommandPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload);
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          selection.insertNodes([imageNode]);
        } else {
          $insertNodes([imageNode]);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
