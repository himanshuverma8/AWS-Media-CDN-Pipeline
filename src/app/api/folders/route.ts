import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/aws-config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Validate authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await getOrCreateUser(
      session.user.email,
      session.user.name || 'User'
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    const { folderName, type } = await request.json();

    if (!folderName) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Determine the base path based on type
    const basePath = type === 'image' ? 'images' : 'files';
    // Clean folder name to avoid issues
    const cleanFolderName = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    // User-specific path
    const userPrefix = `users/${user.id}/${basePath}`;
    const key = `${userPrefix}/${cleanFolderName}/`;

    // Create folder by uploading an empty object with trailing slash
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: '',
      ContentType: 'application/x-directory',
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      folderPath: key,
      folderName: cleanFolderName,
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
