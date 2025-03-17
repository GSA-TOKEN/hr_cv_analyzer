"use client"

import { useState, useEffect } from 'react'
import path from 'path'

export default function CVDebugPage() {
    const [files, setFiles] = useState<string[]>([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedFile, setSelectedFile] = useState('')

    useEffect(() => {
        const getCVFiles = async () => {
            try {
                setLoading(true)
                const res = await fetch('/api/cvs')
                const data = await res.json()

                if (data.cvs && Array.isArray(data.cvs)) {
                    setFiles(data.cvs.map((cv: any) => cv.filename))
                } else {
                    setError('Invalid response format')
                }
            } catch (err) {
                setError('Failed to load CV files')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        getCVFiles()
    }, [])

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">CV Debug Page</h1>

            <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded">
                <p className="text-yellow-800">
                    This page is for debugging CV file viewing issues. Use the links below to test direct access to CV files.
                </p>
            </div>

            {loading ? (
                <p>Loading CV files...</p>
            ) : error ? (
                <div className="bg-red-50 text-red-800 p-4 rounded">
                    Error: {error}
                </div>
            ) : (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Available CV Files</h2>
                    {files.length === 0 ? (
                        <p>No CV files found</p>
                    ) : (
                        <div className="space-y-4">
                            <ul className="bg-white border rounded divide-y">
                                {files.map((file) => (
                                    <li key={file} className="p-3 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <span>{file}</span>
                                            <div className="space-x-2">
                                                <a
                                                    href={`/api/serve-cv/${encodeURIComponent(file)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                                >
                                                    Direct Link
                                                </a>
                                                <button
                                                    onClick={() => setSelectedFile(file)}
                                                    className="bg-gray-200 px-3 py-1 rounded text-sm"
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {selectedFile && (
                                <div className="mt-6 bg-white border rounded p-4">
                                    <h3 className="text-lg font-medium mb-3">File Details: {selectedFile}</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>URL:</strong> <code className="bg-gray-100 p-1">/api/serve-cv/{encodeURIComponent(selectedFile)}</code></p>
                                        <p><strong>Original path:</strong> <code className="bg-gray-100 p-1">/cv/{selectedFile}</code></p>
                                        <p><strong>Content-Type:</strong> {selectedFile.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'unknown'}</p>
                                        <p><strong>Encoded name:</strong> <code className="bg-gray-100 p-1">{encodeURIComponent(selectedFile)}</code></p>
                                        <p className="mt-4">
                                            <a
                                                href={`/api/serve-cv/${encodeURIComponent(selectedFile)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block bg-green-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Test View in New Tab
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 