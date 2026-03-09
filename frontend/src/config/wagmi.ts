import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const flowEvmTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-evm-testnet',
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flowscan',
      url: 'https://evm-testnet.flowscan.io',
    },
  },
  testnet: true,
});

const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://testnet.evm.nodes.onflow.org';

export const config = createConfig({
  chains: [flowEvmTestnet],
  connectors: [injected()],
  transports: {
    [flowEvmTestnet.id]: http(rpcUrl),
  },
});
