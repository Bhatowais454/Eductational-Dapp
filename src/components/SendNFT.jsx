// src/components/SendNFT.js
import React, { useState } from "react";
import { ethers } from "ethers";

export default function SendNFT({ isOpen, onClose, tokenId, contractAddress }) {
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found. Please install MetaMask or OKX.");
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const abi = [
        "function safeTransferFrom(address from, address to, uint256 tokenId) external"
      ];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const senderAddress = await signer.getAddress();

      const tx = await contract.safeTransferFrom(senderAddress, recipient, tokenId);
      await tx.wait();

      setSuccess(`NFT sent successfully! TX Hash: ${tx.hash}`);
      setRecipient("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Send NFT</h2>
        <input
          type="text"
          placeholder="Recipient Wallet Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
