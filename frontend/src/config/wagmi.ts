import { http } from 'wagmi';
import {
    optimism,
    optimismSepolia
} from 'viem/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Configure supported chains
const projectId = 'YOUR_PROJECT_ID'; // Get from WalletConnect Cloud

export const chains = [
    optimism,
    optimismSepolia
] as const;

// Create wagmi config using RainbowKit's getDefaultConfig
export const config = getDefaultConfig({
    appName: 'Flutter',
    projectId,
    chains,
    transports: {
        // Use a single transport configuration for all chains
        ...Object.fromEntries(
            chains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])])
        ),
    },
});

// Export chain IDs for type safety
export const CHAIN_IDS = {
    OPTIMISM: optimism.id,
    OPTIMISM_SEPOLIA: optimismSepolia.id
} as const;
