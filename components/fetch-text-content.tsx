'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface FetchTextContentProps {
    path: string;
}

export default function FetchTextContent({ path }: FetchTextContentProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if path is a URL
                if (path.startsWith('http')) {
                    // For external URLs, use a proxy endpoint or CORS-friendly method
                    const response = await fetch(`/api/proxy-text?url=${encodeURIComponent(path)}`);
                    if (!response.ok) throw new Error(`Failed to fetch content: ${response.statusText}`);
                    const text = await response.text();
                    setContent(text);
                } else {
                    // For local files, use a direct API endpoint
                    const response = await fetch(`/api/serve-text-file?path=${encodeURIComponent(path)}`);
                    if (!response.ok) throw new Error(`Failed to fetch content: ${response.statusText}`);
                    const text = await response.text();
                    setContent(text);
                }
            } catch (err: any) {
                console.error('Error fetching text content:', err);
                setError(err.message || 'Failed to load text content');
            } finally {
                setLoading(false);
            }
        };

        if (path) {
            fetchContent();
        }
    }, [path]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading content...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4">
                <p>Error loading content: {error}</p>
            </div>
        );
    }

    return <>{content}</>;
} 