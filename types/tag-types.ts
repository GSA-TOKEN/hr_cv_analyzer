// Define the hierarchical tag structure types
export type TagCategory = "languages" | "education" | "experience" | "techskills" | "softskills" | "certifications"

// Languages categories
export type LanguageOption =
  | "English"
  | "Russian"
  | "German"
  | "Arabic"
  | "French"
  | "Spanish"
  | "Chinese"
  | "Ukrainian"
  | "Turkish"
  | "Dutch"
  | "Italian"
  | "Portuguese"
  | "Hebrew"
  | "Polish"
  | "Romanian"

export type ProficiencyLevel =
  | "Basic"
  | "Intermediate"
  | "Advanced"
  | "Fluent"
  | "Native"

export const languageOptions: LanguageOption[] = [
  "English",
  "Russian",
  "German",
  "Arabic",
  "French",
  "Spanish",
  "Chinese",
  "Ukrainian",
  "Turkish",
  "Dutch",
  "Italian",
  "Portuguese",
  "Hebrew",
  "Polish",
  "Romanian"
]

export const proficiencyLevels: ProficiencyLevel[] = [
  "Basic",
  "Intermediate",
  "Advanced",
  "Fluent",
  "Native"
]

// Education categories
export type EducationLevel =
  | "High School"
  | "Associate Degree"
  | "Bachelor's Degree"
  | "Master's Degree"
  | "PhD"
  | "Vocational Certificate"
  | "Professional Diploma"
  | "Industry Certification"

export type FieldRelevance =
  | "Hospitality Management"
  | "Tourism"
  | "Culinary Arts"
  | "Business Administration"
  | "Finance/Accounting"
  | "Engineering"
  | "IT/Computer Science"
  | "Recreation Management"
  | "Marketing/Communications"
  | "Human Resources"
  | "Health & Safety"
  | "Sports & Leisure"
  | "Environmental Management"
  | "Spa & Wellness"
  | "Landscape Architecture"

export const educationLevels: EducationLevel[] = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Vocational Certificate",
  "Professional Diploma",
  "Industry Certification"
]

export const fieldRelevance: FieldRelevance[] = [
  "Hospitality Management",
  "Tourism",
  "Culinary Arts",
  "Business Administration",
  "Finance/Accounting",
  "Engineering",
  "IT/Computer Science",
  "Recreation Management",
  "Marketing/Communications",
  "Human Resources",
  "Health & Safety",
  "Sports & Leisure",
  "Environmental Management",
  "Spa & Wellness",
  "Landscape Architecture"
]

// Experience categories
export type ExperienceDuration =
  | "No Experience"
  | "Less than 1 year"
  | "1-3 years"
  | "3-5 years"
  | "5-10 years"
  | "10+ years"

export type EstablishmentType =
  | "Luxury Resort"
  | "Business Hotel"
  | "Restaurant/Bar"
  | "Tour Operator"
  | "Cruise Line"
  | "Event Company"
  | "Corporate Office"
  | "Chain Hotel"
  | "Boutique Property"
  | "Casino"
  | "Golf Resort"
  | "Thermal/Wellness Resort"
  | "All-Inclusive Resort"
  | "Timeshare Property"

export type PositionLevel =
  | "Entry Level"
  | "Specialist"
  | "Supervisor"
  | "Manager"
  | "Department Head"
  | "Director"
  | "Executive"

export const experienceDurations: ExperienceDuration[] = [
  "No Experience",
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years"
]

export const establishmentTypes: EstablishmentType[] = [
  "Luxury Resort",
  "Business Hotel",
  "Restaurant/Bar",
  "Tour Operator",
  "Cruise Line",
  "Event Company",
  "Corporate Office",
  "Chain Hotel",
  "Boutique Property",
  "Casino",
  "Golf Resort",
  "Thermal/Wellness Resort",
  "All-Inclusive Resort",
  "Timeshare Property"
]

export const positionLevels: PositionLevel[] = [
  "Entry Level",
  "Specialist",
  "Supervisor",
  "Manager",
  "Department Head",
  "Director",
  "Executive"
]

// Technical Skills categories
export type TechnicalSkillCategory =
  | "Front Office / Reservation / CRM & Call Center"
  | "Housekeeping / Laundry / Flower Center"
  | "F&B / Kitchen / Dishroom"
  | "Finance / Accounting / Purchasing"
  | "IT / Technical Service"
  | "Entertainment / Kids Club / SPA"
  | "HR / Quality"
  | "Marketing / Sales"
  | "Grounds (Garden/Greenkeeping)"

export const technicalSkillCategories: Record<TechnicalSkillCategory, string[]> = {
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
}

// Soft Skills
export const softSkills = [
  "Guest Communication",
  "Problem Resolution",
  "Team Leadership",
  "Conflict Management",
  "Time Management",
  "Attention to Detail",
  "Cultural Sensitivity",
  "Adaptability",
  "Work Under Pressure",
  "Emotional Intelligence",
  "Decision Making",
  "Initiative",
  "Creativity",
  "Strategic Thinking",
  "Negotiation",
  "Active Listening",
  "Crisis Management",
  "Delegation",
  "Coaching/Mentoring",
  "Multitasking",
] as const

// Certifications
export const certifications = [
  "Food Safety (HACCP, ServSafe)",
  "First Aid/CPR",
  "Lifeguard Certification",
  "Fire Safety",
  "Security Certification",
  "Spa/Wellness Certifications",
  "Sommelier/Beverage Certifications",
  "Revenue Management",
  "Environmental Management",
  "Health & Safety (NEBOSH, IOSH)",
  "Project Management (PMP, PRINCE2)",
  "IT Certifications (ITIL, Microsoft, Cisco)",
  "Guest Service Gold",
  "Financial Certifications (CPA, ACCA)",
  "Hospitality Management Certification",
  "Training Certification",
  "Pool Operations",
  "Fitness Instruction",
  "Language Certifications (TOEFL, IELTS)",
  "Eco-Certification (Green Globe, Travelife)",
] as const

export type Tag = {
  id: string // Format: "category:subcategory:value" (e.g., "languages:option:english")
  category: TagCategory
  subcategory?: string
  value: string
  displayName: string
}

// Scoring components
export type ScoreComponents = {
  departmentMatch: number // 0-100
  technicalQualification: number // 0-100
  experienceValue: number // 0-100
  languageProficiency: number // 0-100
  practicalFactors: number // 0-100
}

