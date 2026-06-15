import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";

export const web3Auth = new Web3Auth({
  clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID, // Get this from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x5", // Goerli or 0x13881 for Mumbai testnet
    rpcTarget: "https://rpc.ankr.com/polygon_mumbai", // RPC endpoint
  },
});
