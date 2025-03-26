import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ICV } from '@/lib/cv-store';
import { Eye, FileText, BarChart2, RefreshCw, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CVCardProps {
    cv: ICV;
    onView: (cv: ICV) => void;
    onViewAnalysis?: (cv: ICV) => void;
    onAnalyze?: (cv: ICV) => void;
    isAnalyzing?: boolean;
}

const CVCard: React.FC<CVCardProps> = ({
    cv,
    onView,
    onViewAnalysis,
    onAnalyze,
    isAnalyzing
}) => {
    const uploadDate = new Date(cv.uploadDate);
    const timeAgo = formatDistanceToNow(uploadDate, { addSuffix: true });

    // Filter and format tags for display
    const displayTags = React.useMemo(() => {
        if (!cv.tags || cv.tags.length === 0) return [];

        // Prioritize important tag categories
        const priorityCategories = ['lang:', 'dept:', 'field:', 'experience:'];
        const otherCategories = ['technical-skill:', 'soft-skill:', 'education:'];

        // Get priority tags first
        const priorityTags = cv.tags
            .filter(tag => priorityCategories.some(cat => tag.startsWith(cat)))
            .slice(0, 3); // Max 3 priority tags

        // If we have less than 5 priority tags, add other categories
        const remainingSlots = 5 - priorityTags.length;
        const additionalTags = remainingSlots > 0
            ? cv.tags
                .filter(tag => otherCategories.some(cat => tag.startsWith(cat)))
                .slice(0, remainingSlots)
            : [];

        return [...priorityTags, ...additionalTags];
    }, [cv.tags]);

    // Format tag for display
    const formatTag = (tag: string) => {
        const parts = tag.split(':');
        if (parts.length < 2) return tag;

        // Format based on tag type
        if (tag.startsWith('lang:')) {
            const [language, level] = parts[1].split('-');
            return `${language} (${level})`;
        }

        if (tag.startsWith('technical-skill:') || tag.startsWith('soft-skill:')) {
            // For skills with multiple parts (e.g. technical-skill:front-office:guest-check-in)
            return parts[parts.length - 1].replace(/-/g, ' ');
        }

        // Default formatting
        return parts[1].replace(/-/g, ' ');
    };

    // Get color for tag
    const getTagColor = (tag: string) => {
        if (tag.startsWith('lang:')) return 'bg-blue-100 text-blue-800';
        if (tag.startsWith('dept:')) return 'bg-green-100 text-green-800';
        if (tag.startsWith('field:')) return 'bg-purple-100 text-purple-800';
        if (tag.startsWith('experience:')) return 'bg-orange-100 text-orange-800';
        if (tag.startsWith('technical-skill:')) return 'bg-teal-100 text-teal-800';
        if (tag.startsWith('soft-skill:')) return 'bg-rose-100 text-rose-800';
        if (tag.startsWith('education:')) return 'bg-amber-100 text-amber-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Get display name using only the filename with cleaning
    const displayName = React.useMemo(() => {
        return cv.filename.replace(/\.(pdf|docx|doc)$/i, '').replace(/[_-]/g, ' ');
    }, [cv.filename]);

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate" title={displayName}>
                    <User className="h-4 w-4 inline mr-2" />
                    {displayName}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="text-xs text-gray-500 mb-3">
                    <p>Uploaded {timeAgo}</p>
                    {cv.analyzed && (
                        <p className="mt-1 text-green-600">Analysis complete</p>
                    )}
                    {cv.status === 'error' && (
                        <p className="mt-1 text-red-600">Analysis failed: {cv.error}</p>
                    )}
                    {cv.status === 'processing' && (
                        <p className="mt-1 text-blue-600">Analysis in progress...</p>
                    )}
                </div>

                {/* Display tags */}
                {cv.analyzed && displayTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {displayTags.map((tag, index) => (
                            <span
                                key={index}
                                className={`inline-flex text-[10px] px-2 py-0.5 rounded-full ${getTagColor(tag)}`}
                                title={tag}
                            >
                                {formatTag(tag)}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => onView(cv)}
                >
                    <Eye className="h-4 w-4 mr-2" /> View
                </Button>

                {cv.analyzed && onViewAnalysis && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => onViewAnalysis(cv)}
                    >
                        <BarChart2 className="h-4 w-4 mr-2" /> Analysis
                    </Button>
                )}

                {onAnalyze && !cv.analyzed && cv.status !== 'processing' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => onAnalyze(cv)}
                        disabled={isAnalyzing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        Analyze
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default CVCard; 