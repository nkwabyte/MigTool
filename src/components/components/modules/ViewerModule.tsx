import { ImageViewport } from '../ImageViewport';
import { ViewerLayout } from '../../App';
import mriImage from 'figma:asset/f25826900735c77151f96b7831dafcf98bf45a20.png';
import ctImage from 'figma:asset/1b9a6f0b7bb7bc8701cafaf2a061f100a2c0ecfb.png';

interface ViewerModuleProps {
  layout: ViewerLayout;
  heatmapIntensity: number;
  imageGenType: string;
}

export function ViewerModule({ layout, heatmapIntensity, imageGenType }: ViewerModuleProps) {
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

  // Determine which image goes where based on imageGenType
  const getCTViewport = (borderColor: 'red' | 'yellow', withHeatmap: boolean = false) => (
    <div className="relative">
      <ImageViewport
        imageUrl={ctImage}
        patientName="Smith, John"
        modality="CT"
        series="Axial Brain"
        imageNumber="1/1"
        window="1500"
        level="500"
        borderColor={borderColor}
        orientation={{
          top: 'S',
          bottom: 'I',
          left: 'A',
          right: 'P'
        }}
      />
      {withHeatmap && getHeatmapOverlay()}
    </div>
  );

  const getMRIViewport = (borderColor: 'red' | 'yellow', withHeatmap: boolean = false) => (
    <div className="relative">
      <ImageViewport
        imageUrl={mriImage}
        patientName="Smith, John"
        modality="MRI"
        series="Axial T2"
        imageNumber="45/120"
        window="400"
        level="40"
        borderColor={borderColor}
        orientation={{
          top: 'S',
          bottom: 'I',
          left: 'R',
          right: 'L'
        }}
      />
      {withHeatmap && getHeatmapOverlay()}
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

  if (layout === '1x2') {
    return (
      <div className="flex-1 grid grid-cols-2 grid-rows-1 gap-0">
        {/* Left Viewport - Red Border - Input Image */}
        {imageGenType === 'ct-to-mri' && getCTViewport('red', false)}
        {imageGenType === 'mri-to-ct' && getMRIViewport('red', false)}
        {imageGenType === 'none' && getEmptyViewport('red')}

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
      {imageGenType === 'ct-to-mri' && getCTViewport('red', false)}
      {imageGenType === 'mri-to-ct' && getMRIViewport('red', false)}
      {imageGenType === 'none' && getEmptyViewport('red')}

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