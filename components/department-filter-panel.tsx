"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface DepartmentFilterPanelProps {
  activeFilters: {
    departments: string[]
    experienceLevels: string[]
    skills: string[]
    minScore: number
  }
  setActiveFilters: React.Dispatch<
    React.SetStateAction<{
      departments: string[]
      experienceLevels: string[]
      skills: string[]
      minScore: number
    }>
  >
}

export default function DepartmentFilterPanel({ activeFilters, setActiveFilters }: DepartmentFilterPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    departments: true,
    experience: false,
    skills: false,
    score: false,
  })

  const departmentCategories = {
    "Guest Services": [
      "Front Office",
      "Guest Relations",
      "Reservation",
      "CRM & Call Center",
      "SPA",
      "Kids Club",
      "Entertainment",
      "Lifeguard",
    ],
    "Accommodation Services": ["Housekeeping", "Laundry", "Flower Center"],
    "Food & Beverage": ["Kitchen", "Dishroom", "F&B Service"],
    "Business Operations": [
      "Accounting & Finance",
      "Human Resources",
      "Marketing",
      "Sales",
      "Purchasing",
      "Quality",
      "Security",
    ],
    "Facilities Management": ["Technical Service", "Garden", "Greenkeeping", "Information Technology"],
  }

  const experienceLevels = ["Entry Level (0-2 years)", "Mid-Level (2-5 years)", "Senior (5+ years)", "Management"]

  const skillCategories = {
    "Customer-Facing": ["Guest Communication", "Problem Resolution", "Service Excellence", "Multilingual Ability"],
    Operational: ["System Knowledge", "Process Efficiency", "Team Coordination", "Safety Compliance"],
    Administrative: ["Documentation", "Reporting", "Analysis", "Regulatory Compliance"],
  }

  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section],
    })
  }

  const toggleDepartment = (department: string) => {
    if (activeFilters.departments.includes(department)) {
      setActiveFilters({
        ...activeFilters,
        departments: activeFilters.departments.filter((d) => d !== department),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        departments: [...activeFilters.departments, department],
      })
    }
  }

  const toggleExperienceLevel = (level: string) => {
    if (activeFilters.experienceLevels.includes(level)) {
      setActiveFilters({
        ...activeFilters,
        experienceLevels: activeFilters.experienceLevels.filter((l) => l !== level),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        experienceLevels: [...activeFilters.experienceLevels, level],
      })
    }
  }

  const toggleSkill = (skill: string) => {
    if (activeFilters.skills.includes(skill)) {
      setActiveFilters({
        ...activeFilters,
        skills: activeFilters.skills.filter((s) => s !== skill),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        skills: [...activeFilters.skills, skill],
      })
    }
  }

  const handleScoreChange = (value: number[]) => {
    setActiveFilters({
      ...activeFilters,
      minScore: value[0],
    })
  }

  const clearFilters = () => {
    setActiveFilters({
      departments: [],
      experienceLevels: [],
      skills: [],
      minScore: 0,
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filter Candidates</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Department Filter */}
        <div>
          <Collapsible open={openSections.departments} onOpenChange={() => toggleSection("departments")}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Departments
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {Object.entries(departmentCategories).map(([category, departments]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-sm font-medium mb-1">{category}</h4>
                  <div className="flex flex-wrap gap-1">
                    {departments.map((department) => (
                      <Badge
                        key={department}
                        variant={activeFilters.departments.includes(department) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDepartment(department)}
                      >
                        {department}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Experience Level Filter */}
        <div>
          <Collapsible open={openSections.experience} onOpenChange={() => toggleSection("experience")}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Experience Level
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="flex flex-col gap-1">
                {experienceLevels.map((level) => (
                  <div
                    key={level}
                    className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded"
                    onClick={() => toggleExperienceLevel(level)}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                        activeFilters.experienceLevels.includes(level) ? "bg-primary border-primary" : "border-gray-300"
                      }`}
                    >
                      {activeFilters.experienceLevels.includes(level) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">{level}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Skills Filter */}
        <div>
          <Collapsible open={openSections.skills} onOpenChange={() => toggleSection("skills")}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Skills
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {Object.entries(skillCategories).map(([category, skills]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-sm font-medium mb-1">{category}</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={activeFilters.skills.includes(skill) ? "secondary" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Score Filter */}
        <div>
          <Collapsible open={openSections.score} onOpenChange={() => toggleSection("score")}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Minimum Score
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 px-2">
              <div className="space-y-4">
                <Slider defaultValue={[activeFilters.minScore]} max={100} step={5} onValueChange={handleScoreChange} />
                <div className="flex justify-between text-sm">
                  <span>Min: {activeFilters.minScore}%</span>
                  <span>Max: 100%</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Active Filters */}
      {(activeFilters.departments.length > 0 ||
        activeFilters.experienceLevels.length > 0 ||
        activeFilters.skills.length > 0 ||
        activeFilters.minScore > 0) && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.departments.map((dept) => (
              <Badge key={dept} variant="default" className="flex gap-1 items-center">
                {dept}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleDepartment(dept)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.experienceLevels.map((level) => (
              <Badge key={level} variant="secondary" className="flex gap-1 items-center">
                {level.split(" ")[0]}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleExperienceLevel(level)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="flex gap-1 items-center">
                {skill}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleSkill(skill)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.minScore > 0 && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Min Score: {activeFilters.minScore}%
                <button
                  className="ml-1 hover:bg-red-500 rounded-full"
                  onClick={() => setActiveFilters({ ...activeFilters, minScore: 0 })}
                >
                  ✕
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

