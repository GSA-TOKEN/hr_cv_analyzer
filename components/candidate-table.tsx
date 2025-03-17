"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CandidateProfile from "@/components/candidate-profile"
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

interface CandidateTableProps {
  candidates: Candidate[]
  isLoading: boolean
}

export default function CandidateTable({ candidates, isLoading }: CandidateTableProps) {
  // Update the initial sort state to ensure it sorts by score by default
  const [sortField, setSortField] = useState<string>("overallScore")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aValue: any = a[sortField as keyof Candidate]
    let bValue: any = b[sortField as keyof Candidate]

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getExperienceBadge = (level: string) => {
    if (level.includes("Entry")) return <Badge variant="outline">Entry</Badge>
    if (level.includes("Mid")) return <Badge variant="secondary">Mid</Badge>
    if (level.includes("Senior")) return <Badge variant="default">Senior</Badge>
    if (level.includes("Management")) return <Badge variant="destructive">Mgmt</Badge>
    return <Badge variant="outline">{level}</Badge>
  }

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
            className="text-xs"
          >
            {displayName}
          </Badge>
        )
      case "education":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="secondary"
            className="text-xs"
          >
            {displayName}
          </Badge>
        )
      case "experience":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="destructive"
            className="text-xs"
          >
            {displayName}
          </Badge>
        )
      case "techskills":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="accent"
            className="text-xs"
          >
            {displayName}
          </Badge>
        )
      case "softskills":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="neutral"
            className="text-xs"
          >
            {displayName}
          </Badge>
        )
      case "certifications":
        return (
          <Badge
            // @ts-ignore - Our component supports these variants
            variant="warning"
            className="text-xs border-dashed"
          >
            {displayName}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {displayName || tag}
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No candidates found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("candidateName")}>
              <div className="flex items-center">
                Candidate
                {getSortIcon("candidateName")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("primaryDepartment")}>
              <div className="flex items-center">
                Department
                {getSortIcon("primaryDepartment")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("experienceLevel")}>
              <div className="flex items-center">
                Experience
                {getSortIcon("experienceLevel")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("overallScore")}>
              <div className="flex items-center">
                Match Score
                {getSortIcon("overallScore")}
              </div>
            </TableHead>
            <TableHead>Key Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">{candidate.candidateName}</TableCell>
              <TableCell>{candidate.primaryDepartment}</TableCell>
              <TableCell>{getExperienceBadge(candidate.experienceLevel)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress
                    value={candidate.overallScore}
                    className={`h-2 w-24 ${getScoreColor(candidate.overallScore)}`}
                  />
                  <span className="font-medium">{candidate.overallScore}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {candidate.tags.slice(0, 3).map((tag, i) => (
                    <div key={i}>{getTagBadge(tag)}</div>
                  ))}
                  {candidate.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{candidate.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Candidate Profile</DialogTitle>
                    </DialogHeader>
                    {selectedCandidate && <CandidateProfile candidate={selectedCandidate} />}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

