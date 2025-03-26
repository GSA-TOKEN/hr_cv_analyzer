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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CVAnalysisDialogProps {
    cv: ICV | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CVAnalysisDialog: React.FC<CVAnalysisDialogProps> = ({
    cv,
    open,
    onOpenChange,
}) => {
    if (!cv) return null;

    const parsedData = cv.parsedData || {};
    const analysis = cv.analysis || {
        languages: [],
        education: [],
        experience: [],
        technicalSkills: [],
        softSkills: [],
        certifications: [],
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">CV Analysis: {cv.filename}</DialogTitle>
                    <DialogDescription>
                        Analysis results and extracted information from the CV
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="summary" className="mt-4">
                    <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="experience">Experience</TabsTrigger>
                        <TabsTrigger value="education">Education</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">CV Overview</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p>{cv.firstName && cv.lastName
                                        ? `${cv.firstName} ${cv.lastName}`
                                        : (cv.parsedData?.demographics?.firstName && cv.parsedData?.demographics?.lastName
                                            ? `${cv.parsedData.demographics.firstName} ${cv.parsedData.demographics.lastName}`
                                            : 'Not available')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p>{cv.email || cv.parsedData?.demographics?.email || 'Not available'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p>{cv.phone || cv.parsedData?.demographics?.phone || 'Not available'}</p>
                                </div>
                                {(cv.age || cv.birthdate || cv.parsedData?.demographics?.birthdate) && (
                                    <div>
                                        <p className="text-sm text-gray-500">Age/Birthdate</p>
                                        <p>{cv.age
                                            ? `${cv.age} years`
                                            : (cv.birthdate || cv.parsedData?.demographics?.birthdate || 'Not available')}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Filename</p>
                                    <p>{cv.filename}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium">Languages</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analysis.languages && analysis.languages.length > 0 ? (
                                    analysis.languages.map((lang, index) => (
                                        <Badge key={index} variant="outline" className="text-sm">
                                            {typeof lang === 'string' ? lang : `${lang.name} (${lang.level})`}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No languages detected</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium">All Tags</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {cv.tags && cv.tags.length > 0 ? (
                                    cv.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-sm">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No tags generated</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Technical Skills</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analysis.technicalSkills && analysis.technicalSkills.length > 0 ? (
                                    analysis.technicalSkills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-sm">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No technical skills detected</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium">Soft Skills</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analysis.softSkills && analysis.softSkills.length > 0 ? (
                                    analysis.softSkills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-sm">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No soft skills detected</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium">Certifications</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {analysis.certifications && analysis.certifications.length > 0 ? (
                                    analysis.certifications.map((cert, index) => (
                                        <Badge key={index} variant="outline" className="text-sm">
                                            {cert}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No certifications detected</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Work Experience</h3>
                            <div className="space-y-3 mt-2">
                                {analysis.experience && analysis.experience.length > 0 ? (
                                    analysis.experience.map((exp, index) => (
                                        <div key={index} className="border rounded-lg p-3">
                                            {typeof exp === 'string' ? (
                                                <p>{exp}</p>
                                            ) : (
                                                <>
                                                    <p className="font-medium">{exp.position}</p>
                                                    <p className="text-sm">{exp.company}</p>
                                                    <p className="text-sm text-gray-500">{exp.duration}</p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No work experience detected</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Education</h3>
                            <div className="space-y-3 mt-2">
                                {analysis.education && analysis.education.length > 0 ? (
                                    analysis.education.map((edu, index) => (
                                        <div key={index} className="border rounded-lg p-3">
                                            {typeof edu === 'string' ? (
                                                <p>{edu}</p>
                                            ) : (
                                                <>
                                                    <p className="font-medium">{edu.degree}</p>
                                                    <p className="text-sm">{edu.school}</p>
                                                    <p className="text-sm text-gray-500">{edu.year}</p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No education history detected</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CVAnalysisDialog; 