import { ImageWithFallback } from './ImageWithFallback';
import { Link, Maximize2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';

interface ImageViewportProps {
  imageUrl: string;
  patientName?: string;
  modality?: string;
  series?: string;
  imageNumber?: string;
  window?: string;
  level?: string;
  borderColor: 'red' | 'yellow' | 'green' | 'blue';
  orientation?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

const colorMap = {
  red: {
    border: 'border-red-600',
    bg: 'bg-red-600',
    text: 'text-red-600'
  },
  yellow: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500',
    text: 'text-yellow-500'
  },
  green: {
    border: 'border-green-600',
    bg: 'bg-green-600',
    text: 'text-green-600'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-500'
  }
};

export function ImageViewport({
  imageUrl,
  patientName = "Smith, John",
  modality = "CT",
  series = "Axial",
  imageNumber = "5/120",
  window = "400",
  level = "40",
  borderColor,
  orientation = {}
}: ImageViewportProps) {
  const colors = colorMap[borderColor];

  return (
    <div className={`relative w-full h-full bg-[#101010] border-2 ${colors.border} overflow-hidden flex flex-col`}>
      {/* Colored Top Bar with Controls */}
      <div className={`${colors.bg} h-6 flex items-center justify-between px-2 shrink-0`}>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-black/20 text-white"
          >
            <Link className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-black/20 text-white"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-black/20 text-white"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-white">{series}</div>
      </div>

      {/* Medical Image */}
      <div className="relative flex-1 overflow-hidden">
        {imageUrl && (
          <ImageWithFallback
            src={imageUrl}
            alt="Medical scan"
            className="w-full h-full object-cover opacity-80 grayscale"
          />
        )}

        {/* Overlay Information - Top Left */}
        <div className="absolute top-2 left-2 text-white/80 space-y-0 pointer-events-none select-none text-xs">
          <div>{patientName}</div>
          <div>{modality}</div>
        </div>

        {/* Overlay Information - Top Right */}
        <div className="absolute top-2 right-2 text-white/80 text-xs text-right pointer-events-none select-none">
          <div>W: {window}</div>
          <div>L: {level}</div>
        </div>

        {/* Overlay Information - Bottom Left */}
        <div className="absolute bottom-2 left-2 text-white/80 text-xs pointer-events-none select-none">
          <div>Img {imageNumber}</div>
        </div>

        {/* Orientation Markers */}
        {orientation.top && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none select-none">
            {orientation.top}
          </div>
        )}
        {orientation.bottom && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none select-none">
            {orientation.bottom}
          </div>
        )}
        {orientation.left && (
          <div className="absolute top-1/2 left-8 -translate-y-1/2 text-white/60 text-sm pointer-events-none select-none">
            {orientation.left}
          </div>
        )}
        {orientation.right && (
          <div className="absolute top-1/2 right-8 -translate-y-1/2 text-white/60 text-sm pointer-events-none select-none">
            {orientation.right}
          </div>
        )}
      </div>
    </div>
  );
}
