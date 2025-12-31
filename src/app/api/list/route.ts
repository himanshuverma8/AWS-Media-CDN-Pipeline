import {NextRequest, NextResponse} from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, generateCDNUrl} from '@/lib/aws-config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/db';

export async function GET(request: NextRequest){
  const session = await getServerSession(authOptions);
  if(!session?.user?.email){
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'file';
    const prefix = searchParams.get('prefix') || '';

    const basePath = type === 'image' ? 'images' : 'files';
    const userPrefix = `users/${user.id}/${basePath}`;
    const cleanPrefix = prefix && prefix.trim() ? prefix.replace(/^\/+|\/+$/g, '') : '';
    const fullPrefix = cleanPrefix ? `${userPrefix}/${cleanPrefix}/` : `${userPrefix}/`;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: fullPrefix,
      Delimiter: '/',
    })

    const response = await s3Client.send(command);

    const folders = (response.CommonPrefixes || [])
      .map(prefix => {
        const folderName = prefix.Prefix?.replace(fullPrefix, '').replace(/\/$/, '') || '';
        return {
          name: folderName,
          type: 'folder',
          path: prefix.Prefix || '',
        };
      })
      .filter(folder => folder.name && folder.name !== '');

  const files = (response.Contents || [])
    .filter(obj => obj.Key && !obj.Key.endsWith('/') && obj.Key !== fullPrefix)
    .map(obj => {
      const fileName = obj.Key?.replace(fullPrefix, '') || '';
      // Remove userPrefix and basePath to get clean path for CDN URL
      const filePath = obj.Key?.replace(`${userPrefix}/`, '').replace(/^(images|files)\//, '') || '';
      // If filePath is empty, use fileName (for root files)
      const cleanPath = filePath || fileName;
      return {
        name: fileName,
        type: 'file',
        size: obj.Size || 0,
        lastModified: obj.LastModified,
        url: generateCDNUrl(`${user.id}/${cleanPath}`, type === 'image'),
        key: obj.Key
      };
    });
    
    return NextResponse.json({
      success: true,
      folders,
      files,
      currentPath: prefix
    })
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list files'}, { status: 500} );
  }
}