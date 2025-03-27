import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="container flex flex-col items-center justify-center min-h-screen py-12">
            <h1 className="text-6xl font-bold text-center mb-6">404</h1>
            <h2 className="text-2xl font-semibold text-center mb-6">Page Not Found</h2>
            <p className="text-center text-muted-foreground mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                    <Button>
                        Return Home
                    </Button>
                </Link>
                <Link href="/candidates">
                    <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Candidate Search
                    </Button>
                </Link>
                <Link href="/cvs">
                    <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        CV Management
                    </Button>
                </Link>
            </div>
        </div>
    );
} 