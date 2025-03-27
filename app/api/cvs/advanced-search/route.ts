import { NextRequest, NextResponse } from 'next/server';
import CV from '@/models/CV';
import { connectDB } from '@/lib/mongodb';

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
        if (demographic && Object.keys(demographic).length > 0) {
            const demographicQuery: any = {};

            // First and Last name (partial match)
            if (demographic.firstName) {
                demographicQuery.firstName = { $regex: demographic.firstName, $options: 'i' };
            }
            if (demographic.lastName) {
                demographicQuery.lastName = { $regex: demographic.lastName, $options: 'i' };
            }

            // Department (partial match)
            if (demographic.department) {
                demographicQuery.department = { $regex: demographic.department, $options: 'i' };
            }

            // Age range
            if (demographic.age && Array.isArray(demographic.age) && demographic.age.length === 2) {
                demographicQuery.age = {
                    $gte: demographic.age[0],
                    $lte: demographic.age[1]
                };
            }

            // Expected salary range
            if (demographic.expectedSalary && Array.isArray(demographic.expectedSalary) && demographic.expectedSalary.length === 2) {
                demographicQuery.expectedSalary = {
                    $gte: demographic.expectedSalary[0],
                    $lte: demographic.expectedSalary[1]
                };
            }

            // Only add demographic query if it has conditions
            if (Object.keys(demographicQuery).length > 0) {
                query.$and = query.$and || [];
                query.$and.push(demographicQuery);
            }
        }

        // Pagination parameters
        const page = searchParams.page || 1;
        const limit = searchParams.limit || 20;
        const skip = (page - 1) * limit;

        console.log('MongoDB query:', JSON.stringify(query));

        // Execute query with pagination
        const cvs = await CV.find(query)
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await CV.countDocuments(query);

        // Transform CV data to ensure all required fields are included
        const formattedCVs = cvs.map(cv => {
            // Get string representation of _id and handle case when it might be undefined
            const idString = cv._id ? cv._id.toString() : '';

            // Create formatted CV with all fields
            const formattedCV = {
                ...cv,
                id: idString,
                _id: idString,
                // Ensure all required fields exist with defaults if missing
                tags: cv.tags || [],
                analysis: cv.analysis || {},
                firstName: cv.firstName || '',
                lastName: cv.lastName || '',
                email: cv.email || '',
                phone: cv.phone || '',
                department: cv.department || '',
                birthdate: cv.birthdate || '',
                age: cv.age || null,
                expectedSalary: cv.expectedSalary || null,
                status: cv.status || 'pending',
            };
            return formattedCV;
        });

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
        console.error('Error in CV search API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to search CVs' },
            { status: 500 }
        );
    }
} 