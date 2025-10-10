import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import { config } from './config';
import { setupRoutes } from './routes';
import { initialize } from './attest';

// Configure logger based on environment
const isProd = process.env.NODE_ENV === 'production';
const server = fastify({
    logger: isProd
        ? {
            level: 'info',
        }
        : {
            level: 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname,reqId,responseTime,req,res',
                    colorize: true,
                    messageFormat: '{msg}',
                },
            },
        },
    disableRequestLogging: true,
});

// Only log server start
server.log.info('Server starting up');

// List of API endpoints we want to log
const API_ENDPOINTS = [
    '/submit',
    '/question',
];

// Helper to check if a URL is an API endpoint
function isApiEndpoint(url: string): boolean {
    // Remove query parameters for matching
    const path = url?.split('?')[0] ?? '';
    // Remove trailing slash for consistency
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

    return API_ENDPOINTS.some((endpoint) => {
        // Either exact match or starts with endpoint + '/'
        return (
            normalizedPath === endpoint || normalizedPath.startsWith(endpoint + '/')
        );
    });
}

server.addHook('onResponse', async (request, reply) => {
    if (isApiEndpoint(request.url)) {
        request.log.info(
            `${request.method} ${request.url} - ${reply.statusCode} (${reply.elapsedTime.toFixed(1)}ms)`
        );
    }
});

// Register plugins and configure server
async function build(): Promise<FastifyInstance> {
    // Register environment variables
    await server.register(env, {
        schema: config.envSchema,
        dotenv: true,
    });

    // CORS is handled by nginx in production
    if (process.env.NODE_ENV !== 'production') {
        // Only enable CORS in development
        const cors = await import('@fastify/cors');
        await server.register(cors.default, {
            origin: '*', // Allow all origins for API access
            credentials: true,
        });
    }

    // API routes should be handled first
    await setupRoutes(server);

    // Initialize blockchain
    await initialize();

    // Handle HEAD requests for root explicitly
    server.head('/', async (request, reply) => {
        return reply.code(200).send();
    });

    // Add hook to prevent non-GET requests to static files
    server.addHook('onRequest', async (request, reply) => {
        if (request.url.startsWith('/assets/') && request.method !== 'GET') {
            return reply.code(405).send({ error: 'Method not allowed' });
        }
    });

    // Serve static files from frontend/dist
    await server.register(fastifyStatic, {
        root: path.join(process.cwd(), 'frontend/dist'),
        prefix: '/',
        decorateReply: false,
        logLevel: 'error', // Only log errors for static files
    });

    // Catch-all route to serve index.html for client-side routing
    server.setNotFoundHandler(async (request, reply) => {
        if (request.url.startsWith('/api')) {
            return reply.code(404).send({
                message: 'API route not found',
                error: 'Not Found',
                statusCode: 404,
            });
        }

        try {
            await reply.sendFile('index.html');
        } catch (err) {
            reply.code(404).send({
                message: 'File not found',
                error: err instanceof Error ? err.message : 'Unknown error',
                statusCode: 404,
            });
        }
    });

    return server;
}

// Start server if this is the main module
const isMainModule =
    process.argv[1]?.endsWith('index.ts') ||
    process.argv[1]?.endsWith('index.js');
if (isMainModule) {
    // Use void to explicitly mark the promise as handled
    void (async (): Promise<void> => {
        try {
            const server = await build();
            await server.listen({
                port: parseInt(process.env.PORT || '3000'),
                host: '0.0.0.0',
            });
        } catch (err) {
            console.error('Error starting server:', err);
            process.exit(1);
        }
    })();
}

export { build };