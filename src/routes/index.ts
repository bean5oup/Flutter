import { type FastifyInstance } from 'fastify';
import { setupSubmitRoutes } from './submit';
import { setupQuestionRoutes } from './question';
import { setupTestRoutes } from './test';

export async function setupRoutes(server: FastifyInstance): Promise<void> {
  // Setup all route modules
  await setupSubmitRoutes(server);
  await setupQuestionRoutes(server);
  await setupTestRoutes(server);
}