'use server'

import { auth } from "@clerk/nextjs/server"
import { adminDb } from "@/firebase-admin";
import { WebsiteSettings } from "@/lib/documentToHtml";

export async function publishWebsite(
  docId: string, 
  settings: WebsiteSettings
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Update document with website settings
    await adminDb.collection("documents").doc(docId).update({
      websiteSettings: settings,
      isPublished: true,
      publishedAt: new Date(),
    });

    return { success: true, docId };
  } catch (error) {
    console.error("Error publishing website:", error);
    return { success: false, error: "Failed to publish website" };
  }
}

export async function unpublishWebsite(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await adminDb.collection("documents").doc(docId).update({
      isPublished: false,
      publishedAt: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error unpublishing website:", error);
    return { success: false, error: "Failed to unpublish website" };
  }
}

export async function getWebsiteSettings(docId: string) {
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
      settings: data?.websiteSettings || null,
      isPublished: data?.isPublished || false
    };
  } catch (error) {
    console.error("Error getting website settings:", error);
    return { success: false, error: "Failed to get website settings" };
  }
}

export async function updateWebsiteSettings(
  docId: string, 
  settings: Partial<WebsiteSettings>
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await adminDb.collection("documents").doc(docId).update({
      websiteSettings: settings,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating website settings:", error);
    return { success: false, error: "Failed to update website settings" };
  }
} 