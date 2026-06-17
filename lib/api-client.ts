const API_BASE_URL = "https://giveaway4you-api.onrender.com/api"

// Configuration for Render free tier (can take up to 60s to wake up)
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds
const REQUEST_TIMEOUT = 90000 // 90 seconds

export type ApiStatus = "idle" | "waking" | "retrying" | "error" | "success"

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
  status?: ApiStatus
}

// Status callback for UI updates
let statusCallback: ((status: ApiStatus, message: string) => void) | null = null

export function setApiStatusCallback(callback: ((status: ApiStatus, message: string) => void) | null) {
  statusCallback = callback
}

function updateStatus(status: ApiStatus, message: string) {
  if (statusCallback) {
    statusCallback(status, message)
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  console.log("[v0] FETCH URL:", url)

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt === 1) {
        updateStatus("waking", "Waking up the Giveaway4You API...")
      } else {
        updateStatus("retrying", `Retrying connection... (Attempt ${attempt}/${MAX_RETRIES})`)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `Error: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          const text = await response.text()
          if (text) errorMessage = text
        }
        
        console.log("[v0] API error:", response.status, errorMessage)
        
        // Specific error messages based on status
        if (response.status === 400) {
          errorMessage = errorMessage || "Invalid request data"
        } else if (response.status === 401) {
          errorMessage = "Please sign in again."
        } else if (response.status === 403) {
          errorMessage = "You do not have permission to manage this server."
        } else if (response.status === 404) {
          errorMessage = "Endpoint not found."
        }
        
        // Retry on 5xx errors
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
          continue
        }
        
        updateStatus("error", `API error: ${response.status}`)
        return { 
          success: false, 
          error: errorMessage, 
          statusCode: response.status,
          status: "error"
        }
      }

      const data = await response.json()
      updateStatus("success", "Connected")
      return { success: true, data, statusCode: response.status, status: "success" }
      
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "AbortError"
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        continue
      }
      
      updateStatus("error", "Unable to connect to the Giveaway4You API.")
      return { 
        success: false, 
        error: isTimeout ? "Request timed out" : "Network error",
        statusCode: 0,
        status: "error"
      }
    }
  }

  updateStatus("error", "Unable to connect to the Giveaway4You API.")
  return { success: false, error: "Max retries exceeded", status: "error" }
}

// Health check - call this first to wake up the API
export async function checkApiHealth() {
  return apiRequest<{ success: boolean; bot: string; servers: number }>("/health")
}

// Guild endpoints
export async function getGuildOverview(guildId: string) {
  return apiRequest<GuildOverview>(`/guilds/${guildId}/overview`)
}

export async function getGuildData(guildId: string) {
  return apiRequest<GuildData>(`/guilds/${guildId}`)
}

export async function getGuildSettings(guildId: string) {
  return apiRequest<GuildSettings>(`/guilds/${guildId}/settings`)
}

export async function updateGuildSettings(guildId: string, settings: Partial<GuildSettings>) {
  return apiRequest<GuildSettings>(`/guilds/${guildId}/settings`, {
    method: "PUT",
    body: JSON.stringify(settings),
  })
}

// Helper to map backend giveaway to frontend format
function mapGiveaway(giveaway: any): Giveaway {
  return {
    id: giveaway.id || giveaway._id,
    guildId: giveaway.guildId,
    channelId: giveaway.channelId,
    messageId: giveaway.messageId,
    prize: giveaway.prize,
    description: giveaway.description,
    winners: giveaway.winners || giveaway.winnerCount,
    winnerCount: giveaway.winnerCount || giveaway.winners,
    entries: Array.isArray(giveaway.entries) ? giveaway.entries.length : (giveaway.entries || 0),
    startedAt: giveaway.startedAt,
    scheduledStart:
      giveaway.scheduledStart ||
      giveaway.startsAt ||
      giveaway.startTime ||
      giveaway.scheduledFor ||
      giveaway.startAt ||
      giveaway.startedAt,
    endsAt: giveaway.endsAt,
    endedAt: giveaway.endedAt,
    status: giveaway.ended ? "ended" : (giveaway.status || "active"),
    winnerIds: giveaway.winnerIds,
    hostId: giveaway.hostId,
    requiredRoles: giveaway.requiredRoles,
    blockedRoles: giveaway.blockedRoles,
    requiredLevel: giveaway.requiredLevel,
    bonusEntries: giveaway.bonusEntries,
  }
}

// Giveaway endpoints
export async function getActiveGiveaways(guildId: string) {
  const result = await apiRequest<any>(`/guilds/${guildId}/giveaways?status=active`)
  console.log("[v0] getActiveGiveaways raw result:", result)
  
  if (result.success && result.data) {
    // Handle different response formats
    let rawGiveaways: any[] = []
    
    if (Array.isArray(result.data)) {
      rawGiveaways = result.data
    } else if (result.data.giveaways && Array.isArray(result.data.giveaways)) {
      rawGiveaways = result.data.giveaways
    } else if (result.data.data && Array.isArray(result.data.data)) {
      rawGiveaways = result.data.data
    }
    
    console.log("[v0] rawGiveaways:", rawGiveaways)
    const giveaways = rawGiveaways.map(mapGiveaway)
    console.log("[v0] mapped giveaways:", giveaways)
    return { ...result, data: giveaways }
  }
  return { ...result, data: [] as Giveaway[] }
}

export async function getScheduledGiveaways(guildId: string) {
  const result = await apiRequest<Giveaway[] | { giveaways: Giveaway[] }>(`/guilds/${guildId}/giveaways?status=scheduled`)
  if (result.success && result.data) {
    const rawGiveaways = Array.isArray(result.data) ? result.data : result.data.giveaways || []
    const giveaways = rawGiveaways.map(mapGiveaway)
    return { ...result, data: giveaways }
  }
  return { ...result, data: [] as Giveaway[] }
}

export async function getAllGiveaways(guildId: string) {
  const result = await apiRequest<Giveaway[] | { giveaways: Giveaway[] }>(`/guilds/${guildId}/giveaways`)
  if (result.success && result.data) {
    const rawGiveaways = Array.isArray(result.data) ? result.data : result.data.giveaways || []
    const giveaways = rawGiveaways.map(mapGiveaway)
    return { ...result, data: giveaways }
  }
  return { ...result, data: [] as Giveaway[] }
}

export async function getGiveaway(guildId: string, giveawayId: string) {
  return apiRequest<Giveaway>(`/guilds/${guildId}/giveaways/${giveawayId}`)
}

export async function createGiveaway(guildId: string, giveaway: CreateGiveawayInput, userId?: string) {
  const payload = {
    guildId,
    channelId: giveaway.channelId,
    prize: giveaway.prize,
    winnerCount: giveaway.winnerCount,
    duration: giveaway.duration,
    description: giveaway.description || "",
    userId: userId || "",
    scheduledStart: giveaway.scheduledStart
      ? new Date(giveaway.scheduledStart).toISOString()
      : null,
    bonusEntries: giveaway.bonusEntries ?? [],
    requiredRoles: giveaway.requiredRoles ?? [],
  }
  
  try {
    const response = await fetch("https://giveaway4you-api.onrender.com/api/giveaways", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Error: ${response.status}`,
        statusCode: response.status,
        status: "error" as ApiStatus,
      }
    }
    
    return {
      success: true,
      data: data as Giveaway,
      statusCode: response.status,
      status: "success" as ApiStatus,
    }
  } catch (error) {
    return {
      success: false,
      error: "Network error",
      statusCode: 0,
      status: "error" as ApiStatus,
    }
  }
}

export async function updateGiveaway(guildId: string, giveawayId: string, updates: Partial<Giveaway>) {
  return apiRequest<Giveaway>(`/guilds/${guildId}/giveaways/${giveawayId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

export async function endGiveaway(guildId: string, giveawayId: string) {
  return apiRequest<Giveaway>(`/guilds/${guildId}/giveaways/${giveawayId}/end`, {
    method: "POST",
  })
}

export async function rerollGiveaway(guildId: string, giveawayId: string, count?: number) {
  return apiRequest<Giveaway>(`/guilds/${guildId}/giveaways/${giveawayId}/reroll`, {
    method: "POST",
    body: JSON.stringify({ count }),
  })
}

export async function cancelGiveaway(guildId: string, giveawayId: string) {
  return apiRequest<Giveaway>(`/guilds/${guildId}/giveaways/${giveawayId}/cancel`, {
    method: "POST",
  })
}

// Analytics endpoints
export async function getGuildAnalytics(guildId: string, period: string = "30d") {
  return apiRequest<GuildAnalytics>(`/guilds/${guildId}/analytics?period=${period}`)
}

// Premium endpoints
// Normalizes both the new dashboard format ({ active, plan, expiresAt, features })
// and the existing bot format ({ success, premium, record }) into a single PremiumStatus.
function normalizePremium(raw: any): PremiumStatus {
  const active = raw?.active ?? raw?.premium ?? false

  const expiresAt = raw?.expiresAt ?? raw?.record?.expiresAt ?? null

  const plan: PremiumStatus["plan"] =
    raw?.plan ??
    (raw?.record?.expiresAt || raw?.expiresAt
      ? "monthly"
      : active
        ? "lifetime"
        : "free")

  const features = Array.isArray(raw?.features) ? raw.features : []

  return { active, plan, expiresAt, features }
}

export async function getGuildPremium(guildId: string) {
  const result = await apiRequest<any>(`/guilds/${guildId}/premium`)
  if (result.success && result.data) {
    return { ...result, data: normalizePremium(result.data) }
  }
  return result as ApiResponse<PremiumStatus>
}

export async function redeemPremiumCode(guildId: string, code: string) {
  const result = await apiRequest<any>(`/guilds/${guildId}/premium/redeem`, {
    method: "POST",
    body: JSON.stringify({ code }),
  })
  if (result.success && result.data) {
    return { ...result, data: normalizePremium(result.data) }
  }
  return result as ApiResponse<PremiumStatus>
}

// Types
export interface GuildOverview {
  totalGiveaways: number
  activeGiveaways: number
  completedGiveaways: number
  premiumStatus: boolean
  premiumExpiry: string | null
}

export interface GuildData {
  id: string
  name: string
  icon: string | null
  memberCount: number
  premium: boolean
  premiumExpiry: string | null
  activeGiveaways: number
  totalGiveaways: number
}

export interface GuildSettings {
  defaultGiveawayChannel: string | null
  logChannel: string | null
  winnerRole: string | null
  bonusEntries: BonusEntry[]
  requiredRoles: string[]
  blacklistedRoles: string[]
  bannedUsers: string[]
  dmWinners: boolean
  reminderNotifications: boolean
  reminderIntervals: number[]
  customWinnerMessage: string | null
  voteRequirement: boolean
}

export interface Giveaway {
  id: string
  guildId: string
  channelId: string
  messageId?: string
  prize: string
  description?: string
  winners?: number
  winnerCount?: number
  entries?: number
  startedAt?: string
  scheduledStart?: string
  endsAt: string
  endedAt?: string
  status: "active" | "scheduled" | "ended" | "cancelled"
  winnerIds?: string[]
  hostId?: string
  requiredRoles?: string[]
  blockedRoles?: string[]
  requiredLevel?: number
  bonusEntries?: BonusEntry[]
}

export interface BonusEntry {
  roleId: string
  entries: number
}

export interface CreateGiveawayInput {
  prize: string
  description?: string
  channelId: string
  duration: number // in milliseconds
  winnerCount: number
  hostedBy?: string
  bonusEntries?: BonusEntry[]
  requiredRoles?: string[]
  blacklistedRoles?: string[]
  dmWinner?: boolean
  remindNotifications?: boolean
  scheduledStart?: string
}

export interface GuildAnalytics {
  totalGiveaways: number
  totalEntries: number
  totalWinners: number
  averageEntries: number
  giveawaysByDay: { date: string; count: number }[]
  entriesByDay: { date: string; count: number }[]
  topPrizes: { prize: string; count: number }[]
}

export interface PremiumStatus {
  active: boolean
  plan: "free" | "monthly" | "lifetime"
  expiresAt: string | null
  features: string[]
}
