import type { Metadata } from "next";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "WorkNest - Collaborative Documents to AI-Generated Websites",
  description: "Real-time collaborative document editing meets AI website generation. Transform team docs into stunning websites instantly.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body>
        <Header/>


        <div className="min-h-screen flex bg-grey-200">
          {/* Sidebar */}
          <Sidebar/>
          <div className = "flex-1 p-5  overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </div>
       <Toaster 
          position="top-center" 
          expand={true}
          richColors
          closeButton
          theme="light"
        />
      </body>
    </html>
    </ClerkProvider>
  );
}
