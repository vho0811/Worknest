'use client'

import { useEffect, useState } from "react";
import { useRoom } from "@liveblocks/react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { BlockNoteEditor } from "@blocknote/core";
import { generateWebsiteHtml, WebsiteSettings } from "@/lib/documentToHtml";

interface WebsitePreviewProps {
  docId: string;
  settings: WebsiteSettings;
}

export default function WebsitePreview({ docId, settings }: WebsitePreviewProps) {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    if (!room) return;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  useEffect(() => {
    if (!doc || !provider) return;

    const blockNoteEditor = BlockNoteEditor.create({
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: "Viewer",
          color: "#666",
        },
      }
    });

    setEditor(blockNoteEditor);

    return () => {
      setEditor(null);
    };
  }, [doc, provider]);

  useEffect(() => {
    if (!editor || !settings) return;

    // Generate initial HTML
    const html = generateWebsiteHtml(editor, settings);
    setHtmlContent(html);

    // Set up real-time updates using an interval
    const interval = setInterval(() => {
      const updatedHtml = generateWebsiteHtml(editor, settings);
      setHtmlContent(updatedHtml);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [editor, settings]);

  if (!htmlContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
} 