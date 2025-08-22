"use client";

import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./MenuBar";
import { useEditor } from "@tiptap/react";

export function RichTextEditor() {
  const editor = useEditor({
    // immediatelyRender: false,
    extensions: [StarterKit],
  });

  return (
    <div className="">
      <MenuBar editor={editor} />
    </div>
  );
}
