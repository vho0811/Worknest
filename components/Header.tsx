'use client'

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import Breadcrumbs from "./Breadcrumbs"

function Header() {
    const {user} = useUser()
  return (
    <div className="border-b-3 border-gray-700 flex items-center justify-between p-5 bg-[#1E1E2E] text-white">
      {user && (
        <h1 className="text-2xl font-bold">
            {user.firstName}{`'s`} Hub 
        </h1>
      )}
    <Breadcrumbs/>
    <div>
        <SignedOut>
            <SignInButton/>
        </SignedOut>
        <SignedIn>
            <UserButton/>
        </SignedIn>
    </div>
    </div>

  )
}

export default Header