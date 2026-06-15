import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  WagmiConfig,
  createConfig,
  http,
} from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ define chains yourself
const chains = [mainnet, polygon, optimism, arbitrum];

// ✅ get default wallets, pass chains
const { connectors } = getDefaultWallets({
  appName: 'UOK Dapp',
  projectId: '47f2f2e96c8a7b06ef3b9034e1c7ce51',
  chains,
});

// ✅ create config, pass transport for each chain
const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false,
});

const queryClient = new QueryClient();

export default function WalletProvider({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}