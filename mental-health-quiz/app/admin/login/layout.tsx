"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { checkAdminAuth } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const { isAdmin, user } = await checkAdminAuth()
      setIsAdmin(isAdmin)
      setAdminUser(user)

      if (!isAdmin && pathname !== "/admin/login") {
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router, pathname])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  // Show loading while checking auth
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login page if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4"></h2>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
