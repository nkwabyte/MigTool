declare module '@cornerstonejs/dicom-image-loader' {
    const cornerstoneDICOMImageLoader: {
        init: (config: { maxWebWorkers?: number;[key: string]: any }) => Promise<void>;
        external: {
            cornerstone: any;
            dicomParser: any;
        };
        configure: (config: any) => void;
        webWorkerManager: {
            initialize: (config: any) => void;
        };
        wadouri: {
            loadImage: (imageId: string, options: any) => Promise<any>;
            fileManager: {
                add: (file: File) => string;
            };
        };
    };
    export default cornerstoneDICOMImageLoader;
}

declare module '@cornerstonejs/tools';
declare module '@cornerstonejs/core';
