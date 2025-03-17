"use client"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ScoreFilterProps {
  scoreFilters: {
    overall: number
    departmentMatch: number
    technicalQualification: number
    experienceValue: number
    languageProficiency: number
    practicalFactors: number
  }
  onScoreFilterChange: (component: string, value: number) => void
  onClearScoreFilters: () => void
}

export default function ScoreFilter({ scoreFilters, onScoreFilterChange, onClearScoreFilters }: ScoreFilterProps) {
  const hasActiveFilters = Object.values(scoreFilters).some((value) => value > 0)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreLabel = (component: string) => {
    switch (component) {
      case "overall":
        return "Overall Score"
      case "departmentMatch":
        return "Department Match"
      case "technicalQualification":
        return "Technical Qualification"
      case "experienceValue":
        return "Experience Value"
      case "languageProficiency":
        return "Language Proficiency"
      case "practicalFactors":
        return "Practical Factors"
      default:
        return component
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Score Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearScoreFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Active Score Filters */}
        {hasActiveFilters && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(scoreFilters).map(([component, value]) => {
                if (value === 0) return null
                return (
                  <Badge
                    key={component}
                    variant="outline"
                    className={`flex items-center gap-1 px-3 py-1 border-2 border-${getScoreColor(value).replace("bg-", "")}`}
                  >
                    {getScoreLabel(component)}: {value}%+
                    <X className="h-3 w-3 cursor-pointer" onClick={() => onScoreFilterChange(component, 0)} />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Overall Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Score: {scoreFilters.overall}%+</span>
            </div>
            <Slider
              value={[scoreFilters.overall]}
              max={100}
              step={5}
              className={scoreFilters.overall > 0 ? getScoreColor(scoreFilters.overall) : ""}
              onValueChange={(value) => onScoreFilterChange("overall", value[0])}
            />
          </div>

          {/* Department Match */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Department Match: {scoreFilters.departmentMatch}%+</span>
            </div>
            <Slider
              value={[scoreFilters.departmentMatch]}
              max={100}
              step={5}
              className={scoreFilters.departmentMatch > 0 ? getScoreColor(scoreFilters.departmentMatch) : ""}
              onValueChange={(value) => onScoreFilterChange("departmentMatch", value[0])}
            />
          </div>

          {/* Technical Qualification */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Technical Qualification: {scoreFilters.technicalQualification}%+
              </span>
            </div>
            <Slider
              value={[scoreFilters.technicalQualification]}
              max={100}
              step={5}
              className={
                scoreFilters.technicalQualification > 0 ? getScoreColor(scoreFilters.technicalQualification) : ""
              }
              onValueChange={(value) => onScoreFilterChange("technicalQualification", value[0])}
            />
          </div>

          {/* Experience Value */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Experience Value: {scoreFilters.experienceValue}%+</span>
            </div>
            <Slider
              value={[scoreFilters.experienceValue]}
              max={100}
              step={5}
              className={scoreFilters.experienceValue > 0 ? getScoreColor(scoreFilters.experienceValue) : ""}
              onValueChange={(value) => onScoreFilterChange("experienceValue", value[0])}
            />
          </div>

          {/* Language Proficiency */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Language Proficiency: {scoreFilters.languageProficiency}%+</span>
            </div>
            <Slider
              value={[scoreFilters.languageProficiency]}
              max={100}
              step={5}
              className={scoreFilters.languageProficiency > 0 ? getScoreColor(scoreFilters.languageProficiency) : ""}
              onValueChange={(value) => onScoreFilterChange("languageProficiency", value[0])}
            />
          </div>

          {/* Practical Factors */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Practical Factors: {scoreFilters.practicalFactors}%+</span>
            </div>
            <Slider
              value={[scoreFilters.practicalFactors]}
              max={100}
              step={5}
              className={scoreFilters.practicalFactors > 0 ? getScoreColor(scoreFilters.practicalFactors) : ""}
              onValueChange={(value) => onScoreFilterChange("practicalFactors", value[0])}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

