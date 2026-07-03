"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ? `<p>${value.replace(/\n/g, "</p><p>")}</p>` : "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getText());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getText();
    if (value !== current) {
      editor.commands.setContent(value ? `<p>${value.replace(/\n/g, "</p><p>")}</p>` : "");
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-ring",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-muted"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={disabled}
        >
          Negrito
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-muted"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={disabled}
        >
          Itálico
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-muted"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={disabled}
        >
          Desfazer
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-muted"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={disabled}
        >
          Refazer
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none min-h-[120px] p-3 text-sm"
        data-placeholder={placeholder}
      />
    </div>
  );
};
