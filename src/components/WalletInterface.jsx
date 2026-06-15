// src/components/WalletInterface.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { magic } from "../magic";
import QRCode from "qrcode.react";

export default function WalletInterface() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState("ethereum");
  const [activeTab, setActiveTab] = useState("wallet"); // wallet | nfts | history

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const provider = new ethers.BrowserProvider(magic.rpcProvider);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);

        const bal = await provider.getBalance(userAddress);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error("Wallet load error:", err);
      }
    };
    loadWallet();
  }, [network]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    alert("Address copied!");
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        🎓 Student Wallet
      </h2>

      {/* Wallet Overview */}
      {activeTab === "wallet" && (
        <div className="space-y-4">
          {/* Address + Copy */}
          {address && (
            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-800 break-all">{address}</span>
              <button
                onClick={copyAddress}
                className="ml-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Copy
              </button>
            </div>
          )}

          {/* QR Code */}
          {address && (
            <div className="flex justify-center mt-4">
              <QRCode value={address} size={120} />
            </div>
          )}

          {/* Balance */}
          {balance !== null && (
            <p className="mt-4 text-lg font-semibold text-center text-purple-600">
              Balance: {balance} {network === "ethereum" ? "ETH" : "MATIC"}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
              📤 Send
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
              📥 Receive
            </button>
          </div>

          {/* Network Switch */}
          <div className="mt-6 text-center">
            <label className="text-sm text-gray-600">Network:</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="ml-2 border rounded-lg p-1"
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>
        </div>
      )}

      {/* NFTs Tab */}
      {activeTab === "nfts" && (
        <div className="mt-6 text-center text-gray-600">
          <p>🖼 NFTs will be displayed here (via Alchemy/QuickNode).</p>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="mt-6 text-center text-gray-600">
          <p>📜 Transaction history will be displayed here.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex justify-around border-t pt-4">
        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-3 py-2 rounded-lg ${
            activeTab === "wallet"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Wallet
        </button>
        <button
          onClick={() => setActiveTab("nfts")}
          className={`px-3 py-2 rounded-lg ${
            activeTab === "nfts"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          NFTs
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-3 py-2 rounded-lg ${
            activeTab === "history"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          History
        </button>
      </div>
    </div>
  );
}


