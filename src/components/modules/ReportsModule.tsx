'use client';

import { FileText, Calendar, User, Download, Printer, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { getReports } from '@/src/actions/reports';
import { GeneratedReport } from '@/src/db/schema';
import { useEffect, useState } from 'react';
import { ReportDetailView } from '../ReportDetailView';
import { useSearchParams } from 'next/navigation';

// Extended interface to match UI expectations (mapping DB fields to UI prop names if needed)
interface UIReport extends GeneratedReport {
  reportText: string;
  description: string;
  patientId: string;
  generatedDate: string;
  images: { url: string; label: string }[];
}

export function ReportsModule() {
  const [reports, setReports] = useState<UIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<UIReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchReports() {
      try {
        const result = await getReports();
        if (result.success && result.reports) {
          // Map DB report to UI report format
          const mappedReports: UIReport[] = result.reports.map(r => ({
            ...r,
            reportText: r.reportContent, // Map content to text
            description: r.reportType === 'brief' ? 'Brief Radiology Report' : 'Detailed Radiology Report',
            patientId: r.patientName.startsWith('PID-') ? r.patientName : 'MRN-UNKNOWN',
            generatedDate: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            images: r.imageUrl ? [{ url: r.imageUrl, label: 'Source Image' }] : []
          })) as UIReport[];
          setReports(mappedReports);

          // Check for URL query param to auto-select report
          const reportIdFromUrl = searchParams.get('id');
          if (reportIdFromUrl) {
            const reportToSelect = mappedReports.find(r => r.id === reportIdFromUrl);
            if (reportToSelect) {
              setSelectedReport(reportToSelect);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // If a report is selected, show the detail view
  if (selectedReport) {
    return (
      <ReportDetailView
        report={selectedReport as any} // Cast to satisfy legacy Redux type for now, UIReport matches shape mostly
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  // Filter reports based on search query
  const filteredReports = reports.filter(report => {
    const query = searchQuery.toLowerCase();
    return (
      report.patientName.toLowerCase().includes(query) ||
      report.patientId.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      report.bodyPart.toLowerCase().includes(query) ||
      report.modality?.toLowerCase().includes(query) ||
      report.radiologist?.toLowerCase().includes(query) ||
      report.status?.toLowerCase().includes(query) ||
      report.reportText?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden h-full">
      {/* Header */}
      <div className="border-b border-[#3E3E42] p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl text-white/90">Radiology Reports</h1>
            <p className="text-sm text-white/60 mt-1">
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} available
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white"
              disabled={reports.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white"
              disabled={reports.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, or study description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2B2B2B] border border-[#3E3E42] rounded px-10 py-2 text-white/90 placeholder:text-white/40 focus:outline-none focus:border-[#00A9E0]"
          />
        </div>
      </div>

      {/* Reports List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg">
                {reports.length === 0
                  ? 'No reports generated yet'
                  : 'No reports match your search'}
              </p>
              <p className="text-sm mt-2">
                {reports.length === 0
                  ? 'Generate reports from the Image Viewer module'
                  : 'Try a different search term'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-4 hover:border-[#00A9E0] transition-colors"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#00A9E0]" />
                    <div>
                      <h3 className="text-white/90">{report.patientName}</h3>
                      <p className="text-sm text-white/60">MRN: {report.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs capitalize ${report.reportType === 'detailed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                      }`}>
                      {report.reportType}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${report.status === 'Finalized'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {report.status}
                    </div>
                  </div>
                </div>

                {/* Study Details */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-white/40" />
                    <span className="text-white/60">Study Date:</span>
                    <span className="text-white/90">{report.studyDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">Modality:</span>
                    <span className="text-white/90">{report.modality}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">Body Part:</span>
                    <span className="text-white/90">{report.bodyPart}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-white/40" />
                    <span className="text-white/60">Radiologist:</span>
                    <span className="text-white/90">{report.radiologist}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm mb-2">
                  <span className="text-white/60">Description: </span>
                  <span className="text-white/90">{report.description}</span>
                </div>

                {/* Preview of Impression */}
                <div className="text-sm bg-[#1E1E1E] border border-[#3E3E42] rounded p-3 mb-3">
                  <span className="text-white/60">Impression: </span>
                  <span className="text-white/80">
                    {report.impression && report.impression.length > 150
                      ? `${report.impression.substring(0, 150)}...`
                      : report.impression || 'No impression available'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[#3E3E42]">
                  <Button
                    size="sm"
                    className="bg-[#00A9E0] hover:bg-[#0090c0] text-white"
                    onClick={() => setSelectedReport(report)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white"
                    onClick={async () => {
                      // Quick download without opening the report
                      setSelectedReport(report);
                      // Small delay to ensure component is mounted before triggering download
                      setTimeout(() => {
                        const downloadBtn = document.querySelector('[data-download-pdf]') as HTMLElement;
                        if (downloadBtn) downloadBtn.click();
                        setTimeout(() => setSelectedReport(null), 100);
                      }, 100);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}