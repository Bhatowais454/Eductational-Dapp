import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer";
import { FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import { IoWalletOutline } from "react-icons/io5";

export default function ConnectWallet() {
  const [evmAccount, setEvmAccount] = useState("");
  const [solanaAccount, setSolanaAccount] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const savedEvm = localStorage.getItem("evmAccount");
    const savedSol = localStorage.getItem("solanaAccount");
    if (savedEvm) setEvmAccount(savedEvm);
    if (savedSol) setSolanaAccount(savedSol);
  }, []);

  // Request wallet signature (acts like login/terms approval)
  const requestSignature = async (providerType) => {
    try {
      const message = `Welcome to University Dapp!\n\nBy signing this message, you agree to the Terms of Use.\n\nTimestamp: ${Date.now()}`;

      if (providerType === "evm") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        await signer.signMessage(message); // ✅ MetaMask popup
      } else if (providerType === "solana") {
        const encodedMessage = new TextEncoder().encode(message);
        await window.solana.signMessage(encodedMessage, "utf8"); // ✅ Phantom popup
      }

      console.log("✅ Wallet signature approved!");
    } catch (err) {
      console.error("❌ Signature rejected:", err);
    }
  };

  // Connect MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setEvmAccount(account);
        localStorage.setItem("evmAccount", account);

        // 🔥 Ask user to sign Terms & Conditions right after connection
        await requestSignature("evm");
        setShowMenu(false);
      } catch (err) {
        console.error("❌ MetaMask connection failed:", err);
      }
    } else {
      alert("MetaMask not installed.");
    }
  };

  // Connect Phantom
  const connectPhantom = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        const account = resp.publicKey.toString();
        setSolanaAccount(account);
        localStorage.setItem("solanaAccount", account);

        // 🔥 Ask user to sign Terms & Conditions right after connection
        await requestSignature("solana");
        setShowMenu(false);
      } catch (err) {
        console.error("❌ Phantom connection failed:", err);
      }
    } else {
      alert("Phantom not installed.");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setEvmAccount("");
    setSolanaAccount("");
    localStorage.removeItem("evmAccount");
    localStorage.removeItem("solanaAccount");
    setShowMenu(false);
  };

  const getDisplayAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const connectedAddress = evmAccount || solanaAccount;

  return (
    <div className="relative">
      {/* Main Connect Wallet Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-5 py-2 text-sm font-semibold rounded-full shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        {connectedAddress ? (
          <>
            <IoWalletOutline size={18} />
            {getDisplayAddress(connectedAddress)}
          </>
        ) : (
          <>
            <IoWalletOutline size={18} />
            Connect Wallet
          </>
        )}
      </button>

      {/* Wallet Selection Dropdown */}
      {showMenu && !connectedAddress && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <button
            onClick={connectMetaMask}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-800"
          >
            <FaEthereum size={18} className="text-yellow-500" />
            Connect MetaMask
          </button>
          <button
            onClick={connectPhantom}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-800"
          >
            <SiSolana size={18} className="text-purple-600" />
            Connect Phantom
          </button>
        </div>
      )}

      {/* Disconnect Dropdown */}
      {showMenu && connectedAddress && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <button
            onClick={disconnectWallet}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            ❌ Disconnect
          </button>
        </div>
      )}
    </div>
  );
}



