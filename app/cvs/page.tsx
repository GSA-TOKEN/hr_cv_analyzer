'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICV } from '@/lib/cv-store';
import CVUploader from '../components/CV/CVUploader';
import CVCard from '../components/CV/CVCard';
import CVViewer from '../components/CV/CVViewer';
import CVAnalysisDialog from '../components/CV/CVAnalysisDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUp, Search, CircleAlert, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CVsPage() {
    const router = useRouter();
    const [cvs, setCVs] = useState<ICV[]>([]);
    const [selectedCV, setSelectedCV] = useState<ICV | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [cvToDelete, setCvToDelete] = useState<ICV | null>(null);
    const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);

    // Fetch CVs on component mount
    useEffect(() => {
        fetchCVs();
    }, []);

    // Function to fetch CVs from API
    const fetchCVs = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/cvs');
            if (!response.ok) {
                throw new Error('Failed to fetch CVs');
            }

            const data = await response.json();
            setCVs(data.cvs);
        } catch (error: any) {
            setError(error.message || 'Failed to load CVs');
            console.error('Error fetching CVs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter CVs based on search term
    const filteredCVs = searchTerm
        ? cvs.filter(cv =>
            cv.filename.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : cvs;

    // Handle CV upload completion
    const handleUploadComplete = () => {
        fetchCVs();
        toast.success("Upload Complete", {
            description: "CV was successfully uploaded."
        });
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

    // Handle CV selection for batch operations
    const handleCVSelect = (cvId: string) => {
        setSelectedCVs(prev =>
            prev.includes(cvId)
                ? prev.filter(id => id !== cvId)
                : [...prev, cvId]
        );
    };

    // Handle analyzing a single CV
    const handleAnalyzeCV = async (cv: ICV) => {
        try {
            setIsAnalyzing(true);

            const response = await fetch('/api/analyze-cvs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: [cv.id] }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze CV');
            }

            const data = await response.json();
            fetchCVs(); // Refresh the CV list

            toast.success("Analysis Complete", {
                description: "CV was successfully analyzed."
            });
        } catch (error: any) {
            console.error('Error analyzing CV:', error);
            toast.error("Analysis Failed", {
                description: error.message || "Failed to analyze CV"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Handle analyzing multiple selected CVs
    const handleAnalyzeSelected = async () => {
        if (selectedCVs.length === 0) {
            toast.error("No CVs Selected", {
                description: "Please select at least one CV to analyze."
            });
            return;
        }

        try {
            setIsAnalyzing(true);

            const response = await fetch('/api/analyze-cvs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedCVs }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze selected CVs');
            }

            const data = await response.json();
            fetchCVs(); // Refresh the CV list
            setSelectedCVs([]); // Clear selection

            toast.success("Analysis Complete", {
                description: `Successfully analyzed ${selectedCVs.length} CVs.`
            });
        } catch (error: any) {
            console.error('Error analyzing CVs:', error);
            toast.error("Analysis Failed", {
                description: error.message || "Failed to analyze selected CVs"
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Handle deleting selected CVs
    const handleDeleteSelected = async () => {
        if (selectedCVs.length === 0) {
            toast.error("No CVs Selected", {
                description: "Please select at least one CV to delete."
            });
            return;
        }

        setShowDeleteDialog(true);
    };

    // Execute the delete operation after confirmation
    const executeDelete = async () => {
        try {
            setIsDeleting(true);

            // Delete each selected CV one by one
            const deletePromises = selectedCVs.map(id =>
                fetch(`/api/cvs/${id}`, {
                    method: 'DELETE'
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to delete CV with id ${id}`);
                    }
                    return response.json();
                })
            );

            await Promise.all(deletePromises);

            fetchCVs(); // Refresh the CV list
            setSelectedCVs([]); // Clear selection

            toast.success("Delete Complete", {
                description: `Successfully deleted ${selectedCVs.length} CVs.`
            });
        } catch (error: any) {
            console.error('Error deleting CVs:', error);
            toast.error("Delete Failed", {
                description: error.message || "Failed to delete selected CVs"
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    // Handle deleting a single CV
    const handleDeleteCV = (cv: ICV) => {
        setCvToDelete(cv);
        setShowSingleDeleteDialog(true);
    };

    // Execute single CV delete after confirmation
    const executeSingleDelete = async () => {
        if (!cvToDelete) return;

        try {
            setIsDeleting(true);

            const response = await fetch(`/api/cvs/${cvToDelete.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete CV');
            }

            await response.json();

            fetchCVs(); // Refresh the CV list

            toast.success("Delete Complete", {
                description: "CV was successfully deleted."
            });
        } catch (error: any) {
            console.error('Error deleting CV:', error);
            toast.error("Delete Failed", {
                description: error.message || "Failed to delete CV"
            });
        } finally {
            setIsDeleting(false);
            setCvToDelete(null);
            setShowSingleDeleteDialog(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">CV Manager</h1>

            {/* Dialog for deleting multiple CVs */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected CVs</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedCVs.length} selected CV{selectedCVs.length > 1 ? 's' : ''}?
                            This action cannot be undone and will permanently remove the CV{selectedCVs.length > 1 ? 's' : ''} from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog for deleting a single CV */}
            <AlertDialog open={showSingleDeleteDialog} onOpenChange={setShowSingleDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete CV</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the CV "{cvToDelete?.firstName} {cvToDelete?.lastName || cvToDelete?.filename}"?
                            This action cannot be undone and will permanently remove the CV from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeSingleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Tabs defaultValue="view" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="view">View CVs</TabsTrigger>
                    <TabsTrigger value="upload">Upload CV</TabsTrigger>
                </TabsList>

                <TabsContent value="view" className="space-y-4">
                    {/* Search and actions */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                                placeholder="Search CVs..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleAnalyzeSelected}
                                disabled={selectedCVs.length === 0 || isAnalyzing}
                                className="whitespace-nowrap"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Analyze Selected ({selectedCVs.length})
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleDeleteSelected}
                                disabled={selectedCVs.length === 0 || isDeleting}
                                className="whitespace-nowrap"
                            >
                                {isDeleting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Selected ({selectedCVs.length})
                                    </>
                                )}
                            </Button>
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
                            <p className="mt-2 text-gray-500">Loading CVs...</p>
                        </div>
                    ) : (
                        <>
                            {/* CV grid */}
                            {filteredCVs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredCVs.map((cv) => (
                                        <div key={cv.id} className="relative">
                                            <div className="absolute top-2 left-2 z-10">
                                                <Checkbox
                                                    checked={selectedCVs.includes(cv.id)}
                                                    onCheckedChange={() => handleCVSelect(cv.id)}
                                                    className="bg-white"
                                                />
                                            </div>
                                            <CVCard
                                                cv={cv}
                                                onView={handleViewCV}
                                                onViewAnalysis={handleViewAnalysis}
                                                onAnalyze={handleAnalyzeCV}
                                                onDelete={handleDeleteCV}
                                                isAnalyzing={isAnalyzing}
                                                isDeleting={isDeleting && cvToDelete?.id === cv.id}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <h3 className="text-lg font-medium mb-1">No CVs Found</h3>
                                    <p className="text-gray-500 mb-4">Upload a CV to get started</p>
                                    <Button onClick={() => {
                                        const uploadTab = document.querySelector('[data-value="upload"]');
                                        if (uploadTab instanceof HTMLElement) {
                                            uploadTab.click();
                                        }
                                    }}>
                                        Upload CV
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="upload">
                    <CVUploader onUploadComplete={handleUploadComplete} />
                </TabsContent>
            </Tabs>

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