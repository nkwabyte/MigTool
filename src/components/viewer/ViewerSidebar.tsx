'use client';

import { useEffect, useState } from 'react';
import { getImportSessions, ImportSessionData, ImportedFile } from '@/src/actions/dicom-history';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar, File as FileIcon, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ViewerSidebarProps {
    onFileSelect: (url: string) => void;
    selectedFileUrl: string | null;
}

export function ViewerSidebar({ onFileSelect, selectedFileUrl }: ViewerSidebarProps) {
    const [sessions, setSessions] = useState<ImportSessionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setIsLoading(true);
            const data = await getImportSessions();
            setSessions(data);
            if (data.length > 0) {
                setExpandedSessionId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSession = (sessionId: string) => {
        setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-64 bg-[#1E1E1E] border-r border-[#3E3E42] flex flex-col h-full">
            <div className="p-4 border-b border-[#3E3E42]">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Study Browser
                </h2>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="text-white/50 text-xs text-center p-4">Loading studies...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-white/50 text-xs text-center p-4">No imported studies found.</div>
                    ) : (
                        <div className="space-y-1">
                            {sessions.map((session) => (
                                <div key={session.id} className="rounded overflow-hidden">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between px-2 py-2 h-auto hover:bg-[#2B2B2B] text-left"
                                        onClick={() => toggleSession(session.id)}
                                    >
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                                                <Calendar className="h-3 w-3 text-white/60" />
                                                <span className="truncate">{formatDate(session.timestamp)}</span>
                                            </div>
                                            <span className="text-xs text-white/50 ml-5">
                                                {session.fileCount} files
                                            </span>
                                        </div>
                                        {expandedSessionId === session.id ? (
                                            <ChevronDown className="h-3 w-3 text-white/50" />
                                        ) : (
                                            <ChevronRight className="h-3 w-3 text-white/50" />
                                        )}
                                    </Button>

                                    {expandedSessionId === session.id && (
                                        <div className="bg-[#111111]/50 pl-4 pr-1 py-1 space-y-0.5">
                                            {session.files.map((file) => {
                                                const isSelected = selectedFileUrl === file.path;
                                                return (
                                                    <Button
                                                        key={file.path}
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "w-full justify-start h-8 px-2 text-xs font-normal truncate",
                                                            isSelected ? "bg-[#00A9E0]/20 text-[#00A9E0]" : "text-white/70 hover:text-white hover:bg-[#2B2B2B]"
                                                        )}
                                                        onClick={() => onFileSelect(file.path)}
                                                        title={file.name}
                                                    >
                                                        <FileIcon className="h-3 w-3 mr-2 shrink-0" />
                                                        <span className="truncate">{file.name}</span>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
