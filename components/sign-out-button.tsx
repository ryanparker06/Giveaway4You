"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="border-primary/30 text-foreground hover:bg-primary/10"
    >
      Sign Out
    </Button>
  )
}
