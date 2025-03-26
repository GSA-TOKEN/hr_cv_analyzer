'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ICV } from '@/lib/cv-store';
import CVCard from '@/app/components/CV/CVCard';
import CVViewer from '@/app/components/CV/CVViewer';
import CVAnalysisDialog from '@/app/components/CV/CVAnalysisDialog';
import TagFilterDropdown from '@/app/components/Search/TagFilterDropdown';
import { Search, CircleAlert, RefreshCw, FileUp } from 'lucide-react';

export default function CandidateSearchPage() {
    const router = useRouter();
    const [cvs, setCVs] = useState<ICV[]>([]);
    const [selectedCV, setSelectedCV] = useState<ICV | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
    });

    // Effect to fetch CVs when search params change
    useEffect(() => {
        fetchCVs();
    }, [searchTerm, selectedTags, pagination.page]);

    // Function to fetch CVs from API with search parameters
    const fetchCVs = async () => {
        setLoading(true);
        setError(null);

        try {
            // Build search URL with parameters
            const searchParams = new URLSearchParams();

            if (searchTerm) {
                searchParams.append('query', searchTerm);
            }

            selectedTags.forEach(tag => {
                searchParams.append('tags', tag);
            });

            searchParams.append('limit', pagination.limit.toString());
            searchParams.append('page', pagination.page.toString());

            const url = `/api/cvs/search?${searchParams.toString()}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch CVs');
            }

            const data = await response.json();
            setCVs(data.cvs);
            setPagination(data.pagination);
        } catch (error: any) {
            setError(error.message || 'Failed to load CVs');
            console.error('Error fetching CVs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle viewing a CV
    const handleViewCV = (cv: ICV) => {
        setSelectedCV(cv);
        setViewerOpen(true);
    };

    // Handle viewing CV analysis
    const handleViewAnalysis = (cv: ICV) => {
        setSelectedCV(cv);
        setAnalysisOpen(true);
    };

    // Set page in pagination
    const setPage = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    // Get analyzed CVs count
    const analyzedCount = cvs.filter(cv => cv.analyzed).length;

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Candidate Search</h1>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                        {analyzedCount} of {pagination.total} CVs analyzed
                    </p>
                    {analyzedCount < pagination.total && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/cvs')}
                            className="text-xs"
                        >
                            Analyze more CVs
                        </Button>
                    )}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        placeholder="Search candidates..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search change
                        }}
                    />
                </div>

                <div className="flex-shrink-0">
                    <TagFilterDropdown
                        onFilterChange={(tags) => {
                            setSelectedTags(tags);
                            setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
                        }}
                        initialSelectedTags={selectedTags}
                    />
                </div>
            </div>

            {/* Error state */}
            {error && (
                <Card className="p-4 bg-red-50 text-red-800 flex items-center gap-2 mb-4">
                    <CircleAlert className="h-5 w-5" />
                    <div>{error}</div>
                </Card>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                    <p className="mt-2 text-gray-500">Loading candidates...</p>
                </div>
            ) : (
                <>
                    {/* Results */}
                    <div className="mb-2 text-sm text-gray-500">
                        {cvs.length} candidate{cvs.length !== 1 ? 's' : ''} found {pagination.total > 0 ? `(${pagination.total} total)` : ''}
                    </div>

                    {/* CV grid */}
                    {cvs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {cvs.map((cv) => (
                                    <div key={cv.id}>
                                        <CVCard
                                            cv={cv}
                                            onView={handleViewCV}
                                            onViewAnalysis={cv.analyzed ? handleViewAnalysis : undefined}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center mt-6 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </Button>

                                    {Array.from({ length: pagination.pages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        // Only show max 5 page buttons
                                        if (
                                            pagination.pages <= 5 ||
                                            pageNum === 1 ||
                                            pageNum === pagination.pages ||
                                            (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === pagination.page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        } else if (
                                            (pageNum === 2 && pagination.page > 3) ||
                                            (pageNum === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                                        ) {
                                            return <span key={pageNum} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <FileUp className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">
                                {searchTerm || selectedTags.length > 0
                                    ? 'No candidates match your search criteria.'
                                    : 'No candidates found. Upload CVs to get started.'}
                            </p>
                            {(searchTerm || selectedTags.length > 0) && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedTags([]);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* CV Viewer Dialog */}
            <CVViewer
                cv={selectedCV}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />

            {/* CV Analysis Dialog */}
            <CVAnalysisDialog
                cv={selectedCV}
                open={analysisOpen}
                onOpenChange={setAnalysisOpen}
            />
        </div>
    );
} 