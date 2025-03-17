"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function DirectPDFViewer() {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Extract the filename from params
    const pathArray = Array.isArray(params.path) ? params.path : [params.path];
    const filename = pathArray.join('/');

    // Create the PDF URL
    const pdfUrl = `/api/serve-cv/${encodeURIComponent(filename)}`;

    useEffect(() => {
        // Check if file exists
        const checkFile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(pdfUrl, { method: 'HEAD' });

                if (!response.ok) {
                    setError(`Error loading file: ${response.status} ${response.statusText}`);
                }
            } catch (err) {
                setError('Failed to load the PDF file');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        checkFile();
    }, [pdfUrl]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-red-500 text-xl font-bold mb-4">Error Loading PDF</h1>
                    <p className="mb-4">{error}</p>
                    <p>Filename: {filename}</p>
                    <div className="mt-6 flex justify-between">
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                            Back to Home
                        </Link>
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Try Direct Download
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white p-2 shadow-md flex justify-between items-center">
                <h1 className="font-semibold text-lg truncate">
                    {filename}
                </h1>
                <div className="flex space-x-2">
                    <Link
                        href="/"
                        className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
                    >
                        Back to Files
                    </Link>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                        Open in New Tab
                    </a>
                </div>
            </div>

            <div className="flex-grow bg-gray-800">
                <object
                    data={pdfUrl}
                    type="application/pdf"
                    className="w-full h-full"
                    aria-label={`PDF: ${filename}`}
                >
                    <p className="text-center p-4 bg-white">
                        Your browser doesn't support embedded PDFs.
                        <a
                            href={pdfUrl}
                            className="text-blue-500 ml-1 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Click here to download the PDF file
                        </a>.
                    </p>
                </object>
            </div>
        </div>
    );
} 