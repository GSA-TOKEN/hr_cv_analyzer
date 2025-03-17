import type { Candidate, SearchParams, CVAnalysisResult } from "@/types/cv-types"
import { analyzeCV } from "./cv-analyzer"

// Mock function to simulate API calls to the backend
export async function fetchCandidates(params: SearchParams): Promise<Candidate[]> {
  // In a real implementation, this would make an API call to your backend
  // which would query the database for candidates matching the search criteria

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock data for demonstration
  return [
    {
      id: "c1",
      candidateName: "Maria Rodriguez",
      experienceLevel: "Mid-Level (2-5 years)",
      primaryDepartment: "Front Office",
      overallScore: 82,
      dateAnalyzed: "2023-11-15",
      cvUrl: "/cvs/maria-rodriguez.pdf",
      scoreComponents: {
        departmentMatch: 85,
        technicalQualification: 78,
        experienceValue: 80,
        languageProficiency: 90,
        practicalFactors: 75,
      },
      departmentScores: [
        { category: "Guest Services", department: "Front Office", score: 92 },
        { category: "Guest Services", department: "Guest Relations", score: 88 },
        { category: "Guest Services", department: "Reservation", score: 85 },
        { category: "Guest Services", department: "CRM & Call Center", score: 75 },
        { category: "Guest Services", department: "SPA", score: 40 },
        { category: "Guest Services", department: "Kids Club", score: 30 },
        { category: "Accommodation Services", department: "Housekeeping", score: 55 },
        { category: "Accommodation Services", department: "Laundry", score: 35 },
        { category: "Food & Beverage", department: "F&B Service", score: 65 },
        { category: "Food & Beverage", department: "Kitchen", score: 25 },
        { category: "Business Operations", department: "Human Resources", score: 45 },
        { category: "Business Operations", department: "Marketing", score: 60 },
        { category: "Facilities Management", department: "Information Technology", score: 30 },
      ],
      roleSkills: {
        customerFacing: [
          { name: "Guest Communication", level: 5 },
          { name: "Problem Resolution", level: 4 },
          { name: "Service Excellence", level: 5 },
          { name: "Upselling", level: 3 },
        ],
        operational: [
          { name: "Opera PMS", level: 5 },
          { name: "Reservation Systems", level: 4 },
          { name: "Payment Processing", level: 4 },
          { name: "Check-in/Check-out", level: 5 },
        ],
        administrative: [
          { name: "Reporting", level: 3 },
          { name: "Documentation", level: 4 },
          { name: "Inventory Management", level: 2 },
        ],
      },
      languages: [
        { language: "English", level: 5 },
        { language: "Spanish", level: 5 },
        { language: "French", level: 3 },
        { language: "German", level: 2 },
      ],
      certifications: [
        {
          name: "Certified Hospitality Professional",
          issuer: "American Hotel & Lodging Educational Institute",
          expiryDate: "2025-06-15",
        },
        {
          name: "Customer Service Excellence",
          issuer: "International Customer Service Association",
        },
        {
          name: "Opera PMS Certification",
          issuer: "Oracle Hospitality",
        },
      ],
      personalAttributes: {
        availability: "Immediate",
        accommodationNeeds: "Staff Housing Required",
        salaryExpectation: "$3,500 - $4,000/month",
        noticePeriod: "2 weeks",
      },
      recommendedPositions: [
        { title: "Front Office Supervisor", department: "Front Office", matchScore: 92 },
        { title: "Guest Relations Manager", department: "Guest Relations", matchScore: 85 },
        { title: "Reservations Team Lead", department: "Reservation", matchScore: 82 },
        { title: "CRM Specialist", department: "CRM & Call Center", matchScore: 75 },
      ],
      tags: [
        "dept:front-office",
        "dept:guest-relations",
        "skill:opera-pms",
        "skill:multilingual",
        "skill:guest-communication",
        "skill:problem-resolution",
        "cert:hospitality-professional",
        "cert:opera-pms",
        "exp:mid-level",
        "exp:supervisor",
        "lang:english-native",
        "lang:spanish-native",
        "lang:french-intermediate",
      ],
    },
    {
      id: "c2",
      candidateName: "John Smith",
      experienceLevel: "Senior (5+ years)",
      primaryDepartment: "F&B Service",
      overallScore: 75,
      dateAnalyzed: "2023-11-10",
      cvUrl: "/cvs/john-smith.pdf",
      scoreComponents: {
        departmentMatch: 88,
        technicalQualification: 82,
        experienceValue: 90,
        languageProficiency: 65,
        practicalFactors: 60,
      },
      departmentScores: [
        { category: "Guest Services", department: "Front Office", score: 45 },
        { category: "Guest Services", department: "Guest Relations", score: 60 },
        { category: "Food & Beverage", department: "F&B Service", score: 95 },
        { category: "Food & Beverage", department: "Kitchen", score: 75 },
        { category: "Business Operations", department: "Human Resources", score: 30 },
      ],
      roleSkills: {
        customerFacing: [
          { name: "Guest Communication", level: 4 },
          { name: "Problem Resolution", level: 4 },
          { name: "Service Excellence", level: 5 },
        ],
        operational: [
          { name: "Inventory Management", level: 5 },
          { name: "Team Coordination", level: 5 },
          { name: "Menu Development", level: 4 },
        ],
        administrative: [
          { name: "Reporting", level: 4 },
          { name: "Budgeting", level: 3 },
        ],
      },
      languages: [
        { language: "English", level: 5 },
        { language: "French", level: 3 },
      ],
      certifications: [
        {
          name: "Food & Beverage Management",
          issuer: "Culinary Institute of America",
        },
        {
          name: "ServSafe Manager",
          issuer: "National Restaurant Association",
          expiryDate: "2024-08-22",
        },
      ],
      personalAttributes: {
        availability: "30 days notice",
        accommodationNeeds: "No accommodation needed",
        salaryExpectation: "$5,000 - $6,000/month",
        noticePeriod: "1 month",
      },
      recommendedPositions: [
        { title: "F&B Manager", department: "F&B Service", matchScore: 95 },
        { title: "Restaurant Manager", department: "F&B Service", matchScore: 90 },
        { title: "Banquet Manager", department: "F&B Service", matchScore: 85 },
      ],
      tags: [
        "dept:f&b-service",
        "dept:kitchen",
        "skill:team-management",
        "skill:inventory",
        "skill:menu-development",
        "cert:servsafe",
        "exp:senior",
        "exp:manager",
        "lang:english-native",
        "lang:french-intermediate",
      ],
    },
    {
      id: "c3",
      candidateName: "Sophia Chen",
      experienceLevel: "Entry Level (0-2 years)",
      primaryDepartment: "Housekeeping",
      overallScore: 68,
      dateAnalyzed: "2023-11-05",
      cvUrl: "/cvs/sophia-chen.pdf",
      scoreComponents: {
        departmentMatch: 75,
        technicalQualification: 60,
        experienceValue: 55,
        languageProficiency: 85,
        practicalFactors: 80,
      },
      departmentScores: [
        { category: "Accommodation Services", department: "Housekeeping", score: 85 },
        { category: "Accommodation Services", department: "Laundry", score: 75 },
        { category: "Guest Services", department: "SPA", score: 65 },
        { category: "Guest Services", department: "Front Office", score: 40 },
      ],
      roleSkills: {
        customerFacing: [
          { name: "Guest Communication", level: 3 },
          { name: "Service Excellence", level: 4 },
        ],
        operational: [
          { name: "Cleaning Standards", level: 4 },
          { name: "Inventory Management", level: 3 },
          { name: "Safety Procedures", level: 4 },
        ],
        administrative: [
          { name: "Documentation", level: 3 },
          { name: "Reporting", level: 2 },
        ],
      },
      languages: [
        { language: "English", level: 4 },
        { language: "Mandarin", level: 5 },
        { language: "Cantonese", level: 5 },
      ],
      certifications: [
        {
          name: "Hospitality Operations Certificate",
          issuer: "Community College of Hong Kong",
        },
      ],
      personalAttributes: {
        availability: "Immediate",
        accommodationNeeds: "Staff Housing Required",
        salaryExpectation: "$2,000 - $2,500/month",
        noticePeriod: "1 week",
      },
      recommendedPositions: [
        { title: "Housekeeping Attendant", department: "Housekeeping", matchScore: 85 },
        { title: "Laundry Attendant", department: "Laundry", matchScore: 75 },
        { title: "Spa Attendant", department: "SPA", matchScore: 65 },
      ],
      tags: [
        "dept:housekeeping",
        "dept:laundry",
        "skill:cleaning-standards",
        "skill:safety-procedures",
        "exp:entry-level",
        "lang:mandarin-native",
        "lang:cantonese-native",
        "lang:english-advanced",
      ],
    },
  ]
}

export async function uploadAndAnalyzeCV(file: File): Promise<CVAnalysisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Call the CV analyzer
  const analysisResult = await analyzeCV(file)

  return analysisResult
}

