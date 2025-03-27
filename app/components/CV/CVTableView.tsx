import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ICV } from '@/lib/cv-store';
import { Eye, FileText, BarChart2, User, Mail, Phone, Calendar, BriefcaseBusiness, Tag, ChevronDown, UserCircle2 } from 'lucide-react';
import { formatDistanceToNow, parseISO, parse, differenceInYears } from 'date-fns';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface CVTableViewProps {
    cvs: ICV[];
    onView: (cv: ICV) => void;
    onViewFile?: (cv: ICV) => void;
    onViewAnalysis?: (cv: ICV) => void;
}

// Tag categories and their display names
const TAG_CATEGORIES = {
    'language': 'Languages',
    'education': 'Education',
    'experience': 'Experience',
    'position': 'Position',
    'field': 'Field',
    'technical-skill': 'Technical Skills',
    'soft-skill': 'Soft Skills',
    'establishment': 'Establishment'
};

// Tag Badge component with improved formatting
const TagBadge = ({ tag }: { tag: string }) => {
    const parts = tag.split(':');
    const category = parts[0];
    let displayValue = parts.length > 1 ? parts[1] : tag;
    let bgClass = '';

    // Set colors based on category
    switch (category) {
        case 'language':
            bgClass = 'bg-blue-100 text-blue-800 border-blue-200';
            break;
        case 'education':
            bgClass = 'bg-amber-100 text-amber-800 border-amber-200';
            break;
        case 'experience':
            bgClass = 'bg-orange-100 text-orange-800 border-orange-200';
            break;
        case 'technical-skill':
            bgClass = 'bg-teal-100 text-teal-800 border-teal-200';
            break;
        case 'soft-skill':
            bgClass = 'bg-rose-100 text-rose-800 border-rose-200';
            break;
        case 'field':
            bgClass = 'bg-purple-100 text-purple-800 border-purple-200';
            break;
        case 'position':
            bgClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
            break;
        case 'establishment':
            bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            break;
        default:
            bgClass = 'bg-gray-100 text-gray-800 border-gray-200';
    }

    return (
        <Badge
            variant="outline"
            className={`text-xs whitespace-nowrap ${bgClass} border px-2 py-0.5`}
            title={tag}
        >
            {displayValue.replace(/-/g, ' ')}
        </Badge>
    );
};

// Tag categories display component
const TagCategories = ({ tags }: { tags: string[] }) => {
    // Group tags by category
    const tagsByCategory: Record<string, string[]> = {};

    tags.forEach(tag => {
        const parts = tag.split(':');
        if (parts.length >= 2) {
            const category = parts[0];
            if (!tagsByCategory[category]) {
                tagsByCategory[category] = [];
            }
            tagsByCategory[category].push(tag);
        }
    });

    return (
        <div className="space-y-3 p-3">
            {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
                <div key={category} className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-700">
                        {TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES] || category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {categoryTags.map((tag, idx) => (
                            <TagBadge key={idx} tag={tag} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CVTableView: React.FC<CVTableViewProps> = ({
    cvs,
    onView,
    onViewFile,
    onViewAnalysis
}) => {
    // Format salary for display
    const formatSalary = (salary?: number) => {
        if (!salary) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(salary);
    };

    // Format tags display with priority categories
    const formatTags = (tags: string[]) => {
        if (!tags || tags.length === 0) return '-';

        // Group tags by category
        const tagsByCategory: Record<string, string[]> = {};

        tags.forEach(tag => {
            const parts = tag.split(':');
            if (parts.length >= 2) {
                const category = parts[0];
                if (!tagsByCategory[category]) {
                    tagsByCategory[category] = [];
                }
                tagsByCategory[category].push(tag);
            }
        });

        // Get important tag categories
        const priorityCategories = ['language', 'education', 'experience', 'position', 'field'];
        const priorityTags = priorityCategories.flatMap(category => tagsByCategory[category] || []);

        // Display priority tags first, then others up to the limit
        const displayTags = [...priorityTags, ...tags.filter(tag => !priorityTags.includes(tag))];

        return (
            <div className="flex items-center">
                <div className="flex flex-wrap gap-1 mr-2">
                    {displayTags.slice(0, 3).map((tag, index) => (
                        <TagBadge key={index} tag={tag} />
                    ))}
                </div>

                {tags.length > 3 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                                <Tag className="h-3 w-3 mr-1" />
                                +{tags.length - 3} more
                                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right" className="w-80">
                            <div className="font-medium text-sm pb-1.5 border-b mb-1.5">
                                All Tags ({tags.length})
                            </div>
                            <TagCategories tags={tags} />
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        );
    };

    // Get full name
    const getFullName = (cv: ICV) => {
        if (cv.firstName || cv.lastName) {
            return [cv.firstName, cv.lastName].filter(Boolean).join(' ');
        }
        return cv.filename.replace(/\.(pdf|docx|doc)$/i, '');
    };

    // Format time ago
    const getTimeAgo = (date: string | Date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (e) {
            return '-';
        }
    };

    // Format analysis overview
    const getAnalysisOverview = (cv: ICV) => {
        if (!cv.analyzed || !cv.analysis) return null;

        const { analysis } = cv;
        const items = [];

        if (analysis.languages && analysis.languages.length > 0) {
            items.push(`${analysis.languages.length} languages`);
        }

        if (analysis.technicalSkills && analysis.technicalSkills.length > 0) {
            items.push(`${analysis.technicalSkills.length} tech skills`);
        }

        if (analysis.softSkills && analysis.softSkills.length > 0) {
            items.push(`${analysis.softSkills.length} soft skills`);
        }

        if (analysis.experience && analysis.experience.length > 0) {
            items.push(`${analysis.experience.length} experiences`);
        }

        if (items.length === 0) return null;

        return (
            <div className="text-xs text-gray-500 mt-1">
                {items.join(' • ')}
            </div>
        );
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

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[180px]">Candidate</TableHead>
                        <TableHead className="min-w-[180px]">Contact</TableHead>
                        <TableHead className="min-w-[160px]">Demographics</TableHead>
                        <TableHead className="min-w-[250px]">Tags & Analysis</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="text-right w-[120px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cvs.map((cv) => (
                        <TableRow key={cv.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-gray-500" />
                                        <span className="font-medium">{getFullName(cv)}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        Uploaded {getTimeAgo(cv.uploadDate)}
                                    </span>
                                    {getAnalysisOverview(cv)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm space-y-1">
                                    {cv.email && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-xs truncate max-w-[150px]" title={cv.email}>{cv.email}</span>
                                        </div>
                                    )}
                                    {cv.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-xs">{cv.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm space-y-1">
                                    {(cv.age || cv.birthdate) && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-xs">Age: {getAge(cv) || 'Unknown'}</span>
                                        </div>
                                    )}
                                    {cv.gender && (
                                        <div className="flex items-center gap-1.5">
                                            <UserCircle2 className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-xs">Gender: {cv.gender}</span>
                                        </div>
                                    )}
                                    {cv.department && (
                                        <div className="flex items-center gap-1.5">
                                            <BriefcaseBusiness className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-xs">{cv.department}</span>
                                        </div>
                                    )}
                                    {cv.expectedSalary && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs">Salary: {formatSalary(cv.expectedSalary)}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {formatTags(cv.tags)}
                            </TableCell>
                            <TableCell>
                                {cv.analyzed ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Analyzed
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-gray-100">
                                        Pending
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onView(cv)}
                                        title="View profile"
                                    >
                                        <User className="h-4 w-4" />
                                    </Button>

                                    {onViewFile && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewFile(cv)}
                                            title="View CV file"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {cv.analyzed && onViewAnalysis && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewAnalysis(cv)}
                                            title="View analysis"
                                        >
                                            <BarChart2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {cvs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                No candidates found with the current filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CVTableView; 