declare module 'pdf-parse' {
    interface PDFParseOptions {
        pagerender?: (pageData: any) => Promise<any>;
        max?: number;
        version?: string;
        renderPage?: () => Promise<any>;
        [key: string]: any;
    }

    interface PDFParseResult {
        numpages: number;
        numrender: number;
        info: any;
        metadata: any;
        text: string;
        version: string;
    }

    function PDFParse(dataBuffer: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFParseResult>;

    export default PDFParse;
} 