import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/firebase-admin";

async function getAIWebsiteData(docId: string) {
  try {
    const doc = await adminDb.collection("documents").doc(docId).get();
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      id: docId,
      title: data?.title || "Untitled Document",
      isAIPublished: data?.isAIPublished || false,
      aiGeneratedHTML: data?.aiGeneratedHTML || null,
    };
  } catch (error) {
    console.error("Error fetching AI website:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  const websiteData = await getAIWebsiteData(docId);

  if (!websiteData || !websiteData.isAIPublished || !websiteData.aiGeneratedHTML) {
    return new NextResponse('Website not found or not published', { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Return the raw HTML directly
  return new NextResponse(websiteData.aiGeneratedHTML, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=60',
    },
  });
} 