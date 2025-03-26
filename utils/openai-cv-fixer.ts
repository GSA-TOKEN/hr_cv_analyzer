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

/**
 * Fix and enhance a CV text using OpenAI
 * @param cvText Raw CV text to be fixed
 * @returns Enhanced CV text
 */
export async function fixCV(cvText: string): Promise<string> {
    if (!cvText || typeof cvText !== 'string') {
        throw new Error('Invalid CV text provided');
    }

    try {
        console.log(`Enhancing CV text with OpenAI (length: ${cvText.length} chars)...`);

        // If text is too long, truncate it to avoid token limits
        const maxInputLength = 50000; // Approximately 12,500 tokens
        const truncatedText = cvText.length > maxInputLength
            ? cvText.substring(0, maxInputLength) + "\n[Text truncated due to length]"
            : cvText;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert CV enhancer. 
Your task is to fix and clean up the CV text that was extracted from a PDF or image using OCR.
Correct any OCR errors, fix formatting, organize sections properly, and ensure the CV is well-structured.
Preserve ALL original information including contact details, education, experience, skills, and other sections.
Your output should be the fixed and cleaned CV text only, with no additional comments or explanations.
Support both English and Turkish CVs.`
                },
                { role: 'user', content: truncatedText }
            ],
            temperature: 0.3,
            max_tokens: 4000
        });

        if (!response.choices?.[0]?.message?.content) {
            throw new Error('Empty or invalid response from OpenAI');
        }

        const fixedText = response.choices[0].message.content.trim();
        console.log(`Successfully enhanced CV text (length: ${fixedText.length} chars)`);

        return fixedText;
    } catch (error: any) {
        console.error('Error enhancing CV with OpenAI:', error);
        if (error.response?.data?.error) {
            throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
        }

        // If we can't enhance, return the original text
        console.warn('Returning original text due to enhancement failure');
        return cvText;
    }
} 