'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Rocket, Flame, AlertTriangle, Moon } from 'lucide-react';
import Header from '@/components/Header';
import CreateTokenForm from '@/components/CreateTokenForm';
import TokenList from '@/components/TokenList';
import Stars from '@/components/Stars';
import { FACTORY_ADDRESS, FAUCET_URL } from '@/lib/wagmi';

const queryClient = new QueryClient();

export default function HomeContent() {
  const isFactoryDeployed = FACTORY_ADDRESS !== '0x0000000000000000000000000000000000000000';

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#FFD700',
            accentColorForeground: 'black',
            borderRadius: 'large',
            fontStack: 'system',
          })}
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <div className="relative min-h-screen">
                <Stars />
                
                <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                  {/* Hero Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                  >
                    <motion.h1
                      className="text-5xl md:text-7xl font-bold mb-4"
                      animate={{ 
                        textShadow: [
                          '0 0 20px rgba(255, 215, 0, 0.5)',
                          '0 0 40px rgba(255, 215, 0, 0.8)',
                          '0 0 20px rgba(255, 215, 0, 0.5)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-yellow-400">ARC</span>
                      <span className="text-white">MOON.FUN</span>
                    </motion.h1>
                    <p className="text-xl text-gray-300 mb-2 flex items-center justify-center gap-2">
                      Launch your memecoin to the moon! <Rocket className="w-5 h-5 text-yellow-400" />
                    </p>
                    <p className="text-gray-500">
                      Powered by Arc Testnet • Gas paid in USDC
                    </p>
                  </motion.div>

                  {/* Faucet Banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                  >
                    <a
                      href={FAUCET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full max-w-2xl mx-auto p-4 glass rounded-xl 
                                 border border-purple-500/30 hover:border-purple-500/50 
                                 transition-all group"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <p className="text-white font-medium">
                            Need USDC for gas?
                          </p>
                          <p className="text-purple-400 text-sm group-hover:text-purple-300">
                            Click here to get free USDC from the faucet →
                          </p>
                        </div>
                      </div>
                    </a>
                  </motion.div>

                  {!isFactoryDeployed ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="card-moon max-w-lg mx-auto">
                        <div className="mb-4 flex justify-center">
                          <AlertTriangle className="w-16 h-16 text-yellow-400" />
                        </div>
                        <h2 className="text-xl font-bold text-yellow-400 mb-2">
                          Factory not deployed
                        </h2>
                        <p className="text-gray-400 mb-4">
                          Run deployment script first:
                        </p>
                        <pre className="bg-black/50 p-4 rounded-lg text-sm text-left overflow-x-auto">
                          <code className="text-green-400">
                            npx hardhat run scripts/deploy-factory.ts --network arcTestnet
                          </code>
                        </pre>
                        <p className="text-gray-500 mt-4 text-sm">
                          Then add the address to .env.local:
                          <br />
                          NEXT_PUBLIC_FACTORY_ADDRESS=0x...
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Create Token Form */}
                      <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16"
                      >
                        <CreateTokenForm />
                      </motion.section>

                      {/* Recent Tokens */}
                      <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                          <Flame className="w-6 h-6 text-orange-500" />
                          Recent Tokens
                        </h2>
                        <TokenList />
                      </motion.section>
                    </>
                  )}

                  {/* Network Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 text-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-blue-500/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-gray-200 text-sm font-medium">
                        Connected to Arc Testnet
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </main>
            <footer className="py-6 text-center text-gray-500 text-sm flex flex-col items-center justify-center gap-2">
              <span className="opacity-50 hover:opacity-100 transition-opacity">
                Powered by Arc Testnet
              </span>
              <p>© 2025 ARCMOON.FUN</p>
            </footer>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#2D1B4E',
                color: '#fff',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
