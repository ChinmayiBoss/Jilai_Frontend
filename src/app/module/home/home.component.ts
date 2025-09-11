import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { switchNetwork, watchNetwork } from '@wagmi/core';
import { Modal } from 'bootstrap';
import { ClipboardService } from 'ngx-clipboard';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { VestingButton } from 'src/app/interfaces/common..interface';
import { AuthService } from 'src/app/services/auth.service';
import { ContractService } from 'src/app/services/contract.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProfileService } from 'src/app/services/profile.service';
import { PurchaseService } from 'src/app/services/purchase.service';
import { ApiResponse, TokenInfo, UserInfo, UserRegisterStatus, VestingDetails, VestingUserInfo } from 'src/app/services/types/api-schema.types';
import { WalletService } from 'src/app/services/wallet.service';
import { environment } from 'src/environments/environment';
import * as roadMapData from "./roadmap-data";
import { getConnections, reconnect } from '@wagmi/core';
import { config } from '../landing/config';
import { AppKitService } from 'src/app/services/appkit.service';
// import { ethers } from "ethers";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // @ViewChild('pageScrollContainer') containerRef!: ElementRef;
  public usdtTokenObject: TokenInfo;
  public jilaiTokenObject: TokenInfo;
  public vestingUserInfo: VestingUserInfo = {
    availableToClaim: 0,
    claimedBalance: 0,
    nextClaimDatetime: 0,
    monthsCompleted: 0,
    totalAmount: 0,
    currentIntervalAmount: 0,
    isFounder: false
  };
  public vestingDetails: VestingDetails = {
    amountForClaim: '0',
    amountClaimed: '0',
    remainingAmount: '0',
    nextClaimDate: 'DD/MM/YYYY',
    vestingMonths: '0',
    monthsClaimed: '0'
  };
  public rewardTokenBalanceInContract = 0;
  public vestingAddress: string = '';
  public isAlreadyAnUser = false;
  public lockupPeriodInDays = 0;
  public isClaimLoading = false;
  public vestingButton = VestingButton;
  public buttonState: VestingButton = VestingButton.NoContributionYet;
  public vestingMonth = 0;
  TOTOKENNAME: any;
  tokenSymbol: string;
  saleEnd: string = '';
  saleStart: string = '';
  tokenRate: any;
  lockupPeriod: number;
  transformedLockupPeriod: string = '';
  contractAddress: string = '';
  isLoading = false;
  tokenProcess = false;
  calculatorFromText: any;
  calculatorToText: any;
  calculatorFrom: any;
  from: any;
  to: any;
  calculatorTo: any;
  getTransError = false;
  public usdtTokenBalance = 0;
  public checkSaleDate = true;
  public isFinalized = false;
  public tokenAddress: string = '';
  public checkSaleStartDate = false;
  public usdtTokenAddress: string = '';
  public userInfo: UserInfo = {
    ethContributed: 0,
    jilaiRecieved: 0
  };
  isRefValidAddress = true;
  public currentWalletAddress: string;
  public closingTime: any;
  schedules = [
    { label: 'Days', value: 0 },
    { label: 'Hours', value: 0 },
    { label: 'Minutes', value: 0 },
    { label: 'Seconds', value: 0 },
  ];
  remainingDays = 0;
  remainingHours = 0;
  remainingMinutes = 0;
  remainingSeconds = 0;
  public walletAddress = '';
  isWrongNetwork = false;
  rewardTokenAddress: any
  bgColor: string = '';
  startingTime = 0;
  currentTime: Date;
  isUserRegistered = false;
  fromInputValue: string = '';
  toInputValue: string = '';
  disclaimerModal: Modal;
  agreedToDisclaimer = false;
  roadMapData = roadMapData.data ;
  supportedNetwork: boolean;
  isComingSoon = false;
  disable: boolean = false;
  tokensRemaining: number = 0;
  transactionHash: string = '';
  tokenPrice: string = '';
  kycStatus: number = 0;
  address: string = '';
  intervalId: any;
  currentStage: number = 0;
  ethBalance: number = 0;
  allowBuy: boolean = true;
  tokenPurchased: number = 0;
  ethSpent: number = 0;
  docUploaded: boolean = false;
  ethTOusd: number = 0;
  usdContributed: number = 0;

  constructor(
    private contractService: ContractService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private copyToClipboardService: ClipboardService,
    private localStorageService: LocalStorageService,
    private walletService: WalletService,
    private purchaseService: PurchaseService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private appKitService: AppKitService
    // private sharedService: SharedService,
    // private renderer: Renderer2
  ) {
  }
  /**
   * on init
   */
  ngOnInit(): void {
    this.isComingSoon= false;

    this.address = this.localStorageService.getDataByKey('address');

    this.docUploaded = this.localStorageService.getDataByKey('docUploaded');

    const kyc_verified = this.localStorageService.getDataByKey('kycStatus');
    this.kycStatus = kyc_verified ? kyc_verified : 0;

    if ( kyc_verified === 0 || kyc_verified !== 1) {
      this.checkVerificationStatus();
    }

    this.fetchWalletAddress();
    this.spinner.show();
    this.conn();
    this.TOTOKENNAME = environment.TOTOKENNAME;
    this.tokenSymbol = environment.TOKENSYMBOL;
    this.checkVestInfo();

    // this.walletService.disconnect$.subscribe(disconnected => {
    //   if (disconnected) {
    //     this.walletDisconnected();
    //   }
    // });

    this.appKitService.wallet$.subscribe((response: any) => {
      // console.log("response",response)
      if (response && response.account) {
        this.currentWalletAddress = response.account;
        this.getETHBalance();
        this.conn();
      }else {
        this.contractAddress = ''
        this.currentWalletAddress = '';
        this.ethBalance = 0;
      }
    })

  }

  
  /**
   * Gets eth balance
   */
  async getETHBalance() {
    if (this.currentWalletAddress) {
      const eth = await this.contractService.getEthBalance(this.currentWalletAddress);
      const ethValue = Number(eth?.value);
      this.ethBalance = ethValue / 10 ** 18;
      // console.log('ETH Balance: ', this.ethBalance);
    }
    
  }

  
  /**
   * Checks ethprice
   */
  checkETHprice() {
    this.intervalId = setInterval(() => {
      this.calculateETHPrice();
    }, 120000); // 120000 = 2mins
  }

  /**
   * Wallets disconnected
   */
  walletDisconnected() {
    this.currentWalletAddress = '';
    this.ethBalance = 0;
    this.conn();
    this.vestingDetails = {
      amountForClaim: '0',
      amountClaimed: '0',
      remainingAmount: '0',
      monthsClaimed: '0',
      vestingMonths: '0',
      nextClaimDate: 'DD/MM/YYYY'
    }
    this.disable = true;
    this.buttonState = this.vestingButton.NoContributionYet;
  }

  /**
   * Verifications status
   */
  verificationStatus() {
    const userId = this.localStorageService.getDataByKey('userId');

    const kyc_verified = this.localStorageService.getDataByKey('kycStatus');

    this.kycStatus = kyc_verified ? kyc_verified : 0;

    if (kyc_verified === 0 || kyc_verified !== 1) {
      this.profileService.getProfile(userId).subscribe((response: any) => {
        this.kycStatus = response.data.kyc_verified;
        if (this.kycStatus === 1) {
          this.cdr.detectChanges();
          this.toastr.success("KYC Approved Successfully!");
          this.localStorageService.storeData('kycStatus', this.kycStatus);
          clearInterval(this.intervalId);
        } else if (this.kycStatus === 2) {
          this.profileService.deleteUser(userId).subscribe((response: any) => {
            this.walletService.disconnectWallet();
            this.toastr.error("KYC Declined!");
            console.log('KYC Rejected: ', response);
          })
          this.localStorageService.clearAllStorage();
          clearInterval(this.intervalId);
          this.router.navigate(['/']);
        }

      });
    }
  }

  /**
   * Checks verification status
   */
  checkVerificationStatus() {
    this.intervalId = setInterval(() => {
      this.verificationStatus();
    }, 15000); // 15000 ms = 15 seconds
  }

  /**
   * Fetchs wallet address
   */
  fetchWalletAddress() {
    this.appKitService.wallet$.subscribe((response: any) => {
      if (response && response.account) {        
        this.currentWalletAddress = response.account;
        this.getETHBalance();
        this.conn();
      }else {
        // console.log('No wallet address found');
      }
      
    });
  }

  /**
   * Checks finalized
   */
  async checkFinalized() {
    this.isFinalized = await this.contractService.isFinalized();

    if (this.isFinalized) {
      this.tokenRate = '0';
      this.rewardTokenBalanceInContract = 0;
      this.tokensRemaining = 0;
    }
  }
  /**
   * Checks registered user
   * @param walletAddress
   */
  private checkRegisteredUser(walletAddress: string) {
    this.authService.checkUserRegistrationStatus(walletAddress).subscribe({
      next: (response: ApiResponse<UserRegisterStatus>) => {
        this.isUserRegistered = !response.status
      },
      error: (error) => this.toastr.error(error?.error?.message)
    })
  }

  /**
  * Conn of index component
  */
  public conn = async () => {
    const rewardTokenAddress = await this.contractService.getTokenAddress();

    this.jilaiTokenObject = await this.contractService.getTokenInfo(rewardTokenAddress);
    // this.usdtTokenAddress = await this.contractService.getUSDTTokenAddress();
    // this.usdtTokenObject = await this.contractService.getTokenInfo(this.usdtTokenAddress);
    if (this.currentWalletAddress) {
      const { isFounder, founderVestingMonths } = await this.contractService.isFounder(this.currentWalletAddress);
      isFounder && (this.vestingMonth = founderVestingMonths);
    }

    // await this.vestingInfo();
    if (this.currentWalletAddress) {
      this.getBalance();
      this.calculateETHPrice();
      this.checkETHprice();
      // this.getUSDTBalance();
    } else {
      this.usdtTokenBalance = 0;
      this.userInfo = {
        ethContributed: 0,
        jilaiRecieved: 0
      };
      this.vestingDetails = {
        amountForClaim: '0',
        amountClaimed: '0',
        remainingAmount: '0',
        monthsClaimed: '0',
        vestingMonths: '0',
        nextClaimDate: 'DD/MM/YYYY'
      }
      this.disable = true;
    }
    this.contractAddress = this.contractService.getContractAddress();
    this.transformedLockupPeriod = this.transformLockInPeriod(this.lockupPeriod);
    const tokenRates = await this.contractService.getRateDetails();
    this.tokenRate = this.convert(parseInt(tokenRates[0])) / 10 ** 8;
    this.rewardTokenBalanceInContract = this.limitDecimals(tokenRates[1] / 10 ** this.jilaiTokenObject.decimal, 4);
    const currentStage = await this.contractService.getCurrentStage();
    this.currentStage = currentStage;
    const stageDetails = await this.contractService.getStageDtails(currentStage);
    // console.log('Stage Details: ', stageDetails)
    const tokensRemain = stageDetails[1] - stageDetails[3];
    // this.tokensRemaining = (this.limitDecimals(stageDetails[1] / 10 ** this.jilaiTokenObject.decimal, 4)) - (this.limitDecimals(stageDetails[3] / 10 ** this.jilaiTokenObject.decimal, 4));
    this.tokensRemaining = this.limitDecimals(tokensRemain / 10 ** this.jilaiTokenObject.decimal, 18);
    this.calculatorFromText = 1;
    this.calculatorToText = this.tokenRate;
    this.spinner.hide();
    this.checkFinalized();
      await this.vestingInfo();
  }

  /**
   * Vesting info
   */
  private async vestingInfo() {
    this.vestingAddress = await this.contractService.getVestingAddress();
    this.disable = true;
    if (this.currentWalletAddress) {
      const userVestingDatas = await this.contractService.getVestingDetails(this.currentWalletAddress);
      // console.log('userVestingDatas: ', userVestingDatas);

      let amountForClaim = (BigInt(userVestingDatas[0]) / BigInt(10 ** this.jilaiTokenObject.decimal)).toString();

      const startTime = Number(userVestingDatas[2]);

      if (amountForClaim > '0' && startTime > 0) {
        this.buttonState = this.vestingButton.WaitForNextClaimDate;
      }

      const amountClaimed = (BigInt(userVestingDatas[4]) / BigInt(10 ** this.jilaiTokenObject.decimal)).toString();
      // console.log('Amount Claimed: ', amountClaimed);

      const remainingAmount = (BigInt(userVestingDatas[5]) / BigInt(10 ** this.jilaiTokenObject.decimal)).toString();
      // console.log('Remaining amount for claim: ', remainingAmount);

      const timeStamp = Number(userVestingDatas[6]);
      let nextClaimDate;
      if (timeStamp === 0 && startTime === 0) {
        nextClaimDate = 'Sale Not Ended!';
        this.buttonState = this.vestingButton.SaleNotEnded;
      } else if (timeStamp === 0 && startTime > 0) {
        nextClaimDate = 'Vesting Duration Over!';
      } else {
        nextClaimDate = new Date(timeStamp * 1000).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
              }

      const vestingMonths = userVestingDatas[1];
      // console.log('Vesting Months: ', vestingMonths);
      this.vestingMonth = vestingMonths;

      const monthsClaimed = userVestingDatas[3];
      // console.log('Months claimed: ', monthsClaimed);

      if (monthsClaimed > 0) {
        this.buttonState = this.vestingButton.WaitForNextClaimDate;
      }

      if (vestingMonths === monthsClaimed) {
        this.buttonState = this.vestingButton.VestingDurationEnded;
      }

      if (amountClaimed === amountForClaim) {
        amountForClaim = '0';
      }
      this.vestingDetails = {
        amountForClaim, amountClaimed, remainingAmount, nextClaimDate, vestingMonths, monthsClaimed
      }
    }else {
      this.vestingDetails = {
        amountForClaim: '0',
        amountClaimed: '0',
        remainingAmount: '0',
        monthsClaimed: '0',
        vestingMonths: '0',
        nextClaimDate: 'DD/MM/YYYY'
      }
      this.disable = true;
    }

    this.checkClaimStatus();
  }

  /**
   * Checks claim status
   */
  checkClaimStatus() {
    this.contractService.grantClaim(this.currentWalletAddress).then((response: any) => {
      // console.log('claim status: ', response);

      const vestingAmount = (BigInt(response[1]) / BigInt(10 ** this.jilaiTokenObject.decimal)).toString();
      // console.log('vesting AMount: ', vestingAmount)

      if (Number(vestingAmount) > 0) {
        this.buttonState = this.vestingButton.ClaimYourTokens;
      }
      this.disable = Number(vestingAmount) <= 0;

    })
  }

  /**
   * Checks vest info every one minute
   */
  checkVestInfo() {
    setInterval(() => {
      this.conn();
    }, 60000) //60000 ms = 1 minute
  }

  /**
   * Gets balance
   */
  async getBalance() {
    const userInfo = await this.contractService.getUserBalances(this.currentWalletAddress);
    const ethContributed = this.limitDecimals(userInfo.ethContributed / 10 ** 18, 4);
    const jilaiRecieved = this.limitDecimals(userInfo.jilaiRecieved / 10 ** this.jilaiTokenObject.decimal, 4);
    this.userInfo = { ethContributed, jilaiRecieved };
  }

  /**
   * Gets usdtbalance
   */
  // async getUSDTBalance() {
  //   const usdtTokenBalances = await this.contractService.getBalanceOf(this.currentWalletAddress, this.usdtTokenAddress);
  //   this.usdtTokenBalance = this.limitDecimals(usdtTokenBalances / 10 ** this.usdtTokenObject.decimal, 4);
  // }

  /**
   * Froms input
   */
  public fromInput() {
    this.from = (<HTMLInputElement>document.getElementById("from")).value;
    // Calculate
    if (this.from == "") {
      this.from = '0';
    }
    const tokens = (this.from * this.ethTOusd) / this.tokenRate ;
    const toValue = this.limitDecimals(tokens, 2);
    this.tokenPrice = this.tokenRate;
    this.calculatorFrom = this.limitDecimals(this.from / this.tokenRate, 8);
    (<HTMLInputElement>document.getElementById("to")).value = this.convert(toValue);
    // this.calculatorToText = this.convert(this.calculatorFrom);
    this.calculatorToText = this.convert(toValue);
    this.calculatorFromText = this.convert(this.from);

    // if (this.calculatorToText > this.tokensRemaining) {
    //   this.toastr.error('Limit exceed the token balance!');
    //   this.allowBuy = false;
    // }else {
      this.allowBuy = true;
      this.tokenPurchased = this.calculatorToText;
      this.ethSpent = this.calculatorFromText;
    // }
  }

  private limitDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    if (Math.round(value * factor) / factor !== value) {
      return parseFloat(value.toFixed(decimals));
    }
    return value;
  }
  /**
   * To input
   */
  public toInput() {
    this.to = (<HTMLInputElement>document.getElementById("to")).value;
    if (this.to == "") {
      this.from = '0';
    }
    const totalUSD = this.to * this.tokenRate;
    const ethValue = totalUSD / this.ethTOusd; 
    const fromValue = this.limitDecimals(ethValue, 4);
    this.tokenPrice = this.tokenRate;
    // Calculate
    this.calculatorTo = this.limitDecimals(this.to * this.tokenRate, 4);
    (<HTMLInputElement>document.getElementById("from")).value = this.convert(fromValue);
    this.calculatorToText = this.convert(this.to);
    this.calculatorFromText = this.convert(fromValue);

    // if (this.calculatorToText > this.tokensRemaining) {
    //   this.toastr.error('Limit exceed the token balance!');
    //   this.allowBuy = false;
    // }else {
      this.allowBuy = true;
      this.tokenPurchased = this.calculatorToText;
      this.ethSpent = this.calculatorFromText
    // }

    this.fromInputValue = this.calculatorFromText;

  }

  
  /**
   * Calculates ethprice
   */
  async calculateETHPrice() {
    // this.purchaseService.calculateETH().subscribe({
    //   next: (res: any) => {
    //     console.log('Response for ETH: ', res.RAW.ETH.USD.PRICE);
    //     this.ethTOusd = res.RAW.ETH.USD.PRICE;

    //     this.usdContributed = this.userInfo.ethContributed * this.ethTOusd;
        
    //     // Only update the 'to' field, keep 'from' same
    //     const fromInputValue = (<HTMLInputElement>document.getElementById("from")).value;
  
    //     if (fromInputValue && parseFloat(fromInputValue) > 0) {
    //       this.fromInput();  // recalculate 'to' field
    //     }
  
    //   },
    //   error: (err: any) => {
    //     console.error('Error in fetching price: ', err);
    //   }
    // });

    const usd = await this.contractService.getUSDPrice();
    const oneETH = usd / 10 ** 8;

    this.ethTOusd = oneETH;

    this.usdContributed = this.userInfo.ethContributed * this.ethTOusd;
        
    // Only update the 'to' field, keep 'from' same
    const fromInputValue = (<HTMLInputElement>document.getElementById("from")).value;

    if (fromInputValue && parseFloat(fromInputValue) > 0) {
      this.fromInput();  // recalculate 'to' field
    }


  }
  

  /**
   * Claims vested tokens
   */
  async claimVestedTokens() {
    try {
      this.isClaimLoading = true;
      const claimTokenAbi = await this.contractService.claimVestedTokens();
      const claimToken = await this.contractService.sendTransaction(claimTokenAbi, this.vestingAddress);
      if (claimToken) {
        this.vestingInfo();
        this.isClaimLoading = false;
        this.toastr.success("Claim Successful");
      }

    } catch (error: any) {
      console.log('Error in claim: ', error);
      this.isClaimLoading = false;
      if (error?.data?.cause?.cause?.code === 4001) {
        this.toastr.error(error?.data?.cause?.cause?.message);
      } else {
        this.toastr.error(error);
      }
    }
  }

  /**
   * Buy now of home component
   */
  // buyNow = async () => {
  //   // this.watchNetwork();
  //   const usdtContribution: any = (<HTMLInputElement>document.getElementById("from")).value;
  //   this.getTransError = false;
  //   if (!this.currentWalletAddress) {
  //     this.toastr.error("Connect to the wallet");
  //     this.isLoading = false;
  //     return false;
  //   }
  //   else if (this.currentWalletAddress) {
  //     this.isLoading = true;
  //     if (usdtContribution == "") {
  //       this.toastr.error("Invalid Inputs");
  //       this.isLoading = false;
  //       return false;
  //     }
  //     try {
  //       // const getAllowance = await this.contractService.getAllowance(this.currentWalletAddress, this.usdtTokenObject.tokenAddress);
  //       const usdtContributionInDecimal = usdtContribution;
  //       // if (usdtContributionInDecimal > getAllowance.usdtBalance) {
  //       //   this.toastr.error('Insufficient USDT Balance');
  //       //   this.isLoading = false;
  //       //   return;
  //       // }
  //       // if (getAllowance.approvedAmount < usdtContributionInDecimal) {
  //       //   let approveAbi = await this.contractService.approveAbi(environment.CONTRACT_ADDRESS, usdtContribution, this.usdtTokenObject.tokenAddress);
  //       //   await this.contractService.sendTransaction(approveAbi, this.usdtTokenObject.tokenAddress)
  //       // }
  //       // const buyAbi = await this.contractService.buyToken(usdtContributionInDecimal);
  //       const buyAbi = await  this.contractService.buyToken(usdtContributionInDecimal)
  //         console.log('buy results: ', buyAbi);
  //         this.transactionHash = buyAbi;
  //         (<HTMLInputElement>document.getElementById("from")).value = '';
  //         (<HTMLInputElement>document.getElementById("to")).value = '';
  //         this.isLoading = false;
  //         // this.toastr.success('Transaction Successful');
  //         try {
  //           // this.toastr.success('Transaction successfull!');
  //           await this.conn(); 
  //           await this.vestingInfo();
  //           this.getETHBalance();
  //         this.purchaseDetails();

  //         } catch (err) {
  //           // Silent fail — especially for conn() on first buy
  //           console.warn('Silent error (possibly first-time user):', err);
  //         }
        
  //         this.fromInputValue = '0';
  //       // });
  //       // return;
  //     }
  //     catch (err: any) {
  //       console.log('buy error: ', err)
  //       const errMsg = err?.message || err?.data?.cause?.cause?.message || err?.data?.cause?.shortMessage || 'Transaction failed';

  //       // Handle user rejected error specifically
  //       if (errMsg.toLowerCase().includes('user rejected')) {
  //         this.toastr.warning('Transaction was rejected by the user!');
  //       } else {
  //         this.toastr.error(errMsg, 'Error');
  //       }
    
  //       this.isLoading = false;
  //       return false;
  //     }
  //   }
  //   else {
  //     this.toastr.error("Connect to the wallet");
  //     this.isLoading = false;
  //     return false;
  //   }
  // }

  
  /**
   * Buy now of home component
   */
  buyNow = async (): Promise<boolean> => {
    const usdtContribution: any = (<HTMLInputElement>document.getElementById("from")).value;
    this.getTransError = false;
  
    if (!this.currentWalletAddress) {
      this.toastr.error("Connect to the wallet");
      this.isLoading = false;
      return false;
    }
  
    this.isLoading = true;
    if (usdtContribution === "") {
      this.toastr.error("Invalid Inputs");
      this.isLoading = false;
      return false;
    }
  
    try {
     await this.accountState()
      const usdtContributionInDecimal = usdtContribution;
      const buyAbi = await this.contractService.buyToken(usdtContributionInDecimal);
  
      this.transactionHash = buyAbi;
      (<HTMLInputElement>document.getElementById("from")).value = '';
      (<HTMLInputElement>document.getElementById("to")).value = '';
      this.isLoading = false;
  
      try {
        // this.toastr.success('Transaction successful!');
        await this.conn();
        await this.vestingInfo();
        this.getETHBalance();
        // this.purchaseDetails();
      } catch (err) {
        console.warn('Silent error (possibly first-time user):', err);
      }
  
      this.fromInputValue = '0';
      return true; // Return true for successful transaction
    } catch (err: any) {
      console.log('buy error: ', err);
      const errMsg =
        err?.message ||
        err?.data?.cause?.cause?.message ||
        err?.data?.cause?.shortMessage ||
        'Transaction failed';
  
      if (errMsg.toLowerCase().includes('user rejected')) {
        this.toastr.warning('Transaction was rejected by the user!');
      } else {
        this.toastr.error(errMsg, 'Error');
      }
  
      this.isLoading = false;
      return false;
    }
  };

/**
 * 
 * @returns Asynchronously checks the account state and reconnects if necessary.
 * This function retrieves the current account connection and checks if it is empty.
 * If it is empty, it attempts to reconnect to the wallet.
 */
  async accountState(): Promise<void> {
    const accountConnection = await getConnections(config)
    if (accountConnection.length == 0) {
      await reconnect(config);
      return new Promise((resolve) => {
        resolve();
      });
     }

  }

  /**
   * Validates number
   * @param value
   * @returns true if number
   */
  validateNumber(value: string): boolean {
    return /^[0-9]*\.?[0-9]{0,2}$/.test(value);
  }

  // Convert Expontential value
  /**
   * Converts home component
   * @param n
   * @returns
   */
  convert(n: any) {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n.toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0
      ? sign + "0." + "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal
      : sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))) : (decimal.slice(0, +pow) + "." + decimal.slice(+pow)))
  }

  /**
   * Closes View Transaction alert
   */
  public close() {
    this.tokenProcess = false;
  }

  /**
   * Remaining time of home component
   */
  remainingTime = (time: any) => {
    const closingDate: Date = new Date(time * 1000);
    const interval = setInterval(() => {
      const currentTime: Date = new Date();
      const timeDifference = closingDate.getTime() - currentTime.getTime(); // Recalculate time difference every interval
      if (timeDifference <= 0) {
        clearInterval(interval);
        this.schedules.forEach((item) => (item.value = 0)); // Set all values to 0 when time is up
        return;
      }
      this.schedules[0].value = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      this.schedules[1].value = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.schedules[2].value = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      this.schedules[3].value = Math.floor((timeDifference % (1000 * 60)) / 1000);
    }, 1000);
  }

  /**
   * startTime
   */
  async startTime() {
    const startTimeDate: Date = new Date(this.startingTime * 1000);
    this.currentTime = new Date();
    this.currentTime > startTimeDate ? this.remainingTime(this.closingTime) : this.remainingTime(this.startingTime);
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
   * Determines whether the "Buy Now" button should be disabled
   * @returns {boolean}
   */
  public disableBuyNOW(): boolean {
    return Number(this.fromInputValue) <= 0  || this.isLoading  || this.currentWalletAddress === this.walletAddress || this.isFinalized || this.vestingDetails.nextClaimDate === 'Vesting Duration Over!' || !this.currentWalletAddress || !this.allowBuy;
  }

  /**
   *
   * Updates the wallet address in local storage.
   */
  updateWalletAddress(connection: any) {
    const walletAddress = connection?.address;
    walletAddress ? this.localStorageService.storeData('wallet-address', walletAddress) : this.localStorageService.clearLocalStorage('wallet-address');
  }
  /**
   * Transforms a time period given in seconds to a more readable string format.
   *
   * @param {number} timePeriodInSecs - The time period in seconds.
   * @returns {string} - The time period in a more readable format (months, days, hours, minutes, or seconds).
   */
  public transformLockInPeriod(timePeriodInSecs: number): string {
    const units = [
      { label: 'month', seconds: 2628000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];
    for (const { label, seconds } of units) {
      if (timePeriodInSecs >= seconds) {
        const value = this.roundOff(timePeriodInSecs / seconds);
        return `${value} ${label}${value > 1 ? 's' : ''}`;
      }
    }
    return '0 seconds';
  }

  // Rounds off a value to one decimal place.
  private roundOff(value: number): number {
    return parseFloat(value.toFixed(1));
  }

  /**
   * Purchases details
   */
  purchaseDetails() {
    const params = {
      transaction_id: this.transactionHash,
      number_tokens_purchased: this.tokenPurchased,
      token_price: this.tokenPrice,
      total_contribution_amount: this.ethSpent,
      wallet_address: this.currentWalletAddress,
    }
    console.log('params: ', params);
    this.purchaseService.tokenPurchase(params).subscribe((response: any) => {
    })
  }

}
