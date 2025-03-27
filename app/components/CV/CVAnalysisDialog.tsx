import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ICV } from '@/lib/cv-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, FileText, GraduationCap, BriefcaseBusiness, Award } from 'lucide-react';

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
            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] p-6 bg-background">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-semibold text-foreground">CV Analysis</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        Detailed analysis and extracted information from the CV
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <User className="h-5 w-5 text-primary" />
                                CV Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-base text-foreground">{cv.firstName && cv.lastName
                                        ? `${cv.firstName} ${cv.lastName}`
                                        : (cv.parsedData?.demographics?.firstName && cv.parsedData?.demographics?.lastName
                                            ? `${cv.parsedData.demographics.firstName} ${cv.parsedData.demographics.lastName}`
                                            : 'Not available')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-base text-foreground">{cv.email || cv.parsedData?.demographics?.email || 'Not available'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                    <p className="text-base text-foreground">{cv.phone || cv.parsedData?.demographics?.phone || 'Not available'}</p>
                                </div>
                                {(cv.age || cv.birthdate || cv.parsedData?.demographics?.birthdate) && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Age/Birthdate</p>
                                        <p className="text-base text-foreground">{cv.age
                                            ? `${cv.age} years`
                                            : (cv.birthdate || cv.parsedData?.demographics?.birthdate || 'Not available')}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Filename</p>
                                    <p className="text-base text-foreground">{cv.filename}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <FileText className="h-5 w-5 text-primary" />
                                Languages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysis.languages && analysis.languages.length > 0 ? (
                                    analysis.languages.map((lang, index) => (
                                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                                            {typeof lang === 'string' ? lang : `${lang.name} (${lang.level})`}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No languages detected</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                                Skills & Certifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Technical Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.technicalSkills && analysis.technicalSkills.length > 0 ? (
                                        analysis.technicalSkills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No technical skills detected</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Soft Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.softSkills && analysis.softSkills.length > 0 ? (
                                        analysis.softSkills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No soft skills detected</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Certifications</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.certifications && analysis.certifications.length > 0 ? (
                                        analysis.certifications.map((cert, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                                {cert}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No certifications detected</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                                Work Experience
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysis.experience && analysis.experience.length > 0 ? (
                                    analysis.experience.map((exp, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-muted/50 border-border">
                                            {typeof exp === 'string' ? (
                                                <p className="text-base text-foreground">{exp}</p>
                                            ) : (
                                                <>
                                                    <p className="font-medium text-base text-foreground">{exp.position}</p>
                                                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                                                    <p className="text-sm text-muted-foreground">{exp.duration}</p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No work experience detected</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                Education
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analysis.education && analysis.education.length > 0 ? (
                                    analysis.education.map((edu, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-muted/50 border-border">
                                            {typeof edu === 'string' ? (
                                                <p className="text-base text-foreground">{edu}</p>
                                            ) : (
                                                <>
                                                    <p className="font-medium text-base text-foreground">{edu.degree}</p>
                                                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                                                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No education detected</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CVAnalysisDialog; 