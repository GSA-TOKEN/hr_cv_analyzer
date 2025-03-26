export type DepartmentCategory =
  | "Guest Services"
  | "Accommodation Services"
  | "Food & Beverage"
  | "Business Operations"
  | "Facilities Management"

export type ExperienceLevel = "Entry Level (0-2 years)" | "Mid-Level (2-5 years)" | "Senior (5+ years)" | "Management"

export type RoleSkillCategory = "customerFacing" | "operational" | "administrative"

export interface Skill {
  name: string
  level: number // 1-5
}

export interface RoleSkills {
  customerFacing: Skill[]
  operational: Skill[]
  administrative: Skill[]
}

export interface Language {
  language: string
  level: number // 1-5
}

export interface Certification {
  name: string
  issuer: string
  expiryDate?: string
}

export interface PersonalAttributes {
  availability: string
  accommodationNeeds: string
  salaryExpectation: string
  noticePeriod: string
}

export interface DepartmentScore {
  category: DepartmentCategory
  department: string
  score: number // 0-100
}

export interface PositionMatch {
  title: string
  department: string
  matchScore: number // 0-100
}

export interface ScoreComponents {
  departmentMatch: number // 0-100
  technicalQualification: number // 0-100
  experienceValue: number // 0-100
  languageProficiency: number // 0-100
  practicalFactors: number // 0-100
}

export interface Demographics {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthdate: string
}

export interface CVAnalysisResult {
  candidateName: string
  age: number
  experienceLevel: ExperienceLevel
  primaryDepartment: string
  overallScore: number // 0-100
  scoreComponents: ScoreComponents
  departmentScores: DepartmentScore[]
  roleSkills: RoleSkills
  languages: Language[]
  certifications: Certification[]
  personalAttributes: PersonalAttributes
  recommendedPositions: PositionMatch[]
  tags: string[]
  demographics?: Demographics
}

export interface Candidate extends CVAnalysisResult {
  id: string
  dateAnalyzed: string
  cvUrl: string
}

export interface SearchFilters {
  departments?: string[]
  departmentCategories?: string[]
  experienceLevels?: string[]
  skills?: string[]
  skillCategories?: string[]
  languages?: string[]
  certifications?: string[]
  minScore?: number
  scoreComponents?: Record<string, number>
  ageRanges?: string[]
}

export interface SearchParams {
  query?: string
  filters?: SearchFilters
  page?: number
  limit?: number
}

