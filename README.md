# CleanUp

**Cleanup** is a Web3-powered platform that turns real-world pollution into interactive, tokenized missions.  
Users can **sponsor, play, and verify** cleanup activities using NFTs, drones, and Hedera Hashgraph — making environmental restoration transparent, rewarding, and fun.


# React App

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/devarogundade/cleanup-hedera-hackathon.git

# 2. Navigate to the React app directory
cd react-app

# 3. Install dependencies
npm install
```

### 🌐 Environment Variables

Create a .env file inside the react-app directory and add your credentials:

```env
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=

VITE_PAYSTACK_PK_KEY=

VITE_OPERATOR_ACCOUNT_ID=
VITE_OPERATOR_ACCOUNT_PK=

VITE_PINATA_JWT=
VITE_PINATA_GATEWAY=
```

```bash
# 4. Start the development server
vite
```

# Smart Contracts

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/devarogundade/cleanup-hedera-hackathon.git

# 2. Navigate to the React app directory
cd smart-contract

# 3. Install dependencies
npm install
```

### 🌐 Environment Variables

```env
# 4. Set config variables
npm config set HEDERA_RPC_URL <value>
npm config set HEDERA_PRIVATE_KEY <value>
```

```bash
# 5. Compile contracts
npx hardat compile
```

```bash
# 6. Start the development server
npx hardhat run scripts/deploy.ts --network testnet
```

### Hedera Developer Certificates

[certificate.pdf](https://github.com/user-attachments/files/23266241/ibrahim_arogundade_certificate.pdf)
