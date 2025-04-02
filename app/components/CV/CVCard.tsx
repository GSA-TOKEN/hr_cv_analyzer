import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ICV } from '@/lib/cv-store';
import { User, FileText, BarChart2, RefreshCw, Mail, Phone, Calendar, Tag, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CVDemographicInfo from './CVDemographicInfo';

interface CVCardProps {
    cv: ICV;
    onView: (cv: ICV) => void;
    onViewFile?: (cv: ICV) => void;
    onViewAnalysis?: (cv: ICV) => void;
    onAnalyze?: (cv: ICV) => void;
    onDelete?: (cv: ICV) => void;
    isAnalyzing?: boolean;
    isDeleting?: boolean;
}

const CVCard: React.FC<CVCardProps> = ({
    cv,
    onView,
    onViewFile,
    onViewAnalysis,
    onAnalyze,
    onDelete,
    isAnalyzing,
    isDeleting
}) => {
    const uploadDate = new Date(cv.uploadDate);
    const timeAgo = formatDistanceToNow(uploadDate, { addSuffix: true });

    // Get primary tags for display (prioritize important categories)
    const prioritizedTags = React.useMemo(() => {
        if (!cv.tags || cv.tags.length === 0) return [];

        // Define priority categories
        const priorityCategories = [
            'language:',
            'education:',
            'experience:',
            'position:',
            'field:'
        ];

        // Find one tag from each priority category
        return priorityCategories
            .map(prefix => cv.tags.find(tag => tag.startsWith(prefix)))
            .filter(Boolean) // Filter out undefined values
            .slice(0, 3); // Limit to 3 tags
    }, [cv.tags]);

    // Format tag for display
    const formatTagForDisplay = (tag: string) => {
        const parts = tag.split(':');
        if (parts.length < 2) return tag;

        const value = parts[1].replace(/-/g, ' ');

        // Special formatting for certain tag types
        if (tag.startsWith('language:')) {
            const [language, level] = value.split(' ');
            if (level) {
                return `${language} (${level})`;
            }
        }

        return value;
    };

    // Get tag color based on category
    const getTagColor = (tag: string) => {
        if (tag.startsWith('language:')) return 'bg-blue-100 text-blue-800';
        if (tag.startsWith('education:')) return 'bg-amber-100 text-amber-800';
        if (tag.startsWith('experience:')) return 'bg-orange-100 text-orange-800';
        if (tag.startsWith('position:')) return 'bg-indigo-100 text-indigo-800';
        if (tag.startsWith('field:')) return 'bg-purple-100 text-purple-800';
        if (tag.startsWith('technical-skill:')) return 'bg-teal-100 text-teal-800';
        if (tag.startsWith('soft-skill:')) return 'bg-rose-100 text-rose-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Get display name using firstName and lastName directly from CV or fallback to filename
    const displayName = React.useMemo(() => {
        if (cv.firstName || cv.lastName) {
            const nameParts = [];
            if (cv.firstName) nameParts.push(cv.firstName);
            if (cv.lastName) nameParts.push(cv.lastName);
            return nameParts.join(' ');
        }
        // Otherwise use the filename with cleaning
        return cv.filename.replace(/\.(pdf|docx|doc)$/i, '').replace(/[_-]/g, ' ');
    }, [cv.firstName, cv.lastName, cv.filename]);

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate flex items-center gap-1.5" title={displayName}>
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{displayName}</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow space-y-3">
                <div className="text-xs text-gray-500 flex justify-between">
                    <div>Uploaded {timeAgo}</div>
                    {cv.analyzed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5">
                            Analyzed
                        </Badge>
                    )}
                </div>

                {/* Demographic information */}
                <CVDemographicInfo cv={cv} compact={true} />

                {/* Display key tags if CV is analyzed */}
                {cv.analyzed && (
                    <div className="pt-2 border-t">
                        <div className="flex items-center text-xs text-gray-500 mb-1.5">
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            <span>Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {prioritizedTags.length > 0 ? (
                                prioritizedTags.map((tag, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className={`text-[10px] ${getTagColor(tag as string)}`}
                                        title={tag}
                                    >
                                        {formatTagForDisplay(tag as string)}
                                    </Badge>
                                ))
                            ) : (
                                cv.tags.slice(0, 3).map((tag, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className={`text-[10px] ${getTagColor(tag)}`}
                                        title={tag}
                                    >
                                        {formatTagForDisplay(tag)}
                                    </Badge>
                                ))
                            )}

                            {cv.tags.length > 3 && (
                                <Badge variant="outline" className="text-[10px]">
                                    +{cv.tags.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Analysis Summary (if analyzed) */}
                {cv.analyzed && cv.analysis && (
                    <div className="text-xs text-gray-500">
                        <div className="space-y-0.5">
                            {cv.analysis.languages && cv.analysis.languages.length > 0 && (
                                <div className="flex gap-1">
                                    <span className="font-medium">Languages:</span>
                                    <span className="truncate">{cv.analysis.languages.length}</span>
                                </div>
                            )}

                            {cv.analysis.technicalSkills && cv.analysis.technicalSkills.length > 0 && (
                                <div className="flex gap-1">
                                    <span className="font-medium">Technical Skills:</span>
                                    <span className="truncate">{cv.analysis.technicalSkills.length}</span>
                                </div>
                            )}

                            {cv.analysis.softSkills && cv.analysis.softSkills.length > 0 && (
                                <div className="flex gap-1">
                                    <span className="font-medium">Soft Skills:</span>
                                    <span className="truncate">{cv.analysis.softSkills.length}</span>
                                </div>
                            )}
                        </div>
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
                    <User className="h-4 w-4 mr-2" /> View
                </Button>

                {onViewFile && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => onViewFile(cv)}
                    >
                        <FileText className="h-4 w-4 mr-2" /> File
                    </Button>
                )}

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

                {!cv.analyzed && onAnalyze && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => onAnalyze(cv)}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" /> Analyze
                            </>
                        )}
                    </Button>
                )}

                {onDelete && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(cv)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default CVCard; 