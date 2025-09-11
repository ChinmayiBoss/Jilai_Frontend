import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(private http: HttpClient) { }

  /**
   * Tokens purchase
   * @param params 
   * @returns  
   */
  tokenPurchase(params: any) {
    return this.http.post(`${environment.API_BASE_URL}user/token-purchase-confirmation`, params);
  }

  /**
   * Calculates eth
   * @returns  
   */
  calculateETH() {
    return this.http.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD`);
  }
}
 