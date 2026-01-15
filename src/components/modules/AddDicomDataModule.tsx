'use client'

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FolderOpen, HardDrive, Upload, FileText, CheckCircle2, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { useState, useRef } from "react";

interface UploadedFile {
  name: string;
  size: number;
  path: string;
}

export function AddDicomDataModule() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDraggingFolder, setIsDraggingFolder] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent, isFolder: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);
    setIsDraggingFolder(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const isDicomFile = async (file: File): Promise<boolean> => {
    // Check file extension first
    const validExtensions = ['.dcm', '.dicom', '.DCM', '.DICOM'];
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

  const processFiles = async (files: File[]) => {
    const rejected: string[] = [];
    const validFiles: UploadedFile[] = [];

    for (const file of files) {
      const isValid = await isDicomFile(file);
      if (isValid) {
        validFiles.push({
          name: file.name,
          size: file.size,
          path: file.webkitRelativePath || file.name
        });
      } else {
        rejected.push(file.name);
      }
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }

    if (rejected.length > 0) {
      setRejectedFiles(rejected);
      setTimeout(() => setRejectedFiles([]), 5000); // Clear after 5 seconds
    }
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

  const handleImport = () => {
    // Simulate import process
    console.log('Importing files:', uploadedFiles);
    // In a real application, this would process the DICOM files
    alert(`Importing ${uploadedFiles.length} file(s)...`);
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
            Local Files
          </TabsTrigger>
          <TabsTrigger 
            value="dicomdir"
            className="text-white/70 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white flex-1"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            DICOMDIR
          </TabsTrigger>
        </TabsList>

        {/* Local Files Tab */}
        <TabsContent value="local" className="mt-6">
          <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
            <h3 className="text-white/80 mb-4">Import from Local Storage</h3>
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
                    className={`h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      isDraggingFolder
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
                    accept=".dcm,.dicom,.DCM,.DICOM"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Files Upload */}
                  <div
                    onDrop={(e) => handleFileDrop(e, false)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, false)}
                    onDragLeave={(e) => handleDragLeave(e, false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      isDraggingFiles
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
                    accept=".dcm,.dicom,.DCM,.DICOM"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <Separator className="bg-[#3E3E42]" />

              {/* Rejected Files Warning */}
              {rejectedFiles.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
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
                          <FileText className="h-4 w-4 text-[#00A9E0] flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white/80 truncate">{file.name}</p>
                            <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeFile(index)}
                          size="sm"
                          variant="ghost"
                          className="text-white/60 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 p-0 flex-shrink-0"
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
                  disabled={uploadedFiles.length === 0}
                  className="bg-[#00A9E0] hover:bg-[#0090C0] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* DICOMDIR Tab */}
        <TabsContent value="dicomdir" className="mt-6">
          <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
            <h3 className="text-white/80 mb-4">Import from DICOMDIR</h3>
            <p className="text-sm text-white/60 mb-6">
              Load studies from a DICOMDIR file, typically found on medical imaging CDs/DVDs.
            </p>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#3E3E42] rounded-lg p-12 text-center">
                <FolderOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 mb-2">Drop DICOMDIR file here</p>
                <p className="text-xs text-white/50 mb-4">or</p>
                <Button 
                  variant="outline"
                  className="bg-[#1E1E1E] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42]"
                >
                  Browse for DICOMDIR
                </Button>
              </div>

              <Separator className="bg-[#3E3E42]" />

              <div className="space-y-2">
                <Label className="text-white/70">DICOMDIR Path</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="/media/cdrom/DICOMDIR"
                    className="bg-[#1E1E1E] border-[#3E3E42] text-white/80"
                    readOnly
                  />
                  <Button 
                    variant="outline"
                    className="bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42]"
                  >
                    Browse
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-[#00A9E0] hover:bg-[#0090C0] text-white">
                  Load DICOMDIR
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}