import { type FastifyInstance } from 'fastify';
import {
    type Hex,
    keccak256,
    encodeAbiParameters,
    encodePacked,
    concat,
    toBytes,
    parseCompactSignature,
    compactSignatureToSignature,
    serializeSignature,
    recoverAddress,
} from 'viem';
import type { ValidationResult } from './types';

// EIP-712 domain
const DOMAIN = (chainId: bigint) => {
    return {
        name: 'Flutter',
        version: '0',
        chainId: chainId,
        verifyingContract: process.env.ATTESTER_ADDRESS as `0x${string}`,
    } as const;
}

// EIP-712 domain typehash
const EIP712_DOMAIN_TYPEHASH = keccak256(
    encodePacked(
        ['string'],
        [
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)',
        ]
    )
);

function generateDomainHash(chainId: bigint): Hex {
    return keccak256(
        encodeAbiParameters(
            [
                { name: 'typeHash', type: 'bytes32' },
                { name: 'name', type: 'bytes32' },
                { name: 'version', type: 'bytes32' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            [
                EIP712_DOMAIN_TYPEHASH,
                keccak256(encodePacked(['string'], [DOMAIN(chainId).name])),
                keccak256(encodePacked(['string'], [DOMAIN(chainId).version])),
                chainId,
                DOMAIN(chainId).verifyingContract,
            ]
        )
    );
}

function generateEncodeData(answers: Record<string, string>, timestamp: bigint): Hex {
    // Generate type hash
    const typeHash = keccak256(
        encodePacked(
            ['string'],
            [
                'Questionnaire(string answer,uint256 timestamp)',
            ]
        )
    );

    // Generate message hash
    return keccak256(
        encodeAbiParameters(
            [
                { name: 'typeHash', type: 'bytes32' },
                { name: 'answer', type: 'bytes32' },
                { name: 'timestamp', type: 'uint256' },
            ],
            [
                typeHash,
                keccak256(toBytes(JSON.stringify(answers))),
                timestamp
            ]
        )
    );
}

function generateDigest(domainSeparator: Hex, encodeData: Hex): Hex {
    return keccak256(concat(['0x1901', domainSeparator, encodeData]));
}

export async function validateSubmit(
    account: string,
    chainId: string,
    answers: Record<string, string>,
    timestamp: string,
    signature: string
): Promise<ValidationResult> {
    try {
        // 1. Chain ID validation
        const chainIdNum = parseInt(chainId);
        if (
            isNaN(chainIdNum) ||
            chainIdNum <= 0 ||
            chainIdNum.toString() !== chainId
        ) {
            return { isValid: false, error: 'Invalid chain ID format' };
        }

        // 2. Signature verification
        const domainSeparator = generateDomainHash(BigInt(chainId));
        const encodeData = generateEncodeData(answers, BigInt(timestamp));
        const digest = generateDigest(domainSeparator, encodeData);

        // Convert compact signature to full signature for recovery
        const parsedCompactSig = parseCompactSignature(
            signature as `0x${string}`
        );
        const sig = compactSignatureToSignature(parsedCompactSig);
        const fullSignature = serializeSignature(sig);

        // Recover the signer address
        const signer = await recoverAddress({
            hash: digest,
            signature: signature as `0x${string}`,
        });

        if(account !== signer)
            throw new Error('Invalid signature');

        return {
            isValid: true
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Validation failed'
        };
    }
}