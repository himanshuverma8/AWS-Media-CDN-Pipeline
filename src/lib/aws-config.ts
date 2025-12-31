import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

//aws configuration
export const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
export const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || 'cdn.hv6.dev';

//helper fn to generate the cdn urls
export function generateCDNUrl(filePath: string, isImage: boolean = false): string {
    const basePath = isImage ? 'images' : 'files';
    const cleanFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `https://${CLOUDFRONT_DOMAIN}/${basePath}/${cleanFilePath}`;
}

//generate presigned URL for secure access
export async function generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
}

//storage limit
export const USER_STORAGE_LIMIT = 50*1024*1024; //50mb
export const GLOBAL_STORAGE_LIMIT = 4.8*1024*1024*1024; //4.8gb


