import { useWriteContract, useBalance, useAccount, usePublicClient } from 'wagmi';
import React from 'react';
import { parseUnits } from 'viem';
import { MOON_TOKEN_ABI } from '@/lib/contracts';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { EXPLORER_URL } from '@/lib/wagmi';

export function useMoonTrade(tokenAddress: string) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const publicClient = usePublicClient();

  // Balances
  const { data: ethBalance, refetch: refetchEth } = useBalance({ address });
  const { data: tokenBalance, refetch: refetchToken } = useBalance({ 
    address, 
    token: tokenAddress as `0x${string}` 
  });

  // Write Contract
  const { writeContractAsync } = useWriteContract();

  const handleTransaction = async (
    functionName: 'buy' | 'sell',
    args: any[],
    value: bigint = 0n,
    toastId: string
  ) => {
    if (!address) return toast.error("Connect wallet first");
    if (!publicClient) return toast.error("Network not connected");
    
    try {
      setIsPending(true);
      
      // 1. Submit Transaction
      const hash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: MOON_TOKEN_ABI,
        functionName,
        args: args as any,
        value,
        gas: 500000n // Force slightly higher gas limit
      });

      toast.loading("Confirming transaction...", { id: toastId });

      // 2. Wait for Receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        toast.success(
          <div className="flex flex-col gap-1">
            <span>Transaction Successful!</span>
            <a 
              href={`${EXPLORER_URL}/tx/${hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs underline text-blue-300 hover:text-blue-100"
            >
              View on ArcScan
            </a>
          </div>,
          { id: toastId, duration: 5000 }
        );
        // Refresh balances
        refetchEth();
        refetchToken();
      } else {
        toast.error("Transaction Reverted on chain", { id: toastId });
      }

      return hash;

    } catch (error: any) {
      console.error(error);
      // User rejected or simulation failed
      const msg = error.message?.includes('User rejected') 
        ? "Transaction rejected by user" 
        : (error.message || "Transaction failed");
      toast.error(msg, { id: toastId });
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const buy = async (amountUSDC: string, minTokens: string) => {
    console.log("--- BUY DEBUG ---");
    console.log("Input Amount (USDC):", amountUSDC);
    
    // FORÇA conversão manual para 6 decimals
    const amountFloat = parseFloat(amountUSDC);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.error("Invalid amount");
      throw new Error("Invalid amount");
    }
    
    // Multiplica por 1 milhão (6 casas decimais) e converte para BigInt
    const parsedAmount = BigInt(Math.floor(amountFloat * 1000000));
    console.log("Manual Parsed Amount (6 decimals):", parsedAmount.toString());
    console.log("In USDC:", (Number(parsedAmount) / 1000000).toFixed(6), "USDC");
    
    const parsedMinTokens = parseUnits(minTokens, 18);
    console.log("Min Tokens:", parsedMinTokens.toString());

    if (ethBalance && ethBalance.value < parsedAmount) {
      toast.error("Insufficient USDC balance");
      throw new Error("Insufficient USDC balance");
    }

    return handleTransaction('buy', [parsedMinTokens], parsedAmount, 'tx-buy');
  };

  const sell = async (amountTokens: string, minUSDC: string) => {
    const parsedAmount = parseUnits(amountTokens, 18);
    const parsedMinRefund = parseUnits(minUSDC, 6);

    if (tokenBalance && tokenBalance.value < parsedAmount) {
      toast.error("Insufficient token balance");
      throw new Error("Insufficient token balance");
    }

    return handleTransaction('sell', [parsedAmount, parsedMinRefund], 0n, 'tx-sell');
  };

  return {
    buy,
    sell,
    isPending,
    ethBalance,
    tokenBalance,
    refetchBalances: () => { refetchEth(); refetchToken(); }
  };
}
