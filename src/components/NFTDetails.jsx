// src/components/NFTDetails.js
import React from "react";

export default function NFTDetails({ isOpen, onClose, nft }) {
  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">NFT Details</h2>
        <img src={nft.image} alt={nft.name} className="w-full rounded-lg mb-4" />
        <p><strong>Name:</strong> {nft.name}</p>
        <p><strong>Token ID:</strong> {nft.tokenId}</p>
        <p><strong>Contract:</strong> {nft.contractAddress}</p>
        {nft.metadata && <p><strong>Metadata:</strong> <a href={nft.metadata} target="_blank" rel="noopener noreferrer">View</a></p>}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
