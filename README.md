# CleanUp

# React App

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/devarogundade/cleanup-hedera-hackathon.git

# 2. Navigate to the React app directory
cd cleanup/react-app

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
cd cleanup/smart-contract

# 3. Install dependencies
npm install
```

### 🌐 Environment Variables

Create a .env file inside the smart-contracts directory and add your credentials:

```env
# 4. Set config variables
npm config set HEDERA_RPC_URL <value>
npm config set HEDERA_PRIVATE_KEY <value>
```

```bash
# 5. Start the development server
npx hardat compile
```

