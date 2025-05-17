'use client'
import { LiveblocksProvider } from "@liveblocks/react";
function LiveBlocksProvider({children} : {children: React.ReactNode}) {
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_ID) {
    throw new Error("NEXT_PUBLIC_LIVEBLOCKS_ID is not set")
  }
  return (
    <LiveblocksProvider throttle={16} authEndpoint={"/auth-endpoint"} >{children}</LiveblocksProvider>
  )
}

export default LiveBlocksProvider