import type { Candidate, SearchParams, CVAnalysisResult } from "@/types/cv-types"
import { analyzeCV } from "./cv-analyzer"

// Function to fetch actual analyzed CVs from the backend
export async function fetchCandidates(params: SearchParams): Promise<Candidate[]> {
  try {
    // In a real implementation, this would make an API call to your backend
    // which would query the database for candidates matching the search criteria
    const response = await fetch('/api/mock-cvs')

    if (!response.ok) {
      throw new Error('Failed to fetch candidates')
    }

    const data = await response.json()

    // Transform mock CV data into Candidate format
    return data.cvs.map((cv: any) => ({
      id: cv.id,
      candidateName: cv.filename.replace(/\.(pdf|docx|doc)$/, '').replace(/_/g, ' '),
      experienceLevel: getExperienceLevelFromTags(cv.tags),
      primaryDepartment: getPrimaryDepartmentFromTags(cv.tags),
      overallScore: calculateOverallScore(cv.tags),
      dateAnalyzed: cv.uploadDate,
      cvUrl: `/api/cv-files/${cv.fileId}`,
      age: cv.age || 0,
      tags: cv.tags || [],
      // Additional properties with default/empty values
      scoreComponents: {
        departmentMatch: 0,
        technicalQualification: 0,
        experienceValue: 0,
        languageProficiency: 0,
        practicalFactors: 0,
      },
      departmentScores: [],
      roleSkills: {
        customerFacing: [],
        operational: [],
        administrative: [],
      },
      languages: [],
      certifications: [],
      personalAttributes: {
        availability: "",
        accommodationNeeds: "",
        salaryExpectation: "",
        noticePeriod: "",
      },
      recommendedPositions: [],
    }))
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return []
  }
}

// Helper functions to extract information from tags
function getExperienceLevelFromTags(tags: string[]): string {
  const expTag = tags.find(tag => tag.startsWith('experience:'))
  if (!expTag) return 'Unknown'

  if (expTag.includes('no-experience') || expTag.includes('less-than-1-year')) {
    return 'Entry Level (0-2 years)'
  } else if (expTag.includes('1-3-years')) {
    return 'Entry Level (0-2 years)'
  } else if (expTag.includes('3-5-years')) {
    return 'Mid-Level (2-5 years)'
  } else if (expTag.includes('5-10-years')) {
    return 'Senior (5+ years)'
  } else if (expTag.includes('10+-years')) {
    return 'Senior (5+ years)'
  }

  return 'Unknown'
}

function getPrimaryDepartmentFromTags(tags: string[]): string {
  // Look for department tags
  const deptTags = tags.filter(tag => tag.startsWith('dept:') || tag.startsWith('field:'))

  if (deptTags.length === 0) {
    // Look for technical skill tags as fallback
    const skillTags = tags.filter(tag => tag.startsWith('technical-skill:'))
    if (skillTags.length > 0) {
      const firstSkill = skillTags[0].split(':')[1]
      if (firstSkill) return firstSkill.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    return 'Not Specified'
  }

  // Use the first department tag
  const deptName = deptTags[0].split(':')[1]
  if (!deptName) return 'Not Specified'

  return deptName.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function calculateOverallScore(tags: string[]): number {
  // Simple scoring algorithm based on number and types of tags
  const languageTags = tags.filter(tag => tag.startsWith('language:')).length
  const skillTags = tags.filter(tag => tag.startsWith('technical-skill:') || tag.startsWith('soft-skill:')).length
  const educationTags = tags.filter(tag => tag.startsWith('education:')).length
  const certTags = tags.filter(tag => tag.startsWith('cert:')).length

  // Base score: 60-85
  let score = 60 + Math.floor(Math.random() * 25)

  // Add points for various qualifications
  score += languageTags * 2 // More languages = better score
  score += skillTags * 1.5  // More skills = better score
  score += educationTags * 3 // Higher education = better score
  score += certTags * 2     // More certifications = better score

  // Cap at 100
  return Math.min(Math.round(score), 100)
}

export async function uploadAndAnalyzeCV(file: File): Promise<CVAnalysisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Call the CV analyzer
  const analysisResult = await analyzeCV(file)

  return analysisResult
}

