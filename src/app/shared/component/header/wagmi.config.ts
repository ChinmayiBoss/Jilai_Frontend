import { environment } from 'src/environments/environment';

export const config = {
metaData:{
    metadata : {
        name: environment.TOTOKENNAME,
        description: environment.APP_DESCRIPTION,
        url: environment.APP_URL, // origin must match your domain & subdomain
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      projectId:environment.WALLET_CONNECT_PROJECT_ID,
      chains:environment.SUPPORTED_CHAINS
    },
    themeVariables: {
      '--w3m-accent': 'linear-gradient(90deg, #24F3EA 0.08%, #619DCA 89.66%)',
      '--w3m-border-radius-master': '1.7px',
      '--w3m-font-size-master': '10px'
    },
    enableAnalytics:true

}
