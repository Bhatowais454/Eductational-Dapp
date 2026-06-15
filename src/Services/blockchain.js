// src/services/blockchain.js
import { ethers } from "ethers";
import { ensureProvider, ensureSigner } from "./walletMPC";
import StudentNFTJson from "../abi/StudentNFT.json"; // keep your ABI where it already is

const CONTRACT_ADDRESS =
  import.meta?.env?.VITE_STUDENT_NFT_ADDRESS || process.env.REACT_APP_CONTRACT_ADDRESS || "";

/**
 * Returns a read-only contract if signer not available, write-capable if signer available.
 * Falls back to provider to avoid crashes if not logged in.
 */
export async function getStudentNFTContract(write = false) {
  const provider = await ensureProvider();
  if (write) {
    const signer = await ensureSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, StudentNFTJson.abi, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, StudentNFTJson.abi, provider);
}

/**
 * Example: Mint a student NFT (expects your contract to have mint(string uri) or similar)
 */
export async function mintStudentNFT(metadataURI) {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address missing. Set VITE_STUDENT_NFT_ADDRESS or REACT_APP_CONTRACT_ADDRESS.");
  const contract = await getStudentNFTContract(true);
  const tx = await contract.mint(metadataURI);
  return tx; // caller can await tx.wait()
}

/**
 * Example: Get NFTs for an address (adjust to your contract’s view methods)
 */
export async function tokensOf(address) {
  if (!CONTRACT_ADDRESS) return [];
  try {
    const contract = await getStudentNFTContract(false);
    if (contract.tokensOfOwner) {
      return await contract.tokensOfOwner(address);
    }
    return []; // adapt if your ABI exposes a different read method
  } catch {
    return [];
  }
}
