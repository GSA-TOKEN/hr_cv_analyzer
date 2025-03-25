import { GridFSBucket, ObjectId } from 'mongodb';
import { connectDB } from './mongodb';

let bucket: GridFSBucket | null = null;

export async function getBucket() {
    if (!bucket) {
        const { db } = await connectDB();
        bucket = new GridFSBucket(db);

        // Ensure the fs.files and fs.chunks collections exist
        await db.createCollection('fs.files').catch(() => { });
        await db.createCollection('fs.chunks').catch(() => { });
    }
    return bucket;
}

export async function uploadFile(file: Buffer, filename: string, contentType: string): Promise<string> {
    const bucket = await getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: {
            uploadDate: new Date(),
        }
    });

    return new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
            resolve(uploadStream.id.toString());
        });
        uploadStream.on('error', reject);
        uploadStream.end(file);
    });
}

export async function getFileFromGridFS(id: string): Promise<Buffer> {
    const bucket = await getBucket();
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        downloadStream.on('data', (chunk) => chunks.push(chunk));
        downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
        downloadStream.on('error', reject);
    });
}

export async function deleteFileFromGridFS(id: string): Promise<void> {
    const bucket = await getBucket();
    await bucket.delete(new ObjectId(id));
}

export async function getFileMetadata(id: string) {
    const bucket = await getBucket();
    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    return files[0];
}

export async function listFiles(): Promise<Array<{ id: string; filename: string; size: number }>> {
    const bucket = await getBucket();
    const files = await bucket.find().toArray();
    return files.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        size: file.length
    }));
}

// Initialize GridFS bucket on module load
getBucket().catch(console.error); 