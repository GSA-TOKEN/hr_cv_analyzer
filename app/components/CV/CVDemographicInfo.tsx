import React from 'react';
import { Calendar, Briefcase, Mail, Phone, DollarSign, User } from 'lucide-react';
import { ICV } from '@/lib/cv-store';
import { Badge } from '@/components/ui/badge';

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

    if (compact) {
        // Compact view for cards
        return (
            <div className="text-sm space-y-1">
                {(cv.firstName || cv.lastName) && (
                    <div className="font-medium flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                        {[cv.firstName, cv.lastName].filter(Boolean).join(' ')}
                    </div>
                )}
                {cv.age && (
                    <div className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {cv.age} years old
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

                {cv.age && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                            <div className="text-sm text-gray-500">Age</div>
                            <div>{cv.age} years old</div>
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