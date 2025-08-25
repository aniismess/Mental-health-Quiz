"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { STATEMENTS, CATEGORIES } from "@/components/ei-questions"
import { calculateEIScores, classifyEIScore, validateEIAnswers } from "@/lib/scoring"

export default function EIQuizPage() {
  const [currentStatement, setCurrentStatement] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null) // Added sessionId state
  const router = useRouter()

  useEffect(() => {
    const storedUserId = localStorage.getItem("quiz_user_id")
    const storedSessionId = localStorage.getItem("quiz_session_id") // Get sessionId from localStorage

    if (!storedUserId || !storedSessionId) { // Check both
      router.push("/")
      return
    }
    setUserId(storedUserId)
    setSessionId(storedSessionId) // Set sessionId state
  }, [router])

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStatement]: Number.parseInt(value),
    }))
  }

  const handleNext = () => {
    if (currentStatement < STATEMENTS.length - 1) {
      setCurrentStatement((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStatement > 0) {
      setCurrentStatement((prev) => prev - 1)
    }
  }

  const getCategoryForStatement = (statementIndex: number) => {
    const statementNumber = statementIndex + 1
    return CATEGORIES.find((cat) => cat.items.includes(statementNumber))?.key || "SA"
  }

  const handleSubmit = async () => {
    if (!userId || !sessionId) return // Check both userId and sessionId

    if (!validateEIAnswers(answers, STATEMENTS.length)) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all statements before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseClient()

      // Save responses
      const responses = Object.entries(answers).map(([statementIndex, rating]) => ({
        user_id: userId,
        session_id: sessionId, // Added session_id
        statement_number: Number.parseInt(statementIndex) + 1,
        statement_text: STATEMENTS[Number.parseInt(statementIndex)],
        response_value: rating,
        category: CATEGORIES.find((cat) => cat.items.includes(Number.parseInt(statementIndex) + 1))?.label || "Self-awareness", // Changed to use full label
      }))

      const { error: responseError } = await supabase.from("ei_responses").insert(responses)

      if (responseError) throw responseError

      const scoreResults = calculateEIScores(answers, CATEGORIES)

      const categoryScores = CATEGORIES.reduce(
        (acc, category) => {
          const score = scoreResults[category.key as keyof typeof scoreResults]
          acc[category.key] = {
            score: score,
            classification: classifyEIScore(score),
          }
          return acc
        },
        {} as Record<string, { score: number; classification: string }>,
      )

      // Save results
      const { error: resultError } = await supabase.from("ei_results").insert({
        user_id: userId,
        session_id: sessionId, // Added session_id
        self_awareness_score: scoreResults.SA,
        self_awareness_classification: classifyEIScore(scoreResults.SA),
        managing_emotions_score: scoreResults.ME,
        managing_emotions_classification: classifyEIScore(scoreResults.ME),
        motivating_oneself_score: scoreResults.MO,
        motivating_oneself_classification: classifyEIScore(scoreResults.MO),
        empathy_score: scoreResults.E,
        empathy_classification: classifyEIScore(scoreResults.E),
        social_skill_score: scoreResults.SS,
        social_skill_classification: classifyEIScore(scoreResults.SS),
        total_score: scoreResults.total,
      })

      if (resultError) throw resultError

      // Update completion status
      const { error: completionError } = await supabase
        .from("quiz_completions")
        .update({ ei_completed: true })
        .eq("user_id", userId)

      if (completionError) throw completionError

      // Store results for display
      localStorage.setItem(
        "ei_results",
        JSON.stringify({
          ...categoryScores,
          total_score: scoreResults.total,
        }),
      )

      router.push("/quiz/ei/results")
    } catch (error) {
      console.error("Error submitting EI quiz:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userId) return null

  const progress = ((currentStatement + 1) / STATEMENTS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Emotional Intelligence Assessment</CardTitle>
          <CardDescription className="text-center">
            Statement {currentStatement + 1} of {STATEMENTS.length}
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">{STATEMENTS[currentStatement]}</h3>
            <p className="text-sm text-gray-600 text-center">
              Rate how well this statement describes you (1 = Not at all, 5 = Very much)
            </p>
            <RadioGroup
              value={answers[currentStatement]?.toString() || ""}
              onValueChange={handleAnswerChange}
              className="flex justify-center space-x-8"
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                    {rating}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between text-xs text-gray-500 px-4">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStatement === 0}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!answers[currentStatement] || isSubmitting}>
              {currentStatement === STATEMENTS.length - 1 ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
