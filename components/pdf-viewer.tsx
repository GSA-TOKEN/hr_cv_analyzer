"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, RefreshCw } from "lucide-react";

interface PDFViewerProps {
    filename: string;
}

export default function PDFViewer({ filename }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Create URLs for the CV file
    const apiUrl = `/api/serve-cv/${encodeURIComponent(filename)}`;

    // Handle opening in new tab
    const openDirectInNewTab = () => {
        window.open(apiUrl, '_blank');
    };

    // Function to retry loading the PDF
    const retryLoading = () => {
        setIsLoading(true);
        setHasError(false);
        checkFile();
    };

    // Check if the file is available
    const checkFile = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(apiUrl, { method: 'HEAD' });

            if (!response.ok) {
                setHasError(true);
                setErrorMessage(`Server returned status ${response.status}: ${response.statusText}`);
                console.error('Error checking PDF file:', response.statusText);
            } else {
                setHasError(false);
            }
        } catch (error) {
            console.error('Error checking PDF file:', error);
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

    return (
        <div className="flex flex-col h-full">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : hasError ? (
                <div className="bg-red-50 text-red-800 p-4 rounded text-center flex flex-col items-center">
                    <p className="font-medium">Error loading PDF</p>
                    {errorMessage && (
                        <p className="text-sm mt-2 max-w-md overflow-auto">{errorMessage}</p>
                    )}
                    <p className="text-sm mt-2">This may be due to special characters in the filename.</p>
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
                <div className="flex-1 w-full bg-slate-800 rounded overflow-hidden relative min-h-[500px]">
                    <iframe
                        src={apiUrl}
                        className="w-full h-full absolute inset-0"
                        title={`PDF Viewer - ${filename}`}
                        onError={() => {
                            setHasError(true);
                            setErrorMessage("Failed to load PDF in iframe");
                        }}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button
                            size="sm"
                            onClick={openDirectInNewTab}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                            <Download className="w-4 h-4 mr-1" /> Download
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 