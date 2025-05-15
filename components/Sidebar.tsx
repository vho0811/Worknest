'use client'
import NewDocumentButton from "./NewDocumentButton"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
//   import {useCollection} from "react-firebase-hooks/firestore"
  import {MenuIcon} from "lucide-react"
// import { useUser } from "@clerk/nextjs"
  function Sidebar() {
//   const {user} = useUser();
//   const [data,loading,error] = useCollection()

  const menuOptions = (
        <NewDocumentButton/>

  )
  return (
    <div className="p-3 md:p-5 bg-gray-800 text-white min-h-screen">
        <div className="md:hidden">
        <Sheet>
        <SheetTrigger>
            <MenuIcon className="p-2 hover:opacity-30 cursor-pointer rounded-lg" size={40}/>
        </SheetTrigger>
        <SheetContent side={"left"}>
            <SheetHeader>
            <SheetTitle>
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