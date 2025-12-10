import { NextRequest, NextResponse} from 'next/server';
import { verifyApiAuth } from '@/lib/api-auth';
import { generatePresignedUrl } from '@/lib/aws-config';
import { error } from 'console';

export async function GET(request: NextRequest) {
    const authResult = await verifyApiAuth(request);
    if(!authResult.authenticated) {
        return NextResponse.json({error: authResult.error}, {status: 401});
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const type = searchParams.get('type') || 'file';
    const expiresIn = parseInt(searchParams.get('expires') || '3600');

    if(!filePath) {
        return NextResponse.json(
            {error: 'path parameter is required'},
            {status: 400}
        );
    }

    try {
        const basePath = type === 'image' ? 'images' : 'files';
        const key = `users/${authResult.user!.id}/${basePath}/${filePath}`;

        const presignedUrl = await generatePresignedUrl(key, expiresIn);

        return NextResponse.json({
            success: true,
            url: presignedUrl,
            expiresIn
        });
    } catch (error) {
        console.error('Presigned URL error:', error);
        return NextResponse.json(
            {error: 'Failed to generate presigned URL'},
            {status: 500}
        );
    }
}