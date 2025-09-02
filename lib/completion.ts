import { getSupabaseClient } from "./supabase"

export async function updateOverallCompletion(userId: string, sessionId: string) {
  const supabase = getSupabaseClient()

  try {
    // Fetch the current quiz session status
    const { data: session, error: sessionError } = await supabase
      .from("quiz_sessions")
      .select("vak_completed, ei_completed, rep_system_completed")
      .eq("user_id", userId)
      .eq("id", sessionId)
      .single()

    if (sessionError) throw sessionError

    if (session && session.vak_completed && session.ei_completed && session.rep_system_completed) {
      // All quizzes are completed, update all_completed and completed_at
      const { error: updateError } = await supabase
        .from("quiz_sessions")
        .update({ all_completed: true, completed_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("id", sessionId)

      if (updateError) throw updateError
      console.log(`Session ${sessionId} marked as all_completed.`)
    } else {
      console.log(`Session ${sessionId} not yet all_completed.`)
    }
  } catch (error) {
    console.error("Error updating overall completion:", error)
    // Optionally, re-throw or handle more gracefully
  }
}
