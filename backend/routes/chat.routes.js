import { Router } from 'express';
import { chatWithProject } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:id/chat', requireAuth, chatWithProject);

export default router;
