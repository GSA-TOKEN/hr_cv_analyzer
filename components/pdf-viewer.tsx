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
            transformOrigin: 'center center',
        };

        if (fileType === 'image') {
            return (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 overflow-auto">
                    <img
                        src={fileUrl}
                        alt="Document preview"
                        className="max-w-full max-h-full object-contain"
                        style={style}
                    />
                </div>
            );
        }

        if (fileType === 'pdf') {
            return (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 overflow-auto">
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        style={style}
                    />
                </div>
            );
        }

        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-500">Unsupported file type</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={openDirectInNewTab}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in new tab
                    </Button>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Loading document...</p>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-red-500 mb-2">{errorMessage}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={retryLoading}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={zoomOut}
                        disabled={zoom <= 0.5}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetZoom}
                        disabled={zoom === 1}
                    >
                        {Math.round(zoom * 100)}%
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={zoomIn}
                        disabled={zoom >= 3}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={rotate}
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={openDirectInNewTab}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in new tab
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(fileUrl, '_blank', 'download')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
} 