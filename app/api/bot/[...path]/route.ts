import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://giveaway4you-api.onrender.com/api"

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  const { path } = await params
  const endpoint = "/" + path.join("/")
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE_URL}${endpoint}${searchParams ? `?${searchParams}` : ""}`

  console.log(`[v0] Proxying ${method} to:`, url)

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    }

    // Add body for non-GET requests
    if (method !== "GET" && method !== "DELETE") {
      try {
        const body = await request.text()
        if (body) {
          fetchOptions.body = body
        }
      } catch {
        // No body
      }
    }

    const response = await fetch(url, fetchOptions)

    console.log(`[v0] Response status:`, response.status)

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.log(`[v0] Non-JSON response:`, text.substring(0, 200))
      
      if (!response.ok) {
        return NextResponse.json(
          { error: text || `API returned ${response.status}` },
          { status: response.status }
        )
      }
      
      // Try to parse as JSON anyway
      try {
        const data = JSON.parse(text)
        return NextResponse.json(data)
      } catch {
        return NextResponse.json({ message: text })
      }
    }

    const data = await response.json()
    
    if (!response.ok) {
      console.log(`[v0] Error response:`, JSON.stringify(data))
      return NextResponse.json(
        { error: data.message || data.error || `API error: ${response.status}` },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.log(`[v0] Proxy error:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect to API" },
      { status: 502 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "GET")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "POST")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PUT")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "PATCH")
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, "DELETE")
}
