import { useRoom, useSelf } from "@liveblocks/react";
import * as Y from "yjs";
import { useEffect, useState } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import {BlockNoteEditor} from "@blocknote/core"
import {useCreateBlockNote} from "@blocknote/react"
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css"
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";
type EditorProps = {
    doc: Y.Doc;
    provider: any;
    
}

function BlockNote({doc, provider}: EditorProps) {
    const userInfo = useSelf((me) => me.info);
    const editor: BlockNoteEditor = useCreateBlockNote({
        collaboration: {
            provider,
            fragment: doc.getXmlFragment("document-store"),
            user:{
                name: userInfo?.name || "Anonymous",
                color: stringToColor(userInfo?.email || ""),
            },
        }
    })
  return (
    <div className = "relative max-w-6xl mx-auto bg-gray-800">
    <BlockNoteView
    editor={editor}
    editable={true}
    theme="dark"
    className="min-h-screen p-6"
    
    />
    </div>
  )
}

function Editor() {
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<LiveblocksYjsProvider>();
    
    useEffect(()=>{
       const yDoc = new Y.Doc();
       const yProvider = new LiveblocksYjsProvider(room,yDoc);
       setDoc(yDoc);
       setProvider(yProvider);
       return ()=>{
        yDoc?.destroy();
        yProvider?.destroy();
       }
    },[room])
    if (!doc || !provider) return null;
    const style = `hover:text-white`
  return (
    <div className ="flex-1 max-w-6xl mx-auto justify-between items-center mb-5 ">
        {/* <TranslateDocument doc= {doc}/> */}

        <div className = "flex items-center gap-5 justify-end mb-10">
        
        </div>
        {/* TranslateDocument AI */}
        {/* ChatToDocument AI */}
        {/* BlockNote */}

        <BlockNote doc={doc} provider={provider} />

    </div>
  )
}

export default Editor