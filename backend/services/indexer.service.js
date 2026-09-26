import { db, projectFiles, codeChunks, projects } from '../../database/index.js';
import { eq } from 'drizzle-orm';
import { chunkCode } from './chunker.service.js';
import { generateEmbedding } from './gemini.service.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function indexProject(projectId) {
  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId));
  
  let totalChunks = 0;
  
  for (const file of files) {
    // Skip embedding lockfiles and large generated files
    if (file.filePath.endsWith('package-lock.json') || 
        file.filePath.endsWith('yarn.lock') || 
        file.filePath.endsWith('pnpm-lock.yaml') ||
        (file.filePath.endsWith('.json') && file.content.length > 50000)) {
       console.log(`Skipping embedding for large/lock file: ${file.filePath}`);
       continue;
    }
    
    const chunks = chunkCode(file.content);
    
    for (let i = 0; i < chunks.length; i++) {
       const chunk = chunks[i];
       const chunkContext = `File: ${file.filePath}\nLines: ${chunk.startLine}-${chunk.endLine}\n\n${chunk.content}`;
       
       try {
          const embedding = await generateEmbedding(chunkContext, 768);
          if (embedding) {
             await db.insert(codeChunks).values({
               projectId,
               fileId: file.id,
               filePath: file.filePath,
               content: chunk.content,
               startLine: chunk.startLine,
               endLine: chunk.endLine,
               embedding: embedding,
             });
             totalChunks++;
          }
       } catch (error) {
          if (error?.status === 429) {
             console.error(`Rate limited embedding chunk for ${file.filePath}. Backing off...`);
             await sleep(2000);
          } else {
             console.error(`Error embedding chunk for ${file.filePath}:`, error);
          }
       }
       
       await sleep(1000);
    }
  }
  
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (project.length > 0) {
     const currentStats = (project[0].stats) || {};
     await db.update(projects).set({ 
       stats: { ...currentStats, chunksCount: totalChunks } 
     }).where(eq(projects.id, projectId));
  }
}
