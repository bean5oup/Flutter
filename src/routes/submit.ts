import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAddress } from 'viem/utils';

import type { SubmitPayload } from '../types';
import { evaluate } from '../evaluation';
import { validateSubmit } from '../validation';
import { attest } from '../attest';

export async function setupSubmitRoutes(
    server: FastifyInstance
): Promise<void> {
    // Get compacts for a specific account
    server.post<{
        Body: SubmitPayload;
    }>(
        '/api/submit',
        async (
            request: FastifyRequest<{
                Body: SubmitPayload;
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { chainId, account, answers, signature, timestamp } = request.body;

                let normalizedAccount: string;
                try {
                    normalizedAccount = getAddress(account);
                } catch {
                    reply.code(400);
                    return { error: 'Invalid account address format' };
                }

                const validationResult = await validateSubmit(normalizedAccount, chainId, answers, timestamp, signature);
                if (!validationResult.isValid)
                    throw new Error(validationResult.error || 'Invalid submit');

                const evaluateResult = await evaluate();

                const attestResult = await attest(server, parseInt(chainId), normalizedAccount, answers, signature, timestamp, evaluateResult.score);
                if(!attestResult.success)
                    throw new Error('Failed to attest');

                return {
                    'success': attestResult.success,
                    'tx': attestResult.tx,
                    'score': evaluateResult.score
                }
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