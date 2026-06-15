import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";

export const web3Auth = new Web3Auth({
  clientId: "BByvAhagI5kp4L4Z2DX7ScMtKGFTaGcyuq0dW3coVtnmBKUkI5GxOloX3EOxfOOBaak_XbY72EZLNhlpP_O2njc", // Get this from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x5", // Goerli or 0x13881 for Mumbai testnet
    rpcTarget: "https://rpc.ankr.com/polygon_mumbai", // RPC endpoint
  },
});
