import { type FastifyInstance } from 'fastify';
import { setupSubmitRoutes } from './submit';
import { setupQuestionRoutes } from './question';

export async function setupRoutes(server: FastifyInstance): Promise<void> {
  // Setup all route modules
  await setupSubmitRoutes(server);
  await setupQuestionRoutes(server);
}