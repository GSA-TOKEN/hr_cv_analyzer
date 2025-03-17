"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Upload, Filter, CheckSquare, ArrowRight, Eye, Loader2, Maximize2 } from "lucide-react"
import { useToast } from "@/components/ui/simple-toast"
import { CV } from "@/lib/cv-store"
import PDFViewer from "@/components/pdf-viewer"

export default function ResumeView() {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [filter, setFilter] = useState<"all" | "analyzed" | "unanalyzed">("all")
    const [viewFile, setViewFile] = useState<CV | null>(null)
    const [resumeFiles, setResumeFiles] = useState<CV[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    // Fetch CVs when component mounts or filter changes
    useEffect(() => {
        fetchCVs()
    }, [filter])

    const fetchCVs = async () => {
        setIsLoading(true)
        try {
            let endpoint = '/api/cvs'
            if (filter === "analyzed") {
                endpoint += '?analyzed=true'
            } else if (filter === "unanalyzed") {
                endpoint += '?analyzed=false'
            }

            const response = await fetch(endpoint)
            if (!response.ok) {
                throw new Error('Failed to fetch CVs')
            }

            const data = await response.json()
            setResumeFiles(data.cvs)
        } catch (error) {
            console.error('Error fetching CVs:', error)
            toast({
                title: "Error",
                description: "Failed to load resume files",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const filteredFiles = resumeFiles

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
                toast({
                    title: "Upload Complete",
                    description: `Successfully uploaded ${successCount} file(s)`,
                })
                // Refresh the CV list
                fetchCVs()
            }

            // Show error if any
            const failedFiles = result.files.filter((f: any) => !f.success)
            if (failedFiles.length > 0) {
                toast({
                    title: "Upload Issues",
                    description: `${failedFiles.length} file(s) failed to upload`,
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error uploading files:', error)
            toast({
                title: "Upload Failed",
                description: "Failed to upload files. Please try again.",
                variant: "destructive"
            })
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

            toast({
                title: "Analysis Started",
                description: `Analysis of ${selectedFiles.length} file(s) has been initiated`,
            })

            // Refresh the CV list after a delay to allow for analysis to update status
            setTimeout(() => {
                fetchCVs()
            }, 1000)
        } catch (error) {
            console.error('Error analyzing files:', error)
            toast({
                title: "Analysis Failed",
                description: "Failed to start analysis. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleViewFile = (file: CV, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewFile(file);

        // Create a URL for the CV file - use the new endpoint
        const cvUrl = `/api/serve-cv/${encodeURIComponent(file.filename)}`;

        // Log the URL to console for debugging
        console.log("Opening CV URL:", cvUrl);
    };

    // Format the date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }

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
                    <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as "all" | "analyzed" | "unanalyzed")}>
                        <TabsList>
                            <TabsTrigger value="all">All Resumes</TabsTrigger>
                            <TabsTrigger value="analyzed">Analyzed</TabsTrigger>
                            <TabsTrigger value="unanalyzed">Unanalyzed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="text-sm text-muted-foreground">
                        Showing {filteredFiles.length} resumes
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
                    <p className="text-muted-foreground mb-4">Upload PDF or image files to get started</p>
                    <Button onClick={openFileUpload}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resumes
                    </Button>
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
                                        <FileText className="h-10 w-10 text-primary" />
                                        {file.analyzed ? (
                                            <Badge variant="outline" className="bg-green-100">Analyzed</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-100">Unanalyzed</Badge>
                                        )}
                                    </div>

                                    <h3 className="font-medium text-sm truncate" title={file.filename}>
                                        {file.filename}
                                    </h3>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{formatDate(file.uploadDate)}</span>
                                        <span>PDF</span>
                                    </div>

                                    {selectedFiles.includes(file.id) && (
                                        <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary"></div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-2 pt-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                                    onClick={(e) => handleViewFile(file, e)}
                                >
                                    <div className="flex items-center">
                                        <Eye className="h-4 w-4 mr-1" />
                                        <span>View CV</span>
                                        <Maximize2 className="h-3 w-3 ml-1" />
                                    </div>
                                </Button>
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
                <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh]">
                    <DialogHeader>
                        <DialogTitle>{viewFile?.filename}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 bg-gray-100 rounded-md p-2 h-[80vh] overflow-hidden">
                        {viewFile && (
                            <div className="h-full">
                                <PDFViewer filename={viewFile.filename} />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 