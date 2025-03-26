import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ICV } from '@/lib/cv-store';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Tags, User, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CVDemographicInfo from './CVDemographicInfo';

// Tag categories and their display names
const TAG_CATEGORIES = {
    'language': 'Languages',
    'education': 'Education',
    'experience': 'Experience',
    'position': 'Position',
    'field': 'Field of Study',
    'technical-skill': 'Technical Skills',
    'soft-skill': 'Soft Skills',
    'establishment': 'Establishment'
};

interface CVDetailDialogProps {
    cv: ICV | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CVDetailDialog: React.FC<CVDetailDialogProps> = ({
    cv,
    open,
    onOpenChange,
}) => {
    if (!cv) return null;

    const uploadDate = new Date(cv.uploadDate);
    const timeAgo = formatDistanceToNow(uploadDate, { addSuffix: true });

    // Function to download the original CV
    const handleDownload = async () => {
        if (!cv.fileId) return;

        try {
            window.open(`/api/files/${cv.fileId}?download=true`, '_blank');
        } catch (error) {
            console.error('Error downloading CV:', error);
        }
    };

    // Group tags by category
    const getTagsByCategory = () => {
        if (!cv.tags || cv.tags.length === 0) return {};

        const tagsByCategory: Record<string, string[]> = {};

        cv.tags.forEach(tag => {
            const parts = tag.split(':');
            if (parts.length >= 2) {
                const category = parts[0];
                if (!tagsByCategory[category]) {
                    tagsByCategory[category] = [];
                }
                tagsByCategory[category].push(tag);
            } else {
                // For tags without a category
                if (!tagsByCategory['other']) {
                    tagsByCategory['other'] = [];
                }
                tagsByCategory['other'].push(tag);
            }
        });

        return tagsByCategory;
    };

    // Format tag display value
    const formatTagDisplay = (tag: string) => {
        const parts = tag.split(':');
        if (parts.length < 2) return tag;

        let value = parts[1];

        // Handle additional parts for nested categories (e.g., technical-skill:front-office:guest-services)
        if (parts.length > 2) {
            value = parts.slice(1).join(' > ');
        }

        return value.replace(/-/g, ' ');
    };

    // Get color class for tag category
    const getTagColorClass = (category: string) => {
        switch (category) {
            case 'language': return 'bg-blue-100 text-blue-800';
            case 'education': return 'bg-amber-100 text-amber-800';
            case 'experience': return 'bg-orange-100 text-orange-800';
            case 'technical-skill': return 'bg-teal-100 text-teal-800';
            case 'soft-skill': return 'bg-rose-100 text-rose-800';
            case 'field': return 'bg-purple-100 text-purple-800';
            case 'position': return 'bg-indigo-100 text-indigo-800';
            case 'establishment': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const tagsByCategory = getTagsByCategory();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            {[cv.firstName, cv.lastName].filter(Boolean).join(' ') || cv.filename}
                        </div>
                        <Button size="sm" variant="outline" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </DialogTitle>
                    <DialogDescription>
                        Uploaded {timeAgo} • {cv.analyzed ? 'Analysis complete' : 'Not analyzed'}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="demographic" className="mt-4">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="demographic">
                            <User className="h-4 w-4 mr-2" />
                            Demographics
                        </TabsTrigger>
                        <TabsTrigger value="tags">
                            <Tags className="h-4 w-4 mr-2" />
                            Tags
                        </TabsTrigger>
                        <TabsTrigger value="analysis" disabled={!cv.analyzed}>
                            <FileText className="h-4 w-4 mr-2" />
                            Analysis
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="demographic" className="mt-2">
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <CVDemographicInfo cv={cv} />
                        </div>
                    </TabsContent>

                    <TabsContent value="tags" className="mt-2">
                        <div className="border rounded-lg p-4 bg-gray-50">
                            {cv.tags && cv.tags.length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(tagsByCategory).map(([category, tags]) => (
                                        <div key={category} className="space-y-2">
                                            <h3 className="text-sm font-medium">
                                                {TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES] || category}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className={getTagColorClass(category)}
                                                        title={tag}
                                                    >
                                                        {formatTagDisplay(tag)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No tags available for this CV.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-2">
                        <div className="border rounded-lg p-4 bg-gray-50">
                            {cv.analyzed ? (
                                <div className="space-y-4">
                                    {/* Languages */}
                                    {cv.analysis?.languages && cv.analysis.languages.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-sm border-b pb-1">Languages</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {cv.analysis.languages.map((language, idx) => (
                                                    <div key={idx} className="bg-blue-50 border border-blue-100 rounded-md p-2 flex items-center">
                                                        <span className="font-medium mr-2">{language.name}</span>
                                                        <Badge className="bg-blue-100 text-blue-800 border-none">
                                                            {language.level}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {cv.analysis?.education && cv.analysis.education.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-sm border-b pb-1">Education</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {cv.analysis.education.map((edu, idx) => (
                                                    <div key={idx} className="bg-amber-50 border border-amber-100 p-3 rounded-md">
                                                        <p className="font-medium">{edu.degree}</p>
                                                        <div className="flex justify-between mt-1 text-sm">
                                                            <span>{edu.school}</span>
                                                            <span className="text-gray-600">{edu.year}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Experience */}
                                    {cv.analysis?.experience && cv.analysis.experience.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-sm border-b pb-1">Experience</h3>
                                            <div className="space-y-3">
                                                {cv.analysis.experience.map((exp, idx) => (
                                                    <div key={idx} className="bg-orange-50 border border-orange-100 p-3 rounded-md">
                                                        <p className="font-medium">{exp.position}</p>
                                                        <div className="flex justify-between mt-1 text-sm">
                                                            <span>{exp.company}</span>
                                                            <span className="text-gray-600">{exp.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Technical Skills */}
                                        {cv.analysis?.technicalSkills && cv.analysis.technicalSkills.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-medium text-sm border-b pb-1">Technical Skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {cv.analysis.technicalSkills.map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="bg-teal-100 text-teal-800">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Soft Skills */}
                                        {cv.analysis?.softSkills && cv.analysis.softSkills.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-medium text-sm border-b pb-1">Soft Skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {cv.analysis.softSkills.map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="bg-rose-100 text-rose-800">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Certifications */}
                                    {cv.analysis?.certifications && cv.analysis.certifications.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-sm border-b pb-1">Certifications</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {cv.analysis.certifications.map((cert, idx) => (
                                                    <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-800">
                                                        {cert}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">This CV has not been analyzed yet.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CVDetailDialog; 