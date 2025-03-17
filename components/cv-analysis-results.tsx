import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CVAnalysisResult } from "@/types/cv-types"

interface CVAnalysisResultsProps {
  results: CVAnalysisResult
}

export default function CVAnalysisResults({ results }: CVAnalysisResultsProps) {
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Helper function to get badge variant based on tag category
  const getTagVariant = (tag: string) => {
    if (tag.startsWith("dept:")) return "default"
    if (tag.startsWith("skill:")) return "secondary"
    if (tag.startsWith("cert:")) return "outline"
    if (tag.startsWith("exp:")) return "destructive"
    return "default"
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{results.candidateName}</CardTitle>
            <CardDescription>
              {results.experienceLevel} • {results.primaryDepartment}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{results.overallScore}%</div>
            <div className="text-sm text-muted-foreground">Overall Match</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Scoring Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(results.scoreComponents).map(([component, score]) => (
              <div key={component}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{component.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-sm">{score}%</span>
                </div>
                <Progress value={score} className={`h-2 ${getScoreColor(score)}`} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Key Tags</h3>
          <div className="flex flex-wrap gap-2">
            {results.tags.slice(0, 10).map((tag, index) => (
              <Badge key={index} variant={getTagVariant(tag)}>
                {tag.includes(":") ? tag.split(":")[1] : tag}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Language Proficiency</h3>
          <div className="grid grid-cols-2 gap-3">
            {results.languages.map((lang, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{lang.language}</span>
                  <span className="text-sm">{lang.level}/5</span>
                </div>
                <Progress value={lang.level * 20} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Recommended Positions</h3>
          <div className="space-y-2">
            {results.recommendedPositions.map((position, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{position.title}</span>
                <Badge variant="outline">{position.matchScore}% match</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

