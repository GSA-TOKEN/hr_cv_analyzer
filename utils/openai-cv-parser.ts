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

## 0. Demographics
- First Name (extract the candidate's first name)
- Last Name (extract the candidate's last name)
- Email Address (extract the candidate's email address)
- Phone Number (extract the candidate's phone number)
- Date of Birth or Age (extract the candidate's date of birth or age)

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

For demographic information, include a "Demographics" object in your response with the following structure:
{
  "Demographics": {
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    "birthdate": "..."
  }
}

# Note:
- Make sure the language for the tag is English.
- Do not add other tags other than these tags.
- If you cannot find a tag, leave it blank.
- We are in 2025 and calculate ages accordingly.
- If you cannot find the age, leave it blank.
- Calculate experience in years.
- Always make your best effort to extract demographic information, even if incomplete.
- Format the birthdate in YYYY-MM-DD format if possible.
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
 * Convert parsed CV to tags for filtering and categorization
 * @param parsedCV Parsed CV data from OpenAI
 * @returns Array of tags
 */
export function convertParsedCVToTags(parsedCV: any): string[] {
    const tags: string[] = [];

    try {
        // Age tags
        if (parsedCV.Age) {
            let ageTag = '';
            const age = Number(parsedCV.Age);

            if (!isNaN(age)) {
                if (age < 18) ageTag = 'age:under-18';
                else if (age >= 18 && age <= 22) ageTag = 'age:18-22';
                else if (age >= 23 && age <= 28) ageTag = 'age:23-28';
                else if (age >= 29 && age <= 35) ageTag = 'age:29-35';
                else if (age >= 36 && age <= 45) ageTag = 'age:36-45';
                else if (age > 45) ageTag = 'age:46+';
            }

            if (ageTag) tags.push(ageTag);
        }

        // Language tags
        if (parsedCV.Languages && typeof parsedCV.Languages === 'object') {
            Object.entries(parsedCV.Languages).forEach(([language, level]) => {
                if (language && level && typeof language === 'string' && typeof level === 'string') {
                    // Normalize language name and level
                    const normalizedLanguage = language.toLowerCase().trim();
                    let normalizedLevel = '';

                    // Map various level descriptions to standard terms
                    const levelLower = level.toLowerCase().trim();
                    if (levelLower.includes('native') || levelLower.includes('mother')) {
                        normalizedLevel = 'native';
                    } else if (levelLower.includes('fluent') || levelLower.includes('proficient')) {
                        normalizedLevel = 'fluent';
                    } else if (levelLower.includes('advanced') || levelLower.includes('c1') || levelLower.includes('c2')) {
                        normalizedLevel = 'advanced';
                    } else if (levelLower.includes('intermediate') || levelLower.includes('b1') || levelLower.includes('b2')) {
                        normalizedLevel = 'intermediate';
                    } else if (levelLower.includes('basic') || levelLower.includes('beginner') || levelLower.includes('a1') || levelLower.includes('a2')) {
                        normalizedLevel = 'basic';
                    } else {
                        normalizedLevel = 'basic'; // Default if unclear
                    }

                    tags.push(`language:${normalizedLanguage}-${normalizedLevel}`);
                }
            });
        }

        // Education tags
        if (parsedCV.Education) {
            if (parsedCV.Education["Education Level"]) {
                const eduLevel = parsedCV.Education["Education Level"].toLowerCase();

                if (eduLevel.includes('high school')) {
                    tags.push('education:high-school');
                } else if (eduLevel.includes('associate')) {
                    tags.push('education:associate-degree');
                } else if (eduLevel.includes('bachelor')) {
                    tags.push('education:bachelors-degree');
                } else if (eduLevel.includes('master')) {
                    tags.push('education:masters-degree');
                } else if (eduLevel.includes('phd') || eduLevel.includes('doctorate')) {
                    tags.push('education:phd');
                } else if (eduLevel.includes('vocational') || eduLevel.includes('technical')) {
                    tags.push('education:vocational-certificate');
                } else if (eduLevel.includes('diploma')) {
                    tags.push('education:professional-diploma');
                } else if (eduLevel.includes('certification')) {
                    tags.push('education:industry-certification');
                }
            }

            // Field of study
            const fieldRelevance = parsedCV.Education["Field Relevance"];
            if (fieldRelevance) {
                const fields = Array.isArray(fieldRelevance) ? fieldRelevance : [fieldRelevance];

                fields.forEach(field => {
                    if (field && typeof field === 'string') {
                        const fieldLower = field.toLowerCase();

                        // Map to predefined field categories
                        if (fieldLower.includes('hospitality') && fieldLower.includes('management')) {
                            tags.push('field:hospitality-management');
                        } else if (fieldLower.includes('tourism')) {
                            tags.push('field:tourism');
                        } else if (fieldLower.includes('culinary') || fieldLower.includes('chef')) {
                            tags.push('field:culinary-arts');
                        } else if (fieldLower.includes('business') && fieldLower.includes('admin')) {
                            tags.push('field:business-administration');
                        } else if (fieldLower.includes('finance') || fieldLower.includes('accounting')) {
                            tags.push('field:finance-accounting');
                        } else if (fieldLower.includes('engineering')) {
                            tags.push('field:engineering');
                        } else if (fieldLower.includes('it') || fieldLower.includes('computer') || fieldLower.includes('software')) {
                            tags.push('field:it-computer-science');
                        } else if (fieldLower.includes('marketing') || fieldLower.includes('communications')) {
                            tags.push('field:marketing-communications');
                        } else if (fieldLower.includes('human') && fieldLower.includes('resource')) {
                            tags.push('field:human-resources');
                        }
                        // Add more field mappings as needed
                    }
                });
            }
        }

        // Experience tags
        if (parsedCV.Experience) {
            // Experience duration
            if (parsedCV.Experience.Duration) {
                const duration = parsedCV.Experience.Duration.toLowerCase();

                if (duration.includes('no experience') || duration.includes('none')) {
                    tags.push('experience:no-experience');
                } else if (duration.includes('less than 1') || duration.includes('<1')) {
                    tags.push('experience:less-than-1-year');
                } else if (duration.includes('1-3') || (duration.includes('1') && duration.includes('3'))) {
                    tags.push('experience:1-3-years');
                } else if (duration.includes('3-5') || (duration.includes('3') && duration.includes('5'))) {
                    tags.push('experience:3-5-years');
                } else if (duration.includes('5-10') || (duration.includes('5') && duration.includes('10'))) {
                    tags.push('experience:5-10-years');
                } else if (duration.includes('10+') || duration.includes('over 10')) {
                    tags.push('experience:10+-years');
                }
            }

            // Establishment type
            const establishmentType = parsedCV.Experience["Establishment Type"];
            if (establishmentType) {
                const establishments = Array.isArray(establishmentType) ? establishmentType : [establishmentType];

                establishments.forEach(est => {
                    if (est && typeof est === 'string') {
                        const estLower = est.toLowerCase();

                        if (estLower.includes('luxury') && (estLower.includes('resort') || estLower.includes('hotel'))) {
                            tags.push('establishment:luxury-resort');
                        } else if (estLower.includes('business') && estLower.includes('hotel')) {
                            tags.push('establishment:business-hotel');
                        } else if (estLower.includes('restaurant') || estLower.includes('bar')) {
                            tags.push('establishment:restaurant-bar');
                        } else if (estLower.includes('tour') && estLower.includes('operator')) {
                            tags.push('establishment:tour-operator');
                        } else if (estLower.includes('cruise')) {
                            tags.push('establishment:cruise-line');
                        } else if (estLower.includes('chain') && estLower.includes('hotel')) {
                            tags.push('establishment:chain-hotel');
                        } else if (estLower.includes('boutique')) {
                            tags.push('establishment:boutique-property');
                        } else {
                            tags.push('establishment:other');
                        }
                    }
                });
            }

            // Position level
            if (parsedCV.Experience["Position Level"]) {
                const position = parsedCV.Experience["Position Level"].toLowerCase();

                if (position.includes('entry')) {
                    tags.push('position:entry-level');
                } else if (position.includes('specialist')) {
                    tags.push('position:specialist');
                } else if (position.includes('supervisor')) {
                    tags.push('position:supervisor');
                } else if (position.includes('manager')) {
                    tags.push('position:manager');
                } else if (position.includes('head') && position.includes('department')) {
                    tags.push('position:department-head');
                } else if (position.includes('director')) {
                    tags.push('position:director');
                } else if (position.includes('executive') || position.includes('c-level')) {
                    tags.push('position:executive');
                }
            }
        }

        // Technical Skills
        if (parsedCV["Technical Skills"]) {
            const techSkills = parsedCV["Technical Skills"];

            // Process each skill category
            Object.entries(techSkills).forEach(([category, skills]) => {
                if (!skills) return;

                const skillsArray = Array.isArray(skills) ? skills : [skills];
                const categoryLower = category.toLowerCase();

                // Map category to predefined categories
                let mappedCategory = '';
                if (categoryLower.includes('front') || categoryLower.includes('reception') || categoryLower.includes('reservation')) {
                    mappedCategory = 'front-office';
                } else if (categoryLower.includes('housekeeping') || categoryLower.includes('cleaning')) {
                    mappedCategory = 'housekeeping';
                } else if (categoryLower.includes('kitchen') || categoryLower.includes('f&b') || categoryLower.includes('food')) {
                    mappedCategory = 'fb-kitchen';
                } else if (categoryLower.includes('it') || categoryLower.includes('tech')) {
                    mappedCategory = 'it-technical';
                } else if (categoryLower.includes('accounting') || categoryLower.includes('finance')) {
                    mappedCategory = 'accounting-finance';
                } else {
                    mappedCategory = 'general';
                }

                // Add each skill with proper categorization
                skillsArray.forEach(skill => {
                    if (skill && typeof skill === 'string') {
                        // Normalize skill name to kebab-case
                        const normalizedSkill = skill.toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-');

                        tags.push(`technical-skill:${mappedCategory}:${normalizedSkill}`);
                    }
                });
            });
        }

        // Soft Skills
        if (parsedCV["Soft Skills"]) {
            const softSkills = Array.isArray(parsedCV["Soft Skills"])
                ? parsedCV["Soft Skills"]
                : [parsedCV["Soft Skills"]];

            softSkills.forEach((skill: any) => {
                if (skill && typeof skill === 'string') {
                    // Normalize soft skill to kebab-case
                    const normalizedSkill = skill.toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-');

                    tags.push(`soft-skill:${normalizedSkill}`);
                }
            });
        }

        // Certifications
        if (parsedCV.Certifications) {
            const certifications = Array.isArray(parsedCV.Certifications)
                ? parsedCV.Certifications
                : [parsedCV.Certifications];

            certifications.forEach((cert: any) => {
                if (cert && typeof cert === 'string') {
                    // Try to identify certification type
                    const certLower = cert.toLowerCase();

                    if (certLower.includes('food') && certLower.includes('safety')) {
                        tags.push('certification:food-safety');
                    } else if ((certLower.includes('first') && certLower.includes('aid')) || certLower.includes('cpr')) {
                        tags.push('certification:first-aid-cpr');
                    } else if (certLower.includes('fire') && certLower.includes('safety')) {
                        tags.push('certification:fire-safety');
                    } else if (certLower.includes('hospitality') && certLower.includes('management')) {
                        tags.push('certification:hospitality-management');
                    } else {
                        // Normalize certification to kebab-case
                        const normalizedCert = cert.toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .substring(0, 30);  // Limit length

                        tags.push(`certification:${normalizedCert}`);
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error generating tags from parsed CV:', error);
    }

    // Remove duplicates and return
    return [...new Set(tags)];
} 