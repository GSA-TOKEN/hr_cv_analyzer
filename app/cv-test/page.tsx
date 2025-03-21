"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Tag, User, Calendar, Mail, Phone, Building, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";

export default function TestCVAnalysis() {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const analyzeCV = async () => {
        if (!url) {
            toast.error("Please enter a CV URL");
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/analyze-cv-url", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to analyze CV");
            }

            const data = await response.json();
            setResult(data);
            toast.success("CV analyzed successfully!");
        } catch (error: any) {
            console.error("Error analyzing CV:", error);
            toast.error(`Analysis failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper function to render a profile field
    const renderProfileField = (icon: React.ReactNode, label: string, value: any) => {
        if (!value) return null;
        return (
            <div className="flex items-center gap-2 mb-2">
                <div className="text-slate-500">{icon}</div>
                <div>
                    <span className="font-medium mr-2">{label}:</span>
                    <span>{value}</span>
                </div>
            </div>
        );
    };

    // Show a minimal loading state during hydration
    if (!mounted) {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">CV Analysis</h1>

            <div className="mb-6">
                <label className="block mb-2 font-medium">CV URL</label>
                <div className="flex gap-2">
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to a CV (PDF, DOCX, etc.)"
                        className="flex-1"
                    />
                    <Button onClick={analyzeCV} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Analyze CV"
                        )}
                    </Button>
                </div>
            </div>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {renderProfileField(<User className="h-4 w-4" />, "Name", result.parsedCV.Name)}
                                {renderProfileField(<Mail className="h-4 w-4" />, "Email", result.parsedCV.Email)}
                                {renderProfileField(<Phone className="h-4 w-4" />, "Phone", result.parsedCV.Phone)}
                                {renderProfileField(<Calendar className="h-4 w-4" />, "Age", result.parsedCV.Age)}
                                {renderProfileField(<Building className="h-4 w-4" />, "Location", result.parsedCV.Location)}
                                {renderProfileField(<BriefcaseBusiness className="h-4 w-4" />, "Current Position", result.parsedCV.CurrentPosition)}
                            </div>
                            <div className="mt-4">
                                <h3 className="font-medium mb-2">Analysis Status:</h3>
                                <div className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    <span>CV processed successfully</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Skills & Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {result.tags.map((tag: string, index: number) => (
                                    <div key={index} className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                            {result.parsedCV.Skills && (
                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Skills:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(typeof result.parsedCV.Skills === 'string'
                                            ? result.parsedCV.Skills.split(',')
                                            : Array.isArray(result.parsedCV.Skills)
                                                ? result.parsedCV.Skills
                                                : []
                                        ).map((skill: string, index: number) => (
                                            <div key={index} className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                                                {skill.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(result.parsedCV).map(([key, value]: [string, any]) => {
                                    // Skip certain fields that we've already displayed
                                    if (['Name', 'Email', 'Phone', 'Skills', 'Age', 'Location', 'CurrentPosition'].includes(key)) {
                                        return null;
                                    }

                                    return (
                                        <div key={key} className="border-b pb-3">
                                            <h3 className="font-medium mb-1">{key}:</h3>
                                            <div className="whitespace-pre-wrap">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 