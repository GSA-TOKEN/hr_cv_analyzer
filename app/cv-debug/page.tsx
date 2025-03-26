"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CVDebugPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to candidates page
        router.push("/candidates");
    }, [router]);

    return (
        <div className="container mx-auto py-6 flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-500">Redirecting to candidate search...</p>
            </div>
        </div>
    );
} 