import type { CVAnalysisResult, ExperienceLevel, DepartmentCategory, DepartmentScore } from "@/types/cv-types"
import { extractTextFromDocument } from "./document-parser"

// This is a placeholder for the actual implementation
// In a real application, this would integrate with the chosen NLP/AI services
export async function analyzeCV(file: File): Promise<CVAnalysisResult> {
  try {
    // Extract text from the CV
    const text = await extractTextFromDocument(file)

    // Generate a random age between 18-50 for mock data
    const age = Math.floor(Math.random() * (50 - 18) + 18)

    // Determine age range tag
    let ageRangeTag = ''
    if (age < 18) {
      ageRangeTag = '18- Years'
    } else if (age <= 22) {
      ageRangeTag = '18-22 Years'
    } else if (age <= 28) {
      ageRangeTag = '23-28 Years'
    } else if (age <= 35) {
      ageRangeTag = '29-35 Years'
    } else if (age <= 45) {
      ageRangeTag = '36-45 Years'
    } else {
      ageRangeTag = '46+ Years'
    }

    // Extract demographic information
    const extractedDemographics = extractDemographicInfo(text, file.name)

    // Extract candidate name from filename or first line of text
    const candidateName = extractedDemographics.name || extractCandidateName(file.name, text)

    // Get structured demographic data
    const { firstName, lastName, email, phone, birthdate } = extractedDemographics

    // Generate analysis based on content of the CV
    return {
      candidateName,
      age,
      experienceLevel: determineExperienceLevel(text),
      primaryDepartment: determineDepartment(text),
      overallScore: Math.floor(65 + Math.random() * 30), // Random score between 65-95
      scoreComponents: {
        departmentMatch: Math.floor(60 + Math.random() * 35),
        technicalQualification: Math.floor(60 + Math.random() * 35),
        experienceValue: Math.floor(60 + Math.random() * 35),
        languageProficiency: Math.floor(60 + Math.random() * 35),
        practicalFactors: Math.floor(60 + Math.random() * 35),
      },
      departmentScores: generateDepartmentScores(),
      roleSkills: generateRoleSkills(),
      languages: detectLanguages(text),
      certifications: detectCertifications(text),
      personalAttributes: {
        availability: ["Immediate", "2 weeks", "1 month"][Math.floor(Math.random() * 3)],
        accommodationNeeds: ["Staff Housing Required", "No accommodation needed"][Math.floor(Math.random() * 2)],
        salaryExpectation: `$${2 + Math.floor(Math.random() * 4)},${Math.floor(Math.random() * 10)}00 - $${3 + Math.floor(Math.random() * 4)},${Math.floor(Math.random() * 10)}00/month`,
        noticePeriod: ["1 week", "2 weeks", "1 month"][Math.floor(Math.random() * 3)],
      },
      recommendedPositions: generateRecommendedPositions(determineDepartment(text)),
      tags: generateTags(text, age, ageRangeTag),
      // Add demographic information to the result
      demographics: {
        firstName,
        lastName,
        email,
        phone,
        birthdate,
      }
    }
  } catch (error) {
    console.error("Error analyzing CV:", error)
    throw new Error("Failed to analyze CV")
  }
}

function extractDemographicInfo(text: string, filename: string) {
  const lines = text.trim().split('\n')
  const textLower = text.toLowerCase()

  // Initialize with default values
  let result = {
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
  }

  // Try to extract full name from the first line of text
  if (lines.length > 0 && lines[0].trim()) {
    const firstLine = lines[0].trim()
    // Check if it looks like a name (not too long, no special characters)
    if (firstLine.length < 40 && /^[A-Za-z\s.'-]+$/.test(firstLine)) {
      result.name = firstLine

      // Try to extract first and last name
      const nameParts = firstLine.trim().split(/\s+/)
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0]
        result.lastName = nameParts[nameParts.length - 1]
      } else if (nameParts.length === 1) {
        result.firstName = nameParts[0]
      }
    }
  }

  // If we couldn't extract from the first line, try from filename
  if (!result.name) {
    const nameFromFile = filename.replace(/\.(pdf|docx|doc)$/i, '').replace(/[_-]/g, ' ')
    result.name = nameFromFile.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    // Try to extract first and last name from filename
    const nameParts = nameFromFile.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
      result.lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].slice(1).toLowerCase()
    } else if (nameParts.length === 1) {
      result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
    }
  }

  // Extract email using regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const emailMatches = text.match(emailRegex)
  if (emailMatches && emailMatches.length > 0) {
    result.email = emailMatches[0]
  }

  // Extract phone number using regex
  // This matches various phone formats like (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
  const phoneMatches = text.match(phoneRegex)
  if (phoneMatches && phoneMatches.length > 0) {
    result.phone = phoneMatches[0]
  }

  // Try to extract birthdate or date of birth
  // Look for common date patterns after birthdate-related keywords
  const birthDateKeywords = ['date of birth', 'birth date', 'birthdate', 'born on', 'dob']
  const dateRegex = /\b\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi

  // First check if there's a birth date keyword with a date nearby
  for (const keyword of birthDateKeywords) {
    if (textLower.includes(keyword)) {
      // Find the index of the keyword
      const keywordIndex = textLower.indexOf(keyword)
      // Check the text around the keyword for a date
      const textAroundKeyword = text.substring(keywordIndex, keywordIndex + 50)
      const dateMatches = textAroundKeyword.match(dateRegex)
      if (dateMatches && dateMatches.length > 0) {
        result.birthdate = dateMatches[0]
        break
      }
    }
  }

  // If we still don't have a birthdate, look for any date pattern in the top part of the resume
  // (where personal information is usually located)
  if (!result.birthdate) {
    const topPortion = text.substring(0, Math.min(500, text.length))
    const dateMatches = topPortion.match(dateRegex)
    if (dateMatches && dateMatches.length > 0) {
      // Only use the first date if it appears to be a birthdate (not too recent)
      const currentYear = new Date().getFullYear()
      const potentialDate = dateMatches[0]

      // Try to extract year from the date
      const yearMatch = potentialDate.match(/\b(19\d{2}|20[0-1]\d)\b/)
      if (yearMatch && yearMatch.length > 0) {
        const year = parseInt(yearMatch[0])
        // If year is at least 18 years ago, it might be a birthdate
        if (year <= currentYear - 18) {
          result.birthdate = potentialDate
        }
      }
    }
  }

  return result
}

function extractCandidateName(filename: string, text: string): string {
  // Try to get name from first line of text (usually CV header)
  const lines = text.trim().split('\n')
  if (lines.length > 0 && lines[0].trim()) {
    const firstLine = lines[0].trim()
    // Check if it looks like a name (not too long, no special characters)
    if (firstLine.length < 40 && /^[A-Za-z\s.'-]+$/.test(firstLine)) {
      return firstLine
    }
  }

  // Fallback to filename
  const nameFromFile = filename.replace(/\.(pdf|docx|doc)$/i, '').replace(/[_-]/g, ' ')
  return nameFromFile.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function determineExperienceLevel(text: string): ExperienceLevel {
  const textLower = text.toLowerCase()

  // Look for experience keywords
  if (textLower.includes('senior') ||
    textLower.includes('director') ||
    textLower.includes('head of') ||
    (textLower.includes('manager') && (
      textLower.includes('7 years') ||
      textLower.includes('8 years') ||
      textLower.includes('9 years') ||
      textLower.includes('10 years')
    ))) {
    return 'Senior (5+ years)' as ExperienceLevel
  }

  if (textLower.includes('supervisor') ||
    textLower.includes('team lead') ||
    textLower.includes('3 years') ||
    textLower.includes('4 years') ||
    textLower.includes('5 years')) {
    return 'Mid-Level (2-5 years)' as ExperienceLevel
  }

  return 'Entry Level (0-2 years)' as ExperienceLevel
}

function determineDepartment(text: string): string {
  const textLower = text.toLowerCase()

  // Check for department keywords
  if (textLower.includes('front desk') || textLower.includes('reception') || textLower.includes('front office')) {
    return 'Front Office'
  }

  if (textLower.includes('chef') || textLower.includes('kitchen') || textLower.includes('cook')) {
    return 'Kitchen'
  }

  if (textLower.includes('housekeeping') || textLower.includes('cleaner') || textLower.includes('room attendant')) {
    return 'Housekeeping'
  }

  if (textLower.includes('server') || textLower.includes('waiter') || textLower.includes('waitress') || textLower.includes('restaurant') || textLower.includes('f&b')) {
    return 'F&B Service'
  }

  if (textLower.includes('concierge') || textLower.includes('guest relations')) {
    return 'Guest Relations'
  }

  // Default to a common department
  return 'Guest Services'
}

function generateDepartmentScores(): DepartmentScore[] {
  const departments = [
    'Front Office',
    'Guest Relations',
    'Reservation',
    'CRM & Call Center',
    'Housekeeping',
    'F&B Service',
    'Kitchen',
    'Human Resources',
    'Marketing'
  ]

  // Pick 3-5 random departments
  const count = 3 + Math.floor(Math.random() * 3)
  const selectedDepts: DepartmentScore[] = []

  for (let i = 0; i < count; i++) {
    const randIndex = Math.floor(Math.random() * departments.length)
    const dept = departments[randIndex]
    // Remove to avoid duplicates
    departments.splice(randIndex, 1)

    if (dept === 'Front Office' || dept === 'Guest Relations' || dept === 'Reservation' || dept === 'CRM & Call Center') {
      selectedDepts.push({
        category: 'Guest Services' as DepartmentCategory,
        department: dept,
        score: 65 + Math.floor(Math.random() * 30)
      })
    } else if (dept === 'Housekeeping') {
      selectedDepts.push({
        category: 'Accommodation Services' as DepartmentCategory,
        department: dept,
        score: 65 + Math.floor(Math.random() * 30)
      })
    } else if (dept === 'F&B Service' || dept === 'Kitchen') {
      selectedDepts.push({
        category: 'Food & Beverage' as DepartmentCategory,
        department: dept,
        score: 65 + Math.floor(Math.random() * 30)
      })
    } else {
      selectedDepts.push({
        category: 'Business Operations' as DepartmentCategory,
        department: dept,
        score: 65 + Math.floor(Math.random() * 30)
      })
    }
  }

  // Sort by score descending
  return selectedDepts.sort((a, b) => b.score - a.score)
}

function generateRoleSkills() {
  const customerFacingSkills = [
    'Guest Communication',
    'Problem Resolution',
    'Cultural Awareness',
    'Service Excellence',
    'Upselling',
    'Complaint Handling'
  ]

  const operationalSkills = [
    'Opera PMS',
    'Booking Systems',
    'Payment Processing',
    'Inventory Management',
    'Team Leadership',
    'Menu Knowledge',
    'Food Safety',
    'Cleaning Procedures'
  ]

  const administrativeSkills = [
    'Reporting',
    'Documentation',
    'Budgeting',
    'Staff Scheduling',
    'Process Improvement',
    'Quality Control'
  ]

  // Create random sets of skills
  return {
    customerFacing: selectRandomSkills(customerFacingSkills, 2, 4),
    operational: selectRandomSkills(operationalSkills, 2, 3),
    administrative: selectRandomSkills(administrativeSkills, 1, 3)
  }
}

function selectRandomSkills(skillsList: string[], min: number, max: number) {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const result = []

  // Make a copy so we don't modify the original
  const skills = [...skillsList]

  for (let i = 0; i < count && skills.length > 0; i++) {
    const index = Math.floor(Math.random() * skills.length)
    result.push({
      name: skills[index],
      level: 3 + Math.floor(Math.random() * 3) // Level 3-5
    })
    skills.splice(index, 1)
  }

  return result
}

function detectLanguages(text: string) {
  const result = []
  const textLower = text.toLowerCase()

  // Always include English
  result.push({ language: 'English', level: 4 + Math.floor(Math.random() * 2) })

  // Check for other languages
  if (textLower.includes('spanish') || textLower.includes('español')) {
    result.push({ language: 'Spanish', level: 2 + Math.floor(Math.random() * 4) })
  }

  if (textLower.includes('french') || textLower.includes('français')) {
    result.push({ language: 'French', level: 2 + Math.floor(Math.random() * 4) })
  }

  if (textLower.includes('german') || textLower.includes('deutsch')) {
    result.push({ language: 'German', level: 2 + Math.floor(Math.random() * 4) })
  }

  if (textLower.includes('mandarin') || textLower.includes('chinese')) {
    result.push({ language: 'Mandarin', level: 2 + Math.floor(Math.random() * 4) })
  }

  if (textLower.includes('arabic')) {
    result.push({ language: 'Arabic', level: 2 + Math.floor(Math.random() * 4) })
  }

  return result
}

function detectCertifications(text: string) {
  const result = []
  const textLower = text.toLowerCase()

  if (textLower.includes('certified') || textLower.includes('certificate') || textLower.includes('certification')) {
    // Add 1-3 certifications based on detected keywords
    if (textLower.includes('food') || textLower.includes('safety') || textLower.includes('haccp')) {
      result.push({
        name: 'Food Safety Certification',
        issuer: 'National Restaurant Association',
        expiryDate: randomFutureDate()
      })
    }

    if (textLower.includes('hospitality') || textLower.includes('hotel')) {
      result.push({
        name: 'Hospitality Management Certificate',
        issuer: 'American Hotel & Lodging Educational Institute'
      })
    }

    if (textLower.includes('first aid') || textLower.includes('cpr')) {
      result.push({
        name: 'First Aid/CPR Certification',
        issuer: 'Red Cross',
        expiryDate: randomFutureDate()
      })
    }

    if (textLower.includes('opera') || textLower.includes('pms')) {
      result.push({
        name: 'Opera PMS Certification',
        issuer: 'Oracle Hospitality'
      })
    }
  }

  // If no certifications were found but randomness suggests adding one
  if (result.length === 0 && Math.random() > 0.5) {
    result.push({
      name: 'Customer Service Excellence',
      issuer: 'International Customer Service Association'
    })
  }

  return result
}

function randomFutureDate() {
  const today = new Date()
  const futureYear = today.getFullYear() + Math.floor(Math.random() * 3) + 1
  const futureMonth = Math.floor(Math.random() * 12) + 1
  const futureDay = Math.floor(Math.random() * 28) + 1

  return `${futureYear}-${futureMonth.toString().padStart(2, '0')}-${futureDay.toString().padStart(2, '0')}`
}

function generateRecommendedPositions(department: string) {
  const result = []

  if (department === 'Front Office') {
    result.push({ title: 'Front Office Supervisor', department: 'Front Office', matchScore: 85 + Math.floor(Math.random() * 10) })
    result.push({ title: 'Guest Relations Manager', department: 'Guest Relations', matchScore: 75 + Math.floor(Math.random() * 15) })
    result.push({ title: 'Reservations Team Lead', department: 'Reservation', matchScore: 70 + Math.floor(Math.random() * 15) })
  } else if (department === 'F&B Service') {
    result.push({ title: 'Restaurant Supervisor', department: 'F&B Service', matchScore: 85 + Math.floor(Math.random() * 10) })
    result.push({ title: 'F&B Manager', department: 'F&B Service', matchScore: 70 + Math.floor(Math.random() * 15) })
    result.push({ title: 'Banquet Team Lead', department: 'F&B Service', matchScore: 65 + Math.floor(Math.random() * 15) })
  } else if (department === 'Kitchen') {
    result.push({ title: 'Sous Chef', department: 'Kitchen', matchScore: 85 + Math.floor(Math.random() * 10) })
    result.push({ title: 'Chef de Partie', department: 'Kitchen', matchScore: 75 + Math.floor(Math.random() * 15) })
    result.push({ title: 'Kitchen Supervisor', department: 'Kitchen', matchScore: 70 + Math.floor(Math.random() * 15) })
  } else if (department === 'Housekeeping') {
    result.push({ title: 'Housekeeping Supervisor', department: 'Housekeeping', matchScore: 85 + Math.floor(Math.random() * 10) })
    result.push({ title: 'Laundry Manager', department: 'Laundry', matchScore: 70 + Math.floor(Math.random() * 15) })
    result.push({ title: 'Rooms Division Assistant', department: 'Housekeeping', matchScore: 65 + Math.floor(Math.random() * 15) })
  } else {
    result.push({ title: `${department} Supervisor`, department, matchScore: 85 + Math.floor(Math.random() * 10) })
    result.push({ title: `${department} Team Lead`, department, matchScore: 75 + Math.floor(Math.random() * 15) })
    result.push({ title: `${department} Specialist`, department, matchScore: 70 + Math.floor(Math.random() * 15) })
  }

  return result
}

function generateTags(text: string, age: number, ageRangeTag: string) {
  const textLower = text.toLowerCase()
  const tags = []

  // Department tag based on detected department
  const department = determineDepartment(text).toLowerCase().replace(/\s+/g, '-')
  tags.push(`dept:${department}`)

  // Experience level
  const experience = determineExperienceLevel(text)
  if (experience.includes('Senior')) {
    tags.push('exp:senior')
    if (textLower.includes('manager')) tags.push('exp:manager')
    if (textLower.includes('director')) tags.push('exp:director')
  } else if (experience.includes('Mid-Level')) {
    tags.push('exp:mid-level')
    if (textLower.includes('supervisor')) tags.push('exp:supervisor')
  } else {
    tags.push('exp:entry-level')
  }

  // Age tags
  tags.push(`age:${age}`)
  tags.push(`age:${ageRangeTag.toLowerCase().replace(/\s+/g, '-').replace(/[\/&]/g, '-')}`)

  // Language tags
  if (textLower.includes('english')) {
    if (textLower.includes('native english') || textLower.includes('mother tongue')) {
      tags.push('lang:english-native')
    } else if (textLower.includes('fluent')) {
      tags.push('lang:english-fluent')
    } else {
      tags.push('lang:english-advanced')
    }
  } else {
    tags.push('lang:english-intermediate') // Default
  }

  if (textLower.includes('spanish')) tags.push('lang:spanish-intermediate')
  if (textLower.includes('french')) tags.push('lang:french-basic')

  // Education tags
  if (textLower.includes('master')) {
    tags.push('education:masters-degree')
  } else if (textLower.includes('bachelor') || textLower.includes('university') || textLower.includes('college')) {
    tags.push('education:bachelors-degree')
  } else if (textLower.includes('associate') || textLower.includes('diploma')) {
    tags.push('education:associate-degree')
  } else {
    tags.push('education:high-school')
  }

  // Skill tags
  if (department === 'front-office') {
    tags.push('technical-skill:front-office:guest-check-in')
    tags.push('technical-skill:front-office:reservation-management')
  } else if (department === 'f&b-service') {
    tags.push('technical-skill:fb-kitchen:food-service')
    tags.push('technical-skill:fb-kitchen:beverage-service')
  } else if (department === 'kitchen') {
    tags.push('technical-skill:fb-kitchen:food-preparation')
    tags.push('technical-skill:fb-kitchen:menu-planning')
  } else if (department === 'housekeeping') {
    tags.push('technical-skill:housekeeping:room-inspection')
    tags.push('technical-skill:housekeeping:inventory-management')
  }

  // Soft skills
  tags.push('soft-skill:communication')
  if (textLower.includes('team')) tags.push('soft-skill:teamwork')
  if (textLower.includes('detail')) tags.push('soft-skill:attention-to-detail')
  if (textLower.includes('solve') || textLower.includes('problem')) tags.push('soft-skill:problem-solving')

  return tags
}

