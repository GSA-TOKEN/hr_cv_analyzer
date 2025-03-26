import { NextRequest, NextResponse } from 'next/server';
import CV from '@/models/CV';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        // Connect to MongoDB
        await connectDB();

        // Get search parameters from URL
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query') || '';
        const tags = searchParams.getAll('tags');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const skip = (page - 1) * limit;

        // Prepare search filter
        const filter: any = {};

        // Add text search if query provided
        if (query) {
            filter.$text = { $search: query };
        }

        // Add tag filtering if tags provided
        if (tags && tags.length > 0) {
            filter.tags = { $all: tags };
        }

        // Get total count for pagination
        const total = await CV.countDocuments(filter);

        // Get CVs with pagination
        const cvs = await CV.find(filter)
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Format CV response
        const formattedCVs = cvs.map((cv: any) => ({
            id: cv._id.toString(),
            filename: cv.filename,
            uploadDate: cv.uploadDate,
            analyzed: cv.analyzed,
            status: cv.status || 'pending',
            error: cv.error,
            fileId: cv.fileId,
            tags: cv.tags || [],
            analysis: cv.analysis || {},
            email: cv.email,
            phone: cv.phone,
            age: cv.age,
            department: cv.department,
            expectedSalary: cv.expectedSalary
        }));

        // Return response with pagination metadata
        return NextResponse.json({
            cvs: formattedCVs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Error searching CVs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to search CVs' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
            'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        },
    });
} 