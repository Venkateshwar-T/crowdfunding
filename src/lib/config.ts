import { http } from 'wagmi';
import { flareTestnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// IMPORTANT: Replace 'YOUR_PROJECT_ID' with your actual WalletConnect Project ID
const projectId = '065b9d9852130a72b187d8b590d0bc5e';

export const config = getDefaultConfig({
  appName: 'Flarestarter',
  projectId: projectId,
  chains: [flareTestnet],
  transports: {
    [flareTestnet.id]: http(),
  },
  ssr: true, // Required for Next.js app router
});
