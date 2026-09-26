import { db, projects } from '../../database/index.js';
import { eq } from 'drizzle-orm';
import { processGithubRepo, processLocalZip } from './processor.service.js';
import { indexProject } from './indexer.service.js';

export async function enqueueIndexJob(projectId, sourceType, sourceUrl) {
  setTimeout(async () => {
    try {
      await db.update(projects).set({ status: 'extracting' }).where(eq(projects.id, projectId));
      
      if (sourceType === 'github') {
         await processGithubRepo(projectId, sourceUrl);
      } else {
         await processLocalZip(projectId, sourceUrl); 
      }
      
      await db.update(projects).set({ status: 'indexing' }).where(eq(projects.id, projectId));
      await indexProject(projectId);
      
      await db.update(projects).set({ status: 'ready' }).where(eq(projects.id, projectId));
    } catch (e) {
      console.error('Indexing failed for project', projectId, e);
      await db.update(projects).set({ status: 'failed' }).where(eq(projects.id, projectId));
    }
  }, 0);
}
