import React from 'react';
import PDFViewerBase from '@/components/pdf-viewer';

interface PDFViewerProps {
    fileUrl: string;
}

// This is a wrapper component that reuses the base PDF viewer component
export const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
    return <PDFViewerBase fileUrl={fileUrl} />;
}; 