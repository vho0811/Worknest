'use client'
import {useDocumentData} from "react-firebase-hooks/firestore"
import { Input } from "./ui/input"
import { FormEvent, useEffect, useState, useTransition } from "react"
import { Button } from "./ui/button"
import { updateDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { doc } from "firebase/firestore"
import Editor from "./Editor"
import useOwner from "@/lib/useOwner"
import DeleteDocument from "./DeleteDocument"
import InviteUser from "./InviteUser"
import ManageUsers from "./ManageUsers"
import Avatars from "./Avatars"
import AIWebsiteGenerator from "./AIWebsiteGenerator"
import { EditorProvider, useEditor } from "./EditorContext"
function DocumentContent({id}: {id:string}) {
  const [data] = useDocumentData(doc(db, 'documents', id));
  const [input, setInput] = useState("");
  const [isUpdating, startTransition] = useTransition();
  const isOwner = useOwner();
  const { setDocumentTitle } = useEditor();

  useEffect(()=>{
    if (data){
        setInput(data.title);
        setDocumentTitle(data.title || "");
    }
  }, [data, setDocumentTitle])

  const updateTitle = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()){
        startTransition(async () =>{
            await updateDoc(doc(db, 'documents', id), {
                title: input
        })
    });
  }};
  return ( 
  <div>
    <div className = "flex max-w-6xl mx-auto justify-between pb-5">
        <form className="flex flex-1 space-x-2" onSubmit= {updateTitle}>
            {/* Update title */}
            <Input 
            value = {input} onChange = {(e) => setInput(e.target.value)}
            />
            <Button className="cursor-pointer" disabled={isUpdating} type="submit"> 
                {isUpdating ? "Updating..." : "Update"}

            </Button>
            {isOwner &&(
                <>
                <InviteUser/>
                <DeleteDocument></DeleteDocument>
                </>
            )
            }
        </form>
    </div>
    <div className = "flex max-w-6xl mx-auto justify-between items-center mb-5">
            <ManageUsers/>
            <Avatars/>
      </div>

      {/* AI Website Generator positioned in top right corner */}
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute top-2 right-2 z-10">
          <AIWebsiteGenerator />
    </div>
        <div className="pt-2">
    <Editor/>
    </div>
      </div>
      </div>
  )
}

function Document({id}: {id:string}) {
  return (
    <EditorProvider>
      <DocumentContent id={id} />
    </EditorProvider>
  )
}

export default Document