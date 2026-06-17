"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { 
  getGuildOverview, 
  getGuildSettings, 
  getGuildPremium,
  getActiveGiveaways,
  getScheduledGiveaways,
  getGuildAnalytics,
  checkApiHealth,
  setApiStatusCallback,
  type GuildOverview,
  type GuildSettings,
  type PremiumStatus,
  type Giveaway,
  type GuildAnalytics,
  type ApiStatus
} from "@/lib/api-client"

interface GuildInfo {
  id: string
  name: string
  icon: string | null
}

interface DashboardContextType {
  // Guild info
  guildId: string
  guild: GuildInfo | null
  guildIcon: string | null
  
  // Data
  overview: GuildOverview | null
  settings: GuildSettings | null
  premium: PremiumStatus | null
  activeGiveaways: Giveaway[]
  scheduledGiveaways: Giveaway[]
  analytics: GuildAnalytics | null
  
  // Premium helper
  isPremium: boolean
  
  // Loading states
  isLoading: boolean
  loadingMessage: string
  loadingError: string | null
  
  // 404 states
  overviewMissing: boolean
  settingsMissing: boolean
  premiumMissing: boolean
  giveawaysMissing: boolean
  scheduledMissing: boolean
  analyticsMissing: boolean
  
  // Refresh functions
  refreshOverview: () => Promise<void>
  refreshSettings: () => Promise<void>
  refreshPremium: () => Promise<void>
  refreshGiveaways: () => Promise<void>
  refreshScheduled: () => Promise<void>
  refreshAnalytics: (period?: string) => Promise<void>
  refreshAll: () => Promise<void>
  retryConnection: () => void
  
  // Update functions
  updateSettings: (newSettings: GuildSettings) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider")
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
  guildId: string
}

export function DashboardProvider({ children, guildId }: DashboardProviderProps) {
  // Guild info
  const [guild, setGuild] = useState<GuildInfo | null>(null)
  
  // Data states
  const [overview, setOverview] = useState<GuildOverview | null>(null)
  const [settings, setSettings] = useState<GuildSettings | null>(null)
  const [premium, setPremium] = useState<PremiumStatus | null>(null)
  const [activeGiveaways, setActiveGiveaways] = useState<Giveaway[]>([])
  const [scheduledGiveaways, setScheduledGiveaways] = useState<Giveaway[]>([])
  const [analytics, setAnalytics] = useState<GuildAnalytics | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Connecting to Giveaway4You...")
  const [loadingError, setLoadingError] = useState<string | null>(null)
  
  // 404 states
  const [overviewMissing, setOverviewMissing] = useState(false)
  const [settingsMissing, setSettingsMissing] = useState(false)
  const [premiumMissing, setPremiumMissing] = useState(false)
  const [giveawaysMissing, setGiveawaysMissing] = useState(false)
  const [scheduledMissing, setScheduledMissing] = useState(false)
  const [analyticsMissing, setAnalyticsMissing] = useState(false)

  const guildIcon = guild?.icon 
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : null

  const isPremium = premium?.active ?? false

  // Refresh functions
  const refreshOverview = useCallback(async () => {
    const result = await getGuildOverview(guildId)
    if (result.success && result.data) {
      setOverview(result.data)
      setOverviewMissing(false)
    } else if (result.statusCode === 404) {
      setOverviewMissing(true)
    }
  }, [guildId])

  const refreshSettings = useCallback(async () => {
    const result = await getGuildSettings(guildId)
    if (result.success && result.data) {
      setSettings(result.data)
      setSettingsMissing(false)
    } else if (result.statusCode === 404) {
      setSettingsMissing(true)
    }
  }, [guildId])

  const refreshPremium = useCallback(async () => {
    const result = await getGuildPremium(guildId)
    if (result.success && result.data) {
      setPremium(result.data)
      setPremiumMissing(false)
    } else if (result.statusCode === 404) {
      setPremiumMissing(true)
    }
  }, [guildId])

  const refreshGiveaways = useCallback(async () => {
    const result = await getActiveGiveaways(guildId)
    if (result.success && result.data) {
      setActiveGiveaways(result.data)
      setGiveawaysMissing(false)
    } else if (result.statusCode === 404) {
      setGiveawaysMissing(true)
    }
  }, [guildId])

  const refreshScheduled = useCallback(async () => {
    const result = await getScheduledGiveaways(guildId)
    if (result.success && result.data) {
      setScheduledGiveaways(result.data)
      setScheduledMissing(false)
    } else if (result.statusCode === 404) {
      setScheduledMissing(true)
    }
  }, [guildId])

  const refreshAnalytics = useCallback(async (period: string = "30d") => {
    const result = await getGuildAnalytics(guildId, period)
    if (result.success && result.data) {
      setAnalytics(result.data)
      setAnalyticsMissing(false)
    } else if (result.statusCode === 404) {
      setAnalyticsMissing(true)
    }
  }, [guildId])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshOverview(),
      refreshSettings(),
      refreshPremium(),
      refreshGiveaways(),
      refreshScheduled(),
      refreshAnalytics(),
    ])
  }, [refreshOverview, refreshSettings, refreshPremium, refreshGiveaways, refreshScheduled, refreshAnalytics])

  const updateSettings = useCallback((newSettings: GuildSettings) => {
    setSettings(newSettings)
  }, [])

  // Initial load
  useEffect(() => {
    setApiStatusCallback((status: ApiStatus, message: string) => {
      setLoadingMessage(message)
    })

    initializeDashboard()

    return () => setApiStatusCallback(null)
  }, [guildId])

  // Poll premium status so the dashboard locks/unlocks automatically when a
  // server's premium is granted or removed (without needing a manual refresh).
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPremium()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshPremium])

  async function initializeDashboard() {
    setIsLoading(true)
    setLoadingError(null)
    
    // Fetch guild info first (fast) - this is the only blocking call
    setLoadingMessage("Loading server...")
    
    try {
      const response = await fetch(`/api/guilds/${guildId}`)
      if (response.ok) {
        const data = await response.json()
        setGuild({
          id: data.id,
          name: data.name,
          icon: data.icon,
        })
      }
    } catch {
      // Continue anyway, guild info is optional
    }

    // Show dashboard immediately, fetch data in background
    setIsLoading(false)
    
    // Fetch all other data in background (non-blocking)
    refreshAll()
  }

  const retryConnection = useCallback(() => {
    initializeDashboard()
  }, [guildId, refreshAll])

  const value: DashboardContextType = {
    guildId,
    guild,
    guildIcon,
    overview,
    settings,
    premium,
    activeGiveaways,
    scheduledGiveaways,
    analytics,
    isPremium,
    isLoading,
    loadingMessage,
    loadingError,
    overviewMissing,
    settingsMissing,
    premiumMissing,
    giveawaysMissing,
    scheduledMissing,
    analyticsMissing,
    refreshOverview,
    refreshSettings,
    refreshPremium,
    refreshGiveaways,
    refreshScheduled,
    refreshAnalytics,
    refreshAll,
    retryConnection,
    updateSettings,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}
