'use client';


import React, { useState, useTransition } from 'react';
import { toast } from "sonner";
import { generateImage, generateReport, generateImageFromImage } from '../../actions/image-generation';
import { saveGeneratedImage } from '../../actions/save-image';
import { saveReport } from '../../actions/reports';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload, Brain, Bot, Download, FileText, MessageCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { Textarea } from '../ui/textarea';
import { ImageChatSidebar } from '../ImageChatSidebar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

export function AIImageModule() {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('nano-banana');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [sourceImage, setSourceImage] = useState<string | null>(null); // For DeCGAN/Att-DeCGAN
    const [translationDirection, setTranslationDirection] = useState<'A_to_B' | 'B_to_A'>('A_to_B');
    const [report, setReport] = useState<string | null>(null);
    const [savedImageId, setSavedImageId] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleGenerateImage = () => {
        // For DeCGAN, Att-DeCGAN, and Gemini 3 Pro Image Preview models, use image-to-image translation
        if (selectedModel === 'decgan' || selectedModel === 'att-decgan' || selectedModel === 'models/gemini-3-pro-image-preview') {
            if (!sourceImage) {
                toast.error("Please upload a source image");
                return;
            }

            startTransition(async () => {
                try {
                    const result = await generateImageFromImage(
                        sourceImage,
                        selectedModel,
                        translationDirection
                    );

                    if (result.success) {
                        toast.success(result.message || "Image translated successfully");
                        if (result.image) {
                            const imageData = `data:image/png;base64,${result.image}`;
                            setGeneratedImage(imageData);

                            // Save image to database
                            const saveResult = await saveGeneratedImage(
                                imageData,
                                selectedModel as 'nano-banana' | 'decgan' | 'att-decgan' | 'models/gemini-3-pro-image-preview',
                                'default-user', // TODO: Replace with actual user ID from session
                                undefined,
                                translationDirection
                            );

                            if (saveResult.success && saveResult.imageId) {
                                setSavedImageId(saveResult.imageId);
                            }
                        }
                    } else {
                        toast.error(result.error || "Failed to translate image");
                    }
                } catch (error) {
                    toast.error("An unexpected error occurred");
                    console.error(error);
                }
            });
            return;
        }

        // For nano-banana model, use text-to-image
        if (!prompt) {
            toast.error("Please enter a prompt");
            return;
        }

        startTransition(async () => {
            try {
                const result = await generateImage(prompt, selectedModel);

                if (result.success) {
                    toast.success(result.message || "Image generated successfully");

                    if (result.image) {
                        const imageData = `data:image/png;base64,${result.image}`;
                        setGeneratedImage(imageData);

                        // Save image to database
                        const saveResult = await saveGeneratedImage(
                            imageData,
                            selectedModel as 'nano-banana' | 'decgan' | 'att-decgan' | 'models/gemini-3-pro-image-preview',
                            'default-user', // TODO: Replace with actual user ID from session
                            prompt
                        );

                        if (saveResult.success && saveResult.imageId) {
                            setSavedImageId(saveResult.imageId);
                        }
                    }
                } else {
                    toast.error(result.error || "Failed to generate image");
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
                console.error(error);
            }
        });
    };

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setReport(null); // Clear previous report when new image is uploaded
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleUploadSourceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSourceImage(event.target?.result as string);
                setGeneratedImage(null); // Clear previous generated image
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        setGeneratedImage(null); // Clear generated image when model changes
        setSavedImageId(null); // Clear saved image ID
        setIsChatOpen(false); // Close chat
    };

    const handleDirectionChange = (direction: 'A_to_B' | 'B_to_A') => {
        setTranslationDirection(direction);
        setGeneratedImage(null); // Clear generated image when direction changes
        setSavedImageId(null); // Clear saved image ID
        setIsChatOpen(false); // Close chat
    };

    // ... existing imports

    const handleGenerateReport = () => {
        if (!uploadedImage) {
            toast.error("Please upload an image first");
            return;
        }

        toast("Generating report...", { description: "Analyzing image with Gemini 1.5 Pro" });

        startTransition(async () => {
            try {
                const result = await generateReport(uploadedImage);
                if (result.success && result.report) {
                    setReport(result.report);
                    // Extract basic info from the report for metadata if possible, or use defaults
                    // Simple heuristic to find Patient Name if generated
                    const patientNameMatch = result.report.match(/Patient Name:?\s*(.*?)(\n|$)/i);
                    const patientName = patientNameMatch ? patientNameMatch[1].trim() : "Unknown Patient";

                    const modalityMatch = result.report.match(/Modality:?\s*(.*?)(\n|$)/i);
                    const modality = modalityMatch ? modalityMatch[1].trim() : "Unknown Modality";

                    const bodyPartMatch = result.report.match(/Body Part:?\s*(.*?)(\n|$)/i);
                    const bodyPart = bodyPartMatch ? bodyPartMatch[1].trim() : "Unknown Body Part";

                    // Save report to database
                    const saveResult = await saveReport({
                        imageUrl: uploadedImage, // This might be a data URL, good for now.
                        reportContent: result.report,
                        patientName,
                        modality,
                        bodyPart,
                        studyDate: new Date().toLocaleDateString(),
                        status: 'Finalized', // Auto-finalize for now
                    });

                    if (saveResult.success) {
                        toast.success("Report generated and saved");
                    } else {
                        toast.warning("Report generated but failed to save to history");
                    }
                } else {
                    toast.error(result.error || "Failed to generate report");
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
                console.error(error);
            }
        });
    };

    const handleDownloadReport = () => {
        if (!report) return;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'medical-report.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadImage = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = 'generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex-1 bg-[#1E1E1E] overflow-y-auto">
            <div className="min-h-full p-6 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                    <div className="mb-6">
                        <h2 className="text-white/90 mb-2">AI Image Generation</h2>
                        <p className="text-sm text-white/60">Create and analyze medical images with AI</p>
                    </div>
                    <Tabs defaultValue="text-to-image" className="w-full">
                        <TabsList className="bg-[#2B2B2B] border border-[#3E3E42] w-full">
                            <TabsTrigger value="text-to-image" className="text-white/70 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white flex-1">
                                <Brain className="h-4 w-4 mr-2" />
                                Text to Image
                            </TabsTrigger>
                            <TabsTrigger value="report" className="text-white/70 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white flex-1">
                                <Bot className="h-4 w-4 mr-2" />
                                Report
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="text-to-image" className="mt-6">
                            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
                                <h3 className="text-white/80 mb-4">
                                    {selectedModel === 'nano-banana'
                                        ? 'Generate Image from Text Prompt'
                                        : 'Medical Image Translation'}
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/70">Model</Label>
                                        <Select value={selectedModel} onValueChange={handleModelChange}>
                                            <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3E3E42] text-white/80">
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1E1E1E] border-[#3E3E42] text-white/80">
                                                <SelectItem value="nano-banana">Google Mini (Nano Banana)</SelectItem>
                                                <SelectItem value="decgan">DeCGAN</SelectItem>
                                                <SelectItem value="att-decgan">Att-DeCGAN</SelectItem>
                                                <SelectItem value="models/gemini-3-pro-image-preview">Gemini 3 Pro (Image Preview)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Conditional UI based on selected model */}
                                    {selectedModel === 'nano-banana' ? (
                                        // Text-to-Image UI for nano-banana
                                        <>
                                            <Label className="text-white/70">Prompt</Label>
                                            <Textarea
                                                placeholder="e.g., Coronal view of a brain MRI with an acute infarct"
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                className="bg-[#1E1E1E] border-[#3E3E42] text-white/80 min-h-[80px]"
                                                rows={3}
                                            />
                                        </>
                                    ) : (
                                        // Image-to-Image UI for DeCGAN and Att-DeCGAN
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-white/70">Translation Direction</Label>
                                                <Select
                                                    value={translationDirection}
                                                    onValueChange={(value) => handleDirectionChange(value as 'A_to_B' | 'B_to_A')}
                                                >
                                                    <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3E3E42] text-white/80">
                                                        <SelectValue placeholder="Select direction" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1E1E1E] border-[#3E3E42] text-white/80">
                                                        <SelectItem value="A_to_B">X-ray → MRI</SelectItem>
                                                        <SelectItem value="B_to_A">MRI → X-ray</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-white/70">Upload Source Image</Label>
                                                <div className="h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50 relative">
                                                    <Upload className="h-8 w-8 text-[#00A9E0]" />
                                                    <div className="text-center">
                                                        <div className="text-white/80">Click to upload</div>
                                                        <div className="text-xs text-white/50 mt-1">
                                                            {translationDirection === 'A_to_B' ? 'Upload X-ray image' : 'Upload MRI image'}
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="file"
                                                        onChange={handleUploadSourceImage}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                    />
                                                </div>
                                            </div>

                                            {sourceImage && (
                                                <div>
                                                    <Label className="text-white/70">Source Image Preview</Label>
                                                    <div className="mt-2 border-2 border-dashed border-[#3E3E42] rounded-lg p-4 flex justify-center">
                                                        <img src={sourceImage} alt="Source" className="max-w-full h-auto max-h-64 rounded" />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <Button
                                        onClick={handleGenerateImage}
                                        disabled={isPending}
                                        className="bg-[#00A9E0] hover:bg-[#0090C0] text-white self-end"
                                    >
                                        {isPending ? "Generating..." : "Generate"}
                                    </Button>
                                </div>
                                {generatedImage && (
                                    <div className="mt-6">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-white/70">Generated Image</Label>
                                            <div className="flex gap-2">
                                                {savedImageId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsChatOpen(true)}
                                                        className="text-white/70 hover:text-white hover:bg-[#3E3E42]"
                                                    >
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Chat with AI
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleDownloadImage}
                                                    className="text-white/70 hover:text-white hover:bg-[#3E3E42]"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 border-2 border-dashed border-[#3E3E42] rounded-lg p-4 flex justify-center relative">
                                            <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="report" className="mt-6">
                            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
                                <h3 className="text-white/80 mb-4">Generate a Report for an Existing Image</h3>
                                <div className="flex flex-col gap-6">
                                    <div className="w-full">
                                        <Label htmlFor="image-upload" className="text-white/70 mb-2 block">Upload Image</Label>
                                        <div className="h-64 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50 relative">
                                            <Upload className="h-8 w-8 text-[#00A9E0]" />
                                            <div className="text-center">
                                                <div className="text-white/80">Click to upload</div>
                                                <div className="text-xs text-white/50 mt-1">PNG, JPG, or DICOM</div>
                                            </div>
                                            <Input id="image-upload" type="file" onChange={handleUploadImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <Button
                                            onClick={handleGenerateReport}
                                            disabled={!uploadedImage || isPending}
                                            className="w-full mb-6 bg-[#00A9E0] hover:bg-[#0090C0] text-white disabled:opacity-50 h-12 text-lg"
                                        >
                                            {isPending ? "Generating..." : "Generate Report"}
                                        </Button>

                                        {uploadedImage && (
                                            <div className="mb-6">
                                                <Label className="text-white/70">Preview</Label>
                                                <div className="mt-2 border-2 border-dashed border-[#3E3E42] rounded-lg p-4 flex justify-center">
                                                    <img src={uploadedImage} alt="Uploaded" className="max-w-full h-auto rounded" />
                                                </div>
                                            </div>
                                        )}

                                        {report && (
                                            <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex justify-between items-center mb-2">
                                                    <Label className="text-white/70 text-lg">Generated Report</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleDownloadReport}
                                                        className="text-white/70 hover:text-white hover:bg-[#3E3E42]"
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Export TXT
                                                    </Button>
                                                </div>
                                                <div className="text-sm text-white/80 p-6 bg-[#1E1E1E] rounded-md border border-[#3E3E42] leading-relaxed shadow-inner">
                                                    <Markdown
                                                        components={{
                                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-white/90" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-white/90" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                                        }}
                                                    >
                                                        {report}
                                                    </Markdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Chat Sidebar */}
            {isChatOpen && savedImageId && (
                <ImageChatSidebar
                    imageId={savedImageId}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}


