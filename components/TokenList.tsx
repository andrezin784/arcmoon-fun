'use client';

import { useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MOON_FACTORY_ABI, MOON_TOKEN_ABI } from '@/lib/contracts';
import { FACTORY_ADDRESS } from '@/lib/wagmi';
import { formatEther } from 'viem';
import { getImage } from '@/lib/image-upload';
import { Moon, Rocket, Loader2 } from 'lucide-react';

function TokenCard({ address }: { address: `0x${string}` }) {
  const { data: tokenInfo } = useReadContract({
    address,
    abi: MOON_TOKEN_ABI,
    functionName: 'getTokenInfo',
  });

  if (!tokenInfo) return null;

  const [name, symbol, description, imageURI, , , totalSold, currentPrice] = tokenInfo;
  const priceFormatted = Number(formatEther(currentPrice * BigInt(1000))).toFixed(6);

  // Process image URI
  let displayImage = imageURI;
  if (imageURI && imageURI.startsWith('local://')) {
    const imageId = imageURI.replace('local://', '');
    const localImage = getImage(imageId);
    if (localImage) {
      displayImage = localImage;
    } else {
      displayImage = ''; // Fallback
    }
  }

  return (
    <Link href={`/token/${address}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="card-moon cursor-pointer hover:glow-gold transition-all h-full flex flex-col"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-xl overflow-hidden border-2 border-yellow-400/30">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Moon className="w-6 h-6 text-yellow-100" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
              <p className="text-yellow-400 font-mono text-sm">${symbol}</p>
            </div>
          </div>
        </div>
        
        {description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{description}</p>
        )}
        
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-500 text-xs">Price</p>
            <p className="text-yellow-400 font-bold">${priceFormatted}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">Sold</p>
            <span className="text-white font-medium">
              {(Number(formatEther(totalSold)) / 1_000_000).toFixed(2)}M
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function TokenList() {
  const { data: tokens, isLoading } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: MOON_FACTORY_ABI,
    functionName: 'getRecentTokens',
    args: [BigInt(10)],
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-2" />
        <p className="text-gray-400 mt-2">Loading tokens...</p>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No tokens created yet.</p>
        <p className="text-yellow-400 mt-2 flex items-center justify-center gap-2">
            Be the first to launch! <Rocket className="w-4 h-4" />
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...tokens].reverse().map((address, i) => (
        <motion.div
          key={address}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <TokenCard address={address} />
        </motion.div>
      ))}
    </div>
  );
}

