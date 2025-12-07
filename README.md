# CrowdFund 🌊🚀

**Decentralized Crowdfunding on the Flare Network**

CrowdFund is a next-generation crowdfunding platform built on the **Flare Network**. It empowers creators to launch campaigns and accept funding in non-smart contract assets (like BTC, XRP, and DOGE) using **FAssets**, while ensuring trust and fair valuation through **Flare Data Connector (FDC)** identity verification and **Flare Time Series Oracle (FTSO)** price feeds.

---

## ✨ Key Features

### 1. 🌉 FAsset Integration (Cross-Chain Funding)
CrowdFund bridges the gap between different blockchains. Campaigns can accept:
* **F-BTC** (Bitcoin)
* **F-XRP** (Ripple)
* **F-DOGE** (Dogecoin)
* **F-LTC** (Litecoin)
* **F-USDC** (USD Coin)

This utilizes Flare's FAsset system to bring these assets onto the network for use in smart contracts.

### 2. 🆔 Flare Data Connector (FDC) - Identity Verification
To prevent fraud and ensure regulatory compliance, CrowdFund integrates the Flare Data Connector.
* **Sybil Resistance:** Creators and backers can prove their "humanity" or specific credentials without revealing sensitive data on-chain.
* **Trust Layers:** Campaigns can optionally gate participation to only FDC-verified wallets.

### 3. 📈 Flare Time Series Oracle (FTSO)
The platform uses the FTSO to fetch decentralized, highly accurate, and real-time price feeds.
* **Fair Valuation:** Funding goals (in USD) are dynamically calculated against crypto assets to ensure creators receive the correct value regardless of market volatility.

### 4. 🛡️ Milestone-Based Smart Contracts
* **Escrow Logic:** Funds are released based on campaign milestones (managed on-chain).
* **Refund Mechanism:** If a campaign fails to meet its goal or milestones, smart contracts ensure backers can reclaim their funds.

---

## 🛠️ Tech Stack

**Frontend & Frameworks**
* **[Next.js 15](https://nextjs.org/)**: The React framework for the web (App Router).
* **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for styling.
* **[shadcn/ui](https://ui.shadcn.com/)**: Reusable components built with Radix UI and Tailwind.
* **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icons.

**Web3 & Blockchain**
* **[Wagmi](https://wagmi.sh/)**: React Hooks for Ethereum.
* **[Viem](https://viem.sh/)**: TypeScript Interface for Ethereum.
* **[RainbowKit](https://www.rainbowkit.com/)**: The best way to connect a wallet.
* **Flare Coston2 Testnet**: The underlying blockchain network.

**Backend & Services**
* **[Firebase](https://firebase.google.com/)**:
    * **Authentication**: User management.

---

## 🚀 Getting Started

### Prerequisites
* Node.js v20+
* npm or yarn
* A MetaMask (or similar) wallet configured for **Flare Coston2 Testnet**.
* A Firebase Project.
* A WalletConnect Project ID.