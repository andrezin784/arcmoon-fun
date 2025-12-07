'use client';

import { usePublicClient } from 'wagmi';
import { useState, useEffect } from 'react';
import { MOON_TOKEN_ABI } from '@/lib/contracts';
import { formatEther } from 'viem';
import { EXPLORER_URL } from '@/lib/wagmi';

export default function TransactionTable({ tokenAddress }: { tokenAddress: string }) {
    const publicClient = usePublicClient();
    const [txs, setTxs] = useState<any[]>([]);

    useEffect(() => {
        if (!publicClient || !tokenAddress) return;

        const fetchTxs = async () => {
            try {
                // Limit to recent blocks to avoid RPC limits (Arc limits to 10k logs)
                const blockNumber = await publicClient.getBlockNumber();
                const fromBlock = blockNumber - 5000n > 0n ? blockNumber - 5000n : 0n;

                const [buys, sells] = await Promise.all([
                    publicClient.getContractEvents({
                        address: tokenAddress as `0x${string}`,
                        abi: MOON_TOKEN_ABI,
                        eventName: 'TokensPurchased',
                        fromBlock: fromBlock,
                        toBlock: blockNumber
                    }),
                    publicClient.getContractEvents({
                        address: tokenAddress as `0x${string}`,
                        abi: MOON_TOKEN_ABI,
                        eventName: 'TokensSold',
                        fromBlock: fromBlock,
                        toBlock: blockNumber
                    })
                ]);

                const all = [
                    ...buys.map(e => ({ ...e, type: 'buy', amount: e.args.amount })),
                    ...sells.map(e => ({ ...e, type: 'sell', amount: e.args.amount }))
                ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
                .slice(0, 20); // Last 20

                setTxs(all);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        fetchTxs();
        const interval = setInterval(fetchTxs, 5000);
        return () => clearInterval(interval);
    }, [publicClient, tokenAddress]);

    return (
        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden mt-4">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-white/5">
                <button className="text-white font-bold text-sm border-b-2 border-yellow-400 pb-3 -mb-3.5">Transactions</button>
                <button className="text-gray-400 font-bold text-sm pb-3 -mb-3 hover:text-white">Holders</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black/20 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Amount</th>
                            <th className="px-4 py-3 font-medium">Total ETH/USDC</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Tx</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {txs.map((tx, i) => (
                            <tr key={`${tx.transactionHash}-${i}`} className="hover:bg-white/5 transition-colors">
                                <td className={`px-4 py-2 font-bold ${tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type.toUpperCase()}
                                </td>
                                <td className="px-4 py-2 text-white">
                                    {Number(formatEther(tx.amount || 0n)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-2 font-mono">
                                    {(Number(formatEther(tx.args.cost || tx.args.refund || 0n))).toFixed(4)}
                                </td>
                                <td className="px-4 py-2 text-xs">
                                    {/* Timestamp fetching optimization can be added here if needed */}
                                    recent
                                </td>
                                <td className="px-4 py-2">
                                    <a href={`${EXPLORER_URL}/tx/${tx.transactionHash}`} target="_blank" className="text-blue-400 hover:underline text-xs">
                                        {tx.transactionHash.slice(0, 6)}...
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {txs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    No transactions yet. Be the first!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

