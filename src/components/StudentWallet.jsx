import React, { useEffect, useState } from "react";

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
const ALCHEMY_URL = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner`;

export default function StudentNFTs() {
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask not found");

        const [address] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const url = `${ALCHEMY_URL}?owner=${address}&withMetadata=true&pageSize=50`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.ownedNfts) {
          setError("No NFTs found in wallet.");
          return;
        }

        // Map NFTs with image + metadata
        const ownedNFTs = data.ownedNfts.map((nft) => ({
          tokenId: nft.tokenId,
          name: nft.title || "Unnamed NFT",
          image:
            nft?.rawMetadata?.image?.replace(
              "ipfs://",
              "https://gateway.pinata.cloud/ipfs/"
            ) || "",
          contract: nft.contract.address,
        }));

        setNFTs(ownedNFTs);
      } catch (err) {
        console.error("NFT fetch error:", err);
        setError(`Failed to fetch NFTs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading) return <p className="text-white text-center mt-4">Loading NFTs…</p>;
  if (error) return <p className="text-red-400 text-center mt-4">{error}</p>;
  if (!nfts.length) return <p className="text-white text-center mt-4">No NFTs found in wallet.</p>;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
        {nfts.map((nft, i) => (
          <div
            key={`${nft.contract}-${nft.tokenId}-${i}`}
            className="bg-white/10 p-2 rounded-lg shadow border border-white/20 w-28 flex flex-col items-center"
          >
            {nft.image ? (
              <img
                src={nft.image}
                alt={nft.name}
                className="w-16 h-16 object-contain rounded mb-1 cursor-pointer"
                onClick={() => {
                  setSelectedNFT(nft);
                  setShowModal(true);
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-400 flex items-center justify-center text-xs text-white">
                No Img
              </div>
            )}
            <h3 className="text-white font-semibold text-[10px] text-center leading-tight">
              {nft.name}
            </h3>
            <p className="text-gray-400 text-[8px] text-center mt-1">
              ID: {parseInt(nft.tokenId, 16)}
            </p>
          </div>
        ))}
      </div>

      {/* NFT Details Modal */}
      {showModal && selectedNFT && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-red rounded-lg p-4 w-80">
            <h2 className="text-lg font-bold mb-2">{selectedNFT.name}</h2>
            {selectedNFT.image && (
              <img
                src={selectedNFT.image}
                alt={selectedNFT.name}
                className="w-32 h-32 object-contain mx-auto"
              />
            )}
            <p className="text-sm mt-2">
              Token ID: {parseInt(selectedNFT.tokenId, 16)}
            </p>
            <p className="text-sm break-all">
              Contract: {selectedNFT.contract}
            </p>
            <button
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}



