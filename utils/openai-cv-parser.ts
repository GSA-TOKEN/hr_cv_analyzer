import OpenAI from 'openai';

// Initialize the OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
    apiKey,
    // Set reasonable timeout and max retries
    timeout: 60000, // 60 seconds
    maxRetries: 3
});

// System message for CV analysis
const system_message_cv = `
You are an expert CV analyzer for a resort. Your task is to extract relevant information from CVs and categorize them according to specific tags.
Analyze the CV text and identify the following categories:

## 1. Age
- 18 under
- 18-22
- 23-28
- 28-35
- 36-45
- 46+

## 2. Languages
- **Language Options**
  - english
  - russian
  - german
  - arabic
  - french
  - spanish
  - chinese
  - ukrainian
  - turkish
  - dutch
  - italian
  - portuguese
  - hebrew
  - polish
  - romanian

- **Proficiency Levels**
  - basic
  - intermediate
  - advanced
  - fluent
  - native

## 3. Education
- **Education Level**
  - high school
  - associate degree
  - bachelor's degree
  - master's degree
  - phd
  - vocational certificate
  - professional diploma
  - industry certification

- **Field Relevance**
  - hospitality management
  - tourism
  - culinary arts
  - business administration
  - finance/accounting
  - engineering
  - it/computer science
  - recreation management
  - marketing/communications
  - human resources
  - health & safety
  - sports & leisure
  - environmental management
  - spa & wellness
  - landscape architecture

## 4. Experience
- **Duration**
  - no experience
  - less than 1 year
  - 1-3 years
  - 3-5 years
  - 5-10 years
  - 10+ years

- **Establishment Type**
  - luxury resort
  - business hotel
  - restaurant/bar
  - tour operator
  - cruise line
  - event company
  - corporate office
  - chain hotel
  - boutique property
  - casino
  - golf resort
  - thermal/wellness resort
  - all-inclusive resort
  - timeshare property

- **Position Level**
  - entry level
  - specialist
  - supervisor
  - manager
  - department head
  - director
  - executive

## 5. Technical Skills

### Front Office / Reservation / CRM & Call Center
- pms systems (opera, protel, etc.)
- booking engines (booking.com, expedia, etc.)
- payment processing systems
- crm software
- call center technologies
- upselling techniques
- channel management
- yield management
- guest loyalty programs
- check-in/check-out procedures
- foreign exchange handling
- complaint management

### Housekeeping / Laundry / Flower Center
- inventory management
- chemical handling
- quality control
- industrial equipment operation
- room inspection
- sustainability practices
- linen management
- deep cleaning protocols
- floral arrangement
- decorative displays
- amenity setup
- vip room preparation

### F&B / Kitchen / Dishroom
- food safety certification
- culinary techniques
- menu planning
- cost control
- pos systems
- specialty cuisine knowledge
- beverage service
- banquet operations
- buffet management
- à la carte service
- restaurant reservation systems
- allergen management
- wine knowledge
- cocktail preparation

### Finance / Accounting / Purchasing
- accounting software
- budgeting
- financial analysis
- procurement systems
- vendor management
- audit procedures
- tax compliance
- payroll processing
- cost allocation
- asset management
- financial reporting
- inventory valuation
- contract negotiation
- expense tracking

### IT / Technical Service
- network administration
- system maintenance
- software development
- database management
- audio/visual equipment
- iot solutions
- cctv systems
- key card systems
- energy management systems
- telecommunications
- technical support
- it security
- smart room technology
- preventive maintenance

### Entertainment / Kids Club / SPA
- activity planning
- performance skills
- child safety
- treatment protocols
- equipment operation
- booking management
- theme events
- stage production
- music/dj skills
- sports instruction
- animation programs
- massage techniques
- beauty treatments
- fitness instruction

### HR / Quality
- recruitment tools
- training & development
- performance management
- quality assurance systems
- audit experience
- compliance knowledge
- employee relations
- labor law
- benefits administration
- onboarding processes
- talent management
- diversity & inclusion
- hris systems
- guest satisfaction measurement

### Marketing / Sales
- crm systems
- digital marketing tools
- content creation
- analytics
- contract negotiation
- revenue management
- social media management
- email marketing
- seo/sem knowledge
- brand management
- corporate sales
- mice sales
- loyalty programs
- public relations

### Grounds 
- landscape design
- equipment operation
- irrigation systems
- plant knowledge
- sustainability practices
- pest management
- turf management
- seasonal planning
- water conservation
- ornamental care
- tree maintenance
- chemical application
- beach maintenance
- pool area management

## 6. Soft Skills
- guest communication
- problem resolution
- team leadership
- conflict management
- time management
- attention to detail
- cultural sensitivity
- adaptability
- work under pressure
- emotional intelligence
- decision making
- initiative
- creativity
- strategic thinking
- negotiation
- active listening
- crisis management
- delegation
- coaching/mentoring
- multitasking

## 7. Certifications
- food safety 
- first aid/cpr
- lifeguard certification
- fire safety
- security certification
- spa/wellness certifications
- sommelier/beverage certifications
- revenue management
- environmental management
- health & safety 
- project management 
- it certifications 
- guest service gold
- financial certifications
- hospitality management certification
- training certification
- pool operations
- fitness instruction
- language certifications 
- eco-certification 

Return your analysis as a JSON object with these categories as keys and the identified tags as values. Organize the structure with main categories and subcategories as defined above.

# Note:
- Make sure the language for the tag is English.
- Do not add other tags other than these tags.
- If you cannot find a tag, leave it blank.
- We are in 2025 and calculate ages accordingly.
- If you cannot find the age, leave it blank.
- Calculate experience in years.
`;

/**
 * Parse a CV using OpenAI
 * @param cvText CV text to be parsed
 * @returns Parsed CV data as JSON
 */
export async function parseCV(cvText: string): Promise<any> {
    try {
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: system_message_cv },
                { role: 'user', content: cvText }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (content) {
            return JSON.parse(content);
        } else {
            throw new Error('Empty response from OpenAI');
        }
    } catch (error: any) {
        console.error('Error parsing CV with OpenAI:', error);
        throw new Error(`Failed to parse CV: ${error.message}`);
    }
}

/**
 * Convert parsed CV data to tags
 * @param parsedCV Parsed CV data from OpenAI
 * @returns Array of tags
 */
export function convertParsedCVToTags(parsedCV: any): string[] {
    const tags: string[] = [];

    try {
        // Age
        if (parsedCV.Age) {
            tags.push(`age:${parsedCV.Age.toLowerCase().replace(/\s+/g, "-")}`);
        }

        // Languages
        if (parsedCV.Languages) {
            Object.entries(parsedCV.Languages).forEach(([language, proficiency]) => {
                tags.push(`language:${language.toLowerCase()}-${proficiency}`);
            });
        }

        // Education
        if (parsedCV.Education) {
            if (parsedCV.Education["Education Level"]) {
                tags.push(`education:${parsedCV.Education["Education Level"].toLowerCase().replace(/\s+/g, "-").replace(/'/g, "")}`);
            }

            if (parsedCV.Education["Field Relevance"]) {
                const fieldRelevances = Array.isArray(parsedCV.Education["Field Relevance"])
                    ? parsedCV.Education["Field Relevance"]
                    : [parsedCV.Education["Field Relevance"]];

                fieldRelevances.forEach((field: string) => {
                    if (field && typeof field === 'string') {
                        tags.push(`field:${field.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")}`);
                    }
                });
            }
        }

        // Experience
        if (parsedCV.Experience) {
            if (parsedCV.Experience.Duration) {
                tags.push(`experience:${parsedCV.Experience.Duration.toLowerCase().replace(/\s+/g, "-")}`);
            }

            if (parsedCV.Experience["Establishment Type"]) {
                const establishmentTypes = Array.isArray(parsedCV.Experience["Establishment Type"])
                    ? parsedCV.Experience["Establishment Type"]
                    : [parsedCV.Experience["Establishment Type"]];

                establishmentTypes.forEach((type: string) => {
                    if (type && typeof type === 'string') {
                        tags.push(`establishment:${type.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")}`);
                    }
                });
            }

            if (parsedCV.Experience["Position Level"]) {
                tags.push(`position:${parsedCV.Experience["Position Level"].toLowerCase().replace(/\s+/g, "-")}`);
            }
        }

        // Technical Skills
        if (parsedCV["Technical Skills"]) {
            const technicalSkills = parsedCV["Technical Skills"];

            Object.entries(technicalSkills).forEach(([category, skills]) => {
                const categoryKey = category
                    .toLowerCase()
                    .replace(/\s+\/\s+/g, "-")
                    .replace(/\s+&\s+/g, "-")
                    .replace(/\s+/g, "-");

                if (Array.isArray(skills)) {
                    skills.forEach((skill: string) => {
                        if (skill && typeof skill === 'string') {
                            tags.push(`skill:${categoryKey}:${skill.toLowerCase().replace(/\s+/g, "-").replace(/[\/&()]/g, "-")}`);
                        }
                    });
                } else if (skills && typeof skills === 'string') {
                    // Handle case where skills is a single string
                    tags.push(`skill:${categoryKey}:${skills.toLowerCase().replace(/\s+/g, "-").replace(/[\/&()]/g, "-")}`);
                }
            });
        }

        // Soft Skills
        if (parsedCV["Soft Skills"]) {
            const softSkills = Array.isArray(parsedCV["Soft Skills"])
                ? parsedCV["Soft Skills"]
                : [parsedCV["Soft Skills"]];

            softSkills.forEach((skill: string) => {
                if (skill && typeof skill === 'string') {
                    tags.push(`soft-skill:${skill.toLowerCase().replace(/\s+/g, "-")}`);
                }
            });
        }

        // Certifications
        if (parsedCV.Certifications) {
            const certifications = Array.isArray(parsedCV.Certifications)
                ? parsedCV.Certifications
                : [parsedCV.Certifications];

            certifications.forEach((cert: string) => {
                if (cert && typeof cert === 'string') {
                    tags.push(`certification:${cert.toLowerCase().replace(/\s+/g, "-").replace(/[\/&]/g, "-")}`);
                }
            });
        }

        return tags;
    } catch (error: any) {
        console.error('Error converting parsed CV to tags:', error);
        // Return whatever tags we've created so far
        return tags;
    }
} 