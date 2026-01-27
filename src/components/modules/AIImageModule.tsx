'use client';


import { useState, useTransition } from 'react';
import { toast } from "sonner";
import { generateImage, generateReport } from '../../actions/image-generation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload, Brain, Bot } from 'lucide-react';
import { Textarea } from '../ui/textarea';
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
    const [report, setReport] = useState<string | null>(null);

    const handleGenerateImage = () => {
        if (!prompt) {
            toast.error("Please enter a prompt");
            return;
        }

        startTransition(async () => {
            try {
                const result = await generateImage(prompt, selectedModel);

                if (result.success) {
                    toast.success(result.message || "Image generated successfully");
                    // Assuming the result might eventually return an image URL, or we use the placeholder for now as per the action
                    // For now, we'll keep the placeholder if success, or maybe the action will return a url later.
                    // The current action only returns a message.
                    if (selectedModel === 'nano-banana' && result.message?.includes("Ready")) {
                        // Keep current placeholder or do nothing as it is a setup step
                    } else {
                        setGeneratedImage('/assets/mri_image.png'); // Placeholder logic preserved/simulated
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
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

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
                    toast.success("Report generated successfully");
                } else {
                    toast.error(result.error || "Failed to generate report");
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
                console.error(error);
            }
        });
    };

    return (
        <div className="flex-1 bg-[#1E1E1E] p-6 flex items-center justify-center">
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
                            <h3 className="text-white/80 mb-4">Generate Image from Text Prompt</h3>
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Model</Label>
                                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                                        <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3E3E42] text-white/80">
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1E1E1E] border-[#3E3E42] text-white/80">
                                            <SelectItem value="nano-banana">Google Mini (Nano Banana)</SelectItem>
                                            <SelectItem value="decgan">DeCGAN</SelectItem>
                                            <SelectItem value="att-decgan">Att-DeCGAN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Label className="text-white/70">Prompt</Label>
                                <Textarea
                                    placeholder="e.g., Coronal view of a brain MRI with an acute infarct"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="bg-[#1E1E1E] border-[#3E3E42] text-white/80 min-h-[80px]"
                                    rows={3}
                                />
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
                                    <Label className="text-white/70">Generated Image</Label>
                                    <div className="mt-2 border-2 border-dashed border-[#3E3E42] rounded-lg p-4 flex justify-center">
                                        <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="report" className="mt-6">
                        <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
                            <h3 className="text-white/80 mb-4">Generate a Report for an Existing Image</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="image-upload" className="text-white/70 mb-2 block">Upload Image</Label>
                                    <div className="h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50 relative">
                                        <Upload className="h-8 w-8 text-[#00A9E0]" />
                                        <div className="text-center">
                                            <div className="text-white/80">Click to upload</div>
                                            <div className="text-xs text-white/50 mt-1">PNG, JPG, or DICOM</div>
                                        </div>
                                        <Input id="image-upload" type="file" onChange={handleUploadImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                    {uploadedImage && (
                                        <div className="mt-4">
                                            <Label className="text-white/70">Preview</Label>
                                            <div className="mt-2 border-2 border-dashed border-[#3E3E42] rounded-lg p-4 flex justify-center">
                                                <img src={uploadedImage} alt="Uploaded" className="max-w-full h-auto rounded" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex flex-col h-full">
                                        <Button
                                            onClick={handleGenerateReport}
                                            disabled={!uploadedImage || isPending}
                                            className="w-full mb-4 bg-[#00A9E0] hover:bg-[#0090C0] text-white disabled:opacity-50"
                                        >
                                            {isPending ? "Generating..." : "Generate Report"}
                                        </Button>
                                        {report && (
                                            <div className="mb-4">
                                                <Label className="text-white/70">Generated Report</Label>
                                                <p className="text-sm text-white/80 mt-1 p-3 bg-[#1E1E1E] rounded-md border border-[#3E3E42]">{report}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
