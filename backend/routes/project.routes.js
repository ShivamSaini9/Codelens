import { Router } from 'express';
import { listProjects, getProject, createGithubProject, uploadLocalProject } from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadZip } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', requireAuth, listProjects);
router.get('/:id', requireAuth, getProject);
router.post('/github', requireAuth, createGithubProject);
router.post('/local', requireAuth, uploadZip.single('file'), uploadLocalProject);

export default router;
