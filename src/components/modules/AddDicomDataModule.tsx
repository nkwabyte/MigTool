'use client'

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FolderOpen, HardDrive, Upload, FileText, CheckCircle2, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { saveImportSession } from "@/src/actions/dicom-history";
import { importDicomFiles } from "@/src/actions/dicom-import";
import { useRouter } from "next/navigation";

interface UploadedFile {
  name: string;
  size: number;
  path: string;
  file: File; // Keep reference to actual File object
}

export function AddDicomDataModule() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDraggingFolder, setIsDraggingFolder] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStats, setProcessingStats] = useState({ current: 0, total: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileDrop = (e: React.DragEvent, isFolder: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);
    setIsDraggingFolder(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files, isFolder);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isFolder: boolean = false) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files), isFolder);
    }
  };

  const isDicomFile = async (file: File): Promise<boolean> => {
    // Check file extension first
    const validExtensions = ['.dcm', '.dicom', '.DCM', '.DICOM', '.zip', '.ZIP'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()));

    // Files with no extension might be DICOM too
    const hasNoExtension = !file.name.includes('.');

    if (!hasValidExtension && !hasNoExtension) {
      return false;
    }

    // Check DICOM magic bytes in file header
    try {
      const buffer = await file.slice(0, 132).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // DICOM files have "DICM" at byte offset 128
      if (bytes.length >= 132) {
        const dicmString = String.fromCharCode(bytes[128], bytes[129], bytes[130], bytes[131]);
        if (dicmString === 'DICM') {
          return true;
        }
      }

      // If no DICM signature but has valid extension, still accept it
      return hasValidExtension || hasNoExtension;
    } catch (error) {
      // If we can't read the file, accept it if it has valid extension
      return hasValidExtension || hasNoExtension;
    }
  };

  const processFiles = async (files: File[], silent: boolean = false) => {
    const rejected: string[] = [];
    const validFiles: UploadedFile[] = [];
    const totalFiles = files.length;

    if (totalFiles === 0) return;

    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStats({ current: 0, total: totalFiles });

    // Show processing toast
    const toastId = toast.loading(`Processing ${totalFiles} file(s)...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isValid = await isDicomFile(file);

      if (isValid) {
        validFiles.push({
          name: file.name,
          size: file.size,
          path: file.webkitRelativePath || file.name,
          file: file, // Store the actual File object
        });
      } else {
        rejected.push(file.name);
      }

      // Update progress
      const progress = Math.round(((i + 1) / totalFiles) * 100);
      setUploadProgress(progress);
      setProcessingStats({ current: i + 1, total: totalFiles });
    }

    // Dismiss loading toast
    toast.dismiss(toastId);

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(
        `Found ${validFiles.length} valid DICOM file(s)${rejected.length > 0 ? ` (${rejected.length} skipped)` : ''}`,
        { duration: 3000 }
      );
    } else if (files.length > 0) {
      toast.error("No valid DICOM files found in the selected folder", { duration: 4000 });
    }

    // Always show rejected files in UI for better visibility
    if (rejected.length > 0) {
      setRejectedFiles(rejected);
      setTimeout(() => setRejectedFiles([]), 12000); // Increased to 12 seconds for better visibility
    }

    setIsProcessing(false);
    setUploadProgress(0);
    setProcessingStats({ current: 0, total: 0 });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent, isFolder: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFolder) {
      setIsDraggingFolder(true);
    } else {
      setIsDraggingFiles(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, isFolder: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFolder) {
      setIsDraggingFolder(false);
    } else {
      setIsDraggingFiles(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleImport = async () => {
    if (uploadedFiles.length === 0) return;

    setIsImporting(true);
    const toastId = toast.loading(`Importing ${uploadedFiles.length} file(s)...`);

    try {
      // Create FormData with actual File objects
      const formData = new FormData();
      uploadedFiles.forEach(({ file }) => {
        formData.append('files', file);
      });

      // Save files to server
      const uploadResult = await importDicomFiles(formData);

      if (!uploadResult.success || !uploadResult.sessionId) {
        toast.dismiss(toastId);
        toast.error(uploadResult.error || 'Failed to upload files', { duration: 4000 });
        return;
      }

      // Save import session to database with file paths from server response
      // If savedFiles is returned (new zip logic), use it. Otherwise fallback to client-side derived paths (legacy/fallback)
      const filesMetadata = uploadResult.savedFiles || uploadedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        path: `/dicom/${uploadResult.sessionId}/${f.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      }));

      const result = await saveImportSession(filesMetadata);

      if (!result.success) {
        toast.dismiss(toastId);
        if (result.error === 'Not authenticated') {
          toast.error('Please login to import files', { duration: 4000 });
          router.push('/login');
        } else {
          toast.error(result.error || 'Failed to save import session', { duration: 4000 });
        }
        return;
      }

      toast.dismiss(toastId);
      toast.success(`Successfully imported ${uploadedFiles.length} file(s)!`, {
        duration: 3000,
        action: {
          label: 'View History',
          onClick: () => router.push('/dicom')
        }
      });

      // Clear uploaded files
      setUploadedFiles([]);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to import files. Please try again.', { duration: 4000 });
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#1E1E1E] flex items-center justify-center overflow-auto">
      <Tabs defaultValue="local" className="w-full max-w-4xl px-6">
        <div className="mb-6">
          <h2 className="text-white/90 mb-2">Add DICOM Data</h2>
          <p className="text-sm text-white/60">Import medical imaging data from various sources</p>
        </div>

        <TabsList className="bg-[#2B2B2B] border border-[#3E3E42] w-full">
          <TabsTrigger
            value="local"
            className="text-white/70 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white flex-1"
          >
            <HardDrive className="h-4 w-4 mr-2" />
            DICOM Files
          </TabsTrigger>
        </TabsList>

        {/* Local Files Tab */}
        <TabsContent value="local" className="mt-6">
          <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
            <h3 className="text-white/80 mb-4">Select DICOM Data</h3>
            <p className="text-sm text-white/60 mb-6">
              Select DICOM files (.dcm, .dicom) or folders containing DICOM images. Only valid DICOM medical imaging files will be accepted.
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-white/70 mb-2 block">Import Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Folder Upload */}
                  <div
                    onDrop={(e) => handleFileDrop(e, true)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, true)}
                    onDragLeave={(e) => handleDragLeave(e, true)}
                    onClick={() => folderInputRef.current?.click()}
                    className={`h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDraggingFolder
                      ? 'bg-[#00A9E0]/20 border-[#00A9E0]'
                      : 'bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50'
                      }`}
                  >
                    <FolderOpen className="h-8 w-8 text-[#00A9E0]" />
                    <div className="text-center">
                      <div className="text-white/80">Select Folder</div>
                      <div className="text-xs text-white/50 mt-1">Browse directories</div>
                    </div>
                  </div>
                  <input
                    ref={folderInputRef}
                    type="file"
                    /* @ts-ignore */
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={(e) => handleFileSelect(e, true)}
                    className="hidden"
                  />

                  {/* Files Upload */}
                  <div
                    onDrop={(e) => handleFileDrop(e, false)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, false)}
                    onDragLeave={(e) => handleDragLeave(e, false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isDraggingFiles
                      ? 'bg-[#00A9E0]/20 border-[#00A9E0]'
                      : 'bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50'
                      }`}
                  >
                    <Upload className="h-8 w-8 text-[#00A9E0]" />
                    <div className="text-center">
                      <div className="text-white/80">Select Files</div>
                      <div className="text-xs text-white/50 mt-1">Choose individual files</div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="bg-[#1E1E1E] border border-[#3E3E42] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">
                      Processing files... ({processingStats.current}/{processingStats.total})
                    </span>
                    <span className="text-sm text-white/70">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#2B2B2B] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#00A9E0] h-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Separator className="bg-[#3E3E42]" />

              {/* Rejected Files Warning */}
              {rejectedFiles.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-400 font-medium mb-1">
                        {rejectedFiles.length} file(s) rejected - Not valid DICOM images
                      </p>
                      <div className="text-xs text-red-300/80 space-y-0.5 max-h-20 overflow-y-auto">
                        {rejectedFiles.map((fileName, idx) => (
                          <div key={idx}>• {fileName}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white/70">Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="max-h-64 overflow-y-auto bg-[#1E1E1E] border border-[#3E3E42] rounded-lg">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border-b border-[#3E3E42] last:border-b-0 hover:bg-[#2B2B2B]"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-[#00A9E0] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white/80 truncate">{file.name}</p>
                            <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeFile(index)}
                          size="sm"
                          variant="ghost"
                          className="text-white/60 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 p-0 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-white/50">
                  {uploadedFiles.length === 0 ? (
                    'No files selected'
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {uploadedFiles.length} file(s) ready to import
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleImport}
                  disabled={uploadedFiles.length === 0 || isProcessing}
                  className="bg-[#00A9E0] hover:bg-[#0090C0] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}