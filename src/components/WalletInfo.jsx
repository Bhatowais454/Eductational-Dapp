// src/components/WalletInfo.js
import React, { useEffect, useState } from "react";
import { magic } from "../magic";

export default function WalletInfo() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const metadata = await magic.user.getMetadata();
        if (metadata.publicAddress) {
          setAddress(metadata.publicAddress);

          // fetch ETH balance
          const provider = new magic.rpcProvider.Web3Provider(magic.rpcProvider);
          const bal = await provider.getBalance(metadata.publicAddress);
          setBalance(Number(bal) / 1e18); // convert from wei to ETH
        }
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };
    fetchWallet();
  }, []);

  if (!address) return null;

  return (
    <div className="bg-white/10 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-white/20 mt-4">
      <h3 className="text-sm font-semibold mb-2">💳 Wallet Info</h3>
      <p className="text-xs break-all">Address: {address}</p>
      <p className="text-xs">Balance: {balance ? balance.toFixed(4) : "0"} ETH</p>
    </div>
  );
}
