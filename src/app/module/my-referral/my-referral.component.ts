import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProfileService } from 'src/app/services/profile.service';
import { environment } from 'src/environments/environment';
import { SidebarComponent } from "../../shared/component/sidebar/sidebar.component";

@Component({
  selector: 'app-my-referral',
  standalone: true,
  imports: [SidebarComponent, RouterModule, CommonModule],
  templateUrl: './my-referral.component.html',
  styleUrl: './my-referral.component.scss'
})
export class MyReferralComponent implements OnInit {

  referrals: any[] = [];
  userId: string = '';
  affiliateId: string = '';
  affiliateLink: string = '';

  constructor(
    private copyToClipboardService: ClipboardService,
    private profileService: ProfileService,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router

  ) {
  }

  ngOnInit(): void {
    this.spinner.show();
    this.userId = this.localStorageService.getDataByKey('userId');

    if (this.userId) {
      this.getProfileDetails();
    }
  }

  /**
   * Gets profile details
   */
  getProfileDetails() {
    this.profileService.getProfile(this.userId).subscribe((response: any) => {
      this.affiliateId = response.data.affilate_code;
      if (this.affiliateId) {
        this.myReferral();
      }

      this.affiliateLink = `${environment.DEVELOPMENT_URL}affiliate/${this.affiliateId}`;
    })
  }

  /**
   * referral
   */
  myReferral() {
    this.profileService.getReferralUsers(this.affiliateId).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.referrals = response.data.referrals;
        console.log('referrals: ', this.referrals);
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      }
    });
  }
    /**
   * Copys to clipboard
   * @param value
   */
    copyToClipboard(value: any) {
      this.copyToClipboardService.copy(value);
      this.toastr.success('Copied successfully');
    }
}
