import {NextRequest, NextResponse} from 'next/server';
import { verifyApiAuth } from '@/lib/api-auth';
import { getUserFiles } from '@/lib/db';
import { generateCDNUrl, generatePresignedUrl } from '@/lib/aws-config';
import { error } from 'console';

export async function GET(request: NextRequest) {
    const authResult = await verifyApiAuth(request);
    if(!authResult.authenticated) {
        return NextResponse.json({error: authResult.error}, {status: 401});
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || undefined;
    const type = searchParams.get('type') || 'all';
    const includedPresigned = searchParams.get('presigned') === 'true';

    try {
        const files = await getUserFiles(authResult.user!.id, folder);

        const filesWithUrls = await Promise.all(
            files
                .filter(file => type === 'all' || file.fileType === type)
                .map(async (file) => {
                    const filePath = file.folder ? `${file.folder}/${file.fileName}` : file.fileName;
                    const cdnUrl = generateCDNUrl(`${authResult.user!.id}/${filePath}`, file.fileType === 'image');

                    const basePath = file.fileType === 'image' ? 'images' : 'files';
                    const key = `users/${authResult.user!.id}/${basePath}/${filePath}`;

                    return {
                        id: file.id,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        folder: file.folder,
                        size: file.size,
                        mimeType: file.mimeType,
                        uploadedAt: file.uploadedAt,
                        url: cdnUrl,
                        presignedUrl: includedPresigned ?
                            await generatePresignedUrl(key, 3600) :
                            null,
                    };
                })
        )

        return NextResponse.json({
            success: true,
            files: filesWithUrls,
            count: filesWithUrls.length
        });
    } catch (error) {
        console.error('List files error: ', error);
        return NextResponse.json(
            {error: 'Failed to list files'},
            {status: 500}
        );
    }
}