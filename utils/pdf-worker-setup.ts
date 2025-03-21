import * as pdfjs from 'pdfjs-dist';

// The worker needs to be loaded once for the application
export const setupPdfWorker = () => {
    if (typeof window !== 'undefined') {
        // Client-side: Use CDN for worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    } else {
        // Server-side: Set up a fake worker to avoid errors
        // This is just for SSR and won't be used for actual PDF processing on the server
        const { TextDecoder, TextEncoder } = require('util');
        const { URL } = require('url');

        // Polyfill required globals
        global.TextDecoder = TextDecoder;
        global.TextEncoder = TextEncoder;
        global.URL = URL;

        // Create a fake worker for server-side
        pdfjs.GlobalWorkerOptions.workerSrc = '';
    }

    return pdfjs;
}; 