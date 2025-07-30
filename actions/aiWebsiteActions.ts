'use server'

import { auth } from "@clerk/nextjs/server"
import { adminDb } from "@/firebase-admin";
import { generateAIWebsite, analyzeDocumentForWebsite, DocumentData, AIWebsiteSettings } from "@/lib/aiWebsiteGenerator";

export async function generateAIWebsiteFromDocument(
  docId: string,
  settings: AIWebsiteSettings,
  documentContent?: DocumentData
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate Anthropic API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return { 
      success: false, 
      error: "Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your environment variables." 
    };
  }

  try {
    // Get document data from Firestore
    const docRef = await adminDb.collection("documents").doc(docId).get();
    if (!docRef.exists) {
      return { success: false, error: "Document not found" };
    }

    const docData = docRef.data();
    
    // Use provided document content or fallback to basic data
    const documentData: DocumentData = documentContent || {
      title: docData?.title || "Untitled Document",
      content: [
        {
          type: "paragraph",
          content: [{ text: "This document appears to be empty. Please add some content and try again." }]
        }
      ]
    };

    // Generate AI website
    const aiGeneratedHTML = await generateAIWebsite(documentData, settings);

    // Store the generated website
    await adminDb.collection("documents").doc(docId).update({
      aiWebsiteSettings: settings,
      aiGeneratedHTML: aiGeneratedHTML,
      isAIPublished: true,
      aiPublishedAt: new Date(),
    });

    return { 
      success: true, 
      docId,
      html: aiGeneratedHTML
    };
    
  } catch (error: any) {
    console.error("Error generating AI website:", error);
    return { 
      success: false, 
      error: error.message || "Failed to generate AI website" 
    };
  }
}

export async function analyzeDocumentContent(docId: string, documentContent?: DocumentData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { 
      success: false, 
      error: "Anthropic API key is not configured" 
    };
  }

  try {
    // Get document data
    const docRef = await adminDb.collection("documents").doc(docId).get();
    if (!docRef.exists) {
      return { success: false, error: "Document not found" };
    }

    const docData = docRef.data();
    const documentData: DocumentData = documentContent || {
      title: docData?.title || "Untitled Document",
      content: [
        {
          type: "paragraph", 
          content: [{ text: "Empty document - please add content for better analysis" }]
        }
      ]
    };

    const analysis = await analyzeDocumentForWebsite(documentData);

    return {
      success: true,
      analysis
    };
    
  } catch (error: any) {
    console.error("Error analyzing document:", error);
    return { 
      success: false, 
      error: error.message || "Failed to analyze document" 
    };
  }
}

export async function getAIWebsiteData(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const doc = await adminDb.collection("documents").doc(docId).get();
    if (!doc.exists) {
      return { success: false, error: "Document not found" };
    }

    const data = doc.data();
    return { 
      success: true, 
      settings: data?.aiWebsiteSettings || null,
      isPublished: data?.isAIPublished || false,
      html: data?.aiGeneratedHTML || null
    };
    
  } catch (error) {
    console.error("Error getting AI website data:", error);
    return { success: false, error: "Failed to get website data" };
  }
}

export async function unpublishAIWebsite(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await adminDb.collection("documents").doc(docId).update({
      isAIPublished: false,
      aiPublishedAt: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error unpublishing AI website:", error);
    return { success: false, error: "Failed to unpublish website" };
  }
} 