import type React from "react"
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
