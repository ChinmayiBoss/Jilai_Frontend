import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getAccount, getBalance, sendTransaction, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { environment } from 'src/environments/environment';
import { createPublicClient, http, parseEther } from 'viem';
import Web3 from 'web3';
import { config } from '../module/landing/config';

const web3 = new Web3(environment.PROVIDER);
const abi = require('src/contracts/abi/contract.json');
const contract = new web3.eth.Contract(abi, environment.CONTRACT_ADDRESS);
const abiToken = require('src/contracts/abi/tokenSale.json');
const vestingAbi = require('src/contracts/abi/vestingAbi.json');
const aggregateAbi = require('src/contracts/abi/aggregator.json');
const aggregator = new web3.eth.Contract(aggregateAbi, environment.AGGREGATOR_CONTRACT);

const base_url = environment.API_BASE_URL;


@Injectable({
  providedIn: 'root'
})
export class ContractService {
  public vestingMonths: number = 0;
  router: any;
  loadingSubject: any;
  errorSubject: any;
  toastr: any;
  accountSubject: any;
  chainIdSubject: any;
  localStorage: any;
  disconnectButton: boolean;

  constructor(
    private _http: HttpClient
  ) {
    this.init();
  }

  private async init() {
    this.vestingMonths = await this.getVestingMonths();

  }
  /**
   * Gets name
   * @param {string} tokenAddress
   * @returns
   */
  async getName(tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    const name = await contractToken.methods.name().call();
    return name;
  }

  /**
   * Gets token info
   * @param tokenAddress
   * @returns
   */
  async getTokenInfo(tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    const name = await contractToken.methods.name().call();
    const symbol = await contractToken.methods.symbol().call();
    const decimal = await contractToken.methods.decimals().call();
    return { tokenAddress, name, symbol, decimal };
  }

  /**
   * Gets allowance
   * @param spender
   * @param tokenAddress
   * @returns
   */
  // async getAllowance(spender: string, tokenAddress: string) {
  //   const tokenContract = new web3.eth.Contract(abiToken, tokenAddress);
  //   let approvedAmount = await tokenContract.methods.allowance(spender, environment.CONTRACT_ADDRESS).call();
  //   let usdtBalance = await tokenContract.methods.balanceOf(spender).call();
  //   return { approvedAmount, usdtBalance }
  // }

  /**
   * Approves abi
   * @param spender
   * @param amount
   * @param tokenAddress
   * @returns
   */
  async approveAbi(spender: any, amount: any, tokenAddress: string) {
    const tokenContract = new web3.eth.Contract(abiToken, tokenAddress);
    const decimal = await tokenContract.methods.decimals().call();
    let params = [spender, String(amount * 10 ** decimal)]
    return await tokenContract.methods.approve(...params).encodeABI();
  }

  /**
   * Gets user balances
   * @param walletAddress
   * @returns
   */
  async getUserBalances(walletAddress: string) {
    return await contract.methods.users(walletAddress).call();
  }

  /**
   * Gets reward token balance for sale
   * @returns
   */
  async getRewardTokenBalanceForSale() {
    const tokenAddress = await this.getTokenAddress();
    const tokenContract = new web3.eth.Contract(abiToken, tokenAddress);
    return tokenContract.methods.balanceOf(environment.CONTRACT_ADDRESS).call();
  }

  /**
   * Gets initial lockup period
   * @returns
   */
  // async getInitialLockupPeriod() {
  //   return await contract.methods.initialLockInPeriodInSeconds().call();
  // }

  /**
   * Gets vesting months
   * @returns
   */
  async getVestingMonths() {
    return await contract.methods.vestingMonths().call();
  }

  /**
   * Gets vesting address
   * @returns
   */
  async getVestingAddress() {
    return await contract.methods.vestingContract().call();
  }

  /**
   * Gets vesting contract instance
   * @returns
   */
  async getVestingContractInstance() {
    const vestingAddress = await this.getVestingAddress();
    return new web3.eth.Contract(vestingAbi, vestingAddress);
  }

  /**
   * Claims vested tokens
   * @param round
   * @returns
   */
  async claimVestedTokens() {
    const vestingContractInstance = await this.getVestingContractInstance();
    return await vestingContractInstance.methods.claimVestedTokens().encodeABI();
  }

  async isFounder(receipt: string) {
    const vestingContractInstance = await this.getVestingContractInstance();
    const founderVestingMonths = await vestingContractInstance.methods.isFounder(receipt).call();
    const isFounder = await vestingContractInstance.methods.isFounder(receipt).call();
    return { isFounder, founderVestingMonths }
  }

  /**
   * Gets vesting details
   * @returns  
   */
  async getVestingDetails(receipt: string) {
    const vestingContractInstance = await this.getVestingContractInstance();
    const vestingDetails = await vestingContractInstance.methods.getGrantDetails(receipt).call();
    return vestingDetails
  }


  /**
   * Grants claim details
   * @param receipt 
   * @returns  
   */
  async grantClaim(receipt: string) {
    const vestingContractInstance = await this.getVestingContractInstance();
    const claimDetails = await vestingContractInstance.methods.calculateGrantClaim(receipt).call();
    return claimDetails;
  }
  /**
   * Gets user vesting datas
   * @param receipt
   * @param round
   * @returns
   */
  async getUserVestingDatas(receipt: string) {
    const vestingContractInstance = await this.getVestingContractInstance();
    const getFounder = await this.isFounder(receipt);
    const isFounder = getFounder.isFounder
    if (getFounder.isFounder) {
      const founderVestingMonths = await vestingContractInstance.methods.founderVestingDuration().call();
      this.vestingMonths = founderVestingMonths;
    }
    const claimedTokens = await vestingContractInstance.methods.getGrantDetails(receipt).call();
    const totalAmount = await vestingContractInstance.methods.getGrantDetails(receipt).call();
    const availableToClaim = await vestingContractInstance.methods.getGrantDetails(receipt).call();
    const nextClaimDate = await vestingContractInstance.methods.getGrantDetails(receipt).call();
    let vestingCurrentIntervalDatas;
    if (claimedTokens[0] != this.vestingMonths && totalAmount != 0) {
      vestingCurrentIntervalDatas = await vestingContractInstance.methods.calculateGrantClaim(receipt).call();
    } else {
      vestingCurrentIntervalDatas = [0, 0];
    }
    return { claimedTokens, availableToClaim, nextClaimDate, totalAmount, vestingCurrentIntervalDatas, isFounder };
  }

  /**
   * Gets interval time
   * @returns
   */
  async getIntervalTime() {
    const vestingContractInstance = await this.getVestingContractInstance();
    return await vestingContractInstance.methods.intervalTime().call();
  }

  /**
   * Gets token address
   * @returns
   */
  async getTokenAddress() {
    return await contract.methods.jilaiToken().call();
  }
  
  
  /**
   * Buys token
   * @param ethAmount 
   * @returns token 
   */
  async buyToken(ethAmount: string): Promise<string> {
    // const fullInfo = JSON.parse(localStorage.getItem('wagmi.store') || '{}');

    // const account = fullInfo?.state?.connections?.value?.[0]?.[1]?.accounts?.[0];
    // if(!account) {
    //   throw new Error('Wallet not connected');
    // }    
    try {
      const txHash = await writeContract(config, {
        address: environment.CONTRACT_ADDRESS as `0x${string}`,
        abi: abi,
        functionName: 'buyTokens',
        value: parseEther(ethAmount),
        args: [],
      });
    
      // ✅ Wait for confirmation
      const client = createPublicClient({
        transport: http(environment.PROVIDER),
      });      
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed!');
      }
  
      return txHash;
    } catch (error) {
      console.error('Buy token failed:', error);
      throw error;
    }
  }
  


  /**
   * Claims bonus
   * @returns
   */
  public async claimBonus() {
    return await contract.methods.claimBonus().encodeABI();
  }

  
  async getEthBalance(address: string) {
    try {
      const balance = await getBalance(config, {
        address: address as `0x${string}`,
      });
      return balance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }

  /**
   * Gets symbol
   * @param {string} tokenAddress
   * @returns
   */
  async getSymbol(tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    const getSymbol = await contractToken.methods.symbol().call();
    return getSymbol;
  }
  /**
   * Gets decimal
   * @param tokenAddress
   * @returns
   */
  async getDecimal(tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    const getDecimal = await contractToken.methods.decimals().call();
    return getDecimal;
  }
  /**
   * Gets balance of
   * @param {string} address
   * @param {string} tokenAddress
   * @returns
   */
  async getBalanceOf(address: string, tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    const balanceOf = await contractToken.methods.balanceOf(address).call();
    return balanceOf;
  }
  /**
   * Gets rate
   * @returns
   */
  async getRate() {
    const rate = await contract.methods.price().call();
    return rate;
  }

  /**
   * Gets rate details
   * @returns  
   */
  async getRateDetails() {
    const price = await contract.methods.getCurrentStageDetails().call();
    return price;
  }

  async getUSDPrice() {
    const usd = await aggregator.methods.latestAnswer().call();
    return usd;
  }

  /**
   * Gets stage dtails
   */
  async getStageDtails(index: number) {
    const stages = await contract.methods.stages(index).call();
    return stages;
  }

  async getCurrentStage() {
    const stage = await contract.methods.currentStage().call();
    return stage;
  }

  /**
   * Gets closing time
   * @returns
   */
  // async getClosingTime() {
  //   const closingTime = await contract.methods.closingTime().call();
  //   return closingTime;
  // }
  /**
   * Gets starting time
   * @returns
   */
  // async getStartingTime() {
  //   const startingTime = await contract.methods.openingTime().call();
  //   return startingTime;
  // }
  /**
   * Gets contract address
   * @returns
   */
  public getContractAddress() {
    const ContractAddress = environment.CONTRACT_ADDRESS;
    return ContractAddress;
  }

  /**
   * Totals supply
   * @param {string} tokenAddress
   * @returns
   */
  async totalSupply(tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    const totalSupply = await contractToken.methods.totalSupply().call();
    return totalSupply;
  }

  /**
   * Determines whether finalized is
   * @returns
   */
  async isFinalized() {
    return await contract.methods.isFinalized().call();
  }
  /**
   * Determines whether wallets partner is
   * @param {tokenAddress} tokenAddress
   * @returns
   */
  public async isWalletsPartner(tokenAddress: string) {
    const contractToken = new web3.eth.Contract(abiToken, tokenAddress);
    return await contractToken.methods['isPartnerRegistered']().call();

  }


  /**
   * Creates order
   * @param {object} data
   * @returns
   */
  public createOrder(data: object) {
    return this._http.post(`${base_url}/user/order/create`, data)
  }


  /**
   * Gets wallet address
   * @param name
   * @returns
   */
  public getWalletAddress(name: string) {
    return this._http.get(`${base_url}/user/partner/details?name=${name}`)
  }

  /**
 * Sends transaction
 * @param tokenAbi
 * @param toAddress
 * @param [value]
 */
  async sendTransaction(tokenAbi: any, toAddress: any, value?: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const transaction = await sendTransaction(config, {
          to: toAddress,
          data: tokenAbi,
          value: value ? parseEther(value.toString()) : undefined, // Convert if necessary
        });

        const receipt = await waitForTransactionReceipt(config, { hash: transaction });
        resolve({ status: true, data: receipt });

      } catch (error) {
        reject({ status: false, data: error });
      }
    });
  }

}
