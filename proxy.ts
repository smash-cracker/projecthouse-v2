import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Social-card images are public and are fetched by crawlers; don't make them
  // wait on an auth round-trip.
  if (request.nextUrl.pathname.endsWith('/opengraph-image')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — do not add logic between createServerClient and getUser
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  // Only routes that read or refresh the Supabase session server-side.
  // Public pages (/, /viva, etc.) skip the auth round-trip entirely and can
  // be statically served.
  matcher: [
    '/admin/:path*',
    '/my-projects/:path*',
    '/projects/:path*',
    '/api/bookings/:path*',
    '/api/razorpay/:path*',
  ],
}
