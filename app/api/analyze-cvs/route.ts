import { NextRequest } from 'next/server';
import { cvStore } from '@/lib/cv-store';
import { analyzeCV } from '@/lib/cv-analyzer';

export async function POST(request: NextRequest) {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids)) {
            return new Response('Invalid request body', { status: 400 });
        }

        const results = await Promise.all(ids.map(async (id) => {
            const cv = cvStore.getCV(id);
            if (!cv) return { id, success: false, error: 'CV not found' };

            try {
                // Create a File object from the CV path
                const buffer = require('fs').readFileSync(cv.path);
                const file = new File([buffer], cv.filename, { type: 'application/pdf' });

                // Analyze the CV
                const analysis = await analyzeCV(file);

                // Update CV with analysis results
                const updatedCV = cvStore.updateCVAge(id, analysis.age);
                if (!updatedCV) {
                    throw new Error('Failed to update CV age');
                }

                // Mark as analyzed and add any relevant tags
                const analyzedCV = cvStore.updateCVTags(id, analysis.tags);
                if (!analyzedCV) {
                    throw new Error('Failed to update CV tags');
                }

                return { id, success: true };
            } catch (error) {
                console.error(`Error analyzing CV ${id}:`, error);
                return { id, success: false, error: 'Analysis failed' };
            }
        }));

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in analyze-cvs route:', error);
        return new Response('Internal server error', { status: 500 });
    }
} 