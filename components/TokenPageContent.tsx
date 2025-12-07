'use client';

import { useParams } from 'next/navigation';
import { WagmiProvider, useReadContract } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';
import { config } from '@/lib/wagmi';

import Header from '@/components/Header';
import MoonChart from '@/components/MoonChart';
import TradePanel from '@/components/TradePanel';
import TransactionTable from '@/components/TransactionTable';
import Stars from '@/components/Stars';
import { MOON_TOKEN_ABI } from '@/lib/contracts';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function TokenContent() {
  const params = useParams();
  const tokenAddress = params.address as string;

  const { data: tokenInfo } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MOON_TOKEN_ABI,
    functionName: 'getTokenInfo',
  });

  if (!tokenInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Loading token data...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <Stars />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Chart & Transactions (Main Content) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <MoonChart
                  tokenAddress={tokenAddress}
                  totalSold={(tokenInfo[6] as bigint) ?? 0n}
                />
                <TransactionTable tokenAddress={tokenAddress} />
            </div>

            {/* Right Column: Trade & Info (Sticky Sidebar) */}
            <div className="lg:col-span-4">
                <div className="sticky top-6">
                    <TradePanel tokenAddress={tokenAddress} />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default function TokenPageContent() {
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
          <div className="min-h-screen flex flex-col bg-[#0b0b0b]">
            <Header />
            <main className="flex-1">
              <TokenContent />
            </main>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid #333',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

