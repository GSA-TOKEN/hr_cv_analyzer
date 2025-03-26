import * as pdfjs from 'pdfjs-dist';
import path from 'path';

// The worker needs to be loaded once for the application
export const setupPdfWorker = () => {
    try {
        if (typeof window !== 'undefined') {
            // Client-side: Use CDN for worker
            pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        } else {
            // Server-side: Set worker to null for Node.js environment
            // This allows PDF.js to work in Node without requiring a worker
            pdfjs.GlobalWorkerOptions.workerSrc = '';

            // Polyfill required globals for Node.js
            const { TextDecoder, TextEncoder } = require('util');
            const { URL } = require('url');

            global.TextDecoder = TextDecoder;
            global.TextEncoder = TextEncoder;
            global.URL = URL;
        }

        return pdfjs;
    } catch (error) {
        console.error('Error setting up PDF.js worker:', error);
        return pdfjs;
    }
}; 