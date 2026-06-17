"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Gift,
  Clock,
  PlusCircle,
  Settings,
  Crown,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

interface DashboardSidebarProps {
  guildId: string
  guildName?: string
  guildIcon?: string | null
}

const navItems = [
  { name: "Overview", href: "", icon: LayoutDashboard },
  { name: "Giveaways", href: "/giveaways", icon: Gift },
  { name: "Scheduled", href: "/scheduled", icon: Clock },
  { name: "Create", href: "/create", icon: PlusCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Premium", href: "/premium", icon: Crown },
]

function ServerHeader({ guildName, guildIcon }: { guildName?: string; guildIcon?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-3">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative flex items-center gap-3">
        {guildIcon ? (
          <img src={guildIcon || "/placeholder.svg"} alt={guildName} className="h-11 w-11 rounded-xl ring-2 ring-primary/30" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-2 ring-primary/30">
            <span className="text-base font-bold text-primary">{guildName?.charAt(0).toUpperCase() || "?"}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-foreground">{guildName || "Server"}</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Managing
          </p>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ guildId, guildName, guildIcon }: DashboardSidebarProps) {
  const pathname = usePathname()
  const basePath = `/dashboard/${guildId}`

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col self-start border-r border-border/60 bg-sidebar lg:flex">
      {/* Server header */}
      <div className="space-y-4 p-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Servers
        </Link>
        <ServerHeader guildName={guildName} guildIcon={guildIcon} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = item.href === "" ? pathname === basePath : pathname.startsWith(href)

            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(34,197,94,0.2)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
                {item.name === "Premium" && (
                  <Crown className={cn("ml-auto h-3.5 w-3.5", isActive ? "text-primary" : "text-yellow-500")} />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-4">
        <p className="text-xs text-muted-foreground">
          Powered By <span className="font-semibold text-primary">4You Development</span>
        </p>
      </div>
    </aside>
  )
}

export function MobileDashboardNav({ guildId }: { guildId: string }) {
  const pathname = usePathname()
  const basePath = `/dashboard/${guildId}`
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border/60 bg-sidebar lg:hidden">
      <div className="flex items-center justify-between p-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Servers
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 transition-colors hover:bg-secondary"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-1 px-4 pb-4 pt-2">
          {navItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = item.href === "" ? pathname === basePath : pathname.startsWith(href)

            return (
              <Link
                key={item.name}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(34,197,94,0.2)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.name}
                {item.name === "Premium" && (
                  <Crown className={cn("ml-auto h-3.5 w-3.5", isActive ? "text-primary" : "text-yellow-500")} />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
