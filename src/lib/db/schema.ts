import { pgTable, uuid, varchar, timestamp, bigint, integer, jsonb, index, primaryKey } from 'drizzle-orm/pg-core';

//User Table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', {length: 255}).notNull().unique(),
    name: varchar('name', {length: 255}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    //main hain ye api credentials
    apiKey: varchar('api_key', {length: 64}).unique(),
    apiSecret: varchar('api_secret', {length: 64}).unique(),
    apiKeyCreatedAt: timestamp('api_key_created_at'),
}, (table) => ({
        emailIdx: index('idx_user_email').on(table.email),
        apiKeyIdx: index('idx_user_api_key').on(table.apiKey)
}))

//user files table metadata
export const userFiles = pgTable('user_files', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    s3Key: varchar('s3_Key', {length: 500}).notNull(),
    fileName: varchar('file_name', {length: 255}).notNull(),
    fileType: varchar('file_type', {length: 20}).notNull(),
    folder: varchar('folder', {length: 500}).default('').notNull(),
    size: bigint('size', {mode: 'number'}).notNull(),
    mimeType: varchar('mime_type', {length: 100}),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    metadata: jsonb('metadata').$type<{
        widht?: number,
        height?: number,
        format?: string
    }>(),
}, (table) => ({
    userIdIdx: index('idx_user_files_user_id').on(table.userId),
    folderIdx: index('idx_user_files_folder').on(table.userId, table.folder)
}))

//Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferSelect;
export type UserFile = typeof userFiles.$inferSelect;
export type NewUserFile = typeof userFiles.$inferSelect;