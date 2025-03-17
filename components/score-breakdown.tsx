"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScoreComponents } from "@/types/tag-types"

interface ScoreBreakdownProps {
  overallScore: number
  scoreComponents: ScoreComponents
}

export default function ScoreBreakdown({ overallScore, scoreComponents }: ScoreBreakdownProps) {
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Helper function to get text description based on score
  const getScoreDescription = (component: string, score: number): string => {
    if (score >= 80) return "Excellent match"
    if (score >= 60) return "Good match"
    if (score >= 40) return "Fair match"
    return "Poor match"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Candidate Scoring</CardTitle>
          <div className="text-2xl font-bold">{overallScore}%</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(scoreComponents).map(([component, score]) => (
            <div key={component}>
              <div className="flex justify-between mb-1">
                <div>
                  <span className="text-sm font-medium capitalize">{component.replace(/([A-Z])/g, " $1").trim()}</span>
                  <p className="text-xs text-muted-foreground">{getScoreDescription(component, score)}</p>
                </div>
                <span className="text-sm font-medium">{score}%</span>
              </div>
              <Progress value={score} className={`h-2 ${getScoreColor(score)}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

