export const ATTESTER_ADDRESS = '0x4149371E22D8Db82d50FBcCA5945835DFbeEB701' as const;

// EIP-712 domain for The Compact
export const DOMAIN = (chainId: bigint) => {
	return {
		name: 'Flutter',
		version: '0',
		chainId: chainId,
		verifyingContract: ATTESTER_ADDRESS
	} as const;
}

export const TYPES = {
	Questionnaire: [
		{ name: 'answer', type: 'string' },
		{ name: 'timestamp', type: 'uint256' }
	]
} as const;