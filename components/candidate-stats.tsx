"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Candidate } from "@/types/cv-types"

// Define custom badge variant type that includes our new variants
type ExtendedBadgeVariant =
  | "default"
  | "outline"
  | "secondary"
  | "destructive"
  | "accent"
  | "neutral"
  | "warning"

interface CandidateStatsProps {
  candidates: Candidate[]
}

export default function CandidateStats({ candidates }: CandidateStatsProps) {
  const stats = useMemo(() => {
    if (!candidates.length)
      return {
        departmentDistribution: [],
        experienceLevelDistribution: [],
        averageScores: {
          overall: 0,
          departmentMatch: 0,
          technicalQualification: 0,
          experienceValue: 0,
          languageProficiency: 0,
          practicalFactors: 0,
        },
        skillGaps: [],
        languageDistribution: [],
        tagDistribution: {
          languages: [],
          education: [],
          experience: [],
          techskills: [],
          softskills: [],
          certifications: [],
        },
      }

    // Department distribution
    const deptCounts: Record<string, number> = {}
    candidates.forEach((candidate) => {
      if (!deptCounts[candidate.primaryDepartment]) {
        deptCounts[candidate.primaryDepartment] = 0
      }
      deptCounts[candidate.primaryDepartment]++
    })

    const departmentDistribution = Object.entries(deptCounts)
      .map(([dept, count]) => ({
        department: dept,
        count,
        percentage: Math.round((count / candidates.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // Experience level distribution
    const expCounts: Record<string, number> = {}
    candidates.forEach((candidate) => {
      if (!expCounts[candidate.experienceLevel]) {
        expCounts[candidate.experienceLevel] = 0
      }
      expCounts[candidate.experienceLevel]++
    })

    const experienceLevelDistribution = Object.entries(expCounts)
      .map(([level, count]) => ({
        level,
        count,
        percentage: Math.round((count / candidates.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // Average scores
    const avgScores = {
      overall: 0,
      departmentMatch: 0,
      technicalQualification: 0,
      experienceValue: 0,
      languageProficiency: 0,
      practicalFactors: 0,
    }

    candidates.forEach((candidate) => {
      avgScores.overall += candidate.overallScore
      avgScores.departmentMatch += candidate.scoreComponents.departmentMatch
      avgScores.technicalQualification += candidate.scoreComponents.technicalQualification
      avgScores.experienceValue += candidate.scoreComponents.experienceValue
      avgScores.languageProficiency += candidate.scoreComponents.languageProficiency
      avgScores.practicalFactors += candidate.scoreComponents.practicalFactors
    })

    const averageScores = {
      overall: Math.round(avgScores.overall / candidates.length),
      departmentMatch: Math.round(avgScores.departmentMatch / candidates.length),
      technicalQualification: Math.round(avgScores.technicalQualification / candidates.length),
      experienceValue: Math.round(avgScores.experienceValue / candidates.length),
      languageProficiency: Math.round(avgScores.languageProficiency / candidates.length),
      practicalFactors: Math.round(avgScores.practicalFactors / candidates.length),
    }

    // Language distribution
    const langCounts: Record<string, number> = {}
    candidates.forEach((candidate) => {
      candidate.languages.forEach((lang) => {
        if (!langCounts[lang.language]) {
          langCounts[lang.language] = 0
        }
        langCounts[lang.language]++
      })
    })

    const languageDistribution = Object.entries(langCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / candidates.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // Skill gaps analysis
    const skillCounts: Record<string, number> = {}
    const allSkills = new Set<string>()

    candidates.forEach((candidate) => {
      const allCandidateSkills = [
        ...candidate.roleSkills.customerFacing.map((s) => s.name),
        ...candidate.roleSkills.operational.map((s) => s.name),
        ...candidate.roleSkills.administrative.map((s) => s.name),
      ]

      allCandidateSkills.forEach((skill) => {
        allSkills.add(skill)
        if (!skillCounts[skill]) {
          skillCounts[skill] = 0
        }
        skillCounts[skill]++
      })
    })

    const skillGaps = Array.from(allSkills)
      .map((skill) => ({
        skill,
        count: skillCounts[skill] || 0,
        percentage: Math.round(((skillCounts[skill] || 0) / candidates.length) * 100),
        gap: 100 - Math.round(((skillCounts[skill] || 0) / candidates.length) * 100),
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10)

    // Tag distribution
    const tagCounts: Record<string, Record<string, number>> = {
      languages: {},
      education: {},
      experience: {},
      techskills: {},
      softskills: {},
      certifications: {},
    }

    candidates.forEach((candidate) => {
      candidate.tags.forEach((tag) => {
        const [category] = tag.split(":")
        if (!tagCounts[category]) {
          tagCounts[category] = {}
        }
        if (!tagCounts[category][tag]) {
          tagCounts[category][tag] = 0
        }
        tagCounts[category][tag]++
      })
    })

    const tagDistribution = {
      languages: Object.entries(tagCounts.languages || {})
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: Math.round((count / candidates.length) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      education: Object.entries(tagCounts.education || {})
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: Math.round((count / candidates.length) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      experience: Object.entries(tagCounts.experience || {})
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: Math.round((count / candidates.length) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      techskills: Object.entries(tagCounts.techskills || {})
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: Math.round((count / candidates.length) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      softskills: Object.entries(tagCounts.softskills || {})
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: Math.round((count / candidates.length) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      certifications: Object.entries(tagCounts.certifications || {})
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: Math.round((count / candidates.length) * 100),
        }))
        .sort((a, b) => b.count - a.count),
    }

    return {
      departmentDistribution,
      experienceLevelDistribution,
      averageScores,
      skillGaps,
      languageDistribution,
      tagDistribution,
    }
  }, [candidates])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getTagBadge = (category: string, tag: string) => {
    switch (category) {
      case "languages":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="outline"
            className="text-xs"
          >
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
      case "education":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="secondary"
            className="text-xs"
          >
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
      case "experience":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="destructive"
            className="text-xs"
          >
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
      case "techskills":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="accent"
            className="text-xs"
          >
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
      case "softskills":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="neutral"
            className="text-xs"
          >
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
      case "certifications":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="warning"
            className="text-xs"
          >
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {tag.split(':').pop()?.replace(/-/g, " ")}
          </Badge>
        )
    }
  }

  if (!candidates.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-gray-500">Analytics will be displayed once candidate data is available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Candidate distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.departmentDistribution.map((dept, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{dept.department}</span>
                    <span className="text-sm">
                      {dept.count} ({dept.percentage}%)
                    </span>
                  </div>
                  <Progress value={dept.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Level Distribution</CardTitle>
            <CardDescription>Breakdown of candidate experience levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.experienceLevelDistribution.map((level, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{level.level}</span>
                    <span className="text-sm">
                      {level.count} ({level.percentage}%)
                    </span>
                  </div>
                  <Progress value={level.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Scores</CardTitle>
          <CardDescription>Average scores across all candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center p-4">
              <div className="text-5xl font-bold mb-2">{stats.averageScores.overall}%</div>
              <div className="text-sm text-gray-500">Average Overall Score</div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Department Match</span>
                <span className="text-sm">{stats.averageScores.departmentMatch}%</span>
              </div>
              <Progress
                value={stats.averageScores.departmentMatch}
                className={`h-2 ${getScoreColor(stats.averageScores.departmentMatch)}`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Technical Qualification</span>
                <span className="text-sm">{stats.averageScores.technicalQualification}%</span>
              </div>
              <Progress
                value={stats.averageScores.technicalQualification}
                className={`h-2 ${getScoreColor(stats.averageScores.technicalQualification)}`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Experience Value</span>
                <span className="text-sm">{stats.averageScores.experienceValue}%</span>
              </div>
              <Progress
                value={stats.averageScores.experienceValue}
                className={`h-2 ${getScoreColor(stats.averageScores.experienceValue)}`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Language Proficiency</span>
                <span className="text-sm">{stats.averageScores.languageProficiency}%</span>
              </div>
              <Progress
                value={stats.averageScores.languageProficiency}
                className={`h-2 ${getScoreColor(stats.averageScores.languageProficiency)}`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Practical Factors</span>
                <span className="text-sm">{stats.averageScores.practicalFactors}%</span>
              </div>
              <Progress
                value={stats.averageScores.practicalFactors}
                className={`h-2 ${getScoreColor(stats.averageScores.practicalFactors)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Tags by Category</CardTitle>
            <CardDescription>Most common tags across candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(stats.tagDistribution).map(([category, tags]) => {
                if (tags.length === 0) return null
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">
                      {category === "languages"
                        ? "Languages"
                        : category === "education"
                          ? "Education"
                          : category === "experience"
                            ? "Experience"
                            : category === "techskills"
                              ? "Technical Skills"
                              : category === "softskills"
                                ? "Soft Skills"
                                : "Certifications"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 5).map((tag, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {getTagBadge(category, tag.tag)}
                          <span className="text-xs text-gray-500">({tag.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Gaps Analysis</CardTitle>
            <CardDescription>Top skills missing in candidate pool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.skillGaps.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm">{skill.percentage}% coverage</span>
                  </div>
                  <Progress value={skill.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

