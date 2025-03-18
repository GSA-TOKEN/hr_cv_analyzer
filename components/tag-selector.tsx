"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Candidate } from "@/types/cv-types"
import {
  languageOptions,
  proficiencyLevels,
  educationLevels,
  fieldRelevance,
  experienceDurations,
  establishmentTypes,
  positionLevels,
  technicalSkillCategories,
  softSkills,
  certifications,
  ageRanges,
  LanguageOption,
  ProficiencyLevel,
  EducationLevel,
  FieldRelevance,
  ExperienceDuration,
  EstablishmentType,
  PositionLevel,
  AgeRange
} from "@/types/tag-types"

interface TagSelectorProps {
  candidates: Candidate[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  onClearTags: () => void
}

// Language categories
const languages: Record<string, string[]> = {
  "Language Options": languageOptions,
  "Proficiency Levels": proficiencyLevels
}

// Education categories
const education: Record<string, string[]> = {
  "Education Level": educationLevels,
  "Field Relevance": fieldRelevance
}

// Experience categories
const experience: Record<string, string[]> = {
  "Duration": experienceDurations,
  "Establishment Type": establishmentTypes,
  "Position Level": positionLevels
}

// Age categories
const age: Record<string, string[]> = {
  "Age Range": ageRanges
}

// Define custom badge variant type that includes our new variants
type ExtendedBadgeVariant =
  | "default"
  | "outline"
  | "secondary"
  | "destructive"
  | "accent"
  | "neutral"
  | "warning"

export default function TagSelector({
  candidates,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onClearTags,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Extract all unique tags from candidates
  const allTags = candidates.reduce((tags, candidate) => {
    candidate.tags.forEach((tag) => tags.add(tag))
    return tags
  }, new Set<string>())

  // Group tags by their prefix (languages:, education:, etc.)
  const tagsByCategory = Array.from(allTags).reduce(
    (grouped, tag) => {
      const [category] = tag.split(":")
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(tag)
      return grouped
    },
    {} as Record<string, string[]>,
  )

  // Further organize tags by their subcategory
  const languageTagsBySubcategory: Record<string, string[]> = {
    "Language Options": Array.from(allTags)
      .filter(tag => tag.startsWith("languages:option:"))
      .sort(),
    "Proficiency Levels": Array.from(allTags)
      .filter(tag => tag.startsWith("languages:proficiency:"))
      .sort()
  }

  const educationTagsBySubcategory: Record<string, string[]> = {
    "Education Level": Array.from(allTags)
      .filter(tag => tag.startsWith("education:level:"))
      .sort(),
    "Field Relevance": Array.from(allTags)
      .filter(tag => tag.startsWith("education:field:"))
      .sort()
  }

  const experienceTagsBySubcategory: Record<string, string[]> = {
    "Duration": Array.from(allTags)
      .filter(tag => tag.startsWith("experience:duration:"))
      .sort(),
    "Establishment Type": Array.from(allTags)
      .filter(tag => tag.startsWith("experience:establishment:"))
      .sort(),
    "Position Level": Array.from(allTags)
      .filter(tag => tag.startsWith("experience:position:"))
      .sort()
  }

  const techSkillsTags = Object.entries(technicalSkillCategories).map(([category]) => {
    const formattedCategory = category.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")
    return {
      category,
      tags: Array.from(allTags)
        .filter(tag => tag.startsWith(`techskills:${formattedCategory}:`))
        .sort()
    }
  })

  const softSkillsTags = Array.from(allTags)
    .filter(tag => tag.startsWith("softskills:"))
    .sort()

  const certificationsTags = Array.from(allTags)
    .filter(tag => tag.startsWith("certifications:"))
    .sort()

  const ageTags = Array.from(allTags)
    .filter(tag => tag.startsWith("age:"))
    .sort()

  // Create predefined age tags, so they show up even if no candidates have them yet
  const predefinedAgeTags = ageRanges.map(range => {
    const rangeValue = range.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")
    return `age:${rangeValue}`
  })

  // Combine with any existing age tags
  const combinedAgeTags = [...new Set([...ageTags, ...predefinedAgeTags])].sort()

  // Make sure the age tags explicitly exist in the tag list for searching
  useEffect(() => {
    predefinedAgeTags.forEach(tag => {
      if (!allTags.has(tag)) {
        allTags.add(tag)
      }
    })
  }, [])

  const filterTagsByQuery = (tags: string[]) => {
    if (!searchQuery) return tags
    return tags.filter(
      (tag) => {
        const displayName = getTagDisplayName(tag)
        return displayName.toLowerCase().includes(searchQuery.toLowerCase())
      }
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getTagDisplayName = (tag: string) => {
    const parts = tag.split(":")
    const category = parts[0]
    const value = parts[parts.length - 1]

    // Special case for age tags - simplify to just the range numbers
    if (category === "age") {
      if (value === "18-years") return "18-"
      if (value === "18-22-years") return "18-22"
      if (value === "23-28-years") return "23-28"
      if (value === "29-35-years") return "29-35"
      if (value === "36-45-years") return "36-45"
      if (value === "46-years") return "46+"
    }

    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "languages":
        return "Languages"
      case "education":
        return "Education"
      case "experience":
        return "Experience"
      case "techskills":
        return "Technical Skills"
      case "softskills":
        return "Soft Skills"
      case "certifications":
        return "Certifications"
      case "age":
        return "Age"
      default:
        return category
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
    }
  }

  const getTagVariant = (tag: string, isSelected: boolean): ExtendedBadgeVariant => {
    if (isSelected) return "default"

    const [category] = tag.split(":")
    switch (category) {
      case "languages":
        return "outline"
      case "education":
        return "secondary"
      case "experience":
        return "destructive"
      case "techskills":
        return "accent"
      case "softskills":
        return "neutral"
      case "certifications":
        return "warning"
      case "age":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="default" className="px-3 py-1 text-sm">
            {getTagDisplayName(tag)}
            <button
              className="ml-2 text-xs"
              onClick={() => onTagRemove(tag)}
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={onClearTags}
          >
            Clear All
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedTags.length
          ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
          : "Select Tags"}
        <ChevronDown size={16} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-lg border">
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>

          <ScrollArea className="h-96 p-2">
            {/* Languages Category */}
            {(!searchQuery || tagsByCategory["languages"]?.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Languages</h3>
                {Object.entries(languageTagsBySubcategory).map(
                  ([subcategory, tags]) =>
                    tags.length > 0 && (
                      <div key={subcategory} className="mb-2">
                        <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                          {subcategory}
                        </h4>
                        <div className="flex flex-wrap gap-1 ml-4">
                          {filterTagsByQuery(tags).map((tag) => {
                            const isSelected = selectedTags.includes(tag)
                            return (
                              <Badge
                                key={tag}
                                // @ts-ignore - Our component supports these variants
                                variant={getTagVariant(
                                  tag,
                                  isSelected,
                                )}
                                className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                                  }`}
                                onClick={() => onTagSelect(tag)}
                              >
                                {isSelected && (
                                  <Check size={12} className="mr-1" />
                                )}
                                {getTagDisplayName(tag)}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ),
                )}
                <Separator className="my-2" />
              </div>
            )}

            {/* Age Category */}
            {(!searchQuery ||
              combinedAgeTags.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase())) ||
              "age".includes(searchQuery.toLowerCase())) && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Age</h3>
                  <div className="flex flex-wrap gap-1 ml-4">
                    {/* Always show age tags when age category is visible */}
                    {(!searchQuery ? combinedAgeTags :
                      combinedAgeTags.filter(tag =>
                        getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase())
                      ).length > 0 ?
                        combinedAgeTags.filter(tag =>
                          getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase())
                        ) :
                        combinedAgeTags).map((tag) => {
                          const isSelected = selectedTags.includes(tag)
                          return (
                            <Badge
                              key={tag}
                              // @ts-ignore - Our component supports these variants
                              variant={getTagVariant(tag, isSelected)}
                              className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""}`}
                              onClick={() => onTagSelect(tag)}
                            >
                              {isSelected && <Check size={12} className="mr-1" />}
                              {getTagDisplayName(tag)}
                            </Badge>
                          )
                        })}
                  </div>
                  <Separator className="my-2" />
                </div>
              )}

            {/* Education Category */}
            {(!searchQuery || tagsByCategory["education"]?.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Education</h3>
                {Object.entries(educationTagsBySubcategory).map(
                  ([subcategory, tags]) =>
                    tags.length > 0 && (
                      <div key={subcategory} className="mb-2">
                        <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                          {subcategory}
                        </h4>
                        <div className="flex flex-wrap gap-1 ml-4">
                          {filterTagsByQuery(tags).map((tag) => {
                            const isSelected = selectedTags.includes(tag)
                            return (
                              <Badge
                                key={tag}
                                // @ts-ignore - Our component supports these variants
                                variant={getTagVariant(
                                  tag,
                                  isSelected,
                                )}
                                className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                                  }`}
                                onClick={() => onTagSelect(tag)}
                              >
                                {isSelected && (
                                  <Check size={12} className="mr-1" />
                                )}
                                {getTagDisplayName(tag)}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ),
                )}
                <Separator className="my-2" />
              </div>
            )}

            {/* Experience Category */}
            {(!searchQuery || tagsByCategory["experience"]?.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Experience</h3>
                {Object.entries(experienceTagsBySubcategory).map(
                  ([subcategory, tags]) =>
                    tags.length > 0 && (
                      <div key={subcategory} className="mb-2">
                        <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                          {subcategory}
                        </h4>
                        <div className="flex flex-wrap gap-1 ml-4">
                          {filterTagsByQuery(tags).map((tag) => {
                            const isSelected = selectedTags.includes(tag)
                            return (
                              <Badge
                                key={tag}
                                // @ts-ignore - Our component supports these variants
                                variant={getTagVariant(
                                  tag,
                                  isSelected,
                                )}
                                className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                                  }`}
                                onClick={() => onTagSelect(tag)}
                              >
                                {isSelected && (
                                  <Check size={12} className="mr-1" />
                                )}
                                {getTagDisplayName(tag)}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ),
                )}
                <Separator className="my-2" />
              </div>
            )}

            {/* Technical Skills Category */}
            {(!searchQuery || tagsByCategory["techskills"]?.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Technical Skills</h3>
                {techSkillsTags.map(
                  ({ category, tags }) =>
                    tags.length > 0 && (
                      <div key={category} className="mb-2">
                        <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-1 ml-4">
                          {filterTagsByQuery(tags).map((tag) => {
                            const isSelected = selectedTags.includes(tag)
                            return (
                              <Badge
                                key={tag}
                                // @ts-ignore - Our component supports these variants
                                variant={getTagVariant(
                                  tag,
                                  isSelected,
                                )}
                                className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                                  }`}
                                onClick={() => onTagSelect(tag)}
                              >
                                {isSelected && (
                                  <Check size={12} className="mr-1" />
                                )}
                                {getTagDisplayName(tag)}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ),
                )}
                <Separator className="my-2" />
              </div>
            )}

            {/* Soft Skills Category */}
            {(!searchQuery || tagsByCategory["softskills"]?.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Soft Skills</h3>
                <div className="flex flex-wrap gap-1 ml-4">
                  {filterTagsByQuery(softSkillsTags).map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <Badge
                        key={tag}
                        // @ts-ignore - Our component supports these variants
                        variant={getTagVariant(tag, isSelected)}
                        className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                          }`}
                        onClick={() => onTagSelect(tag)}
                      >
                        {isSelected && <Check size={12} className="mr-1" />}
                        {getTagDisplayName(tag)}
                      </Badge>
                    )
                  })}
                </div>
                <Separator className="my-2" />
              </div>
            )}

            {/* Certifications Category */}
            {(!searchQuery || tagsByCategory["certifications"]?.some(tag => getTagDisplayName(tag).toLowerCase().includes(searchQuery.toLowerCase()))) && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-1 ml-4">
                  {filterTagsByQuery(certificationsTags).map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <Badge
                        key={tag}
                        // @ts-ignore - Our component supports these variants
                        variant={getTagVariant(tag, isSelected)}
                        className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                          }`}
                        onClick={() => onTagSelect(tag)}
                      >
                        {isSelected && <Check size={12} className="mr-1" />}
                        {getTagDisplayName(tag)}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

