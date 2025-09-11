import { mainnet } from "viem/chains";

export const environment = {
    production: true,
    API_BASE_URL:'https://api.jilcrypto.ai/api/v1/',
    DEVELOPMENT_URL: 'https://user.jilcrypto.ai/',
    PROVIDERS: {
      sepolia:  'https://eth-sepolia.g.alchemy.com/v2/BPICn6Du2Z3RJj7yCI8F6iISH389bjTw',
      mainnet: 'https://eth-mainnet.g.alchemy.com/v2/0wVkYag9QNpbh9r_8TdpLW0xtedc6K4G'
    },
    PROVIDER: 'https://eth-mainnet.g.alchemy.com/v2/0wVkYag9QNpbh9r_8TdpLW0xtedc6K4G',
    CONTRACT_ADDRESS:'0x06E9c94a87EF89a9589A5DE7aD24e7eB62E38841',
    LOGO:'assets/images/logo.png',
    TITLE:'JILAI-FRONTEND',
    NETWORK:'ETH Mainnet',
    TYPE:'MAINNET',
    FROMTOKENNAME:'ETH',
    TOTOKENNAME:'JILAI',
    TOKENSYMBOL: 'JIL.AI',
    TRANSLINK:'https://etherscan.io/tx',
    SUPPORTMAIL:'help@globalcharitabledao.com',
    SUPPORTED_CHAINS: [mainnet],
    WALLET_CONNECT_PROJECT_ID: '21b7180548cee23f571fed2f921ba8bf',
    CHAIN_ID:1,
    ENCRYPT_LOCAL_STORAGE: false,
    LOCAL_STORAGE_SECRET: 'D96Q2M84E3400063E8366912AQ45488H',
    APP_DESCRIPTION: 'JILAI Public Sale',
    APP_URL: 'https://user.jilcrypto.ai/',
    PROJECT_ID: '0abf7d50e359305b9ba36805b9f49383',
    AGGREGATOR_CONTRACT: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'
  };

