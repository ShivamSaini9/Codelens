import { Router } from 'express';
import { listProjectFiles, getFileContent } from '../controllers/file.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:id/files', requireAuth, listProjectFiles);
router.get('/:id/files/:fileId', requireAuth, getFileContent);

export default router;
