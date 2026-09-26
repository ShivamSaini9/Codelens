import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import fileRoutes from './file.routes.js';
import chatRoutes from './chat.routes.js';

const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/projects', fileRoutes);
apiRouter.use('/projects', chatRoutes);

export default apiRouter;
