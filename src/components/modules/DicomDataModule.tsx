'use client';

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FolderOpen, Trash2, Eye, FileText, Image as ImageIcon, MessageSquare, Download, Printer } from "lucide-react";
import { getImportSessions, deleteImportSession, type ImportSessionData } from "@/src/actions/dicom-history";
import { getGeneratedImages } from "@/src/actions/get-generated-images";
import { getReports } from "@/src/actions/reports";
import { useRouter } from "next/navigation";
import { GeneratedImage, GeneratedReport } from "@/src/db/schema";
import { ReportDetailView } from "../ReportDetailView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Report } from "../../store/slices/reportsSlice";

interface DicomDataModuleProps {
  onViewStudy?: (studyId: string) => void;
}

export function DicomDataModule({ onViewStudy }: DicomDataModuleProps) {
  const [activeTab, setActiveTab] = useState("dicom");
  const [importSessions, setImportSessions] = useState<ImportSessionData[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]); // Using DB type
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState<ImportSessionData | null>(null);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);

  const router = useRouter();

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (activeTab === "dicom") {
        const sessions = await getImportSessions();
        setImportSessions(sessions);
      } else if (activeTab === "images") {
        const result = await getGeneratedImages();
        if (result.success && result.images) {
          setGeneratedImages(result.images);
        }
      } else if (activeTab === "reports") {
        const result = await getReports();
        if (result.success && result.reports) {
          setReports(result.reports);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [activeTab]);

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Delete this session?')) {
      const result = await deleteImportSession(sessionId);
      if (result.success) {
        setImportSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        alert(result.error);
      }
    }
  };

  const handleViewFiles = (session: ImportSessionData) => {
    setSelectedSession(session);
    setShowFilesDialog(true);
  };

  const formatDate = (timestamp: string | Date | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Convert DB report to ReportDetailView expected format if needed
  // Although ReportDetailView likely expects a specific shape, let's adapt it.
  // The ReportDetailView expects `Report` interface from slice.
  // We should adapt `GeneratedReport` to `Report`.
  const handleViewReport = (report: GeneratedReport) => {
    setSelectedReport(report);
  };

  if (selectedReport) {
    // Adapter to match ReportDetailView props
    const adaptedReport: Report = {
      id: selectedReport.id,
      patientName: selectedReport.patientName || 'Unknown',
      patientId: 'N/A', // Schema doesn't have patientId/MRN separate? Ah, we parsed it maybe? Or just use ID.
      studyDate: selectedReport.studyDate || new Date(selectedReport.createdAt!).toLocaleDateString(),
      modality: selectedReport.modality || 'Unknown',
      bodyPart: selectedReport.bodyPart || 'Unknown',
      description: 'AI Generated Report',
      radiologist: selectedReport.radiologist || 'AI Assistant',
      reportText: selectedReport.reportContent,
      findings: selectedReport.findings || '',
      impression: selectedReport.impression || '',
      status: (selectedReport.status || 'Finalized') as 'Draft' | 'Finalized',
      reportType: (selectedReport.reportType || 'detailed') as 'brief' | 'detailed',
      generatedDate: selectedReport.createdAt ? selectedReport.createdAt.toISOString() : new Date().toISOString(),
      images: selectedReport.imageUrl ? [{ url: selectedReport.imageUrl, label: 'Analyzed Image' }] : []
    };

    return <ReportDetailView report={adaptedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E]">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white/90 text-2xl font-light">History & Reports</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-[#2B2B2B] border border-[#3E3E42] w-full justify-start h-12 p-1 mb-6">
            <TabsTrigger value="dicom" className="h-full px-6 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white">
              <FolderOpen className="h-4 w-4 mr-2" />
              DICOM Imports
            </TabsTrigger>
            <TabsTrigger value="images" className="h-full px-6 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white">
              <ImageIcon className="h-4 w-4 mr-2" />
              Generated Images
            </TabsTrigger>
            <TabsTrigger value="reports" className="h-full px-6 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              AI Reports
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 bg-[#2B2B2B] border border-[#3E3E42] rounded-lg overflow-hidden">
            <TabsContent value="dicom" className="m-0 h-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#3E3E42] hover:bg-[#3E3E42]">
                    <TableHead className="text-white/70">Import Date</TableHead>
                    <TableHead className="text-white/70">Session ID</TableHead>
                    <TableHead className="text-white/70">File Count</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importSessions.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-white/40 py-8">No import sessions found</TableCell></TableRow>
                  ) : (
                    importSessions.map((session) => (
                      <TableRow key={session.id} className="border-[#3E3E42] hover:bg-[#3E3E42]">
                        <TableCell className="text-white/80">{formatDate(session.timestamp)}</TableCell>
                        <TableCell className="text-white/80 font-mono text-xs">{session.id}</TableCell>
                        <TableCell className="text-white/80">{session.fileCount} file(s)</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]" onClick={() => handleViewFiles(session)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-red-500 hover:bg-[#3E3E42]" onClick={() => handleDeleteSession(session.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="images" className="m-0 h-full overflow-auto">
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedImages.length === 0 ? (
                  <div className="col-span-full text-center text-white/40 py-8">No generated images found</div>
                ) : (
                  generatedImages.map((img) => (
                    <div key={img.id} className="bg-[#1E1E1E] border border-[#3E3E42] rounded-lg overflow-hidden group">
                      <div className="aspect-square relative cursor-pointer">
                        <img src={img.imagePath} alt="Generated" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20"><Download className="h-5 w-5" /></Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-white/60 uppercase">{img.modelType}</p>
                        <p className="text-xs text-white/40 truncate mt-1">{formatDate(img.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="m-0 h-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#3E3E42] hover:bg-[#3E3E42]">
                    <TableHead className="text-white/70">Patient Name</TableHead>
                    <TableHead className="text-white/70">Modality</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Radiologist</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-white/40 py-8">No reports found</TableCell></TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id} className="border-[#3E3E42] hover:bg-[#3E3E42]">
                        <TableCell className="text-white/80">{report.patientName}</TableCell>
                        <TableCell className="text-white/80">{report.modality}</TableCell>
                        <TableCell className="text-white/80">{formatDate(report.createdAt)}</TableCell>
                        <TableCell className="text-white/80">{report.radiologist}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="bg-[#00A9E0]/10 text-[#00A9E0] hover:bg-[#00A9E0] hover:text-white" onClick={() => handleViewReport(report)}>
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Files Dialog */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="bg-[#2B2B2B] border-[#3E3E42] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Session Files</DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedSession?.fileCount} file(s) imported on {selectedSession && formatDate(selectedSession.timestamp)}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#3E3E42]">
                  <TableHead className="text-white/70">File Name</TableHead>
                  <TableHead className="text-white/70">Size</TableHead>
                  <TableHead className="text-white/70">Path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSession?.files.map((file, index) => (
                  <TableRow key={index} className="border-[#3E3E42]">
                    <TableCell className="text-white/80">{file.name}</TableCell>
                    <TableCell className="text-white/80">{formatFileSize(file.size)}</TableCell>
                    <TableCell className="text-white/60 text-xs font-mono truncate max-w-xs">{file.path}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
