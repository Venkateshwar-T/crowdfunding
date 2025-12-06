import { http } from 'wagmi';
import { flareTestnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// IMPORTANT: Replace 'YOUR_PROJECT_ID' with your actual WalletConnect Project ID
const projectId = 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Flarestarter',
  projectId: projectId,
  chains: [flareTestnet],
  transports: {
    [flareTestnet.id]: http(),
  },
  ssr: true, // Required for Next.js app router
});
