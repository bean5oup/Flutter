export const ATTESTER_ADDRESS = '0xDa6c22e078D1bE1C5c2DE44e84C93B5e34F93388' as const;

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