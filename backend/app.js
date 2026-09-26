import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount unified API routes
  app.use('/api', apiRouter);

  return app;
}
