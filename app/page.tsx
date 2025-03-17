"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ArrowUpDown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CandidateTable from "@/components/candidate-table"
import HierarchicalTagSelector from "@/components/hierarchical-tag-selector"
import ScoreBreakdown from "@/components/score-breakdown"
import CandidateStats from "@/components/candidate-stats"
import { fetchCandidates } from "@/lib/api"
import { filterCandidatesByTags } from "@/lib/tag-utils"
import type { Candidate } from "@/types/cv-types"

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [scoreFilters, setScoreFilters] = useState({
    overall: 0,
    departmentMatch: 0,
    technicalQualification: 0,
    experienceValue: 0,
    languageProficiency: 0,
    practicalFactors: 0,
  })

  // Load all candidates on initial render
  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true)
      try {
        const results = await fetchCandidates({})
        setCandidates(results)
        setFilteredCandidates(results)
      } catch (error) {
        console.error("Error fetching candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCandidates()
  }, [])

  // Filter candidates based on search query, tags, and score filters
  useEffect(() => {
    if (candidates.length === 0) return

    let results = [...candidates]

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (candidate) =>
          candidate.candidateName.toLowerCase().includes(query) ||
          candidate.primaryDepartment.toLowerCase().includes(query) ||
          candidate.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Tag filters using our utility function
    if (selectedTags.length > 0) {
      results = filterCandidatesByTags(results, selectedTags)
    }

    // Score filters
    if (scoreFilters.overall > 0) {
      results = results.filter((candidate) => candidate.overallScore >= scoreFilters.overall)
    }

    if (scoreFilters.departmentMatch > 0) {
      results = results.filter((candidate) => candidate.scoreComponents.departmentMatch >= scoreFilters.departmentMatch)
    }

    if (scoreFilters.technicalQualification > 0) {
      results = results.filter(
        (candidate) => candidate.scoreComponents.technicalQualification >= scoreFilters.technicalQualification,
      )
    }

    if (scoreFilters.experienceValue > 0) {
      results = results.filter((candidate) => candidate.scoreComponents.experienceValue >= scoreFilters.experienceValue)
    }

    if (scoreFilters.languageProficiency > 0) {
      results = results.filter(
        (candidate) => candidate.scoreComponents.languageProficiency >= scoreFilters.languageProficiency,
      )
    }

    if (scoreFilters.practicalFactors > 0) {
      results = results.filter(
        (candidate) => candidate.scoreComponents.practicalFactors >= scoreFilters.practicalFactors,
      )
    }

    // Sort by overall score by default
    results.sort((a, b) => b.overallScore - a.overallScore)

    setFilteredCandidates(results)
  }, [candidates, searchQuery, selectedTags, scoreFilters])

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag])
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  const handleScoreFilterChange = (component: string, value: number) => {
    setScoreFilters((prev) => ({
      ...prev,
      [component]: value,
    }))
  }

  const clearScoreFilters = () => {
    setScoreFilters({
      overall: 0,
      departmentMatch: 0,
      technicalQualification: 0,
      experienceValue: 0,
      languageProficiency: 0,
      practicalFactors: 0,
    })
  }

  const clearAllFilters = () => {
    clearTags()
    clearScoreFilters()
    setSearchQuery("")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resort Operations Talent Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <HierarchicalTagSelector
                candidates={candidates}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onTagRemove={handleTagRemove}
                onClearTags={clearTags}
              />
            </div>
            <Input
              placeholder="Search by name or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-1/3"
            />
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by Score
            </Button>
            {(selectedTags.length > 0 || Object.values(scoreFilters).some((v) => v > 0) || searchQuery) && (
              <Button variant="ghost" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="md:col-span-1">
            <div className="space-y-6">
              <ScoreBreakdown
                overallScore={
                  filteredCandidates.length > 0
                    ? Math.round(
                        filteredCandidates.reduce((sum, c) => sum + c.overallScore, 0) / filteredCandidates.length,
                      )
                    : 0
                }
                scoreComponents={{
                  departmentMatch:
                    filteredCandidates.length > 0
                      ? Math.round(
                          filteredCandidates.reduce((sum, c) => sum + c.scoreComponents.departmentMatch, 0) /
                            filteredCandidates.length,
                        )
                      : 0,
                  technicalQualification:
                    filteredCandidates.length > 0
                      ? Math.round(
                          filteredCandidates.reduce((sum, c) => sum + c.scoreComponents.technicalQualification, 0) /
                            filteredCandidates.length,
                        )
                      : 0,
                  experienceValue:
                    filteredCandidates.length > 0
                      ? Math.round(
                          filteredCandidates.reduce((sum, c) => sum + c.scoreComponents.experienceValue, 0) /
                            filteredCandidates.length,
                        )
                      : 0,
                  languageProficiency:
                    filteredCandidates.length > 0
                      ? Math.round(
                          filteredCandidates.reduce((sum, c) => sum + c.scoreComponents.languageProficiency, 0) /
                            filteredCandidates.length,
                        )
                      : 0,
                  practicalFactors:
                    filteredCandidates.length > 0
                      ? Math.round(
                          filteredCandidates.reduce((sum, c) => sum + c.scoreComponents.practicalFactors, 0) /
                            filteredCandidates.length,
                        )
                      : 0,
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={showFilters ? "md:col-span-3" : "md:col-span-4"}>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Candidate Search
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <Users className="h-4 w-4 mr-2" />
                Talent Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </div>
              </div>

              <CandidateTable candidates={filteredCandidates} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="analytics">
              <CandidateStats candidates={candidates} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

