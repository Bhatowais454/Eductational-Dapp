// src/pages/Web3AuthWallet.jsx
import React, { useState, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { ethers } from "ethers";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // your firebase config

// 🔹 Replace with your Web3Auth clientId and Alchemy Sepolia RPC
const clientId = "BByvAhagI5kp4L4Z2DX7ScMtKGFTaGcyuq0dW3coVtnmBKUkI5GxOloX3EOxfOOBaak_XbY72EZLNhlpP_O2njc"; 
const alchemyRpcUrl = "https://eth-sepolia.g.alchemy.com/v2/dvoi6t84xLHT6ccSF8akT";

const Web3AuthWallet = ({ email }) => {
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false); // start false
  const [walletExists, setWalletExists] = useState(false);

  // Initialize Web3Auth only on user interaction
  const initWeb3Auth = async () => {
    try {
      const web3authInstance = new Web3Auth({
        clientId,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x5", // Sepolia
          rpcTarget: alchemyRpcUrl,
        },
      });

      setWeb3auth(web3authInstance);
    } catch (err) {
      console.error("Web3Auth init error:", err);
    }
  };

  const connectOrCreateWallet = async () => {
    if (!web3auth) {
      await initWeb3Auth();
    }
    setLoading(true);
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      // Get wallet info
      const walletAddress = await fetchWalletInfo(web3authProvider);

      // Save wallet address to Firebase
      if (email) {
        await setDoc(
          doc(db, "professors", email),
          { walletAddress },
          { merge: true }
        );
        setWalletExists(true);
      }
    } catch (err) {
      console.error("Web3Auth connect error:", err);
      alert("Wallet connection failed!");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletInfo = async (prov) => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(prov);
      const signer = ethersProvider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      const userBalance = await ethersProvider.getBalance(userAddress);
      setBalance(ethers.utils.formatEther(userBalance));
      return userAddress;
    } catch (err) {
      console.error("Fetch wallet info error:", err);
      return "";
    }
  };

  const disconnectWallet = async () => {
    if (!web3auth) return;
    await web3auth.logout();
    setProvider(null);
    setAddress("");
    setBalance("");
    setWalletExists(false);
  };

  const sendTransaction = async (toAddress, amountEth) => {
    if (!provider) return;
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(amountEth),
      });
      await tx.wait();
      await fetchWalletInfo(provider); // refresh balance
      alert("Transaction sent!");
    } catch (err) {
      console.error(err);
      alert("Transaction failed!");
    }
  };

  // Check Firebase for existing wallet
  useEffect(() => {
    const checkExistingWallet = async () => {
      if (!email) return;
      setLoading(true);
      try {
        const docRef = doc(db, "professors", email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().walletAddress) {
          setWalletExists(true);
          setAddress(docSnap.data().walletAddress);
        }
      } catch (err) {
        console.error("Firebase wallet check error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkExistingWallet();
  }, [email]);

  if (loading) return <p>Loading Wallet...</p>;

  return (
    <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
      {!walletExists ? (
        <button
          onClick={connectOrCreateWallet}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
        >
          Create Wallet
        </button>
      ) : (
        <div className="space-y-3">
          <p className="font-mono break-all">Address: {address}</p>
          <p>Balance: {balance || "0"} ETH</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
            >
              Disconnect
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(address)}
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
            >
              Copy Address
            </button>
          </div>
          <SendTransactionForm onSend={sendTransaction} />
        </div>
      )}
    </div>
  );
};

const SendTransactionForm = ({ onSend }) => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  return (
    <div className="mt-4 space-y-2">
      <input
        type="text"
        placeholder="Recipient Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border px-3 py-2 rounded-xl w-full text-gray-800"
      />
      <input
        type="text"
        placeholder="Amount ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border px-3 py-2 rounded-xl w-full text-gray-800"
      />
      <button
        onClick={() => onSend(to, amount)}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all w-full"
      >
        Send
      </button>
    </div>
  );
};

export default Web3AuthWallet;












