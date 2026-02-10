'use client';

import { ViewerLayout } from '../../store/slices/uiSlice';
import { ImageViewport } from '../ImageViewport';
import dynamic from 'next/dynamic';

const DicomViewer = dynamic(() => import('../DicomViewer').then(mod => mod.DicomViewer), {
  ssr: false,
});

interface ViewerModuleProps {
  layout: ViewerLayout;
  imageGenType?: string; // Kept optional for backward compat but unused
  selectedFileUrl?: string | null;
}

export function ViewerModule({ layout, imageGenType, selectedFileUrl }: ViewerModuleProps) {
  // Heatmap overlay removed


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
  const getCTViewport = (borderColor: 'red' | 'yellow') => (
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

  const getMRIViewport = (borderColor: 'red' | 'yellow') => (
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
            {imageGenType === 'ct-to-mri' && getCTViewport('red')}
            {imageGenType === 'mri-to-ct' && getMRIViewport('red')}
            {imageGenType === 'none' && getEmptyViewport('red')}
          </>
        )}

        {/* Right Viewport - Yellow Border - Output Image with Heatmap */}
        {imageGenType === 'ct-to-mri' && getMRIViewport('yellow')}
        {imageGenType === 'mri-to-ct' && getCTViewport('yellow')}
        {imageGenType === 'none' && getCTViewport('yellow')}
      </div>
    );
  }

  // 2x2 layout
  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0 min-h-0">
      {/* Top-Left Viewport - Red Border - Input Image */}
      {selectedFileUrl ? getDicomViewport('red') : (
        <>
          {imageGenType === 'ct-to-mri' && getCTViewport('red')}
          {imageGenType === 'mri-to-ct' && getMRIViewport('red')}
          {imageGenType === 'none' && getEmptyViewport('red')}
        </>
      )}

      {/* Top-Right Viewport - Yellow Border - Output Image with Heatmap */}
      {imageGenType === 'ct-to-mri' && getMRIViewport('yellow')}
      {imageGenType === 'mri-to-ct' && getCTViewport('yellow')}
      {imageGenType === 'none' && getCTViewport('yellow')}

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
