'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { FAUCET_URL } from '@/lib/wagmi';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const needsFaucet = balance && parseFloat(balance.formatted) < 2;

  return (
    <div className="flex items-center gap-3">
      {isConnected && needsFaucet && (
        <motion.a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white font-bold rounded-xl text-sm
                     hover:from-purple-400 hover:to-pink-400 transition-all
                     shadow-lg hover:shadow-purple-500/50"
        >
          💰 Get Free USDC
        </motion.a>
      )}
      
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <motion.button
                      onClick={openConnectModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 
                                 text-black font-bold rounded-xl
                                 hover:from-yellow-400 hover:to-yellow-500 transition-all
                                 shadow-lg hover:shadow-yellow-500/50 moon-pulse"
                    >
                      🌙 Connect Wallet
                    </motion.button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <motion.button
                      onClick={openChainModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 
                                 text-white font-bold rounded-xl"
                    >
                      ⚠️ Wrong Network
                    </motion.button>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={openChainModal}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-2 glass rounded-xl 
                                 border border-yellow-500/30 hover:border-yellow-500/50"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          className="w-5 h-5"
                        />
                      )}
                      <span className="text-sm text-gray-300">{chain.name}</span>
                    </motion.button>

                    <motion.button
                      onClick={openAccountModal}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
                                 from-yellow-500/20 to-yellow-600/20 
                                 border border-yellow-500/50 rounded-xl
                                 hover:from-yellow-500/30 hover:to-yellow-600/30"
                    >
                      <span className="text-yellow-400 font-medium">
                        {account.displayBalance ?? '0 USDC'}
                      </span>
                      <span className="text-white font-mono text-sm">
                        {account.displayName}
                      </span>
                    </motion.button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

