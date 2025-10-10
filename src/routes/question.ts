import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAddress } from 'viem/utils';
import { createQuestionaire } from '../question';

export async function setupQuestionRoutes(
    server: FastifyInstance
): Promise<void> {
    // Get compacts for a specific account
    server.post<{
        Body: { account: string };
    }>(
        '/api/question',
        async (
            request: FastifyRequest<{
                Body: { account: string };
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { account } = request.body;

                let normalizedAccount: string;
                try {
                    normalizedAccount = getAddress(account);
                } catch {
                    reply.code(400);
                    return { error: 'Invalid account address format' };
                }

                return {
                    'questionaireList': await createQuestionaire()
                };
            } catch (error) {
                reply.code(400);
                return {
                    error:
                        error instanceof Error ? error.message : 'Failed to get questions',
                };
            }
        }
    );
}