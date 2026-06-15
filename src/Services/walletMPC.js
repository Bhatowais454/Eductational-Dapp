import { Magic } from "magic-sdk";
import { ethers } from "ethers";

// ----- Config (safe defaults) -----
const MAGIC_KEY =
  import.meta?.env?.VITE_MAGIC_PUBLIC_KEY ||
  process.env.REACT_APP_MAGIC_PUBLIC_KEY ||
  "";
const NETWORK =
  (import.meta?.env?.VITE_CHAIN ||
    process.env.REACT_APP_CHAIN ||
    "sepolia").toLowerCase();

// Initialize Magic
export const magic = MAGIC_KEY
  ? new Magic(MAGIC_KEY, { network: NETWORK }) // e.g. "mainnet" | "sepolia"
  : null;

let _provider; // ethers BrowserProvider
let _signer;   // ethers JsonRpcSigner

function requireMagic() {
  if (!magic) {
    throw new Error(
      "Magic publishable key missing. Set VITE_MAGIC_PUBLIC_KEY or REACT_APP_MAGIC_PUBLIC_KEY."
    );
  }
}

export async function ensureProvider() {
  requireMagic();
  if (!_provider) _provider = new ethers.BrowserProvider(magic.rpcProvider);
  return _provider;
}

export async function ensureSigner() {
  const provider = await ensureProvider();
  if (!_signer) _signer = await provider.getSigner();
  return _signer;
}

/**
 * Login or signup with email OTP.
 * Magic automatically provisions a wallet on first successful login.
 */
export async function createWalletWithEmail(email) {
  requireMagic();
  await magic.auth.loginWithEmailOTP({ email });
  // Force-create signer/address
  const signer = await ensureSigner();
  const address = await signer.getAddress();
  return { signer, address };
}

/**
 * Always tries to fetch wallet info safely.
 * If user is logged in but signer not ready, it ensures wallet is created.
 */
export async function getWalletInfoSafe() {
  if (!magic) return null;
  try {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) return null;

    const signer = await ensureSigner();
    const provider = await ensureProvider();
    const address = await signer.getAddress();
    const balWei = await provider.getBalance(address);

    return {
      address,
      balanceEth: ethers.formatEther(balWei),
      chain: NETWORK,
    };
  } catch (err) {
    console.error("Wallet fetch error:", err);
    return null;
  }
}

/**
 * Send native token (ETH, etc.)
 */
export async function sendNative(to, amountEth) {
  const signer = await ensureSigner();
  if (!to) throw new Error("Recipient address required.");
  if (!amountEth) throw new Error("Amount required.");
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(String(amountEth)),
  });
  return tx; // caller can await tx.wait() if they want confirmations
}

/**
 * Logout and clear cached provider/signer
 */
export async function logout() {
  if (!magic) return;
  try {
    await magic.user.logout();
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    _signer = undefined;
    _provider = undefined;
  }
}
