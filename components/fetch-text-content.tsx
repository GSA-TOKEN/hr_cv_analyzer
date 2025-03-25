'use client';

import { useState, useEffect } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FetchTextContentProps {
    fileId: string;
}

export default function FetchTextContent({ fileId }: FetchTextContentProps) {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [fontSize, setFontSize] = useState(14);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`/api/cv-store/text/${fileId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }

                const text = await response.text();
                setContent(text);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [fileId]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 10));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-md">
                <p className="font-medium">Error loading content</p>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="sticky top-0 z-10 bg-white border-b p-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={decreaseFontSize}
                        disabled={fontSize <= 10}
                    >
                        A-
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {fontSize}px
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseFontSize}
                        disabled={fontSize >= 24}
                    >
                        A+
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy text
                        </>
                    )}
                </Button>
            </div>
            <div
                className="p-6 font-mono whitespace-pre-wrap break-words bg-gray-50 rounded-md"
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.6',
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}
            >
                {content}
            </div>
        </div>
    );
} 