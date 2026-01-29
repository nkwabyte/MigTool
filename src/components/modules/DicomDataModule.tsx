'use client';

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { FolderOpen, Trash2, Eye, FileText } from "lucide-react";
import { getImportSessions, deleteImportSession, type ImportSessionData } from "@/src/actions/dicom-history";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface DicomDataModuleProps {
  onViewStudy?: (studyId: string) => void;
}

export function DicomDataModule({ onViewStudy }: DicomDataModuleProps) {
  const [sessions, setSessions] = useState<ImportSessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<ImportSessionData | null>(null);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load sessions from database on mount
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      const loadedSessions = await getImportSessions();
      setSessions(loadedSessions);
      setIsLoading(false);
    };
    loadSessions();
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && window.confirm(`Delete import session with ${session.fileCount} file(s)?`)) {
      const result = await deleteImportSession(sessionId);
      if (result.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        alert(result.error || 'Failed to delete session');
      }
    }
  };

  const handleViewFiles = (session: ImportSessionData) => {
    setSelectedSession(session);
    setShowFilesDialog(true);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E]">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/90">Import History</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42]"
              onClick={() => router.push('/add-dicom')}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Import DICOM
            </Button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-[#2B2B2B] border border-[#3E3E42] rounded-lg">
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No imports yet</p>
              <p className="text-sm text-white/40 mb-4">Import DICOM files to see them here</p>
              <Button
                onClick={() => router.push('/add-dicom')}
                className="bg-[#00A9E0] hover:bg-[#0090C0] text-white"
              >
                Import Files
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#2B2B2B] border border-[#3E3E42] rounded-lg overflow-hidden">
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
                {sessions.map((session) => (
                  <TableRow key={session.id} className="border-[#3E3E42] hover:bg-[#3E3E42]">
                    <TableCell className="text-white/80">{formatDate(session.timestamp)}</TableCell>
                    <TableCell className="text-white/80 font-mono text-xs">{session.id}</TableCell>
                    <TableCell className="text-white/80">{session.fileCount} file(s)</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
                          onClick={() => handleViewFiles(session)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/60 hover:text-red-500 hover:bg-[#3E3E42]"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-xs text-white/50">
          {sessions.length} import session(s)
        </div>
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
