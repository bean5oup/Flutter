import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount } from 'wagmi';
import { useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from './config/wagmi';
import { WalletConnect } from './components/WalletConnect';
import { Questionaire } from './components/Questionaire';
import { History } from './components/History';
import './App.css'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            gcTime: Infinity,
            refetchOnWindowFocus: false,
        },
    },
});

function AppContent() {
    const { isConnected } = useAccount();
    const [selectedMenu, setSelectedMenu] = useState<'history' | 'questionnaire' | null>(null);

    return (
        <div className="h-screen flex flex-col">
            <header className="flex-none">
                <div className="mx-auto h-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black font-monaco">
                            <span className="text-white">Flutter</span>
                            <span className="text-white"> ❤️</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/Uniswap/autocator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover transition-colors"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                        </a>
                        <WalletConnect />
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="max-w-5xl mx-auto py-6">
                    <div className="mx-auto rounded-lg border">
                        {!isConnected ? (
                            <div>
                                <h2>Please Connect Your Wallet</h2>
                                <p>Connect your wallet to access the application features.</p>
                            </div>
                        ) : !selectedMenu ? (
                            <div>
                                <h2>Choose Your Action</h2>
                                <div className="flex justify-center flex-col">
                                    <button onClick={() => setSelectedMenu('history')}>
                                        📊 View History
                                    </button>
                                    <button onClick={() => setSelectedMenu('questionnaire')}>
                                        📝 Start Questionnaire
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="p-4 border-b">
                                    <button onClick={() => setSelectedMenu(null)}>
                                        ← Back to Menu
                                    </button>
                                </div>
                                {selectedMenu === 'history' && <History />}
                                {selectedMenu === 'questionnaire' && <Questionaire />}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <AppContent />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default App
