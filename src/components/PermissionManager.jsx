// src/components/PermissionManager.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import StudentNFTJson from "../abi/StudentNFT.json"; // ABI of contract

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const abi = StudentNFTJson.abi;

export default function PermissionManager() {
  const [walletAddress, setWalletAddress] = useState("");
  const [allowance, setAllowance] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      prov.getSigner().then((signer) => {
        setContract(new ethers.Contract(CONTRACT_ADDRESS, abi, signer));
      });
    }
  }, []);

  const handleSetAllowance = async () => {
    try {
      const tx = await contract.setMintAllowance(walletAddress, allowance);
      await tx.wait();
      setStatus(`✅ Allowance set: ${walletAddress} can mint ${allowance} NFTs`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error setting allowance");
    }
  };

  const handleGrantRole = async () => {
    try {
      const MINTER_ROLE = await contract.MINTER_ROLE();
      const tx = await contract.grantRole(MINTER_ROLE, walletAddress);
      await tx.wait();
      setStatus(`✅ Granted MINTER_ROLE to ${walletAddress}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error granting role");
    }
  };

  const handleRevokeRole = async () => {
    try {
      const tx = await contract.revokeMinter(walletAddress);
      await tx.wait();
      setStatus(`✅ Revoked MINTER_ROLE & allowance for ${walletAddress}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error revoking role");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">🎓 StudentNFT Permission Manager</h2>
      <input
        type="text"
        placeholder="Wallet Address"
        className="w-full p-2 border rounded"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Allowance (NFTs)"
        className="w-full p-2 border rounded"
        value={allowance}
        onChange={(e) => setAllowance(e.target.value)}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleGrantRole}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Grant Role
        </button>
        <button
          onClick={handleSetAllowance}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Set Allowance
        </button>
        <button
          onClick={handleRevokeRole}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Revoke
        </button>
      </div>
      <p className="text-sm text-gray-600">{status}</p>
    </div>
  );
}
