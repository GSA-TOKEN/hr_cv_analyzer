import OpenAI from 'openai';

// Initialize the OpenAI client
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

/**
 * Fix a CV using OpenAI
 * @param cvText Raw text extracted from a CV
 * @returns Improved and formatted CV text
 */
export async function fixCV(cvText: string): Promise<string> {
    try {
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }

        const prompt = `
    You are a professional CV enhancer. Your task is to improve the following CV text:

    - Fix any grammatical or spelling errors
    - Improve phrasing and clarity
    - Ensure consistent formatting
    - Keep all educational background, work experience, skills, and personal information intact
    - Maintain the original content and intent, just enhance it
    - Organize information in a clear, professional structure
    - Do not add fictitious information

    Here is the CV text to enhance:
    ${cvText}
    `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a professional CV enhancer.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 4000,
        });

        return response.choices[0].message.content || cvText;
    } catch (error: any) {
        console.error('Error fixing CV with OpenAI:', error);
        // Return original CV if there's an error
        return cvText;
    }
} 