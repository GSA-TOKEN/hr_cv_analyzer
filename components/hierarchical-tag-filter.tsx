"use client"

import { useState } from "react"
import { Check, ChevronDown, ChevronRight, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  certifications
} from "@/types/tag-types"

interface HierarchicalTagFilterProps {
  candidates: Candidate[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  onClearTags: () => void
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

export default function HierarchicalTagFilter({
  candidates,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onClearTags,
}: HierarchicalTagFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    languages: true,
    education: false,
    experience: false,
    techskills: false,
    softskills: false,
    certifications: false,
  })

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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const getTagDisplayName = (tag: string) => {
    const parts = tag.split(":")
    const value = parts[parts.length - 1]
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
      default:
        return "outline"
    }
  }

  return (
    <div className="bg-white rounded-lg border p-4 h-[calc(100vh-180px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filter by Tags</h2>
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

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Selected Tags</h3>
        <div className="flex flex-wrap gap-1 mb-2 min-h-10">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="default" className="px-3 py-1 text-xs flex items-center">
              {getTagDisplayName(tag)}
              <button
                className="ml-1"
                onClick={() => onTagRemove(tag)}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {selectedTags.length === 0 && (
            <p className="text-sm text-muted-foreground">No tags selected</p>
          )}
        </div>
      </div>

      <Separator className="my-2" />

      <ScrollArea className="flex-1">
        {/* Languages Category */}
        <Collapsible
          open={expandedCategories.languages}
          onOpenChange={() => toggleCategory("languages")}
          className="w-full mb-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-2 font-medium"
            >
              Languages
              {expandedCategories.languages ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-1">
            {Object.entries(languageTagsBySubcategory).map(
              ([subcategory, tags]) =>
                tags.length > 0 && (
                  <div key={subcategory} className="mb-2">
                    <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                      {subcategory}
                    </h4>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {tags.map((tag) => {
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
                            onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
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
          </CollapsibleContent>
        </Collapsible>

        {/* Education Category */}
        <Collapsible
          open={expandedCategories.education}
          onOpenChange={() => toggleCategory("education")}
          className="w-full mb-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-2 font-medium"
            >
              Education
              {expandedCategories.education ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-1">
            {Object.entries(educationTagsBySubcategory).map(
              ([subcategory, tags]) =>
                tags.length > 0 && (
                  <div key={subcategory} className="mb-2">
                    <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                      {subcategory}
                    </h4>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {tags.map((tag) => {
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
                            onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
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
          </CollapsibleContent>
        </Collapsible>

        {/* Experience Category */}
        <Collapsible
          open={expandedCategories.experience}
          onOpenChange={() => toggleCategory("experience")}
          className="w-full mb-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-2 font-medium"
            >
              Experience
              {expandedCategories.experience ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-1">
            {Object.entries(experienceTagsBySubcategory).map(
              ([subcategory, tags]) =>
                tags.length > 0 && (
                  <div key={subcategory} className="mb-2">
                    <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                      {subcategory}
                    </h4>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {tags.map((tag) => {
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
                            onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
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
          </CollapsibleContent>
        </Collapsible>

        {/* Technical Skills Category */}
        <Collapsible
          open={expandedCategories.techskills}
          onOpenChange={() => toggleCategory("techskills")}
          className="w-full mb-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-2 font-medium"
            >
              Technical Skills
              {expandedCategories.techskills ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-1">
            {techSkillsTags.map(
              ({ category, tags }) =>
                tags.length > 0 && (
                  <div key={category} className="mb-2">
                    <h4 className="text-sm font-medium ml-2 text-gray-500 mb-1">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {tags.map((tag) => {
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
                            onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
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
          </CollapsibleContent>
        </Collapsible>

        {/* Soft Skills Category */}
        <Collapsible
          open={expandedCategories.softskills}
          onOpenChange={() => toggleCategory("softskills")}
          className="w-full mb-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-2 font-medium"
            >
              Soft Skills
              {expandedCategories.softskills ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-1">
            <div className="flex flex-wrap gap-1 ml-2">
              {softSkillsTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    // @ts-ignore - Our component supports these variants
                    variant={getTagVariant(tag, isSelected)}
                    className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                      }`}
                    onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
                  >
                    {isSelected && <Check size={12} className="mr-1" />}
                    {getTagDisplayName(tag)}
                  </Badge>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Certifications Category */}
        <Collapsible
          open={expandedCategories.certifications}
          onOpenChange={() => toggleCategory("certifications")}
          className="w-full mb-2"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-2 font-medium"
            >
              Certifications
              {expandedCategories.certifications ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 pt-1">
            <div className="flex flex-wrap gap-1 ml-2">
              {certificationsTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    // @ts-ignore - Our component supports these variants
                    variant={getTagVariant(tag, isSelected)}
                    className={`cursor-pointer px-2 py-1 text-xs ${isSelected ? "border-primary" : ""
                      }`}
                    onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
                  >
                    {isSelected && <Check size={12} className="mr-1" />}
                    {getTagDisplayName(tag)}
                  </Badge>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </ScrollArea>
    </div>
  )
}

