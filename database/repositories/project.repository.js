import { db } from '../connection.js';
import { projects, projectFiles, codeChunks } from '../schema.js';
import { eq, desc, sql, cosineDistance } from 'drizzle-orm';

export async function findProjectsByUserId(userId) {
  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function findProjectById(projectId) {
  const res = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return res[0] || null;
}

export async function createProject(data) {
  const result = await db.insert(projects).values({
    userId: data.userId,
    name: data.name,
    sourceType: data.sourceType,
    sourceUrl: data.sourceUrl,
    status: data.status || 'queued',
  }).returning();
  return result[0];
}

export async function updateProjectStatus(projectId, status, stats) {
  const updateData = { status, updatedAt: new Date() };
  if (stats) updateData.stats = stats;
  return await db.update(projects).set(updateData).where(eq(projects.id, projectId));
}

export async function getProjectFilesList(projectId) {
  return await db
    .select({
      id: projectFiles.id,
      filePath: projectFiles.filePath,
      extension: projectFiles.extension,
      language: projectFiles.language,
    })
    .from(projectFiles)
    .where(eq(projectFiles.projectId, projectId));
}

export async function getProjectFileById(projectId, fileId) {
  const res = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.id, fileId))
    .limit(1);

  if (res.length === 0 || res[0].projectId !== projectId) {
    return null;
  }
  return res[0];
}

export async function searchCodeChunksByVector(projectId, queryEmbedding, limit = 10) {
  const similarity = sql`1 - (${cosineDistance(codeChunks.embedding, queryEmbedding)})`;
  return await db
    .select({
      content: codeChunks.content,
      filePath: codeChunks.filePath,
      startLine: codeChunks.startLine,
      endLine: codeChunks.endLine,
      similarity,
    })
    .from(codeChunks)
    .where(eq(codeChunks.projectId, projectId))
    .orderBy(desc(similarity))
    .limit(limit);
}
