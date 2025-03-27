'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ICV } from '@/lib/cv-store';
import CVCard from '@/app/components/CV/CVCard';
import CVViewer from '@/app/components/CV/CVViewer';
import CVAnalysisDialog from '@/app/components/CV/CVAnalysisDialog';
import CVDetailDialog from '@/app/components/CV/CVDetailDialog';
import CVTableView from '@/app/components/CV/CVTableView';
import TagFilterDropdown from '@/app/components/Search/TagFilterDropdown';
import { Search, CircleAlert, RefreshCw, FileUp, Filter, LayoutGrid, List } from 'lucide-react';

// Define view types
type ViewType = 'grid' | 'table';

export default function CandidateSearchPage() {
    const router = useRouter();
    const [cvs, setCVs] = useState<ICV[]>([]);
    const [selectedCV, setSelectedCV] = useState<ICV | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewType, setViewType] = useState<ViewType>('table'); // Default to table view
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
    });

    // Effect to fetch CVs when search params change
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchCVs();
        }, 300); // Debounce API calls by 300ms

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, selectedTags, pagination.page]);

    // Function to fetch CVs from API with search parameters
    const fetchCVs = async () => {
        setLoading(true);
        setError(null);

        try {
            // Use the advanced search API endpoint with all filters
            const response = await fetch('/api/cvs/advanced-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTerm,
                    tags: selectedTags,
                    page: pagination.page,
                    limit: pagination.limit
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CVs');
            }

            const data = await response.json();

            // Process the data to ensure proper formatting
            const formattedCVs = data.cvs.map((cv: any) => ({
                id: cv._id || cv.id,
                _id: cv._id || cv.id,
                filename: cv.filename,
                uploadDate: cv.uploadDate,
                analyzed: cv.analyzed,
                status: cv.status || 'pending',
                error: cv.error,
                fileId: cv.fileId,
                tags: cv.tags || [],
                analysis: cv.analysis || {},
                firstName: cv.firstName || '',
                lastName: cv.lastName || '',
                email: cv.email || '',
                phone: cv.phone || '',
                age: cv.age || null,
                department: cv.department || '',
                gender: cv.gender || '',
                expectedSalary: cv.expectedSalary || null,
                birthdate: cv.birthdate || ''
            }));

            setCVs(formattedCVs);
            setPagination({
                total: data.pagination.total,
                page: data.pagination.page,
                limit: data.pagination.limit,
                pages: data.pagination.pages
            });
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
        setDetailOpen(true);
    };

    // Handle viewing CV analysis
    const handleViewAnalysis = (cv: ICV) => {
        setSelectedCV(cv);
        setAnalysisOpen(true);
    };

    // Handle viewing CV file
    const handleViewFile = (cv: ICV) => {
        setSelectedCV(cv);
        setViewerOpen(true);
    };

    // Set page in pagination
    const setPage = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedTags([]);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Check if any filters are active
    const hasActiveFilters = searchTerm || selectedTags.length > 0;

    // Get count of active filters
    const activeFilterCount = (searchTerm ? 1 : 0) + selectedTags.length;

    // Toggle between grid and table view
    const toggleViewType = () => {
        setViewType(prev => prev === 'grid' ? 'table' : 'grid');
    };

    // Handle filter changes with useCallback to prevent recreating functions on each render
    const handleTagFilterChange = useCallback((tags: string[]) => {
        setSelectedTags(tags);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    }, []);

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Candidate Search</h1>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="flex items-center"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Clear Filters ({activeFilterCount})
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleViewType}
                        className="flex items-center"
                    >
                        {viewType === 'grid' ? (
                            <>
                                <List className="mr-2 h-4 w-4" />
                                Table View
                            </>
                        ) : (
                            <>
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Grid View
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                            placeholder="Search candidates by name, skills, or experience..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search change
                            }}
                        />
                    </div>

                    <div className="w-full sm:w-auto">
                        <TagFilterDropdown
                            onFilterChange={handleTagFilterChange}
                            initialSelectedTags={selectedTags}
                        />
                    </div>
                </div>

                <div className="flex flex-row justify-between items-center text-sm text-gray-500">
                    <div>
                        Showing {cvs.length} of {pagination.total} CVs
                    </div>

                    <div>
                        {pagination.total} candidate{pagination.total !== 1 ? 's' : ''} found with current filters
                    </div>
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
                    {/* CV display - grid or table view based on viewType */}
                    {cvs.length > 0 ? (
                        <>
                            {viewType === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {cvs.map((cv) => (
                                        <div key={cv.id}>
                                            <CVCard
                                                cv={cv}
                                                onView={handleViewCV}
                                                onViewFile={handleViewFile}
                                                onViewAnalysis={cv.analyzed ? handleViewAnalysis : undefined}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <CVTableView
                                    cvs={cvs}
                                    onView={handleViewCV}
                                    onViewFile={handleViewFile}
                                    onViewAnalysis={handleViewAnalysis}
                                />
                            )}

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
                                {hasActiveFilters
                                    ? 'No candidates match your search criteria. Try adjusting your filters.'
                                    : 'No CVs found in the database. Please upload CVs to get started.'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* CV Detail Dialog */}
            <CVDetailDialog
                cv={selectedCV}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />

            {/* CV Viewer Modal */}
            {selectedCV && (
                <CVViewer
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                    cv={selectedCV}
                />
            )}

            {/* CV Analysis Modal */}
            {selectedCV && (
                <CVAnalysisDialog
                    open={analysisOpen}
                    onOpenChange={setAnalysisOpen}
                    cv={selectedCV}
                />
            )}
        </div>
    );
} 