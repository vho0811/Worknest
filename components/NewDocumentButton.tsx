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
    <Button onClick={handleCreateNewDocument} disabled={isPending}  className="bg-white text-black hover:bg-gray-200 cursor-pointer flex w-full">
    {isPending ? "Creating..." : "New Document"}
        </Button>
  )
}

export default NewDocumentButton