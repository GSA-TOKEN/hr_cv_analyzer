import { NextResponse } from 'next/server';

// Sample mock CVs with properly formatted tags
const mockCVs = [
    {
        id: 'cv1',
        filename: 'john_smith_resume.pdf',
        uploadDate: new Date('2023-10-12'),
        analyzed: true,
        status: 'completed',
        fileId: 'file1',
        tags: [
            'age:23-28',
            'language:english-fluent',
            'language:german-intermediate',
            'education:bachelors-degree',
            'field:hospitality-management',
            'experience:1-3-years',
            'establishment:luxury-resort',
            'position:specialist',
            'technical-skill:front-office:guest-check-in',
            'technical-skill:front-office:reservation-management',
            'soft-skill:communication',
            'soft-skill:problem-solving'
        ],
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        age: 26
    },
    {
        id: 'cv2',
        filename: 'emily_johnson_cv.pdf',
        uploadDate: new Date('2023-11-05'),
        analyzed: true,
        status: 'completed',
        fileId: 'file2',
        tags: [
            'age:29-35',
            'language:english-native',
            'language:spanish-intermediate',
            'language:french-basic',
            'education:masters-degree',
            'field:marketing-communications',
            'experience:3-5-years',
            'establishment:chain-hotel',
            'position:manager',
            'technical-skill:it-technical:digital-marketing',
            'technical-skill:it-technical:social-media-management',
            'soft-skill:leadership',
            'soft-skill:creative-thinking'
        ],
        email: 'emily.j@example.com',
        phone: '+1 (555) 987-6543',
        age: 32
    },
    {
        id: 'cv3',
        filename: 'alex_wong_resume.pdf',
        uploadDate: new Date('2023-12-18'),
        analyzed: true,
        status: 'completed',
        fileId: 'file3',
        tags: [
            'age:23-28',
            'language:english-fluent',
            'language:chinese-native',
            'education:bachelors-degree',
            'field:culinary-arts',
            'experience:1-3-years',
            'establishment:restaurant-bar',
            'position:specialist',
            'technical-skill:fb-kitchen:menu-planning',
            'technical-skill:fb-kitchen:food-safety',
            'soft-skill:attention-to-detail',
            'soft-skill:time-management'
        ],
        email: 'alexw@example.com',
        phone: '+1 (555) 456-7890',
        age: 25
    },
    {
        id: 'cv4',
        filename: 'sarah_miller_cv.pdf',
        uploadDate: new Date('2024-01-10'),
        analyzed: true,
        status: 'completed',
        fileId: 'file4',
        tags: [
            'age:36-45',
            'language:english-native',
            'language:italian-intermediate',
            'education:masters-degree',
            'field:human-resources',
            'experience:5-10-years',
            'establishment:luxury-resort',
            'position:department-head',
            'technical-skill:accounting-finance:payroll-management',
            'technical-skill:accounting-finance:budgeting',
            'soft-skill:leadership',
            'soft-skill:conflict-management'
        ],
        email: 'sarah.m@example.com',
        phone: '+1 (555) 789-0123',
        age: 38
    },
    {
        id: 'cv5',
        filename: 'miguel_garcia_resume.pdf',
        uploadDate: new Date('2024-02-05'),
        analyzed: true,
        status: 'completed',
        fileId: 'file5',
        tags: [
            'age:23-28',
            'language:english-advanced',
            'language:spanish-native',
            'education:bachelors-degree',
            'field:tourism',
            'experience:less-than-1-year',
            'establishment:tour-operator',
            'position:entry-level',
            'technical-skill:front-office:customer-service',
            'technical-skill:it-technical:booking-systems',
            'soft-skill:communication',
            'soft-skill:adaptability'
        ],
        email: 'miguel.g@example.com',
        phone: '+1 (555) 234-5678',
        age: 24
    },
    {
        id: 'cv6',
        filename: 'lisa_chen_cv.pdf',
        uploadDate: new Date('2024-02-20'),
        analyzed: true,
        status: 'completed',
        fileId: 'file6',
        tags: [
            'age:29-35',
            'language:english-fluent',
            'language:chinese-native',
            'education:masters-degree',
            'field:finance-accounting',
            'experience:3-5-years',
            'establishment:business-hotel',
            'position:manager',
            'technical-skill:accounting-finance:financial-analysis',
            'technical-skill:accounting-finance:revenue-management',
            'soft-skill:analytical-thinking',
            'soft-skill:attention-to-detail'
        ],
        email: 'lisa.chen@example.com',
        phone: '+1 (555) 345-6789',
        age: 31
    },
    {
        id: 'cv7',
        filename: 'david_brown_resume.pdf',
        uploadDate: new Date('2024-03-05'),
        analyzed: true,
        status: 'completed',
        fileId: 'file7',
        tags: [
            'age:18-22',
            'language:english-native',
            'language:french-basic',
            'education:associate-degree',
            'field:culinary-arts',
            'experience:less-than-1-year',
            'establishment:restaurant-bar',
            'position:entry-level',
            'technical-skill:fb-kitchen:food-preparation',
            'technical-skill:fb-kitchen:kitchen-safety',
            'soft-skill:teamwork',
            'soft-skill:willingness-to-learn'
        ],
        email: 'david.b@example.com',
        phone: '+1 (555) 456-7891',
        age: 21
    },
    {
        id: 'cv8',
        filename: 'anna_schmidt_cv.pdf',
        uploadDate: new Date('2024-03-15'),
        analyzed: true,
        status: 'completed',
        fileId: 'file8',
        tags: [
            'age:36-45',
            'language:english-advanced',
            'language:german-native',
            'education:bachelors-degree',
            'field:hospitality-management',
            'experience:10+-years',
            'establishment:boutique-property',
            'position:director',
            'technical-skill:front-office:guest-relations',
            'technical-skill:front-office:revenue-optimization',
            'soft-skill:leadership',
            'soft-skill:strategic-thinking'
        ],
        email: 'anna.s@example.com',
        phone: '+1 (555) 567-8901',
        age: 42
    }
];

export async function GET() {
    return NextResponse.json({ cvs: mockCVs });
}

export const dynamic = 'force-dynamic'; 