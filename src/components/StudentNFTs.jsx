import React, { useEffect, useState } from "react";

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
const ALCHEMY_BASE = `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

function ipfsToHttp(url) {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }
  return url;
}

function pickImage(nft) {
  return (
    nft?.image?.cachedUrl ||
    nft?.image?.pngUrl ||
    nft?.image?.thumbnailUrl ||
    nft?.media?.[0]?.gateway ||
    nft?.media?.[0]?.raw ||
    ipfsToHttp(nft?.rawMetadata?.image) ||
    ""
  );
}

function hexToDec(id) {
  if (!id) return "";
  return id.startsWith("0x") ? parseInt(id, 16).toString() : id.toString();
}

export default function StudentNFTs() {
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask not found");
        const [owner] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const pageSize = 100;
        let pageKey = null;
        const collected = [];

        do {
          const url = new URL(`${ALCHEMY_BASE}/getNFTsForOwner`);
          url.searchParams.set("owner", owner);
          url.searchParams.set("withMetadata", "true");
          url.searchParams.set("pageSize", String(pageSize));
          if (pageKey) url.searchParams.set("pageKey", pageKey);

          const res = await fetch(url.toString());
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Alchemy error ${res.status}: ${txt}`);
          }
          const data = await res.json();

          const list = (data.ownedNfts || data.nfts || []).map((n) => ({
            tokenIdHex: n.tokenId,
            tokenId: hexToDec(n.tokenId),
            name:
              n.title ||
              n.name ||
              n.contract?.name ||
              `Token #${hexToDec(n.tokenId)}`,
            image: pickImage(n),
            contract: n.contract?.address || n.contractAddress,
          }));

          collected.push(...list);
          pageKey = data.pageKey || data.nextToken || null;
        } while (pageKey);

        setNFTs(collected);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to fetch NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <p className="text-white text-center mt-4">Loading NFTs…</p>;
  if (error) return <p className="text-red-400 text-center mt-4">{error}</p>;
  if (!nfts.length) return <p className="text-white text-center mt-4">No NFTs found in wallet.</p>;

  return (
    <div className="mt-4 bg-gray-900 p-4 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-white mb-3">My NFTs</h2>

      <div className="flex space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 p-2">
        {nfts.map((nft, i) => (
          <div
            key={`${nft.contract}-${nft.tokenId}-${i}`}
            className="flex-none w-40 bg-white/10 p-3 rounded-lg shadow border border-white/20 hover:scale-105 transition-transform duration-200"
          >
            {nft.image ? (
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-32 object-contain rounded mb-2"
              />
            ) : (
              <div className="w-full h-32 bg-gray-500/40 rounded mb-2 flex items-center justify-center text-xs text-white">
                No Img
              </div>
            )}
            <h3 className="text-white font-semibold text-sm truncate">
              {nft.name}
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              ID: {nft.tokenId}
            </p>
            <p className="text-gray-500 text-xs mt-1 truncate">
              {nft.contract?.slice(0, 6)}...{nft.contract?.slice(-4)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}





