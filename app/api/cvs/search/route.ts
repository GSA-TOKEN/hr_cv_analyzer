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

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const searchParams = await req.json();

        // Build MongoDB query based on search parameters
        const query: any = {};

        // Handle text search (across multiple fields)
        if (searchParams.searchTerm) {
            query.$text = { $search: searchParams.searchTerm };
        }

        // Handle tag filtering
        if (searchParams.tags && searchParams.tags.length > 0) {
            query.tags = { $all: searchParams.tags };
        }

        // Handle demographic filters
        const { demographic } = searchParams;
        if (demographic) {
            // First and Last name (partial match)
            if (demographic.firstName) {
                query.firstName = { $regex: demographic.firstName, $options: 'i' };
            }
            if (demographic.lastName) {
                query.lastName = { $regex: demographic.lastName, $options: 'i' };
            }

            // Department (partial match)
            if (demographic.department) {
                query.department = { $regex: demographic.department, $options: 'i' };
            }

            // Age range
            if (demographic.age && Array.isArray(demographic.age) && demographic.age.length === 2) {
                query.age = {
                    $gte: demographic.age[0],
                    $lte: demographic.age[1]
                };
            }

            // Expected salary range
            if (demographic.expectedSalary && Array.isArray(demographic.expectedSalary) && demographic.expectedSalary.length === 2) {
                query.expectedSalary = {
                    $gte: demographic.expectedSalary[0],
                    $lte: demographic.expectedSalary[1]
                };
            }

            // Email (partial match)
            if (demographic.email) {
                query.email = { $regex: demographic.email, $options: 'i' };
            }

            // Phone (partial match)
            if (demographic.phone) {
                query.phone = { $regex: demographic.phone, $options: 'i' };
            }

            // Birthdate (exact match)
            if (demographic.birthdate) {
                query.birthdate = demographic.birthdate;
            }

            // Gender (exact match)
            if (demographic.gender) {
                query.gender = demographic.gender;
            }
        }

        // Pagination parameters
        const page = searchParams.page || 1;
        const limit = searchParams.limit || 20;
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const cvs = await CV.find(query)
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await CV.countDocuments(query);

        return NextResponse.json({
            cvs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Error in CV search API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to search CVs' },
            { status: 500 }
        );
    }
} 