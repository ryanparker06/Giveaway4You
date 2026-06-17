import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch Discord guilds and the backend install list in PARALLEL so a slow
  // backend (e.g. a cold Render instance) doesn't stack on top of the Discord
  // request. The backend call also has a timeout so it can never block the
  // whole response — if it's slow we just fall back to "not installed".
  const backendController = new AbortController()
  const backendTimeout = setTimeout(() => backendController.abort(), 4000)

  const [discordRes, backendRes] = await Promise.all([
    fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }),
    fetch("https://giveaway4you-api.onrender.com/api/guilds", {
      signal: backendController.signal,
    }).catch(() => null),
  ])

  clearTimeout(backendTimeout)

  if (!discordRes.ok) {
    return NextResponse.json({ error: "Failed to fetch Discord guilds" }, { status: 500 })
  }

  const discordGuilds = await discordRes.json()

  // Keep only manageable guilds
  const manageableGuilds = discordGuilds.filter(
    (guild: any) => (guild.permissions & 0x20) === 0x20
  )

  // Build the installed ID set from the backend response (if it succeeded)
  let installedIds = new Set<string>()

  if (backendRes && backendRes.ok) {
    const backendGuilds = await backendRes.json()
    installedIds = new Set(backendGuilds.map((g: any) => String(g.id)))
  }

  // 5. Merge WITHOUT filtering anything out
  const mergedGuilds = manageableGuilds.map((guild: any) => ({
    ...guild,
    bot: installedIds.has(String(guild.id)),
  }))

  return NextResponse.json(mergedGuilds)
}
