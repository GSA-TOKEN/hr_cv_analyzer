import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CVAnalysisResult, DepartmentCategory } from "@/types/cv-types"

interface CVDepartmentMatchProps {
  results: CVAnalysisResult
}

export default function CVDepartmentMatch({ results }: CVDepartmentMatchProps) {
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Group departments by category
  const departmentsByCategory: Record<DepartmentCategory, Array<{ name: string; score: number }>> = {
    "Guest Services": [],
    "Accommodation Services": [],
    "Food & Beverage": [],
    "Business Operations": [],
    "Facilities Management": [],
  }

  results.departmentScores.forEach((dept) => {
    departmentsByCategory[dept.category].push({
      name: dept.department,
      score: dept.score,
    })
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Department Match Analysis</CardTitle>
        <CardDescription>Candidate's fit across resort operation departments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(departmentsByCategory).map(([category, departments]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-medium">{category}</h3>
            <div className="space-y-3">
              {departments.map((dept, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{dept.name}</span>
                    <span className="text-sm">{dept.score}%</span>
                  </div>
                  <Progress value={dept.score} className={`h-2 ${getScoreColor(dept.score)}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

