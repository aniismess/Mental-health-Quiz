"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface RepSystemResults {
  scores: {
    V: number
    A: number
    K: number
    Ad: number
  }
  dominant_system: string
}

export default function RepSystemResultsPage() {
  const [results, setResults] = useState<RepSystemResults | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedResults = localStorage.getItem("rep_system_results")
    if (!storedResults) {
      router.push("/quiz/rep-system")
      return
    }
    setResults(JSON.parse(storedResults))
  }, [router])

  const handleViewAllResults = () => {
    router.push("/results")
  }

  if (!results) return null

  const systemDescriptions = {
    Visual: "You prefer to process information through visual means - seeing, imagining, and visualizing.",
    Auditory: "You prefer to process information through auditory means - hearing, listening, and discussing.",
    Kinesthetic: "You prefer to process information through physical experience - touching, moving, and doing.",
    "Auditory Digital":
      "You prefer to process information through logical analysis - thinking, reasoning, and internal dialogue.",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-800">Representational System Results</CardTitle>
            <CardDescription>Your preferred way of processing information</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Dominant System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{results.dominant_system}</div>
              <p className="text-gray-700">
                {systemDescriptions[results.dominant_system as keyof typeof systemDescriptions]}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{results.scores.V}</div>
                <div className="text-sm font-medium text-red-800">Visual</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{results.scores.A}</div>
                <div className="text-sm font-medium text-green-800">Auditory</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{results.scores.K}</div>
                <div className="text-sm font-medium text-yellow-800">Kinesthetic</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{results.scores.Ad}</div>
                <div className="text-sm font-medium text-purple-800">Auditory Digital</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleViewAllResults} size="lg" className="bg-blue-600 hover:bg-blue-700">
            View All Quiz Results
          </Button>
        </div>
      </div>
    </div>
  )
}
