import { NextRequest, NextResponse} from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, generateCDNUrl} from '@/lib/aws-config';
import { verifyApiAuth } from '@/lib/api-auth';
import { checkStorageLimits, createUserFile } from '@/lib/db';
import { error } from 'console';

export async function POST(request: NextRequest) {
    //verify api key
    const authResult = await verifyApiAuth(request);
    if(!authResult.authenticated) {
        return NextResponse.json({error: authResult.error }, {status: 401});
    }

    const user = authResult.user!;

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || '';
        const type = formData.get('type') as string || 'file';

        if(!file){
            return NextResponse.json({error: 'No File Provided'}, {status: 400});
        }

        //check before file upload
        const storageCheck = await checkStorageLimits(user.id, file.size);
        
        if(!storageCheck.allowed){
            return NextResponse.json(
                {
                    error: storageCheck.reason || 'Storage limit exceeded',
                    storageInfo: {
                        userStorageUsed: storageCheck.userStorageUsed,
                        userStorageLimit: storageCheck.userStorageLimit,
                        globalStorageUsed: storageCheck.globalStorageUsed,
                        globalStorageLimit: storageCheck.globalStorageLimit,
                    }
                },
                {status : 413}
            );
        }
        //user specific path
        const basePath = type === 'image' ? 'images' : 'files';
        const userPrefix = `users/${user.id}/${basePath}`;
        const filePath = folder && folder.trim() ? `${folder}/${file.name}` : file.name;
        const key = `${userPrefix}/${filePath}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        //upload to s3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            Metadata: {
                userId: user.id,
                uploadedAt: new Date().toISOString(),
            }
        });

        await s3Client.send(command);

        //save file record
        await createUserFile({
            userId: user.id,
            s3Key: key,
            fileName: file.name,
            fileType: type === 'image' ? 'image' : 'file',
            folder: folder || '',
            size: file.size,
            mimeType: file.type,
            metadata: null,
        });

        //generate the cdn url
        const cdnUrl = generateCDNUrl(`${user.id}/${filePath}`, type === 'image');

        return NextResponse.json({
            success: true,
            file: {
                fileName: file.name,
                size: file.size,
                type: file.type,
                cdnUrl,
            }
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}