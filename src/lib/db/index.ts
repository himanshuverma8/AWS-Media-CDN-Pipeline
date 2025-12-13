import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {eq, and, desc} from "drizzle-orm";
import { randomBytes } from 'crypto';
import { users, userFiles, type UserFile, DbUser } from './schema';

//create drizzle db instance
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// user interface
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

function userToFormat(user: DbUser): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    }
}

export async function getOrCreateUser(email: string, name: string): Promise<User | null> {
    const existing = await getUserByEmail(email);
    if (existing) return existing;

    const [newUser] = await db.insert(users).values({
        email,
        name
    }).returning();

    return userToFormat(newUser);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] ? userToFormat(result[0]) : null;
}
export async function getUserById(userId: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0] ? userToFormat(result[0]) : null;
}

//api key functions
export async function generateApiCredentials(userId: string): Promise<{ apiKey: string; apiSecret: string}> {
    //generate the api key using random bytes from crypto
    const apiKey = `hv_${randomBytes(24).toString('hex')}`;
    //generate api secret (64 character hex string)
    const apiSecret = randomBytes(32).toString('hex');

    await db.update(users)
        .set({
            apiKey,
            apiSecret,
            apiKeyCreatedAt: new Date(),
        })
        .where(eq(users.id, userId));

        return { apiKey, apiSecret};
}

//get user by api key
export async function getUserByApiKey(apiKey: string): Promise<User | null> {
    const result = await db.select().from(users)
        .where(eq(users.apiKey, apiKey))
        .limit(1);
    
    return result[0] ? userToFormat(result[0]) : null;
}

//get api credentials for a user
export async function getApiCredentials(userId: string): Promise<{apiKey: string | null; apiSecret: string | null }>{
    const result = await db.select({
        apiKey: users.apiKey,
        apiSecret: users.apiSecret
    })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return result[0] || { apiKey: null, apiSecret: null };
}
//revoke api credentials
export async function revokeApiCredentials(userId: string): Promise<void> {
    await db.update(users)
        .set({
            apiKey: null,
            apiSecret: null,
            apiKeyCreatedAt: null
        })
        .where(eq(users.id, userId));
}

//file operations
export async function createUserFile(fileData: Omit<UserFile, 'id' | 'uploadedAt'>): Promise<UserFile> {
    const [file] = await db.insert(userFiles).values({
        userId: fileData.userId,
        s3Key: fileData.s3Key,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        folder: fileData.folder,
        size: fileData.size,
        mimeType: fileData.mimeType,
        metadata: fileData.metadata
    }).returning();

    return {
        ...file,
        size: Number(file.size),
    };
}

export async function getUserFiles(userId: string, folder?: string): Promise<UserFile[]> {
    const query = db.select().from(userFiles);

    const result = folder
        ? await query.where(and(eq(userFiles.userId, userId), eq(userFiles.folder, folder))).orderBy(desc(userFiles.uploadedAt))
        : await query.where(eq(userFiles.userId, userId)).orderBy(desc(userFiles.uploadedAt));

    return result.map(file => ({
        ...file,
        size: Number(file.size),
    }))
}

export async function deleteUserFile(fileId: string, userId: string): Promise<boolean> {
    const result = await db.delete(userFiles)
        .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)))
        .returning();

    return result.length > 0;
}

export async function deleteUserFileByS3Key(s3Key: string, userId: string): Promise<boolean> {
    const result = await db.delete(userFiles)
        .where(and(eq(userFiles.s3Key, s3Key), eq(userFiles.userId, userId)))
        .returning();

    return result.length > 0;
}

export async function updateUserFileS3Key(oldS3Key: string, newS3Key: string, newFileName: string, userId: string): Promise<boolean> {
    const result = await db.update(userFiles)
        .set({
            s3Key: newS3Key,
            fileName: newFileName,
        })
        .where(and(eq(userFiles.s3Key, oldS3Key), eq(userFiles.userId, userId)))
        .returning();

    return result.length > 0;
}

// export types
export type { UserFile };

