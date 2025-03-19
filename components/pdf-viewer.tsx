"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, RefreshCw } from "lucide-react";

interface PDFViewerProps {
    filename: string;
    url?: string;
    fallbackUrl?: string;
}

export default function PDFViewer({ filename, url, fallbackUrl }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [currentUrl, setCurrentUrl] = useState<string>(url || '');

    // Create URLs for the CV file - either use provided URL or create from filename
    const apiUrl = currentUrl || `/api/serve-cv/${encodeURIComponent(filename)}`;

    // Determine if this is a PDF or another file type
    const isPDF = apiUrl.toLowerCase().endsWith('.pdf') || apiUrl.toLowerCase().includes('/uploads/') && !apiUrl.match(/\.(jpe?g|png|gif|tiff)$/i);
    const isImage = apiUrl.match(/\.(jpe?g|png|gif|tiff)$/i) !== null;

    // Handle opening in new tab
    const openDirectInNewTab = () => {
        window.open(apiUrl, '_blank');
    };

    // Function to retry loading the PDF
    const retryLoading = () => {
        setIsLoading(true);
        setHasError(false);

        // If we have a fallback URL and we're currently showing the primary URL
        if (fallbackUrl && currentUrl === url) {
            console.log("Trying fallback URL:", fallbackUrl);
            setCurrentUrl(fallbackUrl);
        } else {
            setIsLoading(false);
        }
    };

    // Check if the file is available
    const checkFile = async () => {
        try {
            setIsLoading(true);

            // For external URLs, we don't check availability
            // Just set loading to false to show the iframe
            if (apiUrl.startsWith('http')) {
                setIsLoading(false);
                return;
            }

            // For local files, check if they exist
            const response = await fetch(apiUrl, { method: 'HEAD' });

            if (!response.ok) {
                setHasError(true);
                setErrorMessage(`Server returned status ${response.status}: ${response.statusText}`);
                console.error('Error checking file:', response.statusText);
            } else {
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

    // Check file when component mounts
    useEffect(() => {
        checkFile();
    }, [apiUrl]);

    // Handle file loading error by setting the error state
    const handleFileError = () => {
        // If we have a fallback URL and we haven't tried it yet
        if (fallbackUrl && currentUrl !== fallbackUrl) {
            console.log("Primary URL failed, trying fallback URL:", fallbackUrl);
            setCurrentUrl(fallbackUrl);
        } else {
            setHasError(true);
            setErrorMessage("Failed to load file. The file may not exist or may not be accessible.");
        }
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
                            <RefreshCw className="w-4 h-4 mr-1" /> {fallbackUrl && currentUrl !== fallbackUrl ? "Try Alternate URL" : "Retry"}
                        </Button>
                        <Button onClick={openDirectInNewTab} variant="outline" className="flex gap-1 items-center">
                            <ExternalLink className="w-4 h-4 mr-1" /> Open in browser
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="h-full w-full bg-slate-800 rounded relative">
                    {/* Use appropriate element based on file type */}
                    {isPDF ? (
                        <iframe
                            src={apiUrl}
                            className="w-full h-full"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                display: 'block'
                            }}
                            title={`PDF Viewer - ${filename}`}
                            onError={handleFileError}
                        />
                    ) : isImage ? (
                        <div className="flex items-center justify-center h-full w-full bg-white overflow-auto">
                            <img
                                src={apiUrl}
                                alt={filename}
                                className="max-w-full max-h-full"
                                onError={handleFileError}
                            />
                        </div>
                    ) : (
                        // Fallback to iframe for other file types
                        <iframe
                            src={apiUrl}
                            className="w-full h-full"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                display: 'block'
                            }}
                            title={`Document Viewer - ${filename}`}
                            onError={handleFileError}
                        />
                    )}
                    <div className="absolute bottom-4 right-4 flex gap-2">
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