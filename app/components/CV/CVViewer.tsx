import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ICV } from '@/lib/cv-store';
import PDFViewer from '@/components/pdf-viewer';
import { FileText } from 'lucide-react';

interface CVViewerProps {
    cv: ICV | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CVViewer: React.FC<CVViewerProps> = ({ cv, open, onOpenChange }) => {
    if (!cv) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[90vh] p-4">
                <DialogHeader>
                    <DialogTitle>{cv.filename}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="h-full">
                        {cv.fileId ? (
                            <PDFViewer fileUrl={`/api/cv-store/${cv.id}`} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                    <h3 className="text-lg font-medium mb-1">No CV Available</h3>
                                    <p className="text-muted-foreground">This applicant doesn't have a CV uploaded.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CVViewer; 