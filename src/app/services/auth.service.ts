import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse, UserRegisterStatus } from './types/api-schema.types';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private walletAddressSubject = new BehaviorSubject<string>('');
  walletAddress$ = this.walletAddressSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Checks user registration status
   * @param address
   * @returns user registration status
   */
  public checkUserRegistrationStatus(walletAddress: string): Observable<ApiResponse<UserRegisterStatus>> {
    return this.http.get<ApiResponse<UserRegisterStatus>>(`${environment.API_BASE_URL}/user/check-registration-status?address=${walletAddress}`)
      .pipe(
        switchMap((response: any) => of(response)),
        catchError((error: any) => {
          return throwError(() => error);
        }),
      );
  }

  
  /**
   * Checks login
   * @param wallet_address 
   * @returns  
   */
  checkLogin(wallet_address: string) {
    return this.http.post(`${environment.API_BASE_URL}user/login`, { "wallet_address": wallet_address });
  }

  /**
   * Gets login
   * @param data 
   * @returns  
   */
  getLogin(data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/login`, data);
  }

  /**
   * Signs up
   * @param data 
   * @returns  
   */
  signUp(data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/signup`, data);
  }
  
  /**
   * Forgots password
   * @param data 
   * @returns  
   */
  forgotPassword(data: any) {
    return this.http.get(`${environment.API_BASE_URL}user/send-forgot-password-mail?email=${data}`)
  }

  /**
   * Changes password
   * @param id 
   * @param data 
   * @returns  
   */
  changePassword(id: string, data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/change-password/${id}`, data)
  }
 
  /**
   * Resets password
   * @returns  
   */
  resetPassword(id: string, data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/reset-password/${id}`, data)
  }

  logout() {
    return this.http.delete(`${environment.API_BASE_URL}user/logout`)
  }

  /**
   * Registers auth service
   * @returns register
   */
  public register(params: any): Observable<ApiResponse<UserRegisterStatus>> {
    return this.http.post<ApiResponse<UserRegisterStatus>>(`${environment.API_BASE_URL}/user/signup`, params)
      .pipe(
        switchMap((response: any) => of(response)),
        catchError((error: any) => {
          return throwError(() => error);
        }),
      );
  }

  public imageUpload(params: any): Observable<any> {
    return this.http.post<any[]>(`${environment.API_BASE_URL}/upload`, params)
      .pipe(
        switchMap((response: any) => of(response)),
        catchError((error: any) => {
          return throwError(() => error);
        }),
      );
  }

  /**
   * Reverifys kyc
   * @param email
   * @returns kyc
   */
  public reverifyKyc(email: string): Observable<any> {
    return this.http.get<any[]>(`${environment.API_BASE_URL}/user/kyc-reverification?email=${email}`)
      .pipe(
        switchMap((response: any) => of(response)),
        catchError((error: any) => {
          return throwError(() => error);
        }),
      );
  }

  /**
   * Legals disclaimer agree
   * @param userId
   * @returns disclaimer agree
   */
  public legalDisclaimerAgree(address: string): Observable<any> {
    return this.http.patch<any[]>(`${environment.API_BASE_URL}/user/disclaimer?wallet_address=${address}`, {})
      .pipe(
        switchMap((response: any) => of(response)),
        catchError((error: any) => {
          return throwError(() => error);
        }),
      );
  }

  /**
   * Updates wallet address
   * @param address 
   */
  updateWalletAddress(address: string) {
    this.walletAddressSubject.next(address);
  }

}
