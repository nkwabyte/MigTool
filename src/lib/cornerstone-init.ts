import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';



let initialized = false;

export async function initCornerstone() {
    if (initialized) return;

    // Initialize Cornerstone Core
    await cornerstone.init();

    // Initialize Cornerstone Tools
    await cornerstoneTools.init();

    // Initialize DICOM Image Loader
    // Modern Cornerstone3D loader initialization
    // Web worker configuration is often handled automatically or via simple config object if needed
    // but the .init() method is the standard entry point now.
    await cornerstoneDICOMImageLoader.init({
        maxWebWorkers: 4,
    });

    initialized = true;
}
