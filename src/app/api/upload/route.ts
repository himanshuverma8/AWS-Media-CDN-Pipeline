import {NextRequest, NextResponse} from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, generateCDNUrl } from '@/lib/aws-config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateUser, createUserFile } from '@/lib/db';

export async function POST(request: NextRequest){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email){
    return NextResponse.json({ error: 'Unauthorized'}, {status: 401});
  }

  try {
    //get the user from db or create the user
    const user = await getOrCreateUser(
      session.user.email,
      session.user.name || 'User'
    );

    if (!user) {
      return NextResponse.json(
        {error: 'Failed to get or create user'},
        {status: 500}
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const type = formData.get('type') as string;

    if(!file) {
      return NextResponse.json({ error: 'No file provided'}, {status: 400})
    }

    //User-specific path: users/{userId}/images/ or users/{userId}/files/
    const basePath = type === 'image' ? 'images' : 'files';
    const userPrefix = `users/${user.id}/${basePath}`;
    const filePath = folder && folder.trim() ? `${folder}/${file.name}` : file.name;
    const key = `${userPrefix}/${filePath}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    //upload it to S3
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
      metadata: null
    })

    //generate the cdn url
    const cdnUrl = generateCDNUrl(`${user.id}/${filePath}`, type === 'image');

    return NextResponse.json({
      success: true,
      url: cdnUrl,
      key: key,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({error: 'Failed to upload file'}, {status: 500})
  }
}
