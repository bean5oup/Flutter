import { useAccount } from 'wagmi';

export function History() {
    const { address } = useAccount();

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">📊 Chain History</h2>
            <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 mb-2">Connected Wallet Address: {address}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 mb-2">History viewing functionality will be implemented here.</p>
                    <p className="text-gray-400 text-sm">You can view transaction history, NFT ownership, DeFi activities, and more from the blockchain.</p>
                </div>
            </div>
        </div>
    );
}
