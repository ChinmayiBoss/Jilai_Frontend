import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private affiliate = new BehaviorSubject<boolean>(false);
  affiliate$ = this.affiliate.asObservable();

  constructor(private http: HttpClient) { }

    getAffiliate() {
      return this.affiliate.asObservable();
    }

    setAffiliate(state: boolean) {
      this.affiliate.next(state);
    }
  /**
   * Gets profile
   * @param id
   * @returns
   */
  getProfile(id: string) {
    return this.http.get(`${environment.API_BASE_URL}user/get-user/${id}`);
  }

  /**
   * Profiles update
   * @param id
   * @param data
   * @returns
   */
  profileUpdate(id: string, data: any) {
    return this.http.post(`${environment.API_BASE_URL}user/update/${id}`, data);
  }


  /**
   * Gets referral users
   * @param referralCode
   * @returns
   */
  getReferralUsers(referralCode: string) {
    return this.http.get(`${environment.API_BASE_URL}user/get-my-referal/${referralCode}`);
  }

  /**
   * Deletes user
   * @param id
   * @returns
   */
  deleteUser(id: string) {
    return this.http.delete(`${environment.API_BASE_URL}user/delete-user/${id}`);
  }
}
