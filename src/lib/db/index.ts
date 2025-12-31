import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {eq, and, desc} from "drizzle-orm";
import { randomBytes } from 'crypto';
import { users, userFiles, type UserFile, type User as DbUser } from './schema'
import { GLOBAL_STORAGE_LIMIT, USER_STORAGE_LIMIT } from '../aws-config';

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

export async function updateUserFileS3Key(oldKey: string, newKey: string, newFileName: string, userId: string): Promise<boolean> {
    const result = await db.update(userFiles)
        .set({
            s3Key: newKey,
            fileName: newFileName,
        })
        .where(and(eq(userFiles.s3Key, oldKey), eq(userFiles.userId, userId)))
        .returning();

    return result.length > 0;
}
export interface UserStats {
    totalFiles: number;
    totalImages: number;
    totalDocuments: number;
    totalStorageBytes: number;
    hasApiKey: boolean;
    apiKeyCreatedAt: Date | null;
}

export async function getUserStats(userId: string): Promise<UserStats> {
    const files = await db.select().from(userFiles).where(eq(userFiles.userId, userId));

    const totalFiles = files.length;

    //filter and count images
    const totalImages = files.filter(f => f.fileType === 'image').length;

    //filter and count documents (non-images)
    const totalDocuments = files.filter(f => f.fileName === 'file').length;

    //sum of all file sizes
    const totalStorageBytes = files.reduce((sum, f) => sum + Number(f.size), 0);

    const userResult = await db.select({
        apiKey: users.apiKey,
        apiKeyCreatedAt: users.apiKeyCreatedAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

    const userData = userResult[0];
    
    return {
        totalFiles,
        totalImages,
        totalDocuments,
        totalStorageBytes,
        hasApiKey: !!userData?.apiKey,
        apiKeyCreatedAt: userData?.apiKeyCreatedAt || null
    }
}

//get user total storage
export async function getUserStorageBytes(userId: string): Promise<number> {
    const files = await db.select({
        size: userFiles.size
    })
        .from(userFiles)
        .where(eq(userFiles.userId, userId));

    return files.reduce((sum, file) => sum+Number(file.size), 0);    
}
//get global storage
export async function getGlobalStorageBytes(): Promise<number> {
    const files = await db.select({ size: userFiles.size})
        .from(userFiles);

     return files.reduce((sum, file) => sum+Number(file.size), 0);   
}

//check storage limits before upload
export interface StorageCheckResult {
    allowed: boolean;
    reason?: string;
    userStorageUsed?: number;
    userStorageLimit?: number;
    globalStorageUsed?: number;
    globalStorageLimit?: number;
}

export async function checkStorageLimits(
    userId: string,
    fileSize: number
): Promise<StorageCheckResult> {
    //get the user current storage
    const userStorageUsed = await getUserStorageBytes(userId);

    const userStorageAfterUpload = userStorageUsed + fileSize;

    //check user limit
    if (userStorageAfterUpload > USER_STORAGE_LIMIT){
        const usedMB = (userStorageUsed / (1024 * 1024)).toFixed(2);
        const limitMB = (USER_STORAGE_LIMIT / (1024 * 1024)).toFixed(0);
        const remainingMB = ((USER_STORAGE_LIMIT - userStorageUsed) / (1024 * 1024)).toFixed(2);
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        
        // Check if user has already used 100% of storage
        const isAtLimit = userStorageUsed >= USER_STORAGE_LIMIT;
        
        const reason = isAtLimit
          ? `Your storage is full (${usedMB} MB / ${limitMB} MB). Delete files to free up space.`
          : `Not enough storage space. You have ${remainingMB} MB remaining, but this file requires ${fileSizeMB} MB.`;
        
        return {
          allowed: false,
          reason,
          userStorageUsed,
          userStorageLimit: USER_STORAGE_LIMIT,
        };
    }

    //check global storage limit
    const globalStorageUsed = await getGlobalStorageBytes();

    const globalStorageAfterUpload = globalStorageUsed + fileSize;

    if(globalStorageAfterUpload > GLOBAL_STORAGE_LIMIT) {
        const usedGB = (globalStorageUsed / (1024 * 1024 * 1024)).toFixed(2);
        const limitGB = (GLOBAL_STORAGE_LIMIT / (1024 * 1024 * 1024)).toFixed(1);
        return {
          allowed: false,
          reason: `System storage is full (${usedGB} GB / ${limitGB} GB). Uploads are temporarily disabled.`,
          globalStorageUsed,
          globalStorageLimit: GLOBAL_STORAGE_LIMIT,
        };
    }

    return {
        allowed: true,
        userStorageUsed,
        userStorageLimit: USER_STORAGE_LIMIT,
        globalStorageUsed,
        globalStorageLimit: GLOBAL_STORAGE_LIMIT,
      };
}

// export types
export type { UserFile };


