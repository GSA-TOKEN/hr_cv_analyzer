import {
  type Tag,
  type TagCategory,
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
} from "@/types/tag-types"

// Convert a string to a tag-friendly format
export function formatTagValue(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")
}

// Create a tag ID from category, subcategory (optional), and value
export function createTagId(category: TagCategory, subcategory: string | undefined, value: string): string {
  if (subcategory) {
    return `${category}:${formatTagValue(subcategory)}:${formatTagValue(value)}`
  }
  return `${category}:${formatTagValue(value)}`
}

// Parse a tag ID into its components
export function parseTagId(tagId: string): { category: TagCategory; subcategory?: string; value: string } {
  const parts = tagId.split(":")
  if (parts.length === 3) {
    return {
      category: parts[0] as TagCategory,
      subcategory: parts[1],
      value: parts[2],
    }
  }
  return {
    category: parts[0] as TagCategory,
    value: parts[1],
  }
}

// Get a display name for a tag value
export function getTagDisplayName(value: string): string {
  return value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

// Create a Tag object from a tag ID
export function createTagFromId(tagId: string): Tag {
  const { category, subcategory, value } = parseTagId(tagId)
  return {
    id: tagId,
    category,
    subcategory,
    value,
    displayName: getTagDisplayName(value),
  }
}

// Generate all possible tags from our predefined hierarchies
export function generateAllPossibleTags(): Tag[] {
  const tags: Tag[] = []

  // Language tags
  languageOptions.forEach((language) => {
    const languageValue = formatTagValue(language)
    proficiencyLevels.forEach((level) => {
      const levelValue = formatTagValue(level)
      tags.push({
        id: createTagId("languages", "option", languageValue),
        category: "languages",
        subcategory: "option",
        value: languageValue,
        displayName: language,
      })
      tags.push({
        id: createTagId("languages", "proficiency", levelValue),
        category: "languages",
        subcategory: "proficiency",
        value: levelValue,
        displayName: level,
      })
    })
  })

  // Education tags
  educationLevels.forEach((level) => {
    const levelValue = formatTagValue(level)
    tags.push({
      id: createTagId("education", "level", levelValue),
      category: "education",
      subcategory: "level",
      value: levelValue,
      displayName: level,
    })
  })

  fieldRelevance.forEach((field) => {
    const fieldValue = formatTagValue(field)
    tags.push({
      id: createTagId("education", "field", fieldValue),
      category: "education",
      subcategory: "field",
      value: fieldValue,
      displayName: field,
    })
  })

  // Experience tags
  experienceDurations.forEach((duration) => {
    const durationValue = formatTagValue(duration)
    tags.push({
      id: createTagId("experience", "duration", durationValue),
      category: "experience",
      subcategory: "duration",
      value: durationValue,
      displayName: duration,
    })
  })

  establishmentTypes.forEach((type) => {
    const typeValue = formatTagValue(type)
    tags.push({
      id: createTagId("experience", "establishment", typeValue),
      category: "experience",
      subcategory: "establishment",
      value: typeValue,
      displayName: type,
    })
  })

  positionLevels.forEach((level) => {
    const levelValue = formatTagValue(level)
    tags.push({
      id: createTagId("experience", "position", levelValue),
      category: "experience",
      subcategory: "position",
      value: levelValue,
      displayName: level,
    })
  })

  // Technical skills tags
  Object.entries(technicalSkillCategories).forEach(([category, skills]) => {
    const categoryValue = formatTagValue(category)
    skills.forEach((skill) => {
      const skillValue = formatTagValue(skill)
      tags.push({
        id: createTagId("techskills", categoryValue, skillValue),
        category: "techskills",
        subcategory: categoryValue,
        value: skillValue,
        displayName: skill,
      })
    })
  })

  // Soft skills tags
  softSkills.forEach((skill) => {
    const skillValue = formatTagValue(skill)
    tags.push({
      id: createTagId("softskills", undefined, skillValue),
      category: "softskills",
      value: skillValue,
      displayName: skill,
    })
  })

  // Certification tags
  certifications.forEach((cert) => {
    const certValue = formatTagValue(cert)
    tags.push({
      id: createTagId("certifications", undefined, certValue),
      category: "certifications",
      value: certValue,
      displayName: cert,
    })
  })

  return tags
}

// Group tags by their parent categories
export function groupTagsByCategory(tags: Tag[]): Record<string, Record<string, Tag[]>> {
  return tags.reduce(
    (grouped, tag) => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = {}
      }

      const subcategory = tag.subcategory || "default"
      if (!grouped[tag.category][subcategory]) {
        grouped[tag.category][subcategory] = []
      }

      grouped[tag.category][subcategory].push(tag)
      return grouped
    },
    {} as Record<string, Record<string, Tag[]>>,
  )
}

// Filter candidates by tags
export function filterCandidatesByTags(candidates: any[], selectedTags: string[]): any[] {
  if (selectedTags.length === 0) return candidates

  // Group selected tags by category and subcategory
  const tagsByCategory: Record<string, Record<string, string[]>> = {}
  selectedTags.forEach((tag) => {
    const { category, subcategory } = parseTagId(tag)

    if (!tagsByCategory[category]) {
      tagsByCategory[category] = {}
    }

    const subcat = subcategory || "default"
    if (!tagsByCategory[category][subcat]) {
      tagsByCategory[category][subcat] = []
    }

    tagsByCategory[category][subcat].push(tag)
  })

  // Filter candidates that match all tag categories (AND between categories)
  // but match any tag within a subcategory (OR within subcategory)
  return candidates.filter((candidate) => {
    return Object.entries(tagsByCategory).every(([category, subcategories]) => {
      return Object.entries(subcategories).every(([subcategory, tags]) => {
        return tags.some((tag) => candidate.tags.includes(tag))
      })
    })
  })
}

