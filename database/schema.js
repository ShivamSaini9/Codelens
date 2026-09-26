import { pgTable, text, timestamp, uuid, jsonb, integer, varchar, vector } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Firebase UID
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'github' | 'local'
  sourceUrl: text('source_url'), // GitHub URL or local zip original filename
  status: varchar('status', { length: 50 }).default('queued').notNull(), // 'queued', 'extracting', 'indexing', 'ready', 'failed'
  stats: jsonb('stats'), // filesCount, chunksCount, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectFiles = pgTable('project_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  extension: varchar('extension', { length: 50 }),
  language: varchar('language', { length: 50 }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const codeChunks = pgTable('code_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  fileId: uuid('file_id').references(() => projectFiles.id, { onDelete: 'cascade' }).notNull(),
  filePath: varchar('file_path', { length: 1024 }).notNull(),
  content: text('content').notNull(),
  startLine: integer('start_line').notNull(),
  endLine: integer('end_line').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

