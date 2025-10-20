import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { evaluate } from '../evaluation';

/**
 * Simple test endpoint - no wallet required
 */
export async function setupTestRoutes(server: FastifyInstance): Promise<void> {
    server.post<{
        Body: { answers: Record<string, string> };
    }>(
        '/api/test',
        async (
            request: FastifyRequest<{
                Body: { answers: Record<string, string> };
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { answers } = request.body;

                if (!answers) {
                    reply.code(400);
                    return { error: 'No answers provided' };
                }

                server.log.info('Test evaluation request');
                
                const result = await evaluate(answers);

                return {
                    success: true,
                    score: result.score,
                    message: 'Evaluation complete (test mode - no blockchain)'
                };
            } catch (error) {
                server.log.error('Test evaluation error:', error);
                reply.code(500);
                return {
                    error: error instanceof Error ? error.message : 'Evaluation failed',
                };
            }
        }
    );
}

