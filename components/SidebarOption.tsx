'use client'
import Link from "next/link"
import {useDocumentData} from "react-firebase-hooks/firestore"
import {db} from "@/firebase"
import { doc } from "firebase/firestore"
import { usePathname } from "next/navigation"
function SidebarOption({href, id}:{
    href: string;
    id: string
}) {
  const [data] = useDocumentData(doc(db, 'documents', id));
  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname !== "/";
  if (!data) return null;
  return (
    <Link
      href={href}
      className={`
        w-full bg-[#2B2D3A] border-l-4 border-[#7F5AF0] text-white text-left px-4 py-2 rounded-md
        hover:bg-[#3c3c44] hover:text-white transition
        ${isActive ? "font-bold border-gray-400" : "border-gray-700"}
      `}
    >
      <p className="truncate tracking-wide text-xs font-medium font-sans">{data.title}</p>
    </Link>
  )
}

export default SidebarOption