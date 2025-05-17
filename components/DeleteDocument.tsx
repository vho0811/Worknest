'use client'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useState, useTransition } from "react"
import { Button } from "./ui/button"
import { usePathname, useRouter } from "next/navigation"
import { deleteDocument } from "@/actions/actions"
import { toast } from "sonner"

function DeleteDocument() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const router = useRouter();
    const handleDelete = async () => {
        const roomId = pathname.split("/").pop();
        if(!roomId) return;
        startTransition(async ()=>{
            const {success} = await deleteDocument(roomId);

            if (success){
                setIsOpen(false);
                router.replace("/")
                toast.success("Room deleted successfully!");
            }
            else{
                toast.error("Failed to delete room!");
            }

        })
    }
  return (
    <Dialog open= {isOpen} onOpenChange={setIsOpen}>
        <Button className="cursor-pointer" asChild variant="destructive">
  <DialogTrigger>Delete</DialogTrigger>
  </Button>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your document and all its content.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="sm:justify-end gap-2">
        <Button 
        type = "button" 
        variant="destructive" 
        onClick={handleDelete}
        disabled={isPending}
        className="cursor-pointer"
        > {isPending ? "Deleting..." : "Delete"}</Button>



        <DialogClose asChild>
            <Button className="cursor-pointer" variant="secondary" type="button">Close</Button>
        </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default DeleteDocument