import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Gift } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                  <Gift className="h-4 w-4 text-primary" />
                </span>
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-primary">Giveaway4You</span>{" "}
                  <span className="hidden text-foreground sm:inline">Dashboard</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/60 py-1 pl-1 pr-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image || "/placeholder.svg"}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full ring-1 ring-border"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {session.user?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
                <span className="hidden max-w-32 truncate text-sm font-medium text-foreground sm:inline">
                  {session.user?.name}
                </span>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main>{children}</main>
    </div>
  )
}
