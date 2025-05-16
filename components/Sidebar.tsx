'use client'
import NewDocumentButton from "./NewDocumentButton"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  import {useCollection} from "react-firebase-hooks/firestore"
  import {MenuIcon} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { collectionGroup, DocumentData, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import { useEffect, useState } from "react"
import SidebarOption from "./SidebarOption"
  interface RoomDocument extends DocumentData {
    createdAt: string;
    roomId: string;
    userId: string;
    role: "owner" | "editor";
  }
  function Sidebar() {
  const {user} = useUser();
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  });
  const [data] = useCollection(
    user && (
        query(collectionGroup(db, 'rooms'), where('userId', '==', user.emailAddresses[0].toString()))
    )
  );
  useEffect(() =>{
    if (!data) return;
    const grouped = data.docs.reduce<{
        owner: RoomDocument[]; //separares rooms by owner
        editor: RoomDocument[];//separares rooms by editor
    }>(
        (acc, curr)=>{
            const roomData = curr.data() as RoomDocument;

            if (roomData.role === "owner"){
                acc.owner.push({id: curr.id, ...roomData});
            } else {
                acc.editor.push({id: curr.id, ...roomData});
            }
            return acc;
        }, {
            owner: [],
            editor: [],
        }
    )
    setGroupedData(grouped);
  }, [data])

  const menuOptions = (
    <>
      <NewDocumentButton/>

      <div className = "flex py-4 flex-col space-y-4 md:max-w-36">
      {groupedData.owner.length === 0 ? (
        <h2 className="text-gray-500 font-semibold text-sm">No documents created yet</h2>
      ) : (
        <>
        <h2 className="text-sm font-semibold text-gray-400 mt-4">My Documents</h2>
        {groupedData.owner.map((doc)=>(
            <SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`}/> 
        ))}
        </>
      )}
      </div>

      {/* Shared with me */}
      {groupedData.editor.length > 0 && (
        <>
        <h2 className="text-sm font-semibold text-gray-400 mt-4">Shared with me</h2>
        {groupedData.editor.map((doc) => (
            <SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`}/>
        ))}
        </>
      )}
    </>
  );
  return (
    <div className="bg-[#1E1E2E] text-white p-4 space-y-6 min-h-screen">
        <div className="md:hidden">
        <Sheet>
        <SheetTrigger>
            <MenuIcon className="p-2 hover:opacity-30 cursor-pointer rounded-lg" size={40}/>
        </SheetTrigger>
        <SheetContent side={"left"} className="bg-[#1E1E2E] text-white  p-4 space-y-6">
            <SheetHeader>
            <SheetTitle className="text-white text-lg font-bold">
                Menu
            </SheetTitle>
            <div>{menuOptions}</div>

            </SheetHeader>
        </SheetContent>
        </Sheet>
        </div>

        <div className="hidden md:inline">
        {menuOptions}

        </div>
    </div>
  )
}

export default Sidebar