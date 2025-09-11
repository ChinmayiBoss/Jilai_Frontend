import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

    /**
    * store in in localstorage
    * encruption enabled
    * @param {JSON} data
    */
    public storeLoginData(data: any): void {
      if (!data) return;
      const loginData = environment.ENCRYPT_LOCAL_STORAGE ? CryptoJS.AES.encrypt(JSON.stringify(data), environment.LOCAL_STORAGE_SECRET).toString() : JSON.stringify(data);
      localStorage.setItem('login response', loginData);
    }

    /**
     * get stored used data from localstorage
     * @return {JSON} returns user data
     */
    public getLoginData(): any {
      if (!localStorage.getItem('login response')) return null;
      const loginData = environment.ENCRYPT_LOCAL_STORAGE ? CryptoJS.AES.decrypt(localStorage.getItem('login response')!, environment.LOCAL_STORAGE_SECRET).toString(CryptoJS.enc.Utf8) : localStorage.getItem('login response')!;
      return JSON.parse(loginData);
    }

    /**
     * store any data
     *
     * @param {string} key
     * @param {any} value
     */
    public storeData(key: string, value: any): void {
      const data = environment.ENCRYPT_LOCAL_STORAGE ? CryptoJS.AES.encrypt(JSON.stringify(value), environment.LOCAL_STORAGE_SECRET).toString() : JSON.stringify(value);
      localStorage.setItem(key, data);
    }

    /**
     * Get localstorage value by key
     *
     * @param {string} key
     * @return {any}
     */
    public getDataByKey(key: string): any {
      if (!localStorage.getItem(key)) return null;
      const data = environment.ENCRYPT_LOCAL_STORAGE ? CryptoJS.AES.decrypt(localStorage.getItem(key)!, environment.LOCAL_STORAGE_SECRET).toString(CryptoJS.enc.Utf8) : localStorage.getItem(key)!;
      return JSON.parse(data);
    }

    /**
     * Params local storage service
     * @param {string}key
     */
    public clearLocalStorage(key: string): void {
      localStorage.removeItem(key);
    }

    /**
     * Clears all storage
     */
    public clearAllStorage() {
      localStorage.clear();
    }

    removeData(key: string) {
      localStorage.removeItem(key);
    }

      /**
   * Sets token
   * @param token
   */

  setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  /**
   * Sets the Sales Person ID in local storage.
   *
   * @param {string} id - The ID of the sales person. This is required for a user who is registered under a sales person and making a transaction.
   */
  setSalesPersonID(id:string):void {
    if(id){
      this.storeData('sales_person_ref_id',id);
    }else{
      localStorage.removeItem('sales_person_ref_id');
    }
  }

  /**
   * Gets token
   * @returns token
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Removes token
   * @returns
   */
  removeToken() {
    return localStorage.removeItem('accessToken');
  }
}
