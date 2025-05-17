// app/doc/[id]/layout.tsx

'use client';
import { use } from "react";
import RoomProvider from "@/components/RoomProvider";
import { ReactNode } from "react";

export default function DocLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
