'use client'
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react";
import { collectionGroup, where,query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";
function useOwner() {
    const {user} = useUser();
    const room = useRoom();
    const [isOwner, setIsOwner] = useState(false)
    const [usersInRoom] = useCollection(
        user && query(collectionGroup(db,"rooms"), where("roomId", "==", room.id))
    )
    useEffect(()=>{
        if (usersInRoom?.docs && usersInRoom.docs.length > 0){
            const owners = usersInRoom.docs.filter((doc) => doc.data().role === 'owner')
            if (
                owners.some((owner) => owner.data().userId === user?.emailAddresses[0].toString())
            ){
                setIsOwner(true)
            }
        }
    },[usersInRoom, user])
    return isOwner;
}

export default useOwner