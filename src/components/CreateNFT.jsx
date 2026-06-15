/**
 * src/components/CreateNFT.js
 * 
 * Creates an NFT for a student's profile.
 * Uploads image & metadata to IPFS, then mints NFT via a smart contract.
 */

import React, { useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";

// Connect to IPFS (Infura public gateway)
const client = create({
  url: "https://ipfs.infura.io:5001/api/v0",
});

export default function CreateNFT({ student }) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const mintNFT = async () => {
    if (!student || !student.image) {
      setError("Student data or image missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ Upload student image to IPFS
      const imageResponse = await fetch(student.image);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], "profile.png", { type: "image/png" });
      const imageResult = await client.add(imageFile);

      // 2️⃣ Create and upload metadata
      const metadata = {
        name: student.name,
        description: `NFT for ${student.name}, Semester: ${student.semester}`,
        image: `https://ipfs.io/ipfs/${imageResult.path}`,
        attributes: [
          { trait_type: "Parentage", value: student.parentage },
          { trait_type: "Address", value: student.address },
          { trait_type: "Semester", value: student.semester }
        ]
      };

      const metadataResult = await client.add(JSON.stringify(metadata));

      // 3️⃣ Connect to wallet & smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Replace with your own deployed contract address & ABI
      const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
      const CONTRACT_ABI = [
        "function mintNFT(address recipient, string memory tokenURI) public returns (uint256)"
      ];

      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await nftContract.mintNFT(
        await signer.getAddress(),
        `https://ipfs.io/ipfs/${metadataResult.path}`
      );

      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);
    } catch (err) {
      console.error(err);
      setError("Failed to mint NFT. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={mintNFT}
        disabled={loading}
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "none"
        }}
      >
        {loading ? "Minting..." : "Create NFT"}
      </button>

      {txHash && (
        <p style={{ marginTop: "8px", color: "green" }}>
          ✅ NFT Minted! Tx Hash: {txHash}
        </p>
      )}

      {error && (
        <p style={{ marginTop: "8px", color: "red" }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}
