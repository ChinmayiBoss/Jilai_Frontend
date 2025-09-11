import { Injectable } from '@angular/core';
import { AppKit, createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { createAppKitWalletButton } from '@reown/appkit-wallet-button';
import { disconnect as wagmiDisconnect, getConnections, reconnect } from '@wagmi/core';
import { config } from '../module/landing/config'; // Import Wagmi config

@Injectable({ providedIn: 'root' })
export class AppKitService {
  private modal: AppKit | null = null;
  private walletSubject = new BehaviorSubject<{ account: string; chainId: string; connected: boolean } | null>(null);
  public wallet$ = this.walletSubject.asObservable();
  public appKitWalletButton: ReturnType<typeof createAppKitWalletButton> | null = null;

  constructor() {
    this.initializeAppKit();
  }

  private initializeAppKit() {
    const projectId = environment.PROJECT_ID;
    const metadata = {
      name: 'app-jilAi',
      description: 'AppKit Example',
      url: 'https://reown.com/appkit',
      icons: ['https://assets.reown.com/reown-profile-pic.png'],
    };

    const activeChain = environment.production ? mainnet : sepolia;

    const wagmiAdapter = new WagmiAdapter({
      projectId,
      networks: [activeChain],
    });

    this.modal = createAppKit({
      adapters: [wagmiAdapter],
      networks: [activeChain],
      projectId,
      metadata,
      features: {
        analytics: true,
        email: false,
        socials: false,
      },
      allWallets: 'SHOW',
    });

    this.appKitWalletButton = createAppKitWalletButton();
    this.listenModalEvents();
  }

  listenModalEvents() {
    if (!this.modal) return;

    // This Method Will use Future


    // Subscribe to account changes
    // this.modal.subscribeAccount((account: any) => {
    //   this.updateWalletInfo();
    // });

    // Subscribe to connection events
    this.modal.subscribeEvents((event: any) => {
      console.log("account",event)
        this.updateWalletInfo();
      });

      // This Method Will use Future

      
    // Subscribe to Wagmi connection changes
    // this.modal.subscribeState((state: any) => {
    //     this.updateWalletInfo();
    // });

  }
  async  updateWalletInfo() {
    
    const fullInfo = JSON.parse(localStorage.getItem('wagmi.store') || '{}');
    const account = fullInfo?.state?.connections?.value?.[0]?.[1]?.accounts?.[0];
    const chainId = fullInfo?.state?.chainId;

    if (account && chainId) {
      this.walletSubject.next({ account, chainId, connected: true });
    } else {
      this.walletSubject.next(null);
    }
  }

  public openConnectModal() {
    this.modal?.open({ view: 'Connect' });
  }

  public openNetworkModal() {
    this.modal?.open({ view: 'Networks' });
  }

  public getWalletInfo() {
    return this.modal?.getWalletInfo();
  }

  async disconnect() {
    try {

      // Disconnect AppKit modal
      if (this.modal) {
        await this.modal.disconnect();
      }

      // Clear local storage
      const removeValue = [
        'wagmi.store',
        'reown.store',
        '@appkit/native_balance_cache',
        '@appkit/token_balance_cache',
        'wagmi.recentConnectorId',
        '@appkit/ens_cache',
        '@appkit/identity_cache',
        '@appkit/active_caip_network_id',
        '@appkit/active_namespace',
        '@appkit/connected_namespaces',
      ];
      removeValue.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Reset wallet state
      this.walletSubject.next(null);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  }

  public triggerWalletUpdate() {
    this.updateWalletInfo();
  }
}