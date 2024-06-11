interface WalletAppInfo {
  name: string;
  url: string;
  description: string;
  iconUrls: string[];
  additionalInfo: string;
  walletConnectProjectId: string;
  tiplink?: {
    title: string;
    clientId: string;
    theme: 'dark' | 'light' | 'system';
  };
}

export const APP_INFO: Record<string, WalletAppInfo> = {
  Jupiter: {
    name: 'Jupiter',
    url: 'https://jup.ag',
    description:
      'Jupiter: The best swap aggregator on Solana.  Built for smart traders who like money.',
    iconUrls: ['https://jup.ag/svg/jupiter-logo.svg'],
    additionalInfo: '',
    walletConnectProjectId: '4a4e231c4004ef7b77076a87094fba61',
    tiplink: {
      title: 'Jupiter',
      clientId: 'f959b693-bb63-424f-99b2-87ace1edbb1d',
      theme: 'dark',
    },
  },
  WelcomeToSolana: {
    name: 'Welcome To Solana',
    url: 'https://welcome.jup.ag',
    description: 'Welcome to Solana',
    iconUrls: ['https://jup.ag/svg/jupiter-logo.svg'],
    additionalInfo: '',
    walletConnectProjectId: '4a4e231c4004ef7b77076a87094fba61',
    // Same as JUP above
    tiplink: {
      title: 'Jupiter',
      clientId: 'f959b693-bb63-424f-99b2-87ace1edbb1d',
      theme: 'dark',
    },
  },
  JupiterInternal: {
    name: 'Jupiter Internal',
    url: 'https://internal.jup.ag',
    description: 'Jupiter Internal',
    iconUrls: [],
    additionalInfo: '',
    walletConnectProjectId: '4a4e231c4004ef7b77076a87094fba61',
  },
  Mercurial2: {
    name: 'Meteora',
    url: 'https://app.meteora.ag/',
    description:
      'Building the most secure, optimized & composable yield layer on Solana',
    iconUrls: ['https://app.meteora.ag/icons/logo.svg'],
    additionalInfo: '',
    walletConnectProjectId: '2883fb966cba5bff3d0367890a5a5b42',
    tiplink: {
      title: 'Meteora',
      clientId: 'c45ca831-2ea3-4fe3-b315-89ec7a83fc4d',
      theme: 'dark',
    },
  },
};
