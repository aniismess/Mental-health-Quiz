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
import { VAK_QUESTIONS } from "@/components/vak-questions"
import { calculateVAKScores, getVAKDominantStyle, validateVAKAnswers } from "@/lib/scoring"

export default function VAKQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
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
      [currentQuestion]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < VAK_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!userId || !sessionId) return // Check both userId and sessionId

    if (!validateVAKAnswers(answers, VAK_QUESTIONS.length)) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseClient()

      // Save responses
      const responses = Object.entries(answers).map(([questionIndex, selectedValue]) => {
        const question = VAK_QUESTIONS[Number.parseInt(questionIndex)]
        const selectedOption = question.options.find((opt) => opt.value === selectedValue)

        return {
          user_id: userId,
          session_id: sessionId, // Added session_id
          question_number: Number.parseInt(questionIndex) + 1,
          question_text: question.text,
          selected_option: selectedValue,
          option_text: selectedOption?.label || "",
          selected_value: selectedValue,
          learning_style: selectedValue === 'V' ? 'Visual' : selectedValue === 'A' ? 'Auditory' : 'Kinesthetic', // Added learning_style
        }
      })

      const { error: responseError } = await supabase.from("vak_responses").insert(responses)

      if (responseError) throw responseError

      const scores = calculateVAKScores(answers)
      const dominantStyle = getVAKDominantStyle(scores)

      // Save results
      const { error: resultError } = await supabase.from("vak_results").insert({
        user_id: userId,
        session_id: sessionId, // Added session_id
        visual_score: scores.V,
        auditory_score: scores.A,
        kinesthetic_score: scores.K,
        dominant_style: dominantStyle,
      })

      if (resultError) throw resultError

      // Update completion status
      const { error: completionError } = await supabase
        .from("quiz_sessions") // Changed to quiz_sessions
        .update({ vak_completed: true })
        .eq("user_id", userId)
        .eq("id", sessionId) // Ensure specific session is updated

      if (completionError) throw completionError

      // Store results for display
      localStorage.setItem(
        "vak_results",
        JSON.stringify({
          visual_score: scores.V,
          auditory_score: scores.A,
          kinesthetic_score: scores.K,
          dominant_style: dominantStyle,
        }),
      )

      router.push("/quiz/vak/results")
    } catch (error) {
      console.error("Error submitting VAK quiz:", error)
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

  const progress = ((currentQuestion + 1) / VAK_QUESTIONS.length) * 100
  const currentQuestionData = VAK_QUESTIONS[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">VAK Learning Style Assessment</CardTitle>
          <CardDescription className="text-center">
            Question {currentQuestion + 1} of {VAK_QUESTIONS.length}
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQuestionData.text}</h3>
            <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange} className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!answers[currentQuestion] || isSubmitting}>
              {currentQuestion === VAK_QUESTIONS.length - 1 ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
