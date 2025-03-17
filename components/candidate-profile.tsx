"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Mail, Download, Star } from "lucide-react"
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

interface CandidateProfileProps {
  candidate: Candidate
}

export default function CandidateProfile({ candidate }: CandidateProfileProps) {
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getTagBadge = (tag: string) => {
    const [category] = tag.split(":")

    // Get the display name by extracting the last part after the last colon
    const displayName = tag.split(":").pop()?.replace(/-/g, " ")

    switch (category) {
      case "languages":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="outline"
          >
            {displayName}
          </Badge>
        )
      case "education":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="secondary"
          >
            {displayName}
          </Badge>
        )
      case "experience":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="destructive"
          >
            {displayName}
          </Badge>
        )
      case "techskills":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="accent"
          >
            {displayName}
          </Badge>
        )
      case "softskills":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="neutral"
          >
            {displayName}
          </Badge>
        )
      case "certifications":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="warning"
            className="border-dashed"
          >
            {displayName}
          </Badge>
        )
      default:
        return <Badge variant="outline">{displayName || tag}</Badge>
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{candidate.candidateName}</h2>
          <p className="text-gray-500">
            {candidate.experienceLevel} • {candidate.primaryDepartment}
          </p>
          <div className="flex gap-4 mt-2">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CV
            </Button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{candidate.overallScore}%</div>
          <div className="text-sm text-gray-500">Overall Match</div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills & Certifications</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Scoring Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(candidate.scoreComponents).map(([component, score]) => (
                  <div key={component}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {component.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-sm">{score}%</span>
                    </div>
                    <Progress value={score} className={`h-2 ${getScoreColor(score)}`} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Recommended Positions</h3>
              <div className="space-y-3">
                {candidate.recommendedPositions.map((position, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{position.title}</div>
                      <div className="text-sm text-gray-500">{position.department}</div>
                    </div>
                    <Badge variant="outline">{position.matchScore}% match</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Personal Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(candidate.personalAttributes).map(([key, value]) => (
                <div key={key} className="p-3 border rounded">
                  <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                  <div className="font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Role-Specific Skills</h3>
              <div className="space-y-4">
                {Object.entries(candidate.roleSkills).map(([category, skills]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 capitalize">{category.replace(/([A-Z])/g, " $1").trim()}</h4>
                    <div className="space-y-2">
                      {skills.map((skill, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span>{skill.name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${index < skill.level ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Languages</h3>
              <div className="border rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  {candidate.languages.map((lang, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{lang.language}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < lang.level ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-medium mb-3">Certifications</h3>
              <div className="border rounded-lg p-4">
                <div className="space-y-3">
                  {candidate.certifications.map((cert, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-500">{cert.issuer}</p>
                      </div>
                      <div className="text-sm">{cert.expiryDate ? `Expires: ${cert.expiryDate}` : "No expiration"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">All Tags</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag, index) => (
                  <div key={index}>{getTagBadge(tag)}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags
                    .filter((tag) => tag.startsWith("languages:"))
                    .map((tag, index) => (
                      <div key={index}>{getTagBadge(tag)}</div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Education & Experience</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags
                    .filter((tag) => tag.startsWith("education:") || tag.startsWith("experience:"))
                    .map((tag, index) => (
                      <div key={index}>{getTagBadge(tag)}</div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Technical & Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags
                    .filter((tag) => tag.startsWith("techskills:") || tag.startsWith("softskills:"))
                    .map((tag, index) => (
                      <div key={index}>{getTagBadge(tag)}</div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags
                    .filter((tag) => tag.startsWith("certifications:"))
                    .map((tag, index) => (
                      <div key={index}>{getTagBadge(tag)}</div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to group departments by category
function groupDepartmentsByCategory(departmentScores: Array<{ category: string; department: string; score: number }>) {
  const grouped: Record<string, Array<{ department: string; score: number }>> = {}

  departmentScores.forEach((dept) => {
    if (!grouped[dept.category]) {
      grouped[dept.category] = []
    }
    grouped[dept.category].push({
      department: dept.department,
      score: dept.score,
    })
  })

  return grouped
}

