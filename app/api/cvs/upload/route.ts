import { NextResponse } from 'next/server';
import { saveCVFile } from '@/lib/cv-store';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files were uploaded' },
                { status: 400 }
            );
        }

        const results = [];

        for (const file of files) {
            const savedCV = await saveCVFile(file);
            results.push(savedCV);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully uploaded ${files.length} file(s)`,
            cvs: results
        });
    } catch (error: any) {
        console.error('Error uploading CV:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload CV' },
            { status: 500 }
        );
    }
} 