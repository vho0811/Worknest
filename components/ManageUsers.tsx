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
import { FormEvent, useState, useTransition } from "react"
import { Button } from "./ui/button"
import { usePathname, useRouter } from "next/navigation"
import { deleteDocument, inviteUserToDocument, removeUserFromDocument } from "@/actions/actions"
import { toast } from "sonner"
import { Input } from "./ui/input"
import { useUser } from "@clerk/nextjs"
import { useRoom } from "@liveblocks/react"
import useOwner from "@/lib/useOwner"
import { useCollection } from "react-firebase-hooks/firestore"
import { collectionGroup, query, where } from "firebase/firestore"
import { db } from "@/firebase"

function ManageUsers() {
    const {user} = useUser();
    const room = useRoom();
    const isOwner = useOwner();
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition();

    const [usersInRoom] = useCollection(
        user && query(collectionGroup(db,"rooms"), where("roomId", "==", room.id))
    )
    const handleDelete = async (userId: string) => {
        startTransition(async ()=> {
            if (!user) return;
            const {success} = await removeUserFromDocument(room.id, userId);
            if (success){
                toast.success("User removed successfully!");
            }
            else{
                toast.error("Failed to remove user from the room!");
            }
        })
    }
  return (
    <Dialog open= {isOpen} onOpenChange={setIsOpen}>
        <Button className="cursor-pointer" asChild variant="outline">
  <DialogTrigger>Users ({usersInRoom?.docs.length}) </DialogTrigger>
  </Button> 
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Users with Access</DialogTitle>
      <DialogDescription>
        Below is a list of users who have access to this document
      </DialogDescription>
    </DialogHeader>
    <hr className="my-2"/>

    <div className = "flex flex-col gap-2">
        {/* Users in the room */}
        {usersInRoom?.docs.map((doc)=>{
            return (
                <div key={doc.data().userId}
                className = "flex items-center justify-between">
                <p className = "font-bold">
                    {doc.data().userId === user?.emailAddresses[0].toString()
                    ? `You (${doc.data().userId})`
                    : doc.data().userId}

                </p>

                <div className = "flex items-center gap-2">
                    <Button className = "min-w-20 bg-gray-500 text-white cursor-pointer" variant ="outline"> {doc.data().role}</Button>
                        {isOwner && 
                        doc.data().userId !== user?.emailAddresses[0].toString()
                        && (
                            <Button
                            variant = "destructive"
                            onClick={()=> handleDelete(doc.data().userId)}
                            disabled = {isPending}
                            size = "sm"
                            className = "cursor-pointer"
                            >
                                {isPending ? "Removing..." : "X"}
                            </Button>
                        )
                        
                    }
                        
                </div>

                </div>
            )
    })}

    </div>
    
  </DialogContent>
</Dialog>
  )
}

export default ManageUsers