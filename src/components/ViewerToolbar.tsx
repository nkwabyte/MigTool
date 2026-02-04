'use client';

import { FileText, Flame, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ViewerToolbarProps {
  heatmapIntensity: number;
  onHeatmapChange: (value: number[]) => void;
  onGenerateReport: () => void;
  reportType: string;
  onReportTypeChange: (value: string) => void;
  isGenerating?: boolean;
}

export function ViewerToolbar({
  heatmapIntensity,
  onHeatmapChange,
  onGenerateReport,
  reportType,
  onReportTypeChange,
  isGenerating
}: ViewerToolbarProps) {
  return (
    <div className="h-12 bg-[#2B2B2B] border-b border-[#3E3E42] flex items-center justify-between px-4 gap-4">
      {/* Left Side - Image Generation and Report Controls */}
      <div className="flex items-center gap-2">


        {/* Report Type Dropdown */}
        <Select value={reportType} onValueChange={onReportTypeChange}>
          <SelectTrigger className="w-[180px] bg-[#1E1E1E] border-[#3E3E42] text-white/90">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <SelectItem value="none" className="text-white/90 hover:bg-[#3E3E42]">
              No Report
            </SelectItem>
            <SelectItem value="brief" className="text-white/90 hover:bg-[#3E3E42]">
              Brief AI Draft
            </SelectItem>
            <SelectItem value="detailed" className="text-white/90 hover:bg-[#3E3E42]">
              Detailed Report
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Generate Report Button */}
        <Button
          onClick={onGenerateReport}
          disabled={reportType === 'none' || isGenerating}
          className="bg-[#00A9E0] hover:bg-[#0090c0] text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {/* Right Side - Heatmap Intensity Slider */}
      <div className="flex items-center gap-3 min-w-[300px]">
        <Flame className="h-4 w-4 text-white/60" />
        <span className="text-sm text-white/80 whitespace-nowrap">Heatmap Intensity:</span>
        <Slider
          value={[heatmapIntensity]}
          onValueChange={onHeatmapChange}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-white/80 w-12 text-right">{heatmapIntensity}%</span>
      </div>
    </div>
  );
}