"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Candidate } from "@/types/cv-types"

interface AdvancedSearchPanelProps {
  activeFilters: {
    departments: string[]
    departmentCategories: string[]
    experienceLevels: string[]
    skills: string[]
    skillCategories: string[]
    languages: string[]
    certifications: string[]
    minScore: number
    scoreComponents: Record<string, number>
  }
  setActiveFilters: React.Dispatch<
    React.SetStateAction<{
      departments: string[]
      departmentCategories: string[]
      experienceLevels: string[]
      skills: string[]
      skillCategories: string[]
      languages: string[]
      certifications: string[]
      minScore: number
      scoreComponents: Record<string, number>
    }>
  >
  candidates: Candidate[]
}

export default function AdvancedSearchPanel({ activeFilters, setActiveFilters, candidates }: AdvancedSearchPanelProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState("")

  // Extract unique values from candidates for filter options
  const filterOptions = useMemo(() => {
    if (!candidates.length)
      return {
        departmentCategories: [],
        departments: [],
        experienceLevels: [],
        skills: [],
        languages: [],
        certifications: [],
      }

    const options = {
      departmentCategories: new Set<string>(),
      departments: new Set<string>(),
      experienceLevels: new Set<string>(),
      skills: new Set<string>(),
      languages: new Set<string>(),
      certifications: new Set<string>(),
    }

    candidates.forEach((candidate) => {
      // Experience levels
      options.experienceLevels.add(candidate.experienceLevel)

      // Departments and categories
      candidate.departmentScores.forEach((dept) => {
        options.departmentCategories.add(dept.category)
        options.departments.add(dept.department)
      })

      // Skills
      candidate.roleSkills.customerFacing.forEach((skill) => options.skills.add(skill.name))
      candidate.roleSkills.operational.forEach((skill) => options.skills.add(skill.name))
      candidate.roleSkills.administrative.forEach((skill) => options.skills.add(skill.name))

      // Languages
      candidate.languages.forEach((lang) => options.languages.add(lang.language))

      // Certifications
      candidate.certifications.forEach((cert) => options.certifications.add(cert.name))
    })

    return {
      departmentCategories: Array.from(options.departmentCategories).sort(),
      departments: Array.from(options.departments).sort(),
      experienceLevels: Array.from(options.experienceLevels),
      skills: Array.from(options.skills).sort(),
      languages: Array.from(options.languages).sort(),
      certifications: Array.from(options.certifications).sort(),
    }
  }, [candidates])

  const departmentsByCategory = useMemo(() => {
    const grouped: Record<string, string[]> = {}

    if (!candidates.length) return grouped

    candidates.forEach((candidate) => {
      candidate.departmentScores.forEach((dept) => {
        if (!grouped[dept.category]) {
          grouped[dept.category] = []
        }
        if (!grouped[dept.category].includes(dept.department)) {
          grouped[dept.category].push(dept.department)
        }
      })
    })

    // Sort departments within each category
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort()
    })

    return grouped
  }, [candidates])

  const skillsByCategory = {
    "Customer-Facing": ["Guest Communication", "Problem Resolution", "Service Excellence", "Multilingual Ability"],
    Operational: ["System Knowledge", "Process Efficiency", "Team Coordination", "Safety Compliance"],
    Administrative: ["Documentation", "Reporting", "Analysis", "Regulatory Compliance"],
  }

  const toggleDepartmentCategory = (category: string) => {
    if (activeFilters.departmentCategories.includes(category)) {
      setActiveFilters({
        ...activeFilters,
        departmentCategories: activeFilters.departmentCategories.filter((c) => c !== category),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        departmentCategories: [...activeFilters.departmentCategories, category],
      })
    }
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

  const toggleSkillCategory = (category: string) => {
    const categoryKey =
      category === "Customer-Facing" ? "customerFacing" : category === "Operational" ? "operational" : "administrative"

    if (activeFilters.skillCategories.includes(categoryKey)) {
      setActiveFilters({
        ...activeFilters,
        skillCategories: activeFilters.skillCategories.filter((c) => c !== categoryKey),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        skillCategories: [...activeFilters.skillCategories, categoryKey],
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

  const toggleLanguage = (language: string) => {
    if (activeFilters.languages.includes(language)) {
      setActiveFilters({
        ...activeFilters,
        languages: activeFilters.languages.filter((l) => l !== language),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        languages: [...activeFilters.languages, language],
      })
    }
  }

  const toggleCertification = (certification: string) => {
    if (activeFilters.certifications.includes(certification)) {
      setActiveFilters({
        ...activeFilters,
        certifications: activeFilters.certifications.filter((c) => c !== certification),
      })
    } else {
      setActiveFilters({
        ...activeFilters,
        certifications: [...activeFilters.certifications, certification],
      })
    }
  }

  const handleScoreChange = (value: number[]) => {
    setActiveFilters({
      ...activeFilters,
      minScore: value[0],
    })
  }

  const handleScoreComponentChange = (component: string, value: number[]) => {
    setActiveFilters({
      ...activeFilters,
      scoreComponents: {
        ...activeFilters.scoreComponents,
        [component]: value[0],
      },
    })
  }

  const saveSearch = () => {
    if (!searchName.trim()) return

    // Get existing saved searches from localStorage
    const savedSearches = JSON.parse(localStorage.getItem("savedSearches") || "[]")

    // Add new search
    savedSearches.push({
      name: searchName,
      timestamp: new Date().toISOString(),
      filters: activeFilters,
    })

    // Save back to localStorage
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches))

    // Close dialog and reset name
    setSaveDialogOpen(false)
    setSearchName("")
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Advanced Search</h3>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>Save your current search filters for future use.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input placeholder="Search name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSearch}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="multiple" defaultValue={["departments", "experience", "score"]}>
        {/* Department Filters */}
        <AccordionItem value="departments">
          <AccordionTrigger>Department Filters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Department Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {filterOptions.departmentCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={activeFilters.departmentCategories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDepartmentCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Specific Departments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(departmentsByCategory).map(([category, departments]) => (
                    <div key={category} className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-1">{category}</h5>
                      <div className="flex flex-wrap gap-1">
                        {departments.map((department) => (
                          <Badge
                            key={department}
                            variant={activeFilters.departments.includes(department) ? "secondary" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleDepartment(department)}
                          >
                            {department}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Experience Level Filters */}
        <AccordionItem value="experience">
          <AccordionTrigger>Experience Level</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {filterOptions.experienceLevels.map((level) => (
                <Badge
                  key={level}
                  variant={activeFilters.experienceLevels.includes(level) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleExperienceLevel(level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Skills Filters */}
        <AccordionItem value="skills">
          <AccordionTrigger>Skills</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Skill Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(skillsByCategory).map((category) => {
                    const categoryKey =
                      category === "Customer-Facing"
                        ? "customerFacing"
                        : category === "Operational"
                          ? "operational"
                          : "administrative"

                    return (
                      <Badge
                        key={category}
                        variant={activeFilters.skillCategories.includes(categoryKey) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkillCategory(category)}
                      >
                        {category}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Specific Skills</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category} className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-1">{category}</h5>
                      <div className="flex flex-wrap gap-1">
                        {skills
                          .filter((skill) => filterOptions.skills.includes(skill))
                          .map((skill) => (
                            <Badge
                              key={skill}
                              variant={activeFilters.skills.includes(skill) ? "secondary" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => toggleSkill(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Languages Filters */}
        <AccordionItem value="languages">
          <AccordionTrigger>Languages</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {filterOptions.languages.map((language) => (
                <Badge
                  key={language}
                  variant={activeFilters.languages.includes(language) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleLanguage(language)}
                >
                  {language}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Certifications Filters */}
        <AccordionItem value="certifications">
          <AccordionTrigger>Certifications</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {filterOptions.certifications.map((certification) => (
                <Badge
                  key={certification}
                  variant={activeFilters.certifications.includes(certification) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCertification(certification)}
                >
                  {certification}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Score Filters */}
        <AccordionItem value="score">
          <AccordionTrigger>Score Filters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-4">Minimum Overall Score: {activeFilters.minScore}%</h4>
                <Slider defaultValue={[activeFilters.minScore]} max={100} step={5} onValueChange={handleScoreChange} />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Score Components</h4>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Department Match</span>
                    <span>{activeFilters.scoreComponents.departmentMatch || 0}%</span>
                  </div>
                  <Slider
                    defaultValue={[activeFilters.scoreComponents.departmentMatch || 0]}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleScoreComponentChange("departmentMatch", value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Technical Qualification</span>
                    <span>{activeFilters.scoreComponents.technicalQualification || 0}%</span>
                  </div>
                  <Slider
                    defaultValue={[activeFilters.scoreComponents.technicalQualification || 0]}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleScoreComponentChange("technicalQualification", value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Experience Value</span>
                    <span>{activeFilters.scoreComponents.experienceValue || 0}%</span>
                  </div>
                  <Slider
                    defaultValue={[activeFilters.scoreComponents.experienceValue || 0]}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleScoreComponentChange("experienceValue", value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Language Proficiency</span>
                    <span>{activeFilters.scoreComponents.languageProficiency || 0}%</span>
                  </div>
                  <Slider
                    defaultValue={[activeFilters.scoreComponents.languageProficiency || 0]}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleScoreComponentChange("languageProficiency", value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Practical Factors</span>
                    <span>{activeFilters.scoreComponents.practicalFactors || 0}%</span>
                  </div>
                  <Slider
                    defaultValue={[activeFilters.scoreComponents.practicalFactors || 0]}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleScoreComponentChange("practicalFactors", value)}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Active Filters */}
      {(activeFilters.departments.length > 0 ||
        activeFilters.departmentCategories.length > 0 ||
        activeFilters.experienceLevels.length > 0 ||
        activeFilters.skills.length > 0 ||
        activeFilters.skillCategories.length > 0 ||
        activeFilters.languages.length > 0 ||
        activeFilters.certifications.length > 0 ||
        activeFilters.minScore > 0 ||
        Object.keys(activeFilters.scoreComponents).length > 0) && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.departmentCategories.map((category) => (
              <Badge key={category} variant="default" className="flex gap-1 items-center">
                Category: {category}
                <button
                  className="ml-1 hover:bg-red-500 rounded-full"
                  onClick={() => toggleDepartmentCategory(category)}
                >
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.departments.map((dept) => (
              <Badge key={dept} variant="secondary" className="flex gap-1 items-center">
                {dept}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleDepartment(dept)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.experienceLevels.map((level) => (
              <Badge key={level} variant="outline" className="flex gap-1 items-center">
                {level}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleExperienceLevel(level)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.skillCategories.map((category) => {
              const displayName =
                category === "customerFacing"
                  ? "Customer-Facing"
                  : category === "operational"
                    ? "Operational"
                    : "Administrative"

              return (
                <Badge key={category} variant="default" className="flex gap-1 items-center">
                  Skills: {displayName}
                  <button
                    className="ml-1 hover:bg-red-500 rounded-full"
                    onClick={() => toggleSkillCategory(displayName)}
                  >
                    ✕
                  </button>
                </Badge>
              )
            })}

            {activeFilters.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex gap-1 items-center">
                {skill}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleSkill(skill)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.languages.map((language) => (
              <Badge key={language} variant="outline" className="flex gap-1 items-center">
                {language}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleLanguage(language)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.certifications.map((cert) => (
              <Badge key={cert} variant="outline" className="flex gap-1 items-center">
                Cert: {cert}
                <button className="ml-1 hover:bg-red-500 rounded-full" onClick={() => toggleCertification(cert)}>
                  ✕
                </button>
              </Badge>
            ))}

            {activeFilters.minScore > 0 && (
              <Badge variant="default" className="flex gap-1 items-center">
                Min Score: {activeFilters.minScore}%
                <button
                  className="ml-1 hover:bg-red-500 rounded-full"
                  onClick={() => setActiveFilters({ ...activeFilters, minScore: 0 })}
                >
                  ✕
                </button>
              </Badge>
            )}

            {Object.entries(activeFilters.scoreComponents).map(([component, value]) => (
              <Badge key={component} variant="secondary" className="flex gap-1 items-center">
                {component.replace(/([A-Z])/g, " $1").trim()}: {value}%
                <button
                  className="ml-1 hover:bg-red-500 rounded-full"
                  onClick={() => {
                    const newComponents = { ...activeFilters.scoreComponents }
                    delete newComponents[component]
                    setActiveFilters({ ...activeFilters, scoreComponents: newComponents })
                  }}
                >
                  ✕
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

