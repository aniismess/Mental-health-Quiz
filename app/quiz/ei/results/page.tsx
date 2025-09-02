"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CATEGORIES } from "@/components/ei-questions"

interface EIResults {
  SA: { score: number; classification: string }
  ME: { score: number; classification: string }
  MO: { score: number; classification: string }
  E: { score: number; classification: string }
  SS: { score: number; classification: string }
  total_score: number
}

export default function EIResultsPage() {
  const [results, setResults] = useState<EIResults | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedResults = localStorage.getItem("ei_results")
    if (!storedResults) {
      router.push("/quiz/ei")
      return
    }
    setResults(JSON.parse(storedResults))
  }, [router])

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Strength":
        return "bg-green-100 text-green-800 border-green-200"
      case "Needs attention":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Development priority":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleContinue = () => {
    router.push("/quiz/rep-system")
  }

  if (!results) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-purple-800">Emotional Intelligence Results</CardTitle>
            <CardDescription>Your assessment across the five emotional competencies</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring Grid</CardTitle>
            <CardDescription>Record your scores for each emotional competency category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {CATEGORIES.map((category) => (
                <div key={category.key} className="text-center">
                  <div className="bg-purple-600 text-white p-2 rounded-t font-semibold text-sm">{category.label}</div>
                  <div className="border border-t-0 p-4 space-y-2">
                    {category.items.map((item) => (
                      <div key={item} className="text-sm py-1 border-b">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {CATEGORIES.map((category) => {
                const categoryResult = results[category.key as keyof EIResults] as {
                  score: number
                  classification: string
                }
                return (
                  <div key={category.key} className="text-center">
                    <div className="bg-gray-100 p-2 rounded-t font-semibold text-sm">Total = ({category.key})</div>
                    <div className="border border-t-0 p-4">
                      <div className="text-2xl font-bold text-purple-600">{categoryResult.score}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interpretation Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="bg-green-600 text-white px-3 py-1 rounded font-semibold">35-50</div>
                <div>
                  This area is a <strong>strength</strong> for you.
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="bg-yellow-600 text-white px-3 py-1 rounded font-semibold">18-34</div>
                <div>
                  <strong>Giving attention</strong> to where you feel you are weakest will pay dividends.
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="bg-red-600 text-white px-3 py-1 rounded font-semibold">10-17</div>
                <div>
                  Make this area a <strong>development priority</strong>.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-semibold bg-purple-600 text-white p-2 rounded text-center">Strength</div>
              <div className="font-semibold bg-purple-600 text-white p-2 rounded text-center">Needs attention</div>
              <div className="font-semibold bg-purple-600 text-white p-2 rounded text-center">Development priority</div>

              {CATEGORIES.map((category) => {
                const categoryResult = results[category.key as keyof EIResults] as {
                  score: number
                  classification: string
                }
                return (
                  <div
                    key={`${category.key}-result`}
                    className={`p-3 rounded border text-center ${
                      categoryResult.classification === "Strength"
                        ? "bg-green-50 border-green-200"
                        : categoryResult.classification === "Needs attention"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-red-50 border-red-200"
                    }`}
                  >
                    {categoryResult.classification === category.label.replace(/\s+/g, " ") ? category.label : ""}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 space-y-3">
              {CATEGORIES.map((category) => {
                const categoryResult = results[category.key as keyof EIResults] as {
                  score: number
                  classification: string
                }
                return (
                  <div key={category.key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-teal-700">{category.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{categoryResult.score}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(categoryResult.classification)}`}
                      >
                        {categoryResult.classification}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-center">
                <span className="text-lg font-semibold text-purple-800">Total Score: </span>
                <span className="text-2xl font-bold text-purple-600">{results.total_score}</span>
                <span className="text-lg font-semibold text-purple-800"> / 250</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleContinue} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Continue to Representational System Test
          </Button>
        </div>
      </div>
    </div>
  )
}
