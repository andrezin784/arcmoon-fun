'use client';

import { useState, useEffect } from 'react';
import { useMoonTrade } from '@/hooks/useMoonTrade';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Loader2, ArrowDownUp, Moon } from 'lucide-react';

interface BuySellCardProps {
  tokenAddress: string;
  totalSold: bigint;
  symbol: string;
  tokenImage?: string;
}

const USDC_LOGO = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png";

export default function BuySellCard({ tokenAddress, totalSold, symbol, tokenImage }: BuySellCardProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [debouncedAmount, setDebouncedAmount] = useState('');
  const [estimatedOut, setEstimatedOut] = useState('0');
  
  const { buy, sell, isPending, ethBalance, tokenBalance } = useMoonTrade(tokenAddress);
  const { address } = useAccount();

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 300);
    return () => clearTimeout(handler);
  }, [amount]);

  // Bonding Curve Calculation
  const calculatePreview = () => {
    if (!debouncedAmount || parseFloat(debouncedAmount) === 0) {
      setEstimatedOut('0');
      return;
    }

    const currentSold = Number(formatUnits(totalSold, 18));
    const CREATOR_ALLOCATION = 100_000_000;
    const INITIAL_PRICE = 0.001; 
    const PRICE_INCREMENT = 0.000001;

    const getPrice = (supply: number) => {
        const sold = Math.max(0, supply - CREATOR_ALLOCATION);
        return INITIAL_PRICE + sold * PRICE_INCREMENT;
    };

    try {
        if (mode === 'buy') {
            const currentPrice = getPrice(currentSold);
            const usdcAmount = parseFloat(debouncedAmount);
            if (currentPrice === 0) return;
            const estimatedTokens = usdcAmount / currentPrice;
            setEstimatedOut(estimatedTokens.toFixed(2));
        } else {
            const tokenAmount = parseFloat(debouncedAmount);
            const startPrice = getPrice(currentSold);
            const endPrice = getPrice(currentSold - tokenAmount);
            const avgPrice = (startPrice + endPrice) / 2;
            const estimatedUSDC = tokenAmount * avgPrice;
            setEstimatedOut(estimatedUSDC.toFixed(6));
        }
    } catch (e) {
        console.error(e);
        setEstimatedOut('0');
    }
  };

  useEffect(() => {
    calculatePreview();
  }, [debouncedAmount, mode, totalSold]);

  const handleAction = async () => {
    if (!amount) return;

    try {
        let hash;
        if (mode === 'buy') {
            const minTokens = (parseFloat(estimatedOut) * 0.98).toFixed(18);
            hash = await buy(amount, minTokens);
        } else {
            const minUSDC = (parseFloat(estimatedOut) * 0.98).toFixed(6);
            hash = await sell(amount, minUSDC);
        }

        if (hash) {
            setAmount('');
        }
    } catch (e) {
        // Handled in hook
    }
  };

  const setMax = () => {
    if (mode === 'buy') {
        if (ethBalance) {
            const max = parseFloat(ethBalance.formatted) - 0.05;
            setAmount(max > 0 ? max.toFixed(6) : '0');
        }
    } else {
        if (tokenBalance) {
            setAmount(tokenBalance.formatted);
        }
    }
  };

  const renderBadge = (isUSDC: boolean) => {
    const imgUrl = isUSDC ? USDC_LOGO : tokenImage;
    const label = isUSDC ? 'USDC' : symbol;
    
    return (
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 min-w-[100px] justify-center transition-all hover:bg-white/20 cursor-default select-none">
            {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={imgUrl} 
                    alt={label}
                    className="w-6 h-6 rounded-full object-cover bg-black/20"
                />
            ) : (
                <Moon className="w-5 h-5 text-yellow-400" />
            )}
            <span className="text-sm font-bold text-white">{label}</span>
        </div>
    );
  };

  return (
    <div className="bg-[#111] rounded-xl border border-white/5 p-4 flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex bg-black/40 p-1 rounded-lg">
        <button 
            onClick={() => setMode('buy')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'buy' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}
        >
            Buy
        </button>
        <button 
            onClick={() => setMode('sell')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'sell' ? 'bg-red-500 text-black' : 'text-gray-400 hover:text-white'}`}
        >
            Sell
        </button>
      </div>

      {/* Input */}
      <div className="bg-black/40 border border-white/5 rounded-lg p-3">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Amount</span>
            <button onClick={setMax} className="text-blue-400 hover:underline">
                Max: {mode === 'buy' ? `${parseFloat(ethBalance?.formatted || '0').toFixed(2)} USDC` : `${parseFloat(tokenBalance?.formatted || '0').toFixed(2)} ${symbol}`}
            </button>
        </div>
        <div className="flex items-center gap-3">
            <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="bg-transparent text-2xl font-bold w-full focus:outline-none text-white placeholder-gray-600"
            />
            {renderBadge(mode === 'buy')}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center -my-2 z-10">
        <div className="bg-[#222] p-1.5 rounded-full border border-white/10">
            <ArrowDownUp size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Output Preview */}
      <div className="bg-black/40 border border-white/5 rounded-lg p-3">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Receive (est.)</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-2xl font-bold w-full text-gray-300">
                {estimatedOut === '0' ? '0.0' : estimatedOut}
            </div>
            {renderBadge(mode === 'sell')}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        disabled={isPending || !amount || parseFloat(amount) <= 0}
        className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isPending ? 'bg-gray-700 cursor-not-allowed' :
            mode === 'buy' ? 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
            'bg-red-500 hover:bg-red-400 text-black shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        }`}
      >
        {isPending ? (
            <><Loader2 className="animate-spin" /> Processing...</>
        ) : (
            mode === 'buy' ? 'Buy Token' : 'Sell Token'
        )}
      </button>
      
      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center">
        Slippage: 2% • Gas included
      </div>
    </div>
  );
}

