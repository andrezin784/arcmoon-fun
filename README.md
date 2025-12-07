# 🌙 Moon.fun – Memecoin Launcher on Arc Testnet

![Moon.fun Logo](public/logo.svg)

**Moon.fun** é uma plataforma de lançamento de memecoins com bonding curve, rodando 100% na Arc Testnet. Lance seu token para a lua! 🚀

## ✨ Features

- 🪙 **Criação de Tokens em 1 clique** - Deploy de ERC20 com bonding curve integrada
- 📈 **Bonding Curve** - Preço aumenta conforme mais pessoas compram
- 🌙 **Send Moon** - Envie tokens para múltiplos endereços de uma vez (gera centenas de TXs)
- 💰 **Faucet integrado** - Link direto para pegar USDC grátis
- 🎨 **UI Premium** - Visual moderno com animações Framer Motion
- 📱 **100% Responsivo** - Funciona em desktop e mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Web3**: wagmi, viem, RainbowKit
- **Smart Contracts**: Solidity 0.8.24, Hardhat
- **Network**: Arc Testnet (Chain ID: 5042002)

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione sua private key:

```
PRIVATE_KEY=sua_private_key_aqui
```

### 3. Compilar contratos

```bash
npx hardhat compile
```

### 4. Pegar USDC para gas

Antes de fazer deploy, você precisa de USDC na Arc Testnet:
👉 https://faucet.circle.com

### 5. Deploy da Factory

```bash
npx hardhat run scripts/deploy-factory.ts --network arcTestnet
```

Copie o endereço da factory e adicione no `.env.local`:

```
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
```

### 6. Rodar o frontend

```bash
npm run dev
```

Abra http://localhost:3000 🎉

## 📝 Contratos

### MoonToken.sol
Token ERC20 com bonding curve integrada:
- Supply inicial: 1 bilhão de tokens
- 100 milhões alocados para o criador
- Preço inicial: 0.001 USDC
- Preço aumenta linearmente conforme tokens são vendidos
- Função `sendMoon()` para enviar tokens em massa

### MoonFactory.sol
Factory para criar novos MoonTokens:
- Cria tokens com nome, símbolo, descrição e imagem
- Lista todos os tokens criados
- Busca tokens por criador

## 🌐 Arc Testnet

| Propriedade | Valor |
|-------------|-------|
| Network Name | Arc Testnet |
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Explorer | https://testnet.arcscan.app |
| Native Token | USDC (6 decimals) |

### Adicionar à MetaMask

1. Abra MetaMask
2. Clique em "Add Network"
3. Preencha os dados acima
4. Ou conecte pelo app - ele adiciona automaticamente!

## 🎮 Como usar

1. **Conecte sua wallet** (MetaMask recomendado)
2. **Pegue USDC grátis** se precisar (link no app)
3. **Crie um token** - Nome, símbolo e descrição
4. **Compre tokens** na bonding curve
5. **Send Moon** para gerar transações em massa na testnet!

## 📊 Gerar transações em massa

O botão "Send Moon" permite enviar tokens para 20-50 endereços aleatórios de uma vez. Isso é útil para:
- Testar a rede
- Gerar atividade no explorer
- Simular adoção do token

Cada clique pode gerar 50-500+ transações!

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças maiores, abra uma issue primeiro.

## 📜 Licença

MIT

---

**🌙 To the Moon!** 🚀

