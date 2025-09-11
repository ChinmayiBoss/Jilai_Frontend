import { metaMask, coinbaseWallet } from '@wagmi/connectors';
import { createConfig, createStorage, http, injected } from '@wagmi/core';
import { holesky, mainnet, sepolia } from '@wagmi/core/chains';
import { environment } from 'src/environments/environment';

const activeChain = environment.production ? mainnet : sepolia;

export const config = createConfig({
  chains: [ activeChain],
  connectors: [metaMask(), coinbaseWallet(), injected()],
  storage: createStorage({ storage: window.localStorage }),
  transports: {
    [mainnet.id]: http(environment.PROVIDERS.mainnet),
    [sepolia.id]: http(environment.PROVIDERS.sepolia),
  }
});