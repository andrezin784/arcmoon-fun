'use client';

import { useReadContract } from 'wagmi';
import { MOON_TOKEN_ABI } from '@/lib/contracts';
import { formatEther } from 'viem';
import { getImage } from '@/lib/image-upload';
import BuySellCard from './BuySellCard';
import { Moon } from 'lucide-react';

interface TradePanelProps {
  tokenAddress: string;
}

export default function TradePanel({ tokenAddress }: TradePanelProps) {
  const { data: tokenInfo } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MOON_TOKEN_ABI,
    functionName: 'getTokenInfo',
  });

  if (!tokenInfo) return <div className="animate-pulse h-full bg-white/5 rounded-xl"></div>;

  const [name, symbol, description, imageURI, creator, totalSupply, totalSold, currentPrice, reserveBalance, createdAt] = tokenInfo;
  
  // Stats
  // currentPrice is in native units (6 decimals)
  const price = Number(currentPrice) / 1_000_000; 
  
  // Mcap = Price * TotalSupply
  const mcap = (Number(formatEther(totalSupply)) * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  
  // Liquidity
  const liquidity = (Number(reserveBalance) / 1_000_000).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  
  // Progress (Target 800M sold for "bonding curve completion" typical in pump.fun)
  const progress = (Number(formatEther(totalSold)) / 800_000_000) * 100;

  // Image processing
  let displayImage = imageURI;
  if (imageURI && imageURI.startsWith('local://')) {
    // Legacy: local storage images (old tokens)
    const imageId = imageURI.replace('local://', '');
    const localImage = getImage(imageId);
    if (localImage) displayImage = localImage;
  }
  // New tokens use Base64 (data:image/...) stored on-chain

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Token Header Info */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
             {displayImage ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={displayImage} alt={name} className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center">
                    <Moon className="w-8 h-8 text-gray-500" />
                 </div>
             )}
          </div>
          <div className="flex-1 min-w-0">
             <h2 className="text-white font-bold text-lg truncate">{name}</h2>
             <div className="text-gray-400 text-sm flex items-center gap-2">
                <span>{symbol}</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="text-green-400">Live</span>
             </div>
             {description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{description}</p>}
          </div>
        </div>

        {/* Bonding Curve Progress */}
        <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Bonding Curve Progress</span>
                <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-1000"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
                When the market cap reaches $69k, all liquidity is deposited to Uniswap and burned.
            </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#111] p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Price</p>
              <p className="text-white font-mono text-sm">${price.toFixed(6)}</p>
          </div>
          <div className="bg-[#111] p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Market Cap</p>
              <p className="text-white font-mono text-sm">{mcap}</p>
          </div>
          <div className="bg-[#111] p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Liquidity</p>
              <p className="text-white font-mono text-sm">{liquidity}</p>
          </div>
      </div>

      {/* Trade Box */}
      <div className="flex-1">
          <BuySellCard 
            tokenAddress={tokenAddress} 
            totalSold={totalSold} 
            symbol={symbol} 
            tokenImage={displayImage}
          />
      </div>
    </div>
  );
}
