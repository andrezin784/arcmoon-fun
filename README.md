# ARCMOON.FUN – Memecoin Launcher on Arc Testnet

![ARCMOON.FUN Logo](public/logo.svg)

**ARCMOON.FUN** is a memecoin launch platform with bonding curve, running 100% on Arc Testnet. Launch your token to the moon!

## Features

- **1-click Token Creation** - Deploy ERC20 with integrated bonding curve
- **Bonding Curve** - Price increases as more people buy
- **Custom Token Images** - Upload your own token image
- **Integrated Faucet** - Direct link to get free USDC (100 USDC/24h)
- **Premium UI** - Modern design with Framer Motion animations
- **100% Responsive** - Works on desktop and mobile

## Recent Fixes

✅ **USDC Decimal Handling** - Proper 6-decimal conversion for Arc Network native USDC
✅ **Minimum Amount Validation** - Min 0.001 USDC to avoid rounding errors
✅ **Slippage Protection** - 1% slippage tolerance on all trades
✅ **Enhanced Debugging** - Console logs for transaction tracking
✅ **Safe Math** - BigInt operations throughout for precision
✅ **IPFS Image Storage** - Token images stored permanently on IPFS, visible to everyone

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Web3**: wagmi, viem, RainbowKit
- **Smart Contracts**: Solidity 0.8.24, Hardhat
- **Network**: Arc Testnet (Chain ID: 5042002)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your private key:

```
PRIVATE_KEY=your_private_key_here
```

### 3. Compile contracts

```bash
npx hardhat compile
```

### 4. Get USDC for gas

Before deploying, you need USDC on Arc Testnet:
https://faucet.circle.com

### 5. Deploy Factory

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

Copy the factory address and add to `.env.local`:

```
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
```

### 6. Run frontend

```bash
npm run dev
```

Open http://localhost:3000

## Contracts

### MoonToken.sol
ERC20 token with integrated bonding curve:
- Initial supply: 1 billion tokens
- 100 million allocated to creator
- Initial price: 0.001 USDC
- Price increases linearly as tokens are sold

### MoonFactory.sol
Factory to create new MoonTokens:
- Creates tokens with name, symbol, description and image
- Lists all created tokens
- Search tokens by creator

## Arc Testnet

| Property | Value |
|----------|-------|
| Network Name | Arc Testnet |
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Explorer | https://testnet.arcscan.app |
| Native Token | USDC (6 decimals) |

### Add to MetaMask

1. Open MetaMask
2. Click "Add Network"
3. Fill in the data above
4. Or connect through the app - it adds automatically!

## How to Use

1. **Connect your wallet** (MetaMask recommended)
2. **Get free USDC** if needed (100 USDC every 24h from faucet)
3. **Create a token** - Name, symbol and description
4. **Buy tokens** on the bonding curve (min 0.001 USDC)
5. **Sell tokens** when you want to take profit

## Testing

### Test Buy Simulation

Run the test script to simulate purchases without executing real transactions:

```bash
npx hardhat run scripts/test-buy.js --network arcTestnet
```

This will:
- Connect to your deployed factory
- Get the most recent token
- Simulate buy transactions for 0.001, 1, and 10 USDC
- Show expected tokens received with 1% slippage

### Debug Mode

Open browser console (F12) when making transactions to see detailed logs:
- Input amounts
- USDC units (6 decimals)
- Token calculations
- Min amounts with slippage

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

---

**To the Moon!**
