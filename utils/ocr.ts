import { createWorker, WorkerOptions } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { setupPdfWorker } from './pdf-worker-setup';
import { getDocument } from 'pdfjs-dist';

// Setup PDF.js worker
setupPdfWorker();

// Ensure necessary directories exist for Tesseract
if (typeof window === 'undefined') {
    const ensureDir = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Created directory: ${dirPath}`);
            } catch (err) {
                console.error(`Error creating directory ${dirPath}:`, err);
            }
        }
    };

    // Create temp directories for Tesseract
    ensureDir(path.join(process.cwd(), '.tesseract'));
    ensureDir(path.join(process.cwd(), '.tessdata'));

    // Copy the worker script to our application directory if it doesn't exist
    const workerDirPath = path.join(process.cwd(), 'public', 'worker');
    ensureDir(workerDirPath);

    // Try to copy the worker script from node_modules if needed
    const sourceWorkerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js');
    const targetWorkerPath = path.join(workerDirPath, 'tesseract-worker.js');

    if (fs.existsSync(sourceWorkerPath) && !fs.existsSync(targetWorkerPath)) {
        try {
            fs.copyFileSync(sourceWorkerPath, targetWorkerPath);
            console.log(`Copied Tesseract worker script to: ${targetWorkerPath}`);
        } catch (copyErr) {
            console.error(`Error copying worker script: ${copyErr}`);
        }
    }
}

// Initialize Tesseract worker
let tesseractWorker: any = null;

// Function to create a worker with safe configuration for Next.js 15
async function createSafeWorker() {
    // For server-side, use a minimal configuration
    if (typeof window === 'undefined') {
        try {
            // Create a worker without special options for Next.js 15 compatibility
            // This avoids issues with worker paths in the .next directory
            console.log('Creating worker with standard configuration');
            return await createWorker();
        } catch (err) {
            console.error('Error creating worker:', err);
            // Last resort fallback to simple creation
            return createWorker();
        }
    } else {
        // Client-side - standard configuration
        return createWorker();
    }
}

export async function getTesseractWorker() {
    if (!tesseractWorker) {
        try {
            console.log('Initializing main Tesseract worker...');
            tesseractWorker = await createSafeWorker();
            console.log('Tesseract worker created successfully');
            return tesseractWorker;
        } catch (error: any) {
            console.error('Error initializing Tesseract worker:', error);
            throw new Error(`Failed to initialize OCR: ${error.message}`);
        }
    }
    return tesseractWorker;
}

/**
 * Extract text from a PDF file using PDF.js on client side, or a simpler method on server side
 * Optimized for OpenAI processing with multilingual support
 * @param filePath Path to the PDF file
 * @returns Extracted text from the PDF, cleaned for OpenAI processing
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
    try {
        // Read the file
        const data = await fsPromises.readFile(filePath);

        // Check if we're on server or client
        if (typeof window === 'undefined') {
            // SERVER-SIDE EXTRACTION
            let extractedText = '';

            // Method 1: Try with pdf-parse directly (generally works best for OpenAI)
            try {
                console.log("Attempting to parse PDF with pdf-parse...");

                // Make sure pdf-parse is properly required
                let pdfParse;
                try {
                    pdfParse = require('pdf-parse');
                } catch (requireError) {
                    console.error("Error requiring pdf-parse:", requireError);
                    throw new Error("pdf-parse module not available");
                }

                // Use optimal options for OpenAI-friendly text extraction
                const options = {
                    // Skip rendering
                    renderPage: () => Promise.resolve(),
                    // Get all pages
                    max: 0
                };

                const result = await pdfParse(data, options);

                if (!result || typeof result.text !== 'string' || result.text.length < 10) {
                    console.warn("PDF-parse returned empty or very short text, trying fallback...");
                    throw new Error("PDF-parse returned insufficient text");
                }

                extractedText = result.text || '';
                console.log("PDF parsed successfully with pdf-parse");
            } catch (pdfParseError) {
                console.error("PDF-parse failed:", pdfParseError);

                // Method 2: Fallback to PDF.js
                try {
                    console.log("Trying PDF.js fallback method...");
                    const loadingTask = pdfjsLib.getDocument({ data });
                    const pdf = await loadingTask.promise;

                    let fullText = '';

                    // Extract text from each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        console.log(`Processing page ${i} of ${pdf.numPages}`);
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();

                        // Process each text item to improve layout
                        let lastY;
                        let pageText = '';

                        for (const item of textContent.items) {
                            const textItem = item as any;
                            // Add newlines when Y position changes significantly
                            if (lastY !== undefined && Math.abs(textItem.transform[5] - lastY) > 5) {
                                pageText += '\n';
                            }
                            pageText += textItem.str + ' ';
                            lastY = textItem.transform[5];
                        }

                        fullText += pageText + '\n\n'; // Double newline between pages
                    }

                    if (fullText.length < 10) {
                        throw new Error("PDF.js extracted insufficient text");
                    }

                    extractedText = fullText;
                    console.log("PDF parsed successfully with PDF.js");
                } catch (pdfJsError) {
                    console.error("PDF.js method also failed:", pdfJsError);

                    // Method 3: Try direct text extraction as last resort
                    try {
                        console.log("Attempting direct text extraction...");
                        const textContent = Buffer.from(data).toString('utf-8');
                        if (textContent.includes('%PDF-')) {
                            // This is a PDF but we can't parse it properly
                            throw new Error("Cannot extract text from this PDF format");
                        } else {
                            // This might be a text file with the wrong extension
                            extractedText = textContent;
                        }
                    } catch (directError) {
                        console.error("Direct text extraction failed:", directError);
                        throw new Error("All PDF extraction methods failed");
                    }
                }
            }

            // If we still don't have text, return a meaningful error message
            if (!extractedText || extractedText.trim().length === 0) {
                return "No text could be extracted from this PDF. The document might be scanned, protected, or in an unsupported format.";
            }

            // Clean up the extracted text for better OpenAI processing
            return cleanTextForOpenAI(extractedText);
        } else {
            // CLIENT-SIDE EXTRACTION - use PDF.js
            const loadingTask = pdfjsLib.getDocument(new Uint8Array(data));
            const pdf = await loadingTask.promise;

            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Process each text item to improve layout
                let lastY;
                let pageText = '';

                for (const item of textContent.items) {
                    const textItem = item as any;
                    // Add newlines when Y position changes significantly
                    if (lastY !== undefined && Math.abs(textItem.transform[5] - lastY) > 5) {
                        pageText += '\n';
                    }
                    pageText += textItem.str + ' ';
                    lastY = textItem.transform[5];
                }

                fullText += pageText + '\n\n'; // Double newline between pages
            }

            // If extraction failed, provide helpful message
            if (!fullText || fullText.trim().length === 0) {
                return "No text could be extracted from this PDF. The document might be scanned, protected, or in an unsupported format.";
            }

            return cleanTextForOpenAI(fullText);
        }
    } catch (error: any) {
        console.error('Error extracting text from PDF:', error);
        // Return a user-friendly error message instead of throwing
        return `PDF text extraction encountered an issue: ${error.message}. Please try using a different PDF file.`;
    }
}

/**
 * Clean and format text to be more suitable for OpenAI processing
 * Supports multiple languages including Turkish
 */
function cleanTextForOpenAI(text: string): string {
    if (!text) return '';

    return text
        // Replace multiple spaces with a single space
        .replace(/\s+/g, ' ')
        // Replace multiple newlines with a maximum of two
        .replace(/\n{3,}/g, '\n\n')
        // Trim whitespace from beginning and end of each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // Remove zero-width spaces and other invisible characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Keep Turkish characters intact - no special handling needed for UTF-8
        // Handle common OCR errors in Turkish characters
        .replace(/i\u0307/g, 'i') // dotted i normalization
        .replace(/ð/g, 'ğ') // common OCR error for Turkish ğ
        .replace(/º/g, 'o') // sometimes OCR confuses º with o
        // Ensure reasonable overall length for OpenAI (truncate if over 100,000 chars)
        .substring(0, 100000)
        .trim();
}

/**
 * Extract text from an image file using Tesseract.js
 * Supports Turkish language detection
 * @param filePath Path to the image file
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(filePath: string): Promise<string> {
    try {
        console.log('Extracting text from image using OCR...');

        // Use our safe worker approach
        const worker = await createSafeWorker();

        // Recognize text
        console.log('Running OCR recognition...');
        const { data: { text } } = await worker.recognize(filePath);

        // Terminate after use
        console.log('OCR recognition complete, terminating worker');
        await worker.terminate();

        return cleanTextForOpenAI(text);
    } catch (error: any) {
        console.error('Error extracting text from image:', error);
        return `Image text extraction failed: ${error.message}. Please try a different image.`;
    }
}

/**
 * Extract text from a DOCX file using mammoth.js
 * Supports multilingual content including Turkish
 * @param filePath Path to the DOCX file
 * @returns Extracted text from the DOCX file
 */
export async function extractTextFromDOCX(filePath: string): Promise<string> {
    try {
        console.log("Extracting text from DOCX:", filePath);
        const result = await mammoth.extractRawText({ path: filePath });

        if (!result.value || result.value.trim().length === 0) {
            console.warn("Mammoth extracted empty text from DOCX");
            return "No text could be extracted from this DOCX file. The document might be protected or corrupt.";
        }

        return cleanTextForOpenAI(result.value);
    } catch (error: any) {
        console.error('Error extracting text from DOCX:', error);
        return `DOCX text extraction failed: ${error.message}. Please try a different file.`;
    }
}

/**
 * Extract text from a file based on its extension
 * Supports multiple file types and languages including Turkish
 * @param filePath Path to the file
 * @returns Extracted text from the file
 */
export async function extractTextFromFile(fileBuffer: Buffer): Promise<string> {
    try {
        // First try to extract text as PDF
        try {
            const pdfDocument = await pdfjsLib.getDocument(fileBuffer).promise;
            let text = '';

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(' ') + '\n';
            }

            if (text.trim()) {
                return text;
            }
        } catch (error) {
            console.log('Not a valid PDF or no text content found, trying OCR...');
        }

        // If PDF extraction fails or returns no text, try OCR with our safe worker
        return await extractTextWithOCR(fileBuffer);
    } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
    }
}

/**
 * Extract text from a URL by downloading it first
 * Supports multiple file types and languages including Turkish
 * @param url URL of the file to extract text from
 * @returns Extracted text from the URL
 */
export async function extractTextFromUrl(url: string): Promise<string> {
    try {
        console.log(`Extracting text from URL: ${url}`);

        // Create a temporary file name based on the URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const tempFilePath = path.join(process.cwd(), 'cv', `temp_${Date.now()}_${fileName}`);

        // Make sure cv directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'cv'))) {
            await fsPromises.mkdir(path.join(process.cwd(), 'cv'), { recursive: true });
        }

        // Download the file
        console.log(`Downloading file from URL to: ${tempFilePath}`);
        const response = await fetch(url);
        if (!response.ok) {
            return `Failed to download file: ${response.statusText} (Status: ${response.status})`;
        }

        const arrayBuffer = await response.arrayBuffer();
        await fsPromises.writeFile(tempFilePath, Buffer.from(arrayBuffer));
        console.log(`File downloaded successfully, size: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`);

        // Extract text from the downloaded file
        const text = await extractTextFromFile(Buffer.from(arrayBuffer));

        // Clean up the temporary file
        try {
            await fsPromises.unlink(tempFilePath);
            console.log(`Temporary file deleted: ${tempFilePath}`);
        } catch (cleanupError) {
            console.error('Error cleaning up temporary file:', cleanupError);
        }

        return text;
    } catch (error: any) {
        console.error('Error extracting text from URL:', error);
        return `Failed to extract text from URL: ${error.message}. Please check if the URL is accessible and points to a supported file format.`;
    }
}

// Around line 450 in the file
// Use our safe worker creation
async function extractTextWithOCR(buffer: Buffer) {
    console.log('Using OCR to extract text');

    // Create a dedicated worker with our safe approach for Next.js 15
    console.log('Initializing dedicated OCR worker...');
    const worker = await createSafeWorker();

    try {
        // Process the buffer
        console.log('Running OCR recognition...');
        const result = await worker.recognize(buffer);
        const extractedText = result.data.text || '';

        // Clean up
        console.log('Terminating OCR worker...');
        await worker.terminate();

        return extractedText;
    } catch (err) {
        // Make sure we terminate the worker even if recognition fails
        await worker.terminate();
        throw err;
    }
}

// Update the extractTextFromBuffer function
export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
        let text = '';

        // First, try to extract text as PDF using PDF.js
        try {
            console.log('Attempting to extract text from PDF...');

            // Use a direct approach without relying on the worker for server-side
            if (typeof window === 'undefined') {
                // Server-side PDF extraction
                try {
                    console.log("Using pdf-parse for server-side extraction");
                    // Try pdf-parse which is more reliable for server
                    const pdfParse = require('pdf-parse');
                    const data = await pdfParse(buffer);
                    text = data.text || '';

                    if (text.trim()) {
                        console.log(`Successfully extracted ${text.length} characters using pdf-parse`);
                        return cleanTextForOpenAI(text);
                    }
                } catch (pdfParseError) {
                    console.error("pdf-parse error:", pdfParseError);
                    // Continue to OCR fallback
                }
            } else {
                // Client-side PDF extraction with PDF.js
                const data = new Uint8Array(buffer);
                const pdf = await getDocument({ data }).promise;
                const numPages = pdf.numPages;
                console.log(`PDF has ${numPages} pages`);

                for (let i = 1; i <= numPages; i++) {
                    console.log(`Processing page ${i}/${numPages}`);
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((item: any) => item.str).join(' ') + '\n';
                }

                if (text.trim()) {
                    console.log('Successfully extracted text from PDF');
                    return cleanTextForOpenAI(text);
                }
            }
        } catch (error) {
            console.log('PDF extraction failed, falling back to OCR', error);
        }

        // If PDF extraction fails or returns empty text, try OCR with our safe worker approach
        text = await extractTextWithOCR(buffer);

        const cleanedText = cleanTextForOpenAI(text);
        console.log(`Extracted ${cleanedText.length} characters of text`);
        return cleanedText;
    } catch (error) {
        console.error('Error extracting text from buffer:', error);
        throw new Error(`Failed to extract text: ${error}`);
    }
}

/**
 * Extract text from a buffer containing an image file
 * @param buffer Buffer containing an image file
 * @returns Extracted text
 */
export async function extractTextFromImageBuffer(buffer: Buffer): Promise<string> {
    try {
        if (!buffer || buffer.length === 0) {
            throw new Error('Empty image buffer received');
        }

        console.log('Initializing dedicated OCR worker for extraction...');

        // Create a standalone worker using our safe approach
        const worker = await createSafeWorker();

        // Let Tesseract.js handle initialization internally
        console.log('Running OCR recognition...');
        const result = await worker.recognize(buffer);
        const extractedText = result.data.text || '';

        // Clean up
        console.log('Terminating OCR worker...');
        await worker.terminate();

        if (!extractedText.trim()) {
            console.warn('OCR returned empty text');
            return 'OCR extraction returned no text. The image might be of poor quality or contain no text.';
        }

        console.log(`OCR extracted ${extractedText.length} characters`);
        return cleanTextForOpenAI(extractedText);
    } catch (error: any) {
        console.error('OCR text extraction error:', error);
        return `OCR extraction failed: ${error.message}`;
    }
}