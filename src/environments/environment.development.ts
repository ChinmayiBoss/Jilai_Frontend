import { sepolia } from "viem/chains";

export const environment = {
    production: false,
    API_BASE_URL:'https://devapijilai.jilcrypto.ai/api/v1/',
    DEVELOPMENT_URL: 'https://devjilai.jilcrypto.ai/',
    PROVIDERS: {
      sepolia:  'https://eth-sepolia.g.alchemy.com/v2/BPICn6Du2Z3RJj7yCI8F6iISH389bjTw',
      mainnet: 'https://eth-mainnet.g.alchemy.com/v2/0wVkYag9QNpbh9r_8TdpLW0xtedc6K4G'
    },
    PROVIDER: 'https://eth-sepolia.g.alchemy.com/v2/BPICn6Du2Z3RJj7yCI8F6iISH389bjTw',
    CONTRACT_ADDRESS:'0x285568EDd848676Db31c14343dE177326506C021',
    LOGO:'assets/images/logo.png',
    TITLE:'JILAI-FRONTEND',
    NETWORK:'Sepolia Testnet',
    TYPE:'TESTNET',
    FROMTOKENNAME:'ETH',
    TOTOKENNAME:'JILAI',
    TOKENSYMBOL: 'JIL.AI',
    TRANSLINK:'https://sepolia.etherscan.io/tx',
    SUPPORTMAIL:'info@jilai.co',
    SUPPORTED_CHAINS: [sepolia],
    WALLET_CONNECT_PROJECT_ID: '21b7180548cee23f571fed2f921ba8bf',
    CHAIN_ID: 11155111,
    ENCRYPT_LOCAL_STORAGE: false,
    LOCAL_STORAGE_SECRET: 'D96Q2M84E3400063E8366912AQ45488H',
    APP_DESCRIPTION: 'JILAI Public Sale',
    APP_URL: 'https://jilai.com',
    PROJECT_ID: '0abf7d50e359305b9ba36805b9f49383',
    AGGREGATOR_CONTRACT: '0x694AA1769357215DE4FAC081bf1f309aDC325306'
  };

