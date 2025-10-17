export const config = {
    envSchema: {
        type: 'object',
        required: [
            'BASE_URL',
            'PRIVATE_KEY',
            'ATTESTER_ADDRESS',
            'RPC_URL_OPTIMISM',
            'RPC_URL_OPTIMISM_SEPOLIA'
        ],
        properties: {
            PORT: {
                type: 'string',
                default: '3000',
            },
            PRIVATE_KEY: {
                type: 'string',
            },
            CORS_ORIGIN: {
                type: 'string',
                default: '*',
            },
            DATABASE_DIR: {
                type: 'string',
                default: '.flutter-data'
            },
            BASE_URL: {
                type: 'string',
                default: 'http://localhost:3000'
            },
            ATTESTER_ADDRESS: {
                type: 'string'
            },
            RPC_URL_OPTIMISM_SEPOLIA: {
                type: 'string',
                default: 'https://sepolia.optimism.io'
            },
            RPC_URL_OPTIMISM: {
                type: 'string'
            }
        }
    }
};