'use client'


import { useTransition } from "react";
import { Button } from "./ui/button"
import { useRouter } from "next/navigation";
import { createNewDocument } from "@/actions/actions";
function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleCreateNewDocument = () => {
    startTransition(async ()=>{
        const {docId} = await createNewDocument();
        router.push(`/document/${docId}`);
    })
  }
  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending}  
    className="cursor-pointer w-full bg-gray-200 text-gray-900 font-semibold font-sans py-2 px-4 rounded-md hover:bg-gray-400 flex items-center justify-center space-x-2">
    {isPending ? "Creating..." : "New Document"}
        </Button>
  )
}

export default NewDocumentButton