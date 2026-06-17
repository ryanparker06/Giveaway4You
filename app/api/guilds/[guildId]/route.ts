import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://giveaway4you-api.onrender.com/api"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { guildId } = await params

  try {
    // Fetch guild info from Discord API
    const discordResponse = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    })

    if (!discordResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch Discord guilds" }, { status: 500 })
    }

    const guilds = await discordResponse.json()
    const guild = guilds.find((g: any) => g.id === guildId)

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Return guild info for the sidebar
    return NextResponse.json({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
    })
  } catch (error) {
    console.error("Error fetching guild data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
