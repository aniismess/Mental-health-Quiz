import type React from "react"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const pathname = headers().get('x-pathname') || headers().get('x-url') || "";

  if (pathname.startsWith("/login")) {
    return <>{children}</>
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (!pathname.startsWith("/login")) {
      redirect("/login")
    }
  }

  const { data: adminProfile } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", user?.email)
    .single()

  if (!adminProfile) {
    if (!pathname.startsWith("/login")) {
      redirect("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
