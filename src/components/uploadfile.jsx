// src/components/UploadFile.jsx
import React, { useState } from "react";
import { mintWithURI } from "../lib/mint";

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [preview, setPreview] = useState(null);

  const onChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleUploadAndMint = async () => {
    try {
      if (!file) return alert("Choose a file first");
      setStatus("Uploading to IPFS via Pinata…");
      setTxHash("");

      // Step 1 — Mint NFT using updated mint.js (handles Pinata upload internally)
      setStatus("Minting NFT on-chain… (confirm in wallet)");
      const receipt = await mintWithURI(
        file.name,
        "Minted from Student Dashboard",
        file
      );

      setTxHash(receipt.transactionHash || receipt.hash);
      setStatus("✅ Minted successfully!");
    } catch (err) {
      console.error(err);
      setStatus(`❌ ${err.message || "Failed"}`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <label className="block border-2 border-dashed border-white/30 rounded-2xl p-6 cursor-pointer hover:border-white/60 transition bg-white/10 backdrop-blur">
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={onChange}
        />
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full h-48 object-contain rounded-xl"
          />
        ) : (
          <span className="text-white/80">Click to upload image / PDF / doc</span>
        )}
      </label>

      <button
        onClick={handleUploadAndMint}
        className="mt-5 px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white font-semibold hover:scale-105 hover:shadow-lg transition-all disabled:opacity-60"
        disabled={!file || status.includes("…")}
      >
        🚀 Upload & Mint
      </button>

      {status && <p className="mt-3 text-sm text-white/90">{status}</p>}
      {txHash && (
        <p className="mt-2 text-xs text-white/70 break-all">
          Tx: {txHash}
        </p>
      )}
    </div>
  );
}