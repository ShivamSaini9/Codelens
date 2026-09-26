import { searchCodeChunksByVector } from '../../database/repositories/project.repository.js';
import { generateEmbedding, generateContentStream } from '../services/gemini.service.js';

export async function chatWithProject(req, res) {
  try {
    const projectId = req.params.id;
    const { message } = req.body;

    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const queryEmbedding = await generateEmbedding(message, 768);
    if (!queryEmbedding) {
      res.status(500).json({ error: 'Failed to generate query embedding' });
      return;
    }

    const relevantChunks = await searchCodeChunksByVector(projectId, queryEmbedding, 10);

    const contextStr = relevantChunks
      .map((c) => `--- ${c.filePath} (lines ${c.startLine}-${c.endLine}) ---\n${c.content}\n`)
      .join('\n');

    const prompt = `You are CodeLens AI, an expert developer assistant helping with a codebase.
Use the following relevant code snippets to answer the user's question.
If the answer is not in the context, say you don't have enough context, but try your best.
Always cite the filename when referencing code.

CONTEXT:
${contextStr}

QUESTION:
${message}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ type: 'sources', sources: relevantChunks })}\n\n`);

    const stream = await generateContentStream(prompt);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ type: 'text', text: chunk.text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    let errorMsg = 'Internal server error';
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
      errorMsg = 'Gemini API Rate Limit Exceeded. Please try again in a few seconds or check your quota.';
    }

    if (!res.headersSent) {
      res.status(500).json({ error: errorMsg });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`);
      res.end();
    }
  }
}
