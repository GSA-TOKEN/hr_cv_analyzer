import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ICV } from '@/lib/cv-store';
import { Eye, FileText, BarChart2, RefreshCw } from 'lucide-react';
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

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate" title={cv.filename}>
                    <FileText className="h-4 w-4 inline mr-2" />
                    {cv.filename}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow text-xs text-gray-500">
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