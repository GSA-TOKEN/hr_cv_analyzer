"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { uploadAndAnalyzeCV } from "@/lib/api"
import { toast } from "sonner"

export default function UploadCVPanel() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [successCount, setSuccessCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)
    setUploadStatus("uploading")

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('file', file)
      })

      const response = await fetch('/api/cv-store', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload files')
      }

      const result = await response.json()
      console.log('Upload successful:', result)

      // Clear files after successful upload
      setFiles([])
      setUploadStatus("success")
      setSuccessCount(files.length)
      toast.success('Files uploaded successfully')
    } catch (error) {
      console.error('Error uploading files:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload files')
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload files')
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CVs</CardTitle>
          <CardDescription>Upload candidate CVs for analysis and tagging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                id="cv-upload"
                type="file"
                accept=".pdf,.docx,.doc"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="cv-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-500 mt-1">PDF or Word documents up to 10MB</span>
              </label>
            </div>

            {files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Selected Files ({files.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={uploading}>
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadStatus === "uploading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Upload Complete</AlertTitle>
                <AlertDescription>
                  Successfully processed {successCount} out of {files.length} CVs.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="w-full">
              {uploading ? "Uploading..." : "Upload and Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Tips</CardTitle>
          <CardDescription>Recommendations for efficient CV processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Supported Formats</h4>
              <p className="text-sm text-gray-500">PDF (.pdf), Microsoft Word (.docx, .doc)</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">File Naming</h4>
              <p className="text-sm text-gray-500">
                For best results, name files with candidate names (e.g., "John_Smith_CV.pdf")
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Processing Time</h4>
              <p className="text-sm text-gray-500">
                Each CV takes approximately 15-30 seconds to analyze. Bulk uploads will be processed sequentially.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Best Practices</h4>
              <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>Ensure CVs are text-searchable (not scanned images)</li>
                <li>Upload up to 20 files at once for optimal performance</li>
                <li>Standard CV formats yield the most accurate results</li>
                <li>Check analysis results after upload to verify accuracy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

