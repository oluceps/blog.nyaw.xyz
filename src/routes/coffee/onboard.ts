import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import phantomModule from '@web3-onboard/phantom'

const injected = injectedModule();
const phantom = phantomModule()

const baseMainnet = {
  id: '0x2105', // 8453 in hex
  token: 'ETH',
  label: 'Base',
  rpcUrl: 'https://mainnet.base.org'
};

const hyperEVM = {
  id: '0x1f5', // 501 in hex
  token: 'ETH',
  label: 'HyperEVM',
  rpcUrl: 'https://mainnet.hyperliquid.xyz/evm'
};

const monad = {
  id: '0x1ae', // 430 in hex
  token: 'MON',
  label: 'Monad',
  rpcUrl: 'https://monad-rpc.nownodes.io'
};
const walletConnect = walletConnectModule({
  projectId: '9e60bebc8411323b6f2a22171dabc154',
  dappUrl: 'https://blog.nyaw.xyz'
});
const onboard = Onboard({
  wallets: [injected, walletConnect, phantom],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://cloudflare-eth.com'
    }
    , baseMainnet, hyperEVM, monad
  ],
  appMetadata: {
    name: 'Blog Crypto Connecter',
    description: 'Connect to Secirian\'s blog'
  },
  accountCenter: {
    desktop: { enabled: true, position: 'bottomLeft' },
    mobile: { enabled: true }
  }
});

export default onboard;
