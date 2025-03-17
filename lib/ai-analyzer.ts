import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { CVAnalysisResult } from "@/types/cv-types"

// This file demonstrates how you would implement the AI-powered analysis
// using the AI SDK with OpenAI

export async function analyzeWithAI(cvText: string): Promise<CVAnalysisResult> {
  // Define the system prompt with the tagging and scoring criteria
  const systemPrompt = `
    You are an expert HR analyst for the hospitality industry, specializing in resort operations.
    Analyze the provided CV text and extract relevant information according to these categories:

    1. Department Categories:
       - Guest Services (Front Office, Guest Relations, Reservation, CRM & Call Center, SPA, Kids Club, Entertainment, Lifeguard)
       - Accommodation Services (Housekeeping, Laundry, Flower Center)
       - Food & Beverage (Kitchen, Dishroom, F&B Service)
       - Business Operations (Accounting & Finance, Human Resources, Marketing, Sales, Purchasing, Quality, Security)
       - Facilities Management (Technical Service, Garden, Greenkeeping, Information Technology)

    2. Role-Specific Skills:
       - Customer-Facing (Guest Communication, Problem Resolution, Service Excellence, Multilingual Ability)
       - Operational (System Knowledge, Process Efficiency, Team Coordination, Safety Compliance)
       - Administrative (Documentation, Reporting, Analysis, Regulatory Compliance)

    3. Experience Level:
       - Entry Level (0-2 years)
       - Mid-Level (2-5 years)
       - Senior (5+ years)
       - Management (Team/Department Leadership)

    4. Certifications & Education
    5. Personal Attributes

    Score the candidate on these components:
    - Department Match Score (0-100)
    - Technical Qualification Score (0-100)
    - Experience Value Score (0-100)
    - Language Proficiency Score (0-100)
    - Practical Factors Score (0-100)

    Return a structured JSON object with the analysis results.
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Analyze this CV for a resort operations position:\n\n${cvText}`,
    })

    // Parse the JSON response
    const analysisResult = JSON.parse(text) as CVAnalysisResult
    return analysisResult
  } catch (error) {
    console.error("Error analyzing CV with AI:", error)
    throw new Error("Failed to analyze CV")
  }
}

