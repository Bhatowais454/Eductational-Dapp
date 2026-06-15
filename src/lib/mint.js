
import { ethers } from "ethers";
import StudentNFTJson from "../abi/StudentNFT.json"; // full JSON
import axios from "axios";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT
// console.log("VITE_PINATA_JWT from env:", import.meta.env.VITE_PINATA_JWT);

// Extract ABI array from JSON
const abi = StudentNFTJson.abi;

// Upload file to Pinata using JWT
async function uploadFileToPinata(file) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(url, formData, {
    maxBodyLength: "Infinity",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
}

// Upload metadata JSON to Pinata using JWT
async function uploadMetadataToPinata(name, description, imageURL) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const body = { name, description, image: imageURL };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
  });

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
}

// Mint NFT
export async function mintWithURI(name, description, imageFile) {
  if (!window.ethereum) throw new Error("MetaMask not found");

  // Step 1 — Upload image
  const imageURL = await uploadFileToPinata(imageFile);

  // Step 2 — Upload metadata
  const tokenURI = await uploadMetadataToPinata(name, description, imageURL);

  // Step 3 — Connect wallet
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  // Step 4 — Mint NFT with fast gas (super-fast priority)
  const to = await signer.getAddress();
  const tx = await contract.mintNFT(to, tokenURI, {
    maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"), // high tip
    maxFeePerGas: ethers.parseUnits("100", "gwei"),       // high max fee
  });

  return await tx.wait();
}