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
function Document({id}: {id:string}) {
  const [data] = useDocumentData(doc(db, 'documents', id));
  const [input, setInput] = useState("");
  const [isUpdating, startTransition] = useTransition();
  const isOwner = useOwner();

  useEffect(()=>{
    if (data){
        setInput(data.title)
    }
  }, [data])
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
            <Button disabled={isUpdating} type="submit"> 
                {isUpdating ? "Updating..." : "Update"}

            </Button>
            {isOwner &&(
                <>
                <DeleteDocument></DeleteDocument>
                </>
            )
            }
        </form>
    </div>
    <div></div>
    <Editor/>
    </div>
  )
}

export default Document