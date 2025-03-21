"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Upload, Filter, CheckSquare, ArrowRight, Eye, Loader2, Maximize2 } from "lucide-react"
import { toast } from "sonner"
import { CV } from "@/lib/cv-store"
import PDFViewer from "@/components/pdf-viewer"
import FetchTextContent from "@/components/fetch-text-content"

export default function ResumeView() {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [filter, setFilter] = useState<"all" | "analyzed" | "unanalyzed" | "hasCv">("hasCv")
    const [viewFile, setViewFile] = useState<CV | null>(null)
    const [resumeFiles, setResumeFiles] = useState<CV[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [viewAnalysis, setViewAnalysis] = useState<CV | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [analyzingUrlCVs, setAnalyzingUrlCVs] = useState<Record<string, boolean>>({})

    // Fetch CVs when component mounts or filter changes
    useEffect(() => {
        fetchCVs()
    }, [filter])

    const fetchCVs = async () => {
        setIsLoading(true)
        try {
            // Use the external API endpoint
            const apiUrl = 'https://ikv1api.gsadev.site/api/ikforms/list/new/default/';

            const response = await fetch(apiUrl)
            if (!response.ok) {
                throw new Error('Failed to fetch CVs')
            }

            const data = await response.json()

            // The API response has record_list that contains the array of applications
            if (!data.record_list) {
                throw new Error('API response is missing record_list')
            }

            // Map the API response record_list items to CV format
            const mappedCVs = data.record_list.map((record: any) => {
                // Format the CV path properly
                let cvPath = '';
                if (record.cv) {
                    // Use the new URL format provided
                    if (record.cv.startsWith('http')) {
                        // If it's already a full URL, extract just the filename part
                        const pathParts = record.cv.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        cvPath = `https://ikv1.gsadev.site/uploads/${filename}`;
                    } else {
                        // If it's a relative path, extract just the filename part
                        const pathParts = record.cv.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        cvPath = `https://ikv1.gsadev.site/uploads/${filename}`;
                    }
                }

                return {
                    id: record.id.toString() || record.token || String(Math.random()),
                    filename: record.name_surname || 'Unknown Applicant',
                    uploadDate: record.created_at || record.updated_at || new Date().toISOString(),
                    analyzed: !!record.analyzed,
                    path: cvPath,
                    tags: [
                        record.application_department,
                        record.application_type,
                        record.city && `City: ${record.city}`,
                        record.district && `District: ${record.district}`,
                        record.wants_accommodation === "Evet" && "Wants Accommodation",
                        record.driver_license === "Evet" && `Driver License: ${record.driver_license_type || 'Yes'}`
                    ].filter(Boolean),
                    age: getAgeFromBirthdate(record.birthdate),
                    // Additional fields to display
                    department: record.application_department,
                    email: record.email,
                    phone: record.phone_number,
                    birthdate: record.birthdate,
                    expectedSalary: record.expected_salary,
                    // Store the original CV path
                    originalCvPath: record.cv
                }
            });

            setResumeFiles(mappedCVs)
            console.log('Fetched CVs from external API:', mappedCVs);
        } catch (error) {
            console.error('Error fetching CVs:', error)
            toast.error("Failed to load resume files from external API");
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
            return resumeFiles.filter(file => !!file.path);
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const formData = new FormData()

        Array.from(files).forEach(file => {
            formData.append('files', file)
        })

        try {
            const response = await fetch('/api/cv-upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const result = await response.json()

            // Show success message
            const successCount = result.files.filter((f: any) => f.success).length
            if (successCount > 0) {
                toast.success(`Successfully uploaded ${successCount} file(s)`)
                // Refresh the CV list
                fetchCVs()
            }

            // Show error if any
            const failedFiles = result.files.filter((f: any) => !f.success)
            if (failedFiles.length > 0) {
                toast.error(`${failedFiles.length} file(s) failed to upload`)
            }
        } catch (error) {
            console.error('Error uploading files:', error)
            toast.error("Failed to upload files. Please try again.")
        } finally {
            setIsUploading(false)
            // Reset the input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

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

    const handleViewFile = (file: CV, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewFile(file);

        // Create a URL for the CV file
        // Check if we have a direct file path from the API
        const cvUrl = file.path
            ? file.path
            : `/api/serve-cv/${encodeURIComponent(file.filename)}`;

        // Log the URL to console for debugging
        console.log("Opening CV URL:", cvUrl);
    };

    const handleViewAnalysis = (file: CV, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewAnalysis(file);
    };

    // Format the date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const analyzeCV = async (file: CV) => {
        if (!file.path) {
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
                    url: file.path,
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
                originalCvPath: result.originalTextPath,
                cv: result.fixedTextPath,
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

    return (
        <div className="space-y-6">
            {/* Hidden file input for uploads */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff"
            />

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Tabs defaultValue="hasCv" onValueChange={(value) => setFilter(value as "all" | "analyzed" | "unanalyzed" | "hasCv")}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="hasCv">With CV</TabsTrigger>
                            <TabsTrigger value="analyzed">Analyzed</TabsTrigger>
                            <TabsTrigger value="unanalyzed">Unanalyzed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="text-sm text-muted-foreground">
                        Showing {filteredFiles.length} {filter === "hasCv" ? "resumes with CV" : filter === "analyzed" ? "analyzed resumes" : filter === "unanalyzed" ? "unanalyzed resumes" : "resumes"}
                        {filter === "all" && (
                            <span className="ml-1">
                                ({resumeFiles.filter(f => !!f.path).length} with CV)
                            </span>
                        )}
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
                    {filteredFiles.map((file) => (
                        <Card
                            key={file.id}
                            className={`cursor-pointer ${selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => toggleFileSelection(file.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <FileText className={`h-10 w-10 ${file.path ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div className="flex flex-col gap-1 items-end">
                                            {file.analyzed ? (
                                                <Badge variant="outline" className="bg-green-100">Analyzed</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-100">Unanalyzed</Badge>
                                            )}
                                            {file.age && (
                                                <Badge variant="outline" className="bg-blue-100">Age: {file.age}</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-medium text-sm truncate" title={file.filename}>
                                        {file.filename}
                                    </h3>

                                    {/* Add email and phone if available */}
                                    {(file.email || file.phone) && (
                                        <div className="text-xs text-muted-foreground">
                                            {file.email && <div className="truncate">{file.email}</div>}
                                            {file.phone && <div>{file.phone}</div>}
                                        </div>
                                    )}

                                    {/* Add expected salary if available */}
                                    {file.expectedSalary && (
                                        <div className="text-xs font-medium">
                                            Expected: {file.expectedSalary}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{formatDate(file.uploadDate)}</span>
                                        <span>{file.path ? "PDF Document" : "No CV"}</span>
                                    </div>

                                    {selectedFiles.includes(file.id) && (
                                        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary"></div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-2 pt-0">
                                <div className="w-full flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                                        onClick={(e) => handleViewFile(file, e)}
                                        disabled={!file.path}
                                    >
                                        <div className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            <span>View CV</span>
                                        </div>
                                    </Button>

                                    {file.analyzed ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                                            onClick={(e) => handleViewAnalysis(file, e)}
                                        >
                                            <div className="flex items-center">
                                                <FileText className="h-4 w-4 mr-1" />
                                                <span>Analysis</span>
                                            </div>
                                        </Button>
                                    ) : file.path ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                analyzeCV(file);
                                            }}
                                            disabled={analyzingUrlCVs[file.id]}
                                        >
                                            <div className="flex items-center">
                                                {analyzingUrlCVs[file.id] ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                        <span>Analyzing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        <span>Analyze</span>
                                                    </>
                                                )}
                                            </div>
                                        </Button>
                                    ) : null}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
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
                <DialogContent className="max-w-7xl w-[95vw] h-[90vh] max-h-[90vh] p-4 overflow-hidden flex flex-col">
                    <DialogHeader className="pb-2 flex-shrink-0">
                        <DialogTitle className="text-xl">{viewFile?.filename}</DialogTitle>
                        {viewFile && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm">
                                {viewFile.department && (
                                    <div>
                                        <span className="font-semibold">Department:</span> {viewFile.department}
                                    </div>
                                )}
                                {viewFile.email && (
                                    <div>
                                        <span className="font-semibold">Email:</span> {viewFile.email}
                                    </div>
                                )}
                                {viewFile.phone && (
                                    <div>
                                        <span className="font-semibold">Phone:</span> {viewFile.phone}
                                    </div>
                                )}
                                {viewFile.birthdate && (
                                    <div>
                                        <span className="font-semibold">Date of Birth:</span> {viewFile.birthdate}
                                    </div>
                                )}
                                {viewFile.age !== undefined && (
                                    <div>
                                        <span className="font-semibold">Age:</span> {viewFile.age}
                                    </div>
                                )}
                                {viewFile.expectedSalary && (
                                    <div>
                                        <span className="font-semibold">Expected Salary:</span> {viewFile.expectedSalary}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogHeader>
                    <div className="flex-grow bg-gray-100 rounded-md overflow-hidden" style={{ height: 'calc(100% - 110px)' }}>
                        {viewFile && (
                            <div className="h-full w-full">
                                {viewFile.path ? (
                                    <PDFViewer
                                        filename={viewFile.filename}
                                        url={viewFile.path}
                                        fallbackUrl={viewFile.originalCvPath ?
                                            (viewFile.originalCvPath.startsWith('http') ?
                                                viewFile.originalCvPath :
                                                `https://ikv1api.gsadev.site${viewFile.originalCvPath}`
                                            ) :
                                            undefined
                                        }
                                    />
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
                    <DialogHeader className="pb-2 flex-shrink-0">
                        <DialogTitle className="text-xl">Analysis Results: {viewAnalysis?.filename}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-grow overflow-auto">
                        {viewAnalysis && (
                            <Tabs defaultValue="tags">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="tags">Tags & Categories</TabsTrigger>
                                    <TabsTrigger value="ocr">OCR Text</TabsTrigger>
                                    <TabsTrigger value="enhanced">Enhanced CV</TabsTrigger>
                                </TabsList>

                                <TabsContent value="tags" className="h-full overflow-auto">
                                    <div className="space-y-4">
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
                                </TabsContent>

                                <TabsContent value="ocr" className="h-full overflow-auto">
                                    <Card>
                                        <CardContent className="p-4">
                                            {viewAnalysis.originalCvPath ? (
                                                <div className="max-h-[60vh] overflow-auto p-4 bg-gray-50 rounded-md font-mono text-sm whitespace-pre-wrap">
                                                    <FetchTextContent path={viewAnalysis.originalCvPath} />
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">Original OCR text not available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="enhanced" className="h-full overflow-auto">
                                    <Card>
                                        <CardContent className="p-4">
                                            {viewAnalysis.cv ? (
                                                <div className="max-h-[60vh] overflow-auto p-4 bg-gray-50 rounded-md font-mono text-sm whitespace-pre-wrap">
                                                    <FetchTextContent path={viewAnalysis.cv} />
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground">Enhanced CV text not available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 