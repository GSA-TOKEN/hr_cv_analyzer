"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Upload, Filter, CheckSquare, ArrowRight, Eye, Loader2, Maximize2, Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import PDFViewer from "@/components/pdf-viewer"
import FetchTextContent from "@/components/fetch-text-content"
import { ICV } from '@/lib/cv-store'

export default function ResumeView() {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [filter, setFilter] = useState<"all" | "analyzed" | "unanalyzed" | "hasCv">("hasCv")
    const [viewFile, setViewFile] = useState<ICV | null>(null)
    const [resumeFiles, setResumeFiles] = useState<ICV[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [viewAnalysis, setViewAnalysis] = useState<ICV | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [analyzingUrlCVs, setAnalyzingUrlCVs] = useState<Record<string, boolean>>({})
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [availableTags, setAvailableTags] = useState<string[]>([])
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch CVs when component mounts or filter/tags change
    useEffect(() => {
        fetchCVs()
    }, [filter, selectedTags])

    const fetchCVs = async () => {
        setIsLoading(true)
        try {
            console.log('Fetching CVs from API...');
            let response
            if (selectedTags.length > 0) {
                response = await fetch('/api/cv-store/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tags: selectedTags })
                })
            } else {
                response = await fetch('/api/cv-store')
            }

            if (!response.ok) {
                throw new Error('Failed to fetch CVs')
            }

            const data = await response.json()
            console.log('Received CVs from API:', data);

            // Ensure data is an array before setting it
            const cvArray = Array.isArray(data) ? data : []
            console.log(`Setting ${cvArray.length} CVs to state`);
            setResumeFiles(cvArray)

            // Collect all unique tags
            const tags = new Set<string>()
            cvArray.forEach((cv: ICV) => {
                if (cv.tags && Array.isArray(cv.tags)) {
                    cv.tags.forEach(tag => tags.add(tag))
                }
            })
            setAvailableTags(Array.from(tags))

        } catch (error) {
            console.error('Error fetching CVs:', error)
            toast.error("Failed to load resume files")
        } finally {
            setIsLoading(false)
        }
    }

    // Helper function to calculate age from birthdate string
    const getAgeFromBirthdate = (birthdate: string): number | undefined => {
        if (!birthdate) return undefined;

        // Parse birthdate (assuming format is DD.MM.YYYY)
        const parts = birthdate.split('.');
        if (parts.length !== 3) return undefined;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
        const year = parseInt(parts[2], 10);

        const birthdateObj = new Date(year, month, day);
        const today = new Date();

        let age = today.getFullYear() - birthdateObj.getFullYear();
        const m = today.getMonth() - birthdateObj.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthdateObj.getDate())) {
            age--;
        }

        return age;
    }

    // Filter by CV availability
    const filteredFiles = useMemo(() => {
        if (filter === "analyzed") {
            return resumeFiles.filter(file => file.analyzed);
        } else if (filter === "unanalyzed") {
            return resumeFiles.filter(file => !file.analyzed);
        } else if (filter === "hasCv") {
            return resumeFiles.filter(file => !!file.fileId);
        } else {
            return resumeFiles;
        }
    }, [resumeFiles, filter]);

    const toggleFileSelection = (fileId: string, isButtonClick: boolean = false) => {
        if (isButtonClick) {
            // Don't toggle selection when clicking the view button
            return;
        }

        if (selectedFiles.includes(fileId)) {
            setSelectedFiles(prev => prev.filter(id => id !== fileId))
        } else {
            setSelectedFiles(prev => [...prev, fileId])
        }
    }

    const selectAllFiles = () => {
        if (selectedFiles.length === filteredFiles.length) {
            setSelectedFiles([])
        } else {
            setSelectedFiles(filteredFiles.map(file => file.id))
        }
    }

    const openFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const file = files[0]; // Handle single file upload
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/cv-store', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const result = await response.json();
            console.log('Upload successful:', result);

            // Refresh CV list
            await fetchCVs();
            toast.success('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
            toast.error('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const analyzeSelectedFiles = async () => {
        if (selectedFiles.length === 0) return

        setIsAnalyzing(true)
        try {
            // Use our new OCR-powered analyze-cvs endpoint
            const response = await fetch('/api/analyze-cvs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: selectedFiles })
            })

            if (!response.ok) {
                throw new Error('Analysis request failed')
            }

            const result = await response.json()

            // Count successful and failed analyses
            const successful = result.results.filter(
                (r: any) => r.status === 'fulfilled' && r.value.success
            ).length

            const failed = result.results.filter(
                (r: any) => r.status === 'rejected' || !r.value.success
            ).length

            toast.success(`Successfully analyzed ${successful} file(s)${failed > 0 ? `, ${failed} failed` : ''}`)

            // Refresh the CV list
            fetchCVs()
        } catch (error) {
            console.error('Error analyzing files:', error)
            toast.error("Failed to start analysis. Please try again.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleViewFile = (file: ICV, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewFile(file);

        // Create a URL for the CV file using the local API endpoint
        const cvUrl = `/api/cv-store/${file.id}`;

        // Log the URL to console for debugging
        console.log("Opening CV URL:", cvUrl);
    };

    const handleViewAnalysis = (file: ICV, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewAnalysis(file);
    };

    // Format the date for display
    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const analyzeCV = async (file: ICV) => {
        if (!file.fileId) {
            toast.error("No CV URL available for this entry");
            return;
        }

        // Set analyzing state for this CV
        setAnalyzingUrlCVs(prev => ({ ...prev, [file.id]: true }));

        try {
            // Call the analyze-cv-url endpoint
            const response = await fetch('/api/analyze-cv-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileId: file.fileId,
                    id: file.id,
                    filename: file.filename
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze CV');
            }

            const result = await response.json();

            // Update the file with analysis results
            const updatedFile = {
                ...file,
                analyzed: true,
                tags: [...(file.tags || []), ...(result.tags || [])],
                originalTextFileId: result.originalTextFileId,
                enhancedTextFileId: result.enhancedTextFileId,
                parsedCV: result.parsedCV
            };

            // Update the file in the list
            setResumeFiles(prev =>
                prev.map(f => f.id === file.id ? updatedFile : f)
            );

            toast.success(`Successfully analyzed CV for ${file.filename}`);
        } catch (error: any) {
            console.error('Error analyzing CV from URL:', error);
            toast.error(error.message || "Failed to analyze CV. Please try again.");
        } finally {
            // Clear analyzing state for this CV
            setAnalyzingUrlCVs(prev => ({ ...prev, [file.id]: false }));
        }
    };

    const handleTagSelect = (tag: string) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    // Add tag filter section to the UI
    const renderTagFilters = () => (
        <div className="flex flex-wrap gap-2 mb-4">
            {availableTags.map((tag: string, index: number) => (
                <Badge
                    key={index}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleTagSelect(tag)}
                >
                    {tag}
                </Badge>
            ))}
        </div>
    );

    const renderCV = (cv: ICV) => {
        return (
            <Card
                key={cv.id}
                className={`relative ${selectedFiles.includes(cv.id) ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => toggleFileSelection(cv.id)}
            >
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-medium">{cv.filename}</h3>
                            </div>
                            <div className="text-sm text-gray-500">
                                Uploaded on {formatDate(cv.uploadDate)}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    {cv.fileId ? (
                        <div className="flex flex-wrap gap-1">
                            {cv.tags?.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                            {(cv.tags?.length || 0) > 3 && (
                                <Badge variant="secondary">
                                    +{(cv.tags?.length || 0) - 3} more
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No CV uploaded</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewFile(cv);
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                    </Button>
                    {cv.analyzed && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewAnalysis(cv);
                            }}
                        >
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Analysis
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Hidden file input for uploads */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.docx"
            />

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Tabs defaultValue="hasCv" onValueChange={(value) => setFilter(value as any)}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="hasCv">With CV</TabsTrigger>
                            <TabsTrigger value="analyzed">Analyzed</TabsTrigger>
                            <TabsTrigger value="unanalyzed">Unanalyzed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="text-sm text-muted-foreground">
                        {selectedTags.length > 0 && (
                            <span className="mr-2">
                                Filtered by {selectedTags.length} tag(s)
                            </span>
                        )}
                        Showing {filteredFiles.length} {filter === "hasCv" ? "resumes with CV" : filter === "analyzed" ? "analyzed resumes" : filter === "unanalyzed" ? "unanalyzed resumes" : "resumes"}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllFiles} disabled={isLoading || filteredFiles.length === 0}>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 ? "Deselect All" : "Select All"}
                    </Button>

                    <Button variant="outline" size="sm" onClick={openFileUpload} disabled={isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload PDFs
                            </>
                        )}
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        disabled={selectedFiles.length === 0 || isAnalyzing}
                        onClick={analyzeSelectedFiles}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4 mr-2" />
                                Analyze Selected
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Tag filters */}
            {renderTagFilters()}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading resumes...</span>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="bg-muted/30 rounded-lg py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Resumes Found</h3>
                    <p className="text-muted-foreground mb-4">
                        {filter === "hasCv" ? (
                            "No resumes with CV attachments found. Try selecting 'All' to see all applications."
                        ) : filter === "analyzed" ? (
                            "No analyzed resumes found. Try analyzing some resumes first."
                        ) : (
                            "No resumes match your current filter. Try changing your selection."
                        )}
                    </p>
                    {filter !== "all" && (
                        <Button onClick={() => setFilter("all")}>
                            Show All Applications
                        </Button>
                    )}
                </div>
            ) : (
                /* Grid layout that wraps to next line */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFiles.map((file) => renderCV(file))}
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className="fixed bottom-8 right-8 shadow-lg rounded-lg bg-primary text-white p-4 z-10">
                    <div className="flex items-center gap-2">
                        <span>{selectedFiles.length} file(s) selected</span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={analyzeSelectedFiles}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Analyze <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* CV View Dialog */}
            <Dialog open={viewFile !== null} onOpenChange={(open) => !open && setViewFile(null)}>
                <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[90vh] p-4">
                    <DialogHeader>
                        <DialogTitle>{viewFile?.filename}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {viewFile && (
                            <div className="h-full">
                                {viewFile.fileId ? (
                                    <PDFViewer fileUrl={`/api/cv-store/${viewFile.id}`} />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                            <h3 className="text-lg font-medium mb-1">No CV Available</h3>
                                            <p className="text-muted-foreground">This applicant doesn't have a CV uploaded.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Analysis Results Dialog */}
            <Dialog open={viewAnalysis !== null} onOpenChange={(open) => !open && setViewAnalysis(null)}>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[90vh] p-4 overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Analysis Results - {viewAnalysis?.filename}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="summary" className="flex-1 overflow-hidden">
                        <TabsList>
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="original">Original Text</TabsTrigger>
                            <TabsTrigger value="enhanced">Enhanced Text</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 overflow-auto mt-4">
                            <TabsContent value="summary" className="h-full">
                                {viewAnalysis && (
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <h3 className="text-md font-medium">Tags</h3>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewAnalysis.tags && viewAnalysis.tags.length > 0 ? (
                                                        viewAnalysis.tags.map((tag, i) => (
                                                            <Badge key={i} variant="outline" className="bg-blue-50">
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <p className="text-muted-foreground">No tags found</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <h3 className="text-md font-medium">Candidate Details</h3>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {viewAnalysis.email && (
                                                        <div>
                                                            <p className="text-sm font-medium">Email</p>
                                                            <p className="text-sm text-muted-foreground">{viewAnalysis.email}</p>
                                                        </div>
                                                    )}
                                                    {viewAnalysis.phone && (
                                                        <div>
                                                            <p className="text-sm font-medium">Phone</p>
                                                            <p className="text-sm text-muted-foreground">{viewAnalysis.phone}</p>
                                                        </div>
                                                    )}
                                                    {viewAnalysis.birthdate && (
                                                        <div>
                                                            <p className="text-sm font-medium">Birthdate</p>
                                                            <p className="text-sm text-muted-foreground">{viewAnalysis.birthdate}</p>
                                                        </div>
                                                    )}
                                                    {viewAnalysis.age && (
                                                        <div>
                                                            <p className="text-sm font-medium">Age</p>
                                                            <p className="text-sm text-muted-foreground">{viewAnalysis.age}</p>
                                                        </div>
                                                    )}
                                                    {viewAnalysis.department && (
                                                        <div>
                                                            <p className="text-sm font-medium">Department</p>
                                                            <p className="text-sm text-muted-foreground">{viewAnalysis.department}</p>
                                                        </div>
                                                    )}
                                                    {viewAnalysis.expectedSalary && (
                                                        <div>
                                                            <p className="text-sm font-medium">Expected Salary</p>
                                                            <p className="text-sm text-muted-foreground">{viewAnalysis.expectedSalary}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="original" className="h-full">
                                {viewAnalysis?.originalTextFileId ? (
                                    <FetchTextContent fileId={viewAnalysis.originalTextFileId} />
                                ) : (
                                    <p>Original text not available</p>
                                )}
                            </TabsContent>
                            <TabsContent value="enhanced" className="h-full">
                                {viewAnalysis?.enhancedTextFileId ? (
                                    <FetchTextContent fileId={viewAnalysis.enhancedTextFileId} />
                                ) : (
                                    <p>Enhanced text not available</p>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    )
} 