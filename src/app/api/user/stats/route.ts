import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateUser, getUserStats } from '@/lib/db';
import { error } from 'console';

// Helper function to format bytes
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


export async function GET() {

    //verify authentication
    const session = await getServerSession(authOptions);
    if(!session?.user?.email){
        return NextResponse.json({error: 'unauthorized'}, {status: 401});
    }

    //get user from db
    try {
        const user = await getOrCreateUser(session.user.email, session.user.name || 'User');

        if(!user){
            return NextResponse.json(
                {error: 'failed to get user'},
                {status: 500}
            );
        }

        //calculate stats
        const stats = await getUserStats(user.id);

        //return the json response
        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    avatar: session.user.image || null
                },
                stats: {
                    totalFiles: stats.totalFiles,
                    totalImages: stats.totalImages,
                    totalDocuments: stats.totalDocuments,
                    totalStorageBytes: stats.totalStorageBytes,
                    totalStorageFormatted: formatBytes(stats.totalStorageBytes),
                    hasApiKey: stats.hasApiKey,
                    apiKeyCreatedAt: stats.apikeyCreatedAt
                }
            }
        )
    } catch (error) {

        console.error('error fetching user stats:', error);
        return NextResponse.json(
            {error: 'failed to fetch the user stats'},
            {status: 500}
        )
        
    }
}