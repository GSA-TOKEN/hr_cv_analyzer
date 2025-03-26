import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CVUploaderProps {
    onUploadComplete: () => void;
}

const CVUploader: React.FC<CVUploaderProps> = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        setIsUploading(true);
        const formData = new FormData();

        // Add all files to form data
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('/api/cvs/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to upload file');
            }

            toast.success("Success", {
                description: `${files.length > 1 ? `${files.length} files` : 'File'} uploaded successfully.`
            });

            onUploadComplete();
        } catch (error: any) {
            toast.error("Upload failed", {
                description: error.message || "There was a problem with the upload."
            });
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card
            className={`border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="mb-4 mt-2">
                    <div className="p-3 rounded-full bg-primary/10 inline-block">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-medium mb-2">Upload CV Files</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                    Supports PDF, DOCX, JPG, PNG files
                </p>
                <Button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4" />
                            Select Files
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default CVUploader; 