"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, RefreshCw, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface PDFViewerProps {
    fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [fileType, setFileType] = useState<'pdf' | 'image' | 'other'>('other');

    // Determine file type from URL or content type
    const determineFileType = (url: string, contentType?: string) => {
        if (contentType) {
            if (contentType.includes('pdf')) return 'pdf';
            if (contentType.includes('image')) return 'image';
            return 'other';
        }

        const extension = url.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
        return 'other';
    };

    // Handle opening in new tab
    const openDirectInNewTab = () => {
        window.open(fileUrl, '_blank');
    };

    // Handle zoom controls
    const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => setZoom(1);

    // Handle rotation
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    // Function to retry loading
    const retryLoading = () => {
        setIsLoading(true);
        setHasError(false);
        checkFile();
    };

    // Check if the file is available
    const checkFile = async () => {
        try {
            setIsLoading(true);

            if (fileUrl.startsWith('http')) {
                const response = await fetch(fileUrl, { method: 'HEAD' });
                if (response.ok) {
                    setFileType(determineFileType(fileUrl, response.headers.get('content-type') || undefined));
                }
                setIsLoading(false);
                return;
            }

            const response = await fetch(fileUrl, { method: 'HEAD' });
            if (!response.ok) {
                setHasError(true);
                setErrorMessage(`Server returned status ${response.status}: ${response.statusText}`);
            } else {
                setFileType(determineFileType(fileUrl, response.headers.get('content-type') || undefined));
                setHasError(false);
            }
        } catch (error) {
            console.error('Error checking file:', error);
            setHasError(true);
            setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkFile();
    }, [fileUrl]);

    const renderContent = () => {
        const style = {
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
        };

        if (fileType === 'image') {
            return (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 overflow-auto">
                    <img
                        src={fileUrl}
                        alt="Document preview"
                        className="max-w-full max-h-full object-contain"
                        style={style}
                        onError={() => setHasError(true)}
                    />
                </div>
            );
        }

        return (
            <iframe
                src={fileUrl}
                className="w-full h-full"
                style={{ border: 'none', ...style }}
            />
        );
    };

    return (
        <div className="flex flex-col h-full w-full">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : hasError ? (
                <div className="bg-red-50 text-red-800 p-4 rounded text-center flex flex-col items-center">
                    <p className="font-medium">Error loading file</p>
                    {errorMessage && (
                        <p className="text-sm mt-2 max-w-md overflow-auto">{errorMessage}</p>
                    )}
                    <p className="text-sm mt-2">This may be due to special characters in the filename or external URL restrictions.</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Button onClick={retryLoading} variant="outline" className="flex gap-1 items-center">
                            <RefreshCw className="w-4 h-4 mr-1" /> Retry
                        </Button>
                        <Button onClick={openDirectInNewTab} variant="outline" className="flex gap-1 items-center">
                            <ExternalLink className="w-4 h-4 mr-1" /> Open in browser
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="h-full w-full bg-slate-800 rounded relative">
                    {renderContent()}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="flex gap-2 bg-white/20 p-1 rounded-lg backdrop-blur-sm">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={zoomOut}
                                className="hover:bg-white/20"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={resetZoom}
                                className="hover:bg-white/20"
                            >
                                {Math.round(zoom * 100)}%
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={zoomIn}
                                className="hover:bg-white/20"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={rotate}
                                className="hover:bg-white/20"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            onClick={openDirectInNewTab}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                            <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 