"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import type { VAKResult } from "@/lib/types"

export default function VAKResultsPage() {
  const [results, setResults] = useState<VAKResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedResults = localStorage.getItem("vak_results")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    } else {
      router.push("/")
    }
  }, [router])

  if (!results) return null

  const totalQuestions = results.visual_score + results.auditory_score + results.kinesthetic_score
  const visualPercentage = (results.visual_score / totalQuestions) * 100
  const auditoryPercentage = (results.auditory_score / totalQuestions) * 100
  const kinestheticPercentage = (results.kinesthetic_score / totalQuestions) * 100

  const getStyleDescription = (style: string) => {
    switch (style) {
      case "Visual":
        return "You learn best through seeing and visualizing information. You prefer charts, diagrams, and written instructions."
      case "Auditory":
        return "You learn best through hearing and discussing information. You prefer lectures, discussions, and verbal instructions."
      case "Kinesthetic":
        return "You learn best through hands-on experience and movement. You prefer practical activities and learning by doing."
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">VAK Learning Style Results</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Your dominant learning style is:{" "}
            <span className="font-semibold text-emerald-600">{results.dominant_style}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="bg-emerald-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">{results.dominant_style} Learner</h3>
            <p className="text-gray-700">{getStyleDescription(results.dominant_style)}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Your Learning Style Breakdown</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Visual ({results.visual_score}/{totalQuestions})
                  </span>
                  <span className="text-sm text-gray-600">{visualPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={visualPercentage} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Auditory ({results.auditory_score}/{totalQuestions})
                  </span>
                  <span className="text-sm text-gray-600">{auditoryPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={auditoryPercentage} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    Kinesthetic ({results.kinesthetic_score}/{totalQuestions})
                  </span>
                  <span className="text-sm text-gray-600">{kinestheticPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={kinestheticPercentage} className="h-3" />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => router.push("/quiz/ei")} className="px-8 py-3 text-lg">
              Continue to Emotional Intelligence Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
