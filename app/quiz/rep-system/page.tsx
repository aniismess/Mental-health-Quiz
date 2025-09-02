"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { REP_SYSTEM_QUESTIONS } from "@/components/rep-system-questions"
import { calculateRepSystemScores, getRepSystemDominant, validateRepSystemRankings } from "@/lib/scoring"
import { updateOverallCompletion } from "@/lib/completion"

interface QuestionRanking {
  [optionIndex: number]: number
}

export default function RepSystemQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [rankings, setRankings] = useState<Record<number, QuestionRanking>>({})
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

    // Load saved progress
    if (storedSessionId) {
      const savedProgress = localStorage.getItem(`rep_quiz_progress_${storedSessionId}`)
      if (savedProgress) {
        const { questionIndex, rankings: savedRankings } = JSON.parse(savedProgress)
        setCurrentQuestion(questionIndex)
        setRankings(savedRankings)
      }
    }
  }, [router])

  // Effect to save progress
  useEffect(() => {
    if (userId && sessionId) {
      const progressToSave = JSON.stringify({
        questionIndex: currentQuestion,
        rankings: rankings,
      })
      localStorage.setItem(`rep_quiz_progress_${sessionId}`, progressToSave)
    }
  }, [currentQuestion, rankings, userId, sessionId])

  const handleRankingChange = (optionIndex: number, ranking: number) => {
    setRankings((prev) => {
      const currentQuestionRankings = { ...prev[currentQuestion] };

      // If the selected ranking is already assigned to another option, clear that assignment
      const existingOptionIndexWithSameRanking = Object.keys(currentQuestionRankings).find(
        (key) => currentQuestionRankings[Number.parseInt(key)] === ranking && Number.parseInt(key) !== optionIndex
      );

      if (existingOptionIndexWithSameRanking !== undefined) {
        delete currentQuestionRankings[Number.parseInt(existingOptionIndexWithSameRanking)];
      }

      // Set the new ranking for the current option
      currentQuestionRankings[optionIndex] = ranking;

      return {
        ...prev,
        [currentQuestion]: currentQuestionRankings,
      };
    });
  };

  const getCurrentRankings = () => rankings[currentQuestion] || {}

  const isQuestionComplete = () => {
    const currentRankings = getCurrentRankings()
    const usedRankings = Object.values(currentRankings)
    return (
      usedRankings.length === 4 &&
      usedRankings.includes(1) &&
      usedRankings.includes(2) &&
      usedRankings.includes(3) &&
      usedRankings.includes(4)
    )
  }

  const handleNext = () => {
    if (currentQuestion < REP_SYSTEM_QUESTIONS.length - 1) {
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

    if (!validateRepSystemRankings(rankings, REP_SYSTEM_QUESTIONS.length)) {
      toast({
        title: "Incomplete Quiz",
        description: "Please rank all options for each question before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseClient()

      // Save responses
      const responses = Object.entries(rankings).map(([questionIndex, questionRankings]) => {
        const questionNumber = Number.parseInt(questionIndex) + 1
        const question = REP_SYSTEM_QUESTIONS[Number.parseInt(questionIndex)]

        const visualRank = question.options.find(opt => opt.value === 'V') ? (questionRankings[question.options.findIndex(opt => opt.value === 'V')] || null) : null;
        const auditoryRank = question.options.find(opt => opt.value === 'A') ? (questionRankings[question.options.findIndex(opt => opt.value === 'A')] || null) : null;
        const kinestheticRank = question.options.find(opt => opt.value === 'K') ? (questionRankings[question.options.findIndex(opt => opt.value === 'K')] || null) : null;
        const auditoryDigitalRank = question.options.find(opt => opt.value === 'Ad') ? (questionRankings[question.options.findIndex(opt => opt.value === 'Ad')] || null) : null;

        return {
          user_id: userId,
          session_id: sessionId, // Added sessionId
          question_number: questionNumber,
          question_text: question.text,
          visual_rank: visualRank,
          auditory_rank: auditoryRank,
          kinesthetic_rank: kinestheticRank,
          auditory_digital_rank: auditoryDigitalRank,
        };
      });

      const { error: responseError } = await supabase.from("rep_system_responses").insert(responses);
      if (responseError) throw responseError;

      const scores = calculateRepSystemScores(rankings, REP_SYSTEM_QUESTIONS)
      const dominantSystem = getRepSystemDominant(scores)

      // Save results
      const { error: resultError } = await supabase.from("rep_system_results").insert({
        user_id: userId,
        session_id: sessionId, // Added sessionId
        visual_total: scores.V, // Renamed to match schema
        auditory_total: scores.A, // Renamed to match schema
        kinesthetic_total: scores.K, // Renamed to match schema
        auditory_digital_total: scores.Ad, // Renamed to match schema
        dominant_system: dominantSystem,
      })

      if (resultError) throw resultError

      // Update completion status
      const { error: completionError } = await supabase
        .from("quiz_sessions") // Changed to quiz_sessions
        .update({
          rep_system_completed: true,
        })
        .eq("user_id", userId)
        .eq("id", sessionId) // Ensure specific session is updated

      if (completionError) throw completionError

      // Update overall completion status
      await updateOverallCompletion(userId, sessionId)

      // Store results for display
      localStorage.setItem(
        "rep_system_results",
        JSON.stringify({
          scores,
          dominant_system: dominantSystem,
        }),
      )

      router.push("/quiz/rep-system/results")
      localStorage.removeItem(`rep_quiz_progress_${sessionId}`)
    } catch (error) {
      console.error("Error submitting Rep System quiz:", error)
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

  const progress = ((currentQuestion + 1) / REP_SYSTEM_QUESTIONS.length) * 100
  const question = REP_SYSTEM_QUESTIONS[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Representational System Preference Test</CardTitle>
          <CardDescription className="text-center">
            Question {currentQuestion + 1} of {REP_SYSTEM_QUESTIONS.length}
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{question.text}</h3>
            <p className="text-sm text-gray-600">Rank each option from 1 (most descriptive) to 4 (least descriptive)</p>

            <div className="space-y-4">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="flex-1">{option.text}</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((rank) => (
                      <Button
                        key={rank}
                        variant={getCurrentRankings()[optionIndex] === rank ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRankingChange(optionIndex, rank)}
                        className="w-10 h-10"
                      >
                        {rank}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 text-center">
              1 = Most descriptive of you, 4 = Least descriptive of you
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!isQuestionComplete() || isSubmitting}>
              {currentQuestion === REP_SYSTEM_QUESTIONS.length - 1
                ? isSubmitting
                  ? "Submitting..."
                  : "Submit"
                : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
