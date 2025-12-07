import { usePublicClient } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { MOON_TOKEN_ABI } from '@/lib/contracts';
import { formatEther } from 'viem';

export interface ChartPoint {
  block: number;
  timestamp: number;
  price: number;
  supply: number;
  mcap: number;
}

export function useChartData(tokenAddress: string, totalSold: bigint) {
  const publicClient = usePublicClient();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bonding curve constants (must match contract)
  const INITIAL_PRICE = 0.001;
  const PRICE_INCREMENT = 0.000001;
  const CREATOR_ALLOCATION = 100_000_000;

  const calculatePrice = useCallback((supplyTokens: number) => {
    const sold = Math.max(0, supplyTokens - CREATOR_ALLOCATION);
    return INITIAL_PRICE + sold * PRICE_INCREMENT;
  }, []);

  const fetchData = useCallback(async () => {
    if (!publicClient || !tokenAddress) return;

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 5000n > 0n ? currentBlock - 5000n : 0n;

      const [buyLogs, sellLogs] = await Promise.all([
        publicClient.getContractEvents({
          address: tokenAddress as `0x${string}`,
          abi: MOON_TOKEN_ABI,
          eventName: 'TokensPurchased',
          fromBlock,
          toBlock: currentBlock
        }),
        publicClient.getContractEvents({
          address: tokenAddress as `0x${string}`,
          abi: MOON_TOKEN_ABI,
          eventName: 'TokensSold',
          fromBlock,
          toBlock: currentBlock
        })
      ]);

      const events = [
        ...buyLogs.map(l => ({ ...l, type: 'buy', amount: Number(formatEther(l.args.amount || 0n)) })),
        ...sellLogs.map(l => ({ ...l, type: 'sell', amount: Number(formatEther(l.args.amount || 0n)) }))
      ].sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

      // Calculate current supply/sold
      let currentSold = Number(formatEther(totalSold));
      
      // Work backwards to find start supply of the window
      // Or easier: Work forward? But we only have logs for last 5000 blocks.
      // Better: Assume currentSold is correct NOW.
      // Reconstruct history by subtracting recent moves.
      
      const historyPoints: ChartPoint[] = [];
      let tempSold = currentSold;

      // Add current point
      historyPoints.push({
        block: Number(currentBlock),
        timestamp: Date.now() / 1000,
        price: calculatePrice(tempSold),
        supply: tempSold,
        mcap: calculatePrice(tempSold) * tempSold
      });

      // Process events in reverse to build history backwards
      for (let i = events.length - 1; i >= 0; i--) {
        const e = events[i];
        if (e.type === 'buy') tempSold -= e.amount;
        else tempSold += e.amount; // If sold, before it was higher

        historyPoints.push({
          block: Number(e.blockNumber),
          timestamp: 0, // We'll fetch timestamps if needed, or estimate
          price: calculatePrice(tempSold),
          supply: tempSold,
          mcap: calculatePrice(tempSold) * tempSold
        });
      }

      // Reverse back to chronological order
      const finalData = historyPoints.reverse();

      // Fallback if no data: simulate some growth for visual
      if (finalData.length < 2) {
         // Add a start point
         finalData.unshift({
             block: Number(currentBlock) - 1000,
             timestamp: Date.now() / 1000 - 3600,
             price: INITIAL_PRICE,
             supply: CREATOR_ALLOCATION,
             mcap: INITIAL_PRICE * CREATOR_ALLOCATION
         });
      }

      setData(finalData);
      setIsLoading(false);

    } catch (e) {
      console.error("Error fetching chart data:", e);
      setIsLoading(false);
    }
  }, [publicClient, tokenAddress, totalSold, calculatePrice]);

  // Polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading };
}

