import { type FastifyInstance } from 'fastify';
import type {
    Hex,
    PublicClient,
    WalletClient,
    PrivateKeyAccount,
    Transport,
    Chain as ViemChain
} from 'viem';
import { createPublicClient, createWalletClient, http, encodeFunctionData, encodeAbiParameters, keccak256, toBytes } from 'viem';
import { optimism, optimismSepolia } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts';

// Initialize clients first
const commonConfig = {
    pollingInterval: 4_000,
    batch: {
        multicall: true,
    },
    cacheTime: 4_000,
} as const;

let account!: PrivateKeyAccount;
let publicClients!: Record<number, PublicClient>;
let walletClients!: Record<number, WalletClient<Transport, ViemChain>>;

export async function initialize() {
    account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

    publicClients = {
        10: createPublicClient<Transport, ViemChain>({
            ...commonConfig,
            chain: optimism,
            transport: http(process.env['RPC_URL_OPTIMISM'] || ""),
        }) as PublicClient,
        11155420: createPublicClient<Transport, ViemChain>({
            ...commonConfig,
            chain: optimismSepolia,
            transport: http(process.env['RPC_URL_OPTIMISM_SEPOLIA'] || ""),
        }) as PublicClient
    };

    walletClients = {
        10: createWalletClient({
            account,
            chain: optimism,
            transport: http(process.env['RPC_URL_OPTIMISM']),
        }),
        11155420: createWalletClient({
            account,
            chain: optimismSepolia,
            transport: http(process.env['RPC_URL_OPTIMISM_SEPOLIA']),
        })
    };
}

export async function attest(
    server: FastifyInstance,
    chainId: number,
    recipient: string,
    answers: Record<string, string>,
    signature: string,
    timestamp: string,
    score: number
): Promise<{ 'success': boolean, 'tx'?: Hex }> {
    try {
        const publicClient = publicClients[chainId];
        const walletClient = walletClients[chainId]!;

        const encodedData = encodeAbiParameters(
            [
                { name: "answer", type: "bytes32" },
                { name: "timestamp", type: "uint256" },
                { name: "score", type: "uint256" },
            ],
            [
                keccak256(toBytes(JSON.stringify(answers))),
                BigInt(timestamp),
                BigInt(score),
            ]
        );

        // Encode simulation data with proper ABI
        const callData = encodeFunctionData({
            abi: [{
                "type": "function",
                "name": "attest",
                "inputs": [
                    { "name": "schemaUID", "type": "bytes32", "internalType": "bytes32" },
                    { "name": "recipient", "type": "address", "internalType": "address" },
                    { "name": "sig", "type": "bytes", "internalType": "bytes" },
                    { "name": "data", "type": "bytes", "internalType": "bytes" }
                ],
                "outputs": [
                    { "name": "", "type": "bytes32", "internalType": "bytes32" }
                ],
                "stateMutability": "nonpayable"
            }],
            functionName: "attest",
            args: [
                '0xc36b95afaab96f9462cea8071c5484d8c3677b0d76e0a6135dcc0dfdd3c15004',
                recipient as Hex,
                signature as Hex,
                encodedData
            ]
        });

        // Submit transaction with the wallet client
        const hash = await walletClient.sendTransaction({
            to: process.env.ATTESTER_ADDRESS as `0x${string}`,
            data: callData as `0x${string}`,
            account
        });

        return {
            'success': true,
            'tx': hash
        };
    } catch (error) {
        return {
            'success': false,
        };
    }
}