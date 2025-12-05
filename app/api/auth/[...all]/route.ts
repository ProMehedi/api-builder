import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { NextRequest, NextResponse } from "next/server"

const handler = toNextJsHandler(auth)

// Helper to add CORS headers
function addCorsHeaders(response: Response, request: NextRequest): Response {
  const origin = request.headers.get("origin")
  
  // Allow localhost and any localhost subdomain
  const isAllowedOrigin = origin && (
    origin.includes("localhost") || 
    origin.includes("127.0.0.1")
  )
  
  if (isAllowedOrigin) {
    const headers = new Headers(response.headers)
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Credentials", "true")
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
  
  return response
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")
  
  const isAllowedOrigin = origin && (
    origin.includes("localhost") || 
    origin.includes("127.0.0.1")
  )
  
  if (isAllowedOrigin) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400",
      },
    })
  }
  
  return new NextResponse(null, { status: 204 })
}

export async function GET(request: NextRequest) {
  const response = await handler.GET(request)
  return addCorsHeaders(response, request)
}

export async function POST(request: NextRequest) {
  const response = await handler.POST(request)
  return addCorsHeaders(response, request)
}

