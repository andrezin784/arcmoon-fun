import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { type Chain } from 'viem';

// Arc Testnet Chain Definition
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  iconUrl: 'https://pbs.twimg.com/profile_images/1816068687276072960/b7-7Yt33_400x400.jpg', // Logo da Arc
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'ARCMOON.FUN',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || 'moon-fun-default',
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
});

export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x6b7f4e1117F85808986f467EcC6ddF75E822EAF8';

export const EXPLORER_URL = 'https://testnet.arcscan.app';
export const FAUCET_URL = 'https://faucet.circle.com';

