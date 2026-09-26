# CodeLens

CodeLens is an AI-powered codebase Q&A platform. It can ingest a GitHub repository or local ZIP, split source code into chunks, generate embeddings, store them in PostgreSQL with pgvector, retrieve relevant code using vector similarity, and use Gemini to generate context-aware answers.

## JavaScript / JSX version

This version has been converted from TypeScript/TSX to plain JavaScript/JSX. The frontend remains React + JSX and the backend/database services use JavaScript modules.

## Run locally

1. Install dependencies:
   `npm install`
2. Configure the environment variables from `.env.example`.
3. Run:
   `npm run dev`

The application runs on port `3000`.

## Database

The project uses PostgreSQL with the `pgvector` extension and Drizzle ORM.

Useful commands:

- `npm run db:push`
- `npm run db:studio`

## Build

`npm run build`

## Important

The Google Gemini embedding API is used during repository indexing, so embedding requests are subject to the quota/rate limits of the configured Gemini API key.
