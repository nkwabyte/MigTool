'use client';

import { ViewerLayout } from '../../store/slices/uiSlice';
import { ImageViewport } from '../ImageViewport';
import dynamic from 'next/dynamic';

const DicomViewer = dynamic(() => import('../DicomViewer').then(mod => mod.DicomViewer), {
  ssr: false,
});

interface ViewerModuleProps {
  layout: ViewerLayout;
  heatmapIntensity: number;
  imageGenType?: string; // Kept optional for backward compat but unused
  selectedFileUrl?: string | null;
}

export function ViewerModule({ layout, heatmapIntensity, imageGenType, selectedFileUrl }: ViewerModuleProps) {
  // Heatmap overlay component
  const getHeatmapOverlay = () => (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 15% 12% at 45% 35%, 
            rgba(255, 0, 0, ${heatmapIntensity / 150}) 0%, 
            rgba(255, 100, 0, ${heatmapIntensity / 200}) 30%, 
            transparent 70%),
          radial-gradient(ellipse 20% 18% at 60% 40%, 
            rgba(255, 50, 0, ${heatmapIntensity / 180}) 0%, 
            rgba(255, 150, 0, ${heatmapIntensity / 220}) 25%, 
            transparent 65%),
          radial-gradient(ellipse 12% 10% at 35% 50%, 
            rgba(255, 80, 0, ${heatmapIntensity / 190}) 0%, 
            rgba(255, 165, 0, ${heatmapIntensity / 230}) 35%, 
            transparent 75%),
          radial-gradient(ellipse 18% 15% at 52% 55%, 
            rgba(255, 30, 0, ${heatmapIntensity / 170}) 0%, 
            rgba(255, 120, 0, ${heatmapIntensity / 210}) 30%, 
            transparent 70%),
          radial-gradient(ellipse 10% 8% at 48% 42%, 
            rgba(255, 0, 0, ${heatmapIntensity / 160}) 0%, 
            rgba(255, 200, 0, ${heatmapIntensity / 240}) 40%, 
            transparent 80%)
        `,
        mixBlendMode: 'screen'
      }}
    />
  );

  /* Dicom Viewer Wrapper */
  const getDicomViewport = (borderColor: 'red' | 'yellow') => (
    <div className="relative h-full w-full">
      {selectedFileUrl ? (
        <DicomViewer fileUrl={selectedFileUrl} borderColor={borderColor} />
      ) : (
        getEmptyViewport(borderColor)
      )}
    </div>
  );

  // Determine which image goes where based on imageGenType
  const getCTViewport = (borderColor: 'red' | 'yellow', withHeatmap: boolean = false) => (
    <div className="relative h-full w-full">
      <ImageViewport
        imageUrl={""} // Empty default
        patientName=""
        modality=""
        series=""
        imageNumber=""
        window=""
        level=""
        borderColor={borderColor}
        orientation={{}}
      />
    </div>
  );

  const getMRIViewport = (borderColor: 'red' | 'yellow', withHeatmap: boolean = false) => (
    <div className="relative h-full w-full">
      {/* Placeholder or actual result if available. For now, empty if no result. */}
      {/* Ideally we would have a result image URL to display here if generation happened */}
      <ImageViewport
        imageUrl={""} // Empty until we have logic for generated image result
        patientName=""
        modality=""
        series=""
        imageNumber=""
        window=""
        level=""
        borderColor={borderColor}
        orientation={{}}
      />
      {/* Viewport for potential result image - removing static placeholder */}
    </div>
  );

  const getEmptyViewport = (borderColor: 'red' | 'yellow') => (
    <ImageViewport
      imageUrl=""
      patientName=""
      modality=""
      series=""
      imageNumber=""
      window=""
      level=""
      borderColor={borderColor}
      orientation={{}}
    />
  );

  if (layout === '1x1') {
    return (
      <div className="flex-1 w-full h-full">
        {selectedFileUrl ? getDicomViewport('red') : getEmptyViewport('red')}
      </div>
    );
  }

  if (layout === '1x2') {
    return (
      <div className="flex-1 grid grid-cols-2 grid-rows-1 gap-0">
        {/* Left Viewport - Red Border - Input Image */}
        {selectedFileUrl ? getDicomViewport('red') : (
          <>
            {imageGenType === 'ct-to-mri' && getCTViewport('red', false)}
            {imageGenType === 'mri-to-ct' && getMRIViewport('red', false)}
            {imageGenType === 'none' && getEmptyViewport('red')}
          </>
        )}

        {/* Right Viewport - Yellow Border - Output Image with Heatmap */}
        {imageGenType === 'ct-to-mri' && getMRIViewport('yellow', true)}
        {imageGenType === 'mri-to-ct' && getCTViewport('yellow', true)}
        {imageGenType === 'none' && getCTViewport('yellow', false)}
      </div>
    );
  }

  // 2x2 layout
  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0 min-h-0">
      {/* Top-Left Viewport - Red Border - Input Image */}
      {selectedFileUrl ? getDicomViewport('red') : (
        <>
          {imageGenType === 'ct-to-mri' && getCTViewport('red', false)}
          {imageGenType === 'mri-to-ct' && getMRIViewport('red', false)}
          {imageGenType === 'none' && getEmptyViewport('red')}
        </>
      )}

      {/* Top-Right Viewport - Yellow Border - Output Image with Heatmap */}
      {imageGenType === 'ct-to-mri' && getMRIViewport('yellow', true)}
      {imageGenType === 'mri-to-ct' && getCTViewport('yellow', true)}
      {imageGenType === 'none' && getCTViewport('yellow', false)}

      {/* Bottom-Left Viewport - Empty - Green Border */}
      <ImageViewport
        imageUrl=""
        patientName=""
        modality=""
        series=""
        imageNumber=""
        window=""
        level=""
        borderColor="green"
        orientation={{}}
      />

      {/* Bottom-Right Viewport - Empty - Blue Border */}
      <ImageViewport
        imageUrl=""
        patientName=""
        modality=""
        series=""
        imageNumber=""
        window=""
        level=""
        borderColor="blue"
        orientation={{}}
      />
    </div>
  );
}
