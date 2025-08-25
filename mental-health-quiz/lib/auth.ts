import { getSupabaseClient } from "@/lib/supabase"

export async function checkAdminAuth() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { isAdmin: false, user: null }
  }

  // Check if user exists in admin_users table
  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email)
    .single()

  if (adminError || !adminProfile) {
    return { isAdmin: false, user }
  }

  return { isAdmin: true, user }
}
