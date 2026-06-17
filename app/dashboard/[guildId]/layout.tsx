"use client"

import { useParams } from "next/navigation"
import { DashboardSidebar, MobileDashboardNav } from "@/components/dashboard-sidebar"
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context"
import { Loader2, RefreshCw, AlertCircle, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { guildId, guild, guildIcon, isLoading, loadingMessage, loadingError, retryConnection } = useDashboard()

  if (isLoading || loadingError) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md text-center">
          {loadingError ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Connection Failed</h2>
                <p className="text-muted-foreground mb-6">{loadingError}</p>
                <Button 
                  onClick={retryConnection}
                  className="bg-primary hover:bg-primary/90"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h2>
                <p className="text-muted-foreground">{loadingMessage}</p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <DashboardSidebar 
        guildId={guildId} 
        guildName={guild?.name}
        guildIcon={guildIcon}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileDashboardNav guildId={guildId} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function GuildDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const guildId = params.guildId as string

  return (
    <DashboardProvider guildId={guildId}>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  )
}
