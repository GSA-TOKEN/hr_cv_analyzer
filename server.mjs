import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Ensure cv directory exists for file storage
const cvDir = path.join(__dirname, 'cv');
if (!fs.existsSync(cvDir)) {
    fs.mkdirSync(cvDir, { recursive: true });
}

// Ensure .next/static directory exists if it doesn't
const staticDir = path.join(__dirname, '.next', 'static');
if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
}

// Start the server
app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            const { pathname, query } = parsedUrl;

            // Add proper cache control for static assets
            if (pathname.startsWith('/_next/static/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }

            // Log all static file requests
            if (pathname.includes('static') || pathname.includes('_next')) {
                console.log(`Static file request: ${pathname}`);
            }

            // Let Next.js handle the request
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error handling request:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    })
        .once('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
}); 