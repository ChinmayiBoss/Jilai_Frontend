import { Injectable, OnDestroy } from '@angular/core';
import { coinbaseWallet, metaMask, walletConnect } from '@wagmi/connectors';
import {
  connect, disconnect, getAccount, getBalance, injected, reconnect, switchChain, watchAccount, watchChainId, type GetAccountReturnType,
} from '@wagmi/core';
import { BehaviorSubject, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mainnet, sepolia } from 'viem/chains';
import { Account } from '../models/Account';
import { config } from '../module/landing/config';


@Injectable({
  providedIn: 'root'
})
export class WalletService implements OnDestroy {
  private accountDetailSubject = new BehaviorSubject<GetAccountReturnType | undefined>(undefined);
  private connectInfo = new BehaviorSubject<boolean>(false);
  private disconnectSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private chainIdSubject = new BehaviorSubject<number | null>(null);
  private errorSubject = new BehaviorSubject<Error | null>(null);
  private readonly LOCAL_STORAGE_KEY = 'walletConnectionState';

  private walletAddressSubject = new BehaviorSubject<Account | null>(null);
  private connectWalletModalStateSubject = new BehaviorSubject<boolean>(false);

  account$ = this.accountDetailSubject.asObservable();
  connect$ = this.connectInfo.asObservable();
  disconnect$ = this.disconnectSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  chainId$ = this.chainIdSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor() {
    this.initialize();
    (async () => {
      await this.updateAccount();
    })();
    this.startWatchingAccount();
    this.startWatchingChainId();
  }

  getConnectedWalletAddress() {
    return this.walletAddressSubject.asObservable();
  }

  setConnectedWalletAddress(account: Account) {
    this.walletAddressSubject.next(account);
  }

  getWalletConnectModalState() {
    return this.connectWalletModalStateSubject.asObservable();
  }

  setWalletConnectModalState(state: boolean) {
    this.connectWalletModalStateSubject.next(state);
  }

  private unWatchAccount: () => void = () => { };
  private unWatchChainId: () => void = () => { };


  private initialize() {
    // Set the initial account and chain ID states
    this.updateAccount();
    // this.updateChainId();

    // Watch for changes
    this.startWatchingAccount();
    this.startWatchingChainId();
  }


  /**
   * Starts watching account
   */
  private startWatchingAccount() {
    const activeChain = environment.production ? mainnet : sepolia;
    this.unWatchAccount = watchAccount(config, {
      onChange: (account) => {
        const accountId = account.chainId;
        if (accountId !== activeChain.id) {
          this.switchNetwork();
        }
        this.accountDetailSubject.next(account || undefined);
        // this.updateAccount();
      },
    });
  }


  /**
   * Starts watching chain id
   */
  private startWatchingChainId() {
    this.unWatchChainId = watchChainId(config, {
      onChange: (chainId) => {
        console.log('Chain Changed! : ', chainId);
        this.chainIdSubject.next(chainId || null);

      },
    });
  }
  /**
     * Checks if a wallet is connected.
     *
     * @returns `true` if a wallet is connected, otherwise `false`.
     */
  isConnected(): boolean {
    const account = getAccount(config);
    return !!account?.isConnected;
  }

  /**
   * Updates the current account detail
   */
  private async updateAccount() {
    try {
      const account = getAccount(config);
      if (account?.isConnected) {
        this.accountDetailSubject.next(account);
      } else {
        const result: any = await reconnect(config);
        if (result?.isConnected) {
          this.accountDetailSubject.next(result.account);
          this.chainIdSubject.next(result.chainId || null);
          this.connectInfo.next(true);
        }
      }
    } catch (error) {
      console.error('Error updating account:', error);
      this.accountDetailSubject.next(undefined);
    }
  }



  /**
   * Connects metamask wallet using injected connector
   *  @returns
   */
  connectMetamask() {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return from(connect(config, { connector: injected() })).subscribe({
      next: (result: any) => {
        console.log('Wallet Connected! : ', result);
        this.updateAccount();
        this.saveConnectionState(result.accounts[0], result.chainId, true || null);
        // this.accountDetailSubject.next(result as GetAccountReturnType);
        this.connectInfo.next(true);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.log('Error connecting wallet: ', error);
        this.handleConnectionError(error); // Centralized error handling
        this.loadingSubject.next(false);
      }
    });
  }


  /**
   * Gets account
   * @returns
   */
  async getAccount() {
    try {
      return getAccount(config);
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  /**
  * Disconnects wallet
  */
  disconnectWallet() {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('wagmi config', config);

    return from(disconnect(config)).subscribe({
      next: () => {
        console.log('Wallet disconnected');
        this.accountDetailSubject.next(undefined);
        this.chainIdSubject.next(null);
        this.clearConnectionState();
        this.disconnectSubject.next(true);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Failed to disconnect wallet:', error);
        this.handleConnectionError(error); // Centralized error handling
        this.loadingSubject.next(false);
      },
    });
  }

  /**
   * Connects a wallet using the specified connector type.
   *
   * @param connectorType The type of wallet connector to use. Supported values are
   * 'injected', 'coinbase', and 'walletConnect'.
   * @returns A RxJS observable that resolves when the wallet is connected.
   */
  // connectWallet(connectorType: 'injected' | 'coinbase' | 'walletConnect') {
  //   this.loadingSubject.next(true);
  //   this.errorSubject.next(null);

  //   const connector =
  //     connectorType === 'injected'
  //       ? injected()
  //       : connectorType === 'coinbase'
  //       ? coinbaseWallet({ appName: 'JilAi' })
  //       : walletConnect({ projectId: 'af18a396620785046ea1a7dec9694922', showQrModal: true });

  //   return from(connect(config, { connector })).subscribe({
  //     next: (result: any) => {
  //       console.log('Wallet connected:', result);
  //       this.updateAccount();
  //       this.saveConnectionState(result.accounts[0], result.chainId, true || null);
  //       this.loadingSubject.next(false);
  //     },
  //     error: (error) => {
  //       console.error('Failed to connect wallet:', error);
  //     this.handleConnectionError(error); // Centralized error handling
  //     this.loadingSubject.next(false);
  //     },
  //   });
  // }
  // async connectWallet(type: 'injected' | 'coinbase' | 'walletConnect' | 'trust') {
  //   this.loadingSubject.next(true);
  //   this.errorSubject.next(null);

  //   let connector;

  //   if (type === 'trust') {
  //     // Explicitly use injected for Trust Wallet
  //     connector = injected({ target: 'trust' });
  //   } else if (type === 'injected') {
  //     // Use dedicated MetaMask connector (not injected)
  //     connector = metaMask();
  //   } else if (type === 'coinbase') {
  //     connector = coinbaseWallet({ appName: 'JilAi' });
  //   } else {
  //     connector = walletConnect({ projectId: 'af18a396620785046ea1a7dec9694922', showQrModal: true });
  //   }

  //   return from(connect(config, { connector })).subscribe({
  //     next: (result: any) => {
  //       console.log('Wallet connected:', result);
  //       this.updateAccount();
  //       this.saveConnectionState(result.accounts[0], result.chainId, true || null);
  //       this.loadingSubject.next(false);
  //     },
  //     error: (error) => {
  //       console.error('Failed to connect wallet:', error);
  //       this.handleConnectionError(error);
  //       this.disconnect(); // Disconnect if there's an error
  //       // this.loadingSubject.next(false);
  //     },
  //   });
  // }
  async connectWallet(type: 'injected' | 'coinbase' | 'walletConnect' | 'trust') {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let connector;

    if (type === 'trust') {
      // Check if Trust Wallet is available (we are checking for window.trust as an indicator)
      if (window.ethereum && (window.ethereum as any)['isTrust']) {
        // Use injected for Trust Wallet
        connector = injected({ target: 'trust' });
      } else {
        // Redirect to Trust Wallet download page if not installed
        window.open('https://trustwallet.com/download', '_blank');
        return;
      }
    } else if (type === 'injected') {
      // Check if MetaMask is available
      if (typeof window.ethereum !== 'undefined' && (window.ethereum as any)['isMetaMask']) {
        // Use MetaMask connector
        connector = metaMask();
      } else {
        // Redirect to MetaMask download page if not installed
        window.open('https://metamask.io/download/','_blank');
        return;
      }
    } else if (type === 'coinbase') {
      // Check if Coinbase Wallet is available
      if (type === 'coinbase') {
        // Use Coinbase Wallet connector
        connector = coinbaseWallet({ appName: 'JilAi' });
      } else {
        // Redirect to Coinbase Wallet download page if not installed
        window.open('https://www.coinbase.com/wallet', '_blank');
        return;
      }
    } else {
      // Default to WalletConnect
      connector = walletConnect({ projectId: 'af18a396620785046ea1a7dec9694922', showQrModal: true });
    }

    // Proceed with wallet connection
    return from(connect(config, { connector })).subscribe({
      next: (result: any) => {
        console.log('Wallet connected:', result);
        this.updateAccount();
        this.saveConnectionState(result.accounts[0], result.chainId, true || null);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Failed to connect wallet:', error);
        this.handleConnectionError(error);
        this.disconnect(); // Disconnect if there's an error
        // this.loadingSubject.next(false);
      },
    });
  }

  /**
  * Fetch the token balance of a specific wallet.
  */
  async getWalletTokenBalance(address: `0x${string}`, token: `0x${string}`) {
    try {
      const balance = await getBalance(config, { address, token });
      console.log('Token balance:', balance);
      return balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw error;
    }
  }

  /**
   * Fetch the native cryptocurrency balance of a wallet.
   */
  async getNativeBalance(address: `0x${string}`) {
    try {
      const balance = await getBalance(config, { address });
      console.log('Native balance:', balance);
      return balance;
    } catch (error) {
      console.error('Error fetching native balance:', error);
      throw error;
    }
  }

  /**
   * Cleanup watchers when the service is destroyed.
   */
  ngOnDestroy() {
    if (this.unWatchAccount) {
      this.unWatchAccount();
    }
    if (this.unWatchChainId) {
      this.unWatchChainId();
    }
  }

  /**
 * Reconnect the wallet using a list of connectors.
 * This method attempts to reconnect the wallet session with the specified connectors.
 *
 * @returns A promise with the result of the reconnection.
 */
  async reconnectWallet(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const result: any = await reconnect(config, {
        connectors: [injected(),coinbaseWallet()],
      });

      // // Update the state after reconnection
      this.saveConnectionState(result.account, result.chainId, result.isConnected || false);
      // this.toastr.success('Wallet reconnected successfully', 'Success');
    } catch (error) {
      console.error('Failed to reconnect wallet:', error);
      this.handleConnectionError(error); // Centralized error handling
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Saves the current wallet connection state to local storage.
   */
  private saveConnectionState(address: GetAccountReturnType, chainId: number | null, isConnected: boolean) {
    const state = { address, chainId, isConnected };
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(state));
  }

  /**
    * Clears the persisted wallet connection state from local storage.
    */
  private clearConnectionState() {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }

  /**
   * Handles errors that occur during wallet connection processes.
   */
  private handleConnectionError(error: any): void {
    let errorMessage = 'An unknown error occurred. Please try again.';

    if (error?.name === 'UserRejectedRequestError') {
      errorMessage = 'You rejected the wallet connection request.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.errorSubject.next(error instanceof Error ? error : new Error(errorMessage));
  }

  /**
   * Switches the blockchain network to a specified chain.
   */
  async switchNetwork(): Promise<boolean> {
    const activeChain = environment.production ? mainnet : sepolia;
    try {
      const result = await switchChain(config, { chainId: activeChain.id });
      return true;
    } catch (error) {
      this.handleConnectionError(error); // Centralized error handling
      return false;
    }
  }

  /**
   *
   * @returns disconnect the wallet
   */
  disconnect() {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('wagmi config', config);
    return from(disconnect(config)).subscribe({
      next: () => {
        console.log('Wallet disconnected');
        this.accountDetailSubject.next(undefined);
        this.chainIdSubject.next(null);
        this.clearConnectionState();
        this.disconnectSubject.next(true);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        // console.error('Failed to disconnect wallet:', error);
        this.handleConnectionError(error); // Centralized error handling
        this.loadingSubject.next(false);
      },
    });
  }
}
