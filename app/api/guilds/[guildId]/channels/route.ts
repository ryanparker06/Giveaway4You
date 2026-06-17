import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://giveaway4you-api.onrender.com/api"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params

  try {
    const response = await fetch(`${API_BASE_URL}/guilds/${guildId}/channels`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch channels", channels: [] },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Normalize response - could be array or object with channels property
    const channels = Array.isArray(data) ? data : data.channels || []
    
    return NextResponse.json({ channels })
  } catch (error) {
    console.error("[API] Failed to fetch channels:", error)
    return NextResponse.json(
      { error: "Failed to fetch channels", channels: [] },
      { status: 500 }
    )
  }
}
