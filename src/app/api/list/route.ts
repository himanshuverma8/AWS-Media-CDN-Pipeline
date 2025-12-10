import {NextRequest, NextResponse} from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, generateCDNUrl} from '@/lib/aws-config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/db';
import { error } from 'console';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'file';
    const prefix = searchParams.get('prefix') || '';

    const basePath = type === 'image' ? 'image' : 'files';
    const userPrefix = `users/${user.id}/${basePath}`;
    const cleanPrefix = prefix && prefix.trim() ? prefix.replace(/^\/+|\/+$/g, '') : '';
    const fullPrefix = cleanPrefix ? `${userPrefix}/${cleanPrefix}/` : `${userPrefix}`;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: fullPrefix,
      Delimiter: '/',
    })

    const response = await s3Client.send(command);

    const folders = (response.CommonPrefixes || [])
      .map(prefix => {
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
      const filePath = obj.Key?.replace(`${userPrefix}`, '') || '';
      return {
        name: fileName,
        type: 'file',
        size: obj.Size || 0,
        lastModified: obj.LastModified,
        url: generateCDNUrl(`${user.id}/${filePath}`, type === 'image'),
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