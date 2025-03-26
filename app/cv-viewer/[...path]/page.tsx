"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from "lucide-react";

export default function CVViewerPage({ params }: { params: { path: string[] } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const allowDirectView = searchParams ? searchParams.get("direct") === "true" : false;

    useEffect(() => {
        // If direct viewing is not explicitly allowed, redirect to candidates page
        if (!allowDirectView) {
            router.push("/candidates");
        } else {
            setLoading(false);
        }
    }, [router, allowDirectView]);

    // If we're still loading or redirecting, show a loading state
    if (loading) {
        return (
            <div className="container mx-auto py-6 flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-500">Redirecting to candidate search...</p>
                </div>
            </div>
        );
    }

    // For allowed direct views, maintain the original functionality
    const filePath = params.path.join("/");

    return (
        <div className="container mx-auto py-6">
            <iframe
                src={`/api/serve-cv/${encodeURIComponent(filePath)}`}
                className="w-full h-[85vh] border rounded"
            />
        </div>
    );
} 