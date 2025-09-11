
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
// import { disconnect, switchNetwork, watchAccount, watchNetwork } from '@wagmi/core';
// import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { ClipboardService } from 'ngx-clipboard';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, filter } from 'rxjs';
import { AppKitService } from 'src/app/services/appkit.service';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProfileService } from 'src/app/services/profile.service';
// import { SharedService } from 'src/app/services/shared.service';
import { createAppKitWalletButton } from '@reown/appkit-wallet-button';
import { WalletService } from 'src/app/services/wallet.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  accountSubject = new BehaviorSubject<any>(null);
  chainIdSubject = new BehaviorSubject<any>(null);
  loadingSubject = new BehaviorSubject<boolean>(false);
  disconnectButton: boolean;
  errorSubject: any;
  localStorage: any;
  walletAddress: string = '';
  @ViewChild('navbarTop') navbar!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('closeModalBtn') closeModalBtn!: ElementRef<HTMLButtonElement>;
   appKitWalletButton : ReturnType<typeof createAppKitWalletButton> | null = null;


  constructor(
    private readonly authService: AuthService,
    private readonly localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private router: Router,
    private copyToClipboardService: ClipboardService,
    private walletService: WalletService,
    private profileService: ProfileService,
    private appKitService: AppKitService,
    private spinner: NgxSpinnerService,
    private el: ElementRef

  ) { }
  connectorInfo: any;
  isLoading = false;
  userId: string;
  username: string;
  isAffiliate: boolean = false;
  token: string | null = null;

  ngOnInit() {
     this.profileService.affiliate$.subscribe(state => {
      this.isAffiliate = state;
    });
    this.connectorInfo = this.localStorageService.getDataByKey('address');
    this.userId = this.localStorageService.getDataByKey('userId');
    this.isAffiliate = this.localStorageService.getDataByKey('affiliate') || false;
    this.token = this.localStorageService.getDataByKey('token');
    this.appKitService.wallet$.subscribe((wallet) => {
      this.connectorInfo = wallet;
      // console.log('Header Wallet Info Updated:', wallet);
    });
    this.appKitService.wallet$.subscribe(wallet => {
      if (wallet) {
        // this.connectorInfo = wallet.connected;
        this.connectorInfo = wallet.account;
        this.userId = this.localStorageService.getDataByKey('userId');
        const params = {
          wallet_address: wallet?.account,
        }
        this.profileService.profileUpdate(this.userId, params).subscribe({
          next:(response: any) => {
          }, error: (error: any) => {
            this.closeModal()
            this.toastr.error(error.error.message)
            this.connectorInfo = '';
            this.disconnectWallet();
            this.appKitService.disconnect();
          }
        })
      }

    });

    if (this.userId) {
      this.getProfileDetails();
    }

    document.addEventListener('click', this.closeDropdownIfClickedOutside.bind(this));

    // Add this subscription to close dropdown on route change
    this.router.events
    .pipe(filter(event => event instanceof NavigationStart))
    .subscribe(() => {
      this.closeDropdownOnRouteChange();
    });

  }
/**
   * Close dropdown on route change the user
   */
  closeDropdownOnRouteChange() {
    const dropdown = this.dropdownMenu?.nativeElement;
    const button = this.el.nativeElement.querySelector('.dropdown-toggle');

    if (dropdown && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
      button?.classList.remove('show');
    }
  }



  /**
   * Gets profile details of the logged in user
   */
  getProfileDetails() {
    this.profileService.getProfile(this.userId).subscribe({
      next: (response: any) => {
        this.username = `${response.data.first_name} ${response.data.last_name}`;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }


  async connectWallet(walletType: 'injected' | 'coinbase' | 'walletConnect' | 'trust') {
      this.connectorInfo = '';
        try {
          await this.walletService.connectWallet(walletType);
          this.getWalletAddress();
          this.walletService.loading$.subscribe(loading => {
            if (!loading && this.walletAddress) {
              this.closeModal();
              console.log('Wallet Adress: ', this.walletAddress)
              this.connectorInfo = this.walletAddress;
              this.localStorageService.storeData('address', this.walletAddress);
              const params = {
                wallet_address: this.walletAddress
              }
              this.profileService.profileUpdate(this.userId, params).subscribe({
                next:(response: any) => {
                  console.log('Wallet connected response: ', response);
                }, error: (error: any) => {
                  this.closeModal()
                  console.log('Error: ', error.error.message);
                  this.toastr.error(error.error.message)
                  this.connectorInfo = '';
                  this.disconnectWallet();
                }
              })
            }
          });
        }
     catch (error) {
      console.log(error);
      this.handleError(error);
      this.closeModal();

    }
  }

  /**
   * Closes the modal
   */
  closeModal() {
    this.closeModalBtn.nativeElement.click();
  }

     /**
   * Retrieves the current wallet address from the wallet service.
   * @returns The current wallet address, or an empty string if no wallet is connected.
   */
     getWalletAddress() {
      this.walletService.account$.subscribe((account) => {
        console.log('Account: ', account);
        this.walletAddress = account?.address || '';
        console.log('wallet: ', this.walletAddress);
      });
    }


  /**
   * Opens the AppKit modal for connecting a wallet.
   * This function is called when the "Connect Wallet" button is clicked.
   */
    onConnectWallet() {
      this.appKitService.openConnectModal();
    }


  /**
   * Disconnects wallet
   */
  async disconnectWallet() {
    // await this.walletService.disconnectWallet();
    this.connectorInfo = '';
    await this.walletService.disconnect();
    this.localStorageService.removeData('address');
    this.toastr.success('Wallet disconnected successfully');
    // this.router.navigate(['/']);
  }


  /**
   * Handles disconnect
   * @param event
   */
  handleDisconnect(event: Event): void {
    this.appKitService.disconnect();
    event.preventDefault(); // prevent anchor default behavior
    this.disconnectWallet(); // call the actual disconnect method

    // Optionally collapse dropdown manually if needed
    const dropdown = document.querySelector('.dropdown-toggle') as HTMLElement;
    dropdown?.click();
  }


      /**
   * Copys to clipboard
   * @param value
   */
  copyToClipboard(value: any) {
    this.copyToClipboardService.copy(value);
    this.toastr.success('Copied successfully');
  }

  /**
   * Handles connection error
   * @param error
   */
  handleConnectionError(error: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * Navigates to profile
   */
  navigateToProfile() {
    this.router.navigate(['/profile', this.userId]);
  }
  /**
   * Navigates to change password
   */
  navigateToChangePassword() {
    this.router.navigate(['/change-password']);
  }

  /**
 * Handles errors encountered during wallet operations.
 * @param error - The error object that contains details about the encountered issue.
 */
  handleError(error: any) {
    if (error.code == 4001) {
      // this.toastr.error('User rejected');
    } else {
      const errorMessage = error.shortMessage || 'An error occurred';
      this.toastr.error(errorMessage);
    }
  }

  ngAfterViewInit() {
    if (this.navbar) {
      window.addEventListener("scroll", this.onScroll.bind(this));
    }
  }

  onScroll() {
    if (!this.navbar) return; // Ensure navbar exists before accessing nativeElement

    const navbarEl = this.navbar.nativeElement;
    if (window.scrollY > 10) {
      navbarEl.classList.add("fixed-top");
      let navbarHeight = navbarEl.offsetHeight;
      // document.body.style.paddingTop = navbarHeight + "px";
      // Notify home component
      // this.sharedService.setFixedTopState(true);
    } else {
      navbarEl.classList.remove("fixed-top");
      document.body.style.paddingTop = "0";
      // Notify home component
      // this.sharedService.setFixedTopState(false);
    }
  }

  /**
   * Logouts header component
   */
  logout() {
    this.authService.logout().subscribe({
      next: (res: any) => {
        this.spinner.show();
        this.disconnectWallet();
        this.toastr.success('User logged out successfully!');
        this.appKitService.disconnect();
        this.localStorageService.clearAllStorage();
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Error in logging out: ', err);
      }
    })
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdownIfClickedOutside.bind(this));
    if (this.navbar) {
      window.removeEventListener("scroll", this.onScroll.bind(this));
    }
  }

   /**
   * Dropdown menu open to add show class
   */
  toggleDropdown() {
    const menu = this.dropdownMenu.nativeElement; // Access dropdown menu via ViewChild
    menu.classList.toggle('show');
  }
  /**
   * Dropdown menu outside click to close the menu
   */

  closeDropdownIfClickedOutside(event: MouseEvent) {
    const dropdown = this.dropdownMenu?.nativeElement;
    const button = this.el.nativeElement.querySelector('.dropdown-toggle');

    if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
      // Close the dropdown manually
      dropdown.classList.remove('show');
      button.classList.remove('show');
    }
  }


}
