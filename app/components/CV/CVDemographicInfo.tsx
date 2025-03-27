import React from 'react';
import { Calendar, Briefcase, Mail, Phone, DollarSign, User, UserCircle2 } from 'lucide-react';
import { ICV } from '@/lib/cv-store';
import { Badge } from '@/components/ui/badge';
import { parseISO, parse, differenceInYears } from 'date-fns';

interface CVDemographicInfoProps {
    cv: ICV;
    compact?: boolean;
}

const CVDemographicInfo: React.FC<CVDemographicInfoProps> = ({ cv, compact = false }) => {
    // Format expected salary if it exists
    const formatSalary = (salary?: number) => {
        if (!salary) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(salary);
    };

    // Calculate age from birthdate if age is not provided directly
    const getAge = (cv: ICV): number | null => {
        // If age is already provided, use it
        if (cv.age) {
            return cv.age;
        }

        // Try to calculate from birthdate if available
        if (cv.birthdate) {
            try {
                let birthDate: Date | null = null;
                const birthdateStr = cv.birthdate.trim();

                // Simple parsing for YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(birthdateStr)) {
                    const [year, month, day] = birthdateStr.split('-').map(Number);
                    birthDate = new Date(year, month - 1, day);
                }
                // MM/DD/YYYY format
                else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(birthdateStr)) {
                    const [month, day, year] = birthdateStr.split('/').map(Number);
                    birthDate = new Date(year, month - 1, day);
                }
                // DD/MM/YYYY format
                else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(birthdateStr)) {
                    const [day, month, year] = birthdateStr.split('.').map(Number);
                    birthDate = new Date(year, month - 1, day);
                }
                // Other formats via date-fns
                else {
                    try {
                        // Try different formats
                        const formatAttempts = [
                            'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd',
                            'MMMM d, yyyy', 'MMM d, yyyy', 'MMMM d yyyy', 'MMM d yyyy'
                        ];

                        for (const format of formatAttempts) {
                            try {
                                birthDate = parse(birthdateStr, format, new Date());
                                if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
                                    break;
                                }
                            } catch (e) {
                                // Continue to next format
                            }
                        }
                    } catch (e) {
                        // If all parsing attempts fail, extract year if possible
                        const yearMatch = birthdateStr.match(/\b(19\d{2}|20\d{2})\b/);
                        if (yearMatch && yearMatch.length > 0) {
                            const birthYear = parseInt(yearMatch[0]);
                            return new Date().getFullYear() - birthYear;
                        }
                    }
                }

                // Calculate age if we have a valid birthdate
                if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();

                    // Adjust age if birthday hasn't occurred yet this year
                    if (
                        today.getMonth() < birthDate.getMonth() ||
                        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
                    ) {
                        age--;
                    }

                    return age;
                }
            } catch (error) {
                console.error('Error calculating age from birthdate:', error);
            }
        }

        return null;
    };

    // Get calculated age
    const age = getAge(cv);

    if (compact) {
        // Compact view for cards
        return (
            <div className="text-sm space-y-1">
                {age && (
                    <div className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {age} years old
                    </div>
                )}
                {cv.gender && (
                    <div className="text-gray-500 flex items-center gap-1">
                        <UserCircle2 className="h-3.5 w-3.5" />
                        {cv.gender}
                    </div>
                )}
                {cv.department && (
                    <div className="text-gray-500 flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {cv.department}
                    </div>
                )}
            </div>
        );
    }

    // Full detailed view
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Personal Info */}
            <div className="space-y-3">
                {(cv.firstName || cv.lastName) && (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Full Name</div>
                            <div className="font-medium">{[cv.firstName, cv.lastName].filter(Boolean).join(' ')}</div>
                        </div>
                    </div>
                )}

                {age && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Age</div>
                            <div>{age} years old</div>
                        </div>
                    </div>
                )}

                {cv.gender && (
                    <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Gender</div>
                            <div>{cv.gender}</div>
                        </div>
                    </div>
                )}

                {cv.birthdate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Birthdate</div>
                            <div>{cv.birthdate}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contact & Professional Info */}
            <div className="space-y-3">
                {cv.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="font-medium break-all">{cv.email}</div>
                        </div>
                    </div>
                )}

                {cv.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div>{cv.phone}</div>
                        </div>
                    </div>
                )}

                {cv.department && (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Department</div>
                            <div>{cv.department}</div>
                        </div>
                    </div>
                )}

                {cv.expectedSalary && (
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Expected Salary</div>
                            <div>{formatSalary(cv.expectedSalary)}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tags */}
            {cv.tags && cv.tags.length > 0 && (
                <div className="col-span-1 md:col-span-2 mt-2">
                    <div className="text-sm text-gray-500 mb-1">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                        {cv.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVDemographicInfo; 