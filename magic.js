// src/magic.js
import { Magic } from "magic-sdk";

// Load publishable key from .env (Vite uses import.meta.env)
const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC_KEY, {
  network: {
    rpcUrl: "https://rpc.sepolia.org", // Or your chosen RPC
    chainId: 11155111, // Sepolia testnet
  },
});

// The built-in wallet-compatible Ethereum provider
const mpcWallet = magic.rpcProvider;

export { magic, mpcWallet };



