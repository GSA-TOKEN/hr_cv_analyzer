"use client"

import { useState, useEffect, useRef } from "react"
import type { Candidate } from "@/types/cv-types"
import { getTagDisplayName } from "@/lib/tag-utils"
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

interface HierarchicalTagSelectorProps {
  candidates: Candidate[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  onClearTags: () => void
}

// Define the tag hierarchy structure with proper types
type TagItems = string[];
type SubcategoryItems = Record<string, TagItems>;

interface TagHierarchy {
  "Languages": {
    "Language Options": TagItems;
    "Proficiency Levels": TagItems;
  };
  "Education": {
    "Education Level": TagItems;
    "Field Relevance": TagItems;
  };
  "Experience": {
    "Duration": TagItems;
    "Establishment Type": TagItems;
    "Position Level": TagItems;
  };
  "Technical Skills": Record<string, TagItems>;
  "Soft Skills": TagItems;
  "Certifications": TagItems;
}

const tagHierarchy: TagHierarchy = {
  "Languages": {
    "Language Options": languageOptions,
    "Proficiency Levels": proficiencyLevels
  },
  "Education": {
    "Education Level": educationLevels,
    "Field Relevance": fieldRelevance
  },
  "Experience": {
    "Duration": experienceDurations,
    "Establishment Type": establishmentTypes,
    "Position Level": positionLevels
  },
  "Technical Skills": {
    "Front Office / Reservation / CRM & Call Center": [
      "PMS Systems (Opera, Protel, etc.)",
      "Booking Engines (Booking.com, Expedia, etc.)",
      "Payment Processing Systems",
      "CRM Software",
      "Call Center Technologies",
      "Upselling Techniques",
      "Channel Management",
      "Yield Management",
      "Guest Loyalty Programs",
      "Check-in/Check-out Procedures",
      "Foreign Exchange Handling",
      "Complaint Management",
    ],
    "Housekeeping / Laundry / Flower Center": [
      "Inventory Management",
      "Chemical Handling",
      "Quality Control",
      "Industrial Equipment Operation",
      "Room Inspection",
      "Sustainability Practices",
      "Linen Management",
      "Deep Cleaning Protocols",
      "Floral Arrangement",
      "Decorative Displays",
      "Amenity Setup",
      "VIP Room Preparation",
    ],
    "F&B / Kitchen / Dishroom": [
      "Food Safety Certification",
      "Culinary Techniques",
      "Menu Planning",
      "Cost Control",
      "POS Systems",
      "Specialty Cuisine Knowledge",
      "Beverage Service",
      "Banquet Operations",
      "Buffet Management",
      "À La Carte Service",
      "Restaurant Reservation Systems",
      "Allergen Management",
      "Wine Knowledge",
      "Cocktail Preparation",
    ],
    "Finance / Accounting / Purchasing": [
      "Accounting Software",
      "Budgeting",
      "Financial Analysis",
      "Procurement Systems",
      "Vendor Management",
      "Audit Procedures",
      "Tax Compliance",
      "Payroll Processing",
      "Cost Allocation",
      "Asset Management",
      "Financial Reporting",
      "Inventory Valuation",
      "Contract Negotiation",
      "Expense Tracking",
    ],
    "IT / Technical Service": [
      "Network Administration",
      "System Maintenance",
      "Software Development",
      "Database Management",
      "Audio/Visual Equipment",
      "IoT Solutions",
      "CCTV Systems",
      "Key Card Systems",
      "Energy Management Systems",
      "Telecommunications",
      "Technical Support",
      "IT Security",
      "Smart Room Technology",
      "Preventive Maintenance",
    ],
    "Entertainment / Kids Club / SPA": [
      "Activity Planning",
      "Performance Skills",
      "Child Safety",
      "Treatment Protocols",
      "Equipment Operation",
      "Booking Management",
      "Theme Events",
      "Stage Production",
      "Music/DJ Skills",
      "Sports Instruction",
      "Animation Programs",
      "Massage Techniques",
      "Beauty Treatments",
      "Fitness Instruction",
    ],
    "HR / Quality": [
      "Recruitment Tools",
      "Training & Development",
      "Performance Management",
      "Quality Assurance Systems",
      "Audit Experience",
      "Compliance Knowledge",
      "Employee Relations",
      "Labor Law",
      "Benefits Administration",
      "Onboarding Processes",
      "Talent Management",
      "Diversity & Inclusion",
      "HRIS Systems",
      "Guest Satisfaction Measurement",
    ],
    "Marketing / Sales": [
      "CRM Systems",
      "Digital Marketing Tools",
      "Content Creation",
      "Analytics",
      "Contract Negotiation",
      "Revenue Management",
      "Social Media Management",
      "Email Marketing",
      "SEO/SEM Knowledge",
      "Brand Management",
      "Corporate Sales",
      "MICE Sales",
      "Loyalty Programs",
      "Public Relations",
    ],
    "Grounds (Garden/Greenkeeping)": [
      "Landscape Design",
      "Equipment Operation",
      "Irrigation Systems",
      "Plant Knowledge",
      "Sustainability Practices",
      "Pest Management",
      "Turf Management",
      "Seasonal Planning",
      "Water Conservation",
      "Ornamental Care",
      "Tree Maintenance",
      "Chemical Application",
      "Beach Maintenance",
      "Pool Area Management",
    ],
  },
  "Soft Skills": Array.from(softSkills) as TagItems,
  "Certifications": Array.from(certifications) as TagItems
}

export default function HierarchicalTagSelector({
  candidates,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onClearTags,
}: HierarchicalTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, Record<string, boolean>>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize the expanded state for each category and subcategory
    const initialExpandedCategories: Record<string, boolean> = {}
    const initialExpandedSubcategories: Record<string, Record<string, boolean>> = {}

    Object.keys(tagHierarchy).forEach((category) => {
      initialExpandedCategories[category] = category === "Languages" // Only expand Languages by default
      initialExpandedSubcategories[category] = {}

      if (typeof tagHierarchy[category as keyof TagHierarchy] === "object" && !Array.isArray(tagHierarchy[category as keyof TagHierarchy])) {
        Object.keys(tagHierarchy[category as keyof TagHierarchy] as Record<string, any>).forEach((subcategory) => {
          initialExpandedSubcategories[category][subcategory] = false
        })
      }
    })

    setExpandedCategories(initialExpandedCategories)
    setExpandedSubcategories(initialExpandedSubcategories)

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const createTagIdFromHierarchy = (category: keyof TagHierarchy, subcategory: string, value: string): string => {
    const categoryMap: Record<keyof TagHierarchy, string> = {
      "Languages": "languages",
      "Education": "education",
      "Experience": "experience",
      "Technical Skills": "techskills",
      "Soft Skills": "softskills",
      "Certifications": "certifications"
    }

    const subcategoryMap: Record<string, string> = {
      "Language Options": "option",
      "Proficiency Levels": "proficiency",
      "Education Level": "level",
      "Field Relevance": "field",
      "Duration": "duration",
      "Establishment Type": "establishment",
      "Position Level": "position"
    }

    const formattedCategory = categoryMap[category]
    const formattedValue = value.toLowerCase().replace(/\s+/g, "-").replace(/[\/&(),.]/g, "-")

    if (category === "Technical Skills") {
      const formattedSubcategory = subcategory.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")
      return `${formattedCategory}:${formattedSubcategory}:${formattedValue}`
    } else if (category === "Soft Skills" || category === "Certifications") {
      return `${formattedCategory}:${formattedValue}`
    } else {
      const formattedSubcategory = subcategoryMap[subcategory] || subcategory.toLowerCase().replace(/\s+/g, "-")
      return `${formattedCategory}:${formattedSubcategory}:${formattedValue}`
    }
  }

  const getAllTags = () => {
    const allTags: Record<string, string[]> = {}

    Object.entries(tagHierarchy).forEach(([category, subcategories]) => {
      allTags[category] = []

      if (Array.isArray(subcategories)) {
        // This is a simple array of tags (like Soft Skills or Certifications)
        subcategories.forEach((value: string) => {
          const tagId = createTagIdFromHierarchy(category as keyof TagHierarchy, "", value)
          allTags[category].push(tagId)
        })
      } else {
        // This is an object with subcategories
        Object.entries(subcategories).forEach(([subcategory, values]) => {
          (values as string[]).forEach((value: string) => {
            const tagId = createTagIdFromHierarchy(category as keyof TagHierarchy, subcategory, value)
            allTags[category].push(tagId)
          })
        })
      }
    })

    return allTags
  }

  const allTagIds = getAllTags()

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    setSearchTerm("")
  }

  const toggleCategory = (category: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const toggleSubcategory = (mainCategory: string, subcategory: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedSubcategories((prev) => ({
      ...prev,
      [mainCategory]: {
        ...prev[mainCategory],
        [subcategory]: !prev[mainCategory]?.[subcategory],
      },
    }))
  }

  const handleTagSelect = (tagId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (selectedTags.includes(tagId)) {
      onTagRemove(tagId)
    } else {
      onTagSelect(tagId)
    }
  }

  const renderTag = (tag: string, category: keyof TagHierarchy, subcategory: string) => {
    const tagId = createTagIdFromHierarchy(category, subcategory, tag)
    const isSelected = selectedTags.includes(tagId)

    if (searchTerm && !tag.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null
    }

    return (
      <div
        key={tagId}
        className={`px-3 py-1 rounded-full text-xs ${isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          } cursor-pointer flex items-center gap-1 mb-1 mr-1 whitespace-nowrap`}
        onClick={(e) => handleTagSelect(tagId, e)}
      >
        <span>{tag}</span>
        {isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    )
  }

  const renderSubcategory = (mainCategory: keyof TagHierarchy, subcategory: string, tags: string[]) => {
    const isExpanded = expandedSubcategories[mainCategory]?.[subcategory]

    if (searchTerm && !tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !subcategory.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null
    }

    return (
      <div key={`${mainCategory}-${subcategory}`} className="ml-4 mb-2">
        <div
          className="flex items-center cursor-pointer py-1"
          onClick={(e) => toggleSubcategory(mainCategory as string, subcategory, e)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mr-1 transition-transform ${isExpanded ? "transform rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-sm font-medium">{subcategory}</span>
        </div>
        {isExpanded && (
          <div className="flex flex-wrap ml-6 mt-1">
            {tags.map((tag: string) => renderTag(tag, mainCategory, subcategory))}
          </div>
        )}
      </div>
    )
  }

  const renderCategory = (category: keyof TagHierarchy) => {
    const isExpanded = expandedCategories[category as string]
    const categoryContent = tagHierarchy[category]

    // Skip rendering if no match with search term
    if (searchTerm) {
      let hasMatch = false

      if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
        hasMatch = true
      } else if (Array.isArray(categoryContent)) {
        hasMatch = categoryContent.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      } else {
        hasMatch = Object.entries(categoryContent).some(([subcategory, tags]) => {
          return subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tags as string[]).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        })
      }

      if (!hasMatch) return null
    }

    return (
      <div key={category} className="mb-3">
        <div
          className="flex items-center cursor-pointer p-2 hover:bg-gray-100 rounded"
          onClick={(e) => toggleCategory(category as string, e)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mr-2 transition-transform ${isExpanded ? "transform rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="font-medium">{category}</span>
        </div>

        {isExpanded && (
          <div className="mt-1">
            {Array.isArray(categoryContent) ? (
              // Simple array of tags (Soft Skills, Certifications)
              <div className="flex flex-wrap ml-10 mt-2">
                {categoryContent.map((tag) => renderTag(tag, category, ""))}
              </div>
            ) : (
              // Object with subcategories
              Object.entries(categoryContent).map(([subcategory, tags]) =>
                renderSubcategory(category, subcategory, tags)
              )
            )}
          </div>
        )}
      </div>
    )
  }

  const renderSearchResults = () => {
    if (!searchTerm) return null

    const results: JSX.Element[] = []

    Object.entries(tagHierarchy).forEach(([category, content]) => {
      if (Array.isArray(content)) {
        // Handle categories with direct tags (Soft Skills, Certifications)
        content
          .filter((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          .forEach((tag) => {
            const tagId = createTagIdFromHierarchy(category as keyof TagHierarchy, "", tag)
            const isSelected = selectedTags.includes(tagId)
            results.push(
              <div
                key={tagId}
                className={`px-3 py-1 rounded-full text-xs ${isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  } cursor-pointer flex items-center gap-1 mb-1 mr-1`}
                onClick={() => handleTagSelect(tagId)}
              >
                <span>{category} &gt; {tag}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            )
          })
      } else {
        // Handle categories with subcategories
        Object.entries(content).forEach(([subcategory, tags]) => {
          tags
            .filter((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            .forEach((tag) => {
              const tagId = createTagIdFromHierarchy(category as keyof TagHierarchy, subcategory, tag)
              const isSelected = selectedTags.includes(tagId)
              results.push(
                <div
                  key={tagId}
                  className={`px-3 py-1 rounded-full text-xs ${isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    } cursor-pointer flex items-center gap-1 mb-1 mr-1`}
                  onClick={() => handleTagSelect(tagId)}
                >
                  <span>{category} &gt; {subcategory} &gt; {tag}</span>
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              )
            })
        })
      }
    })

    return results.length > 0 ? (
      <div className="p-2">
        <h3 className="font-medium mb-2">Search Results</h3>
        <div className="flex flex-wrap">{results}</div>
      </div>
    ) : (
      <div className="p-2 text-gray-500">No results found.</div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="rounded-md border border-input overflow-hidden">
        <div
          className="min-h-10 px-3 py-2 flex flex-wrap gap-1 cursor-pointer"
          onClick={toggleDropdown}
        >
          {selectedTags.length > 0 ? (
            selectedTags.map((tagId) => (
              <div
                key={tagId}
                className="bg-primary text-primary-foreground text-xs rounded-full px-3 py-1 flex items-center"
              >
                <span>{getTagDisplayName(tagId)}</span>
                <button
                  className="ml-1 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTagRemove(tagId)
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">Select tags...</div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-[70vh] bg-white rounded-md border shadow-lg overflow-auto">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search tags..."
              className="w-full p-2 rounded border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {searchTerm ? (
            renderSearchResults()
          ) : (
            <div className="p-2">
              {selectedTags.length > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Selected Tags</h3>
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={onClearTags}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap">
                    {selectedTags.map((tagId) => (
                      <div
                        key={tagId}
                        className="bg-primary text-primary-foreground text-xs rounded-full px-3 py-1 flex items-center mr-1 mb-1"
                      >
                        <span>{getTagDisplayName(tagId)}</span>
                        <button
                          className="ml-1 focus:outline-none"
                          onClick={() => onTagRemove(tagId)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="my-2 border-t pt-2">
                <h3 className="font-medium mb-2">All Tags</h3>
                {Object.keys(tagHierarchy).map((category) =>
                  renderCategory(category as keyof TagHierarchy)
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}