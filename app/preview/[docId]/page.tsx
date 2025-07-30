import { notFound } from "next/navigation";
import { adminDb } from "@/firebase-admin";
import { generateWebsiteHtml, WebsiteSettings } from "@/lib/documentToHtml";
import { BlockNoteEditor } from "@blocknote/core";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import LiveBlocksProvider from "@/components/LiveBlocksProvider";
import RoomProvider from "@/components/RoomProvider";
import WebsitePreview from "@/components/WebsitePreview";

interface PreviewPageProps {
  params: Promise<{
    docId: string;
  }>;
}

async function getDocumentData(docId: string) {
  try {
    const doc = await adminDb.collection("documents").doc(docId).get();
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      id: docId,
      title: data?.title || "Untitled Document",
      isPublished: data?.isPublished || false,
      websiteSettings: data?.websiteSettings || null,
    };
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { docId } = await params;
  const documentData = await getDocumentData(docId);

  if (!documentData || !documentData.isPublished) {
    notFound();
  }

  return (
    <LiveBlocksProvider>
      <RoomProvider roomId={docId}>
        <WebsitePreview docId={docId} settings={documentData.websiteSettings} />
      </RoomProvider>
    </LiveBlocksProvider>
  );
} 