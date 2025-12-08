import { useWriteContract, useBalance, useAccount, usePublicClient } from 'wagmi';
import React from 'react';
import { parseUnits, formatUnits } from 'viem';
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
      
      console.log("=== WRITE CONTRACT DEBUG ===");
      console.log("Function:", functionName);
      console.log("Value (BigInt):", value.toString());
      console.log("Value (Hex):", '0x' + value.toString(16));
      console.log("Value (Number):", Number(value));
      console.log("Args:", args);
      
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
    console.log("=== BUY TRANSACTION DEBUG ===");
    console.log("Input Amount (USDC):", amountUSDC);
    
    // Validate input
    const amountFloat = parseFloat(amountUSDC);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.error("Invalid amount");
      throw new Error("Invalid amount");
    }
    
    // Minimum 0.001 USDC to avoid rounding issues
    if (amountFloat < 0.001) {
      toast.error("Minimum 0.001 USDC required");
      throw new Error("Minimum amount: 0.001 USDC");
    }
    
    // Convert to USDC units (6 decimals) using parseUnits
    const parsedAmount = parseUnits(amountUSDC, 6);
    console.log("USDC Amount (6 decimals):", parsedAmount.toString(), "units");
    console.log("In USDC:", formatUnits(parsedAmount, 6), "USDC");
    console.log("In Hex:", '0x' + parsedAmount.toString(16));
    
    // Verify minimum (1000 units = 0.001 USDC)
    if (parsedAmount < 1000n) {
      toast.error("Amount too small (min 0.001 USDC)");
      throw new Error("Amount below minimum");
    }
    
    // Parse min tokens with 1% slippage tolerance
    const parsedMinTokens = parseUnits(minTokens, 18);
    console.log("Min Tokens (with slippage):", formatUnits(parsedMinTokens, 18));

    // Check balance
    if (ethBalance && ethBalance.value < parsedAmount) {
      toast.error("Insufficient USDC balance");
      throw new Error("Insufficient USDC balance");
    }

    console.log("Submitting transaction with value:", parsedAmount.toString());
    console.log("CRITICAL CHECK: Value should be", amountFloat * 1000000, "(", amountFloat, "* 10^6)");
    
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
