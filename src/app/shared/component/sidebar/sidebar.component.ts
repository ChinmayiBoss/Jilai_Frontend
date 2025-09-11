import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProfileService } from 'src/app/services/profile.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  userId: string = '';
  isAffiliate: boolean = false;
  connectorInfo: any;

  constructor(
      private localStorageService: LocalStorageService,
      private router: Router,
      private toastr: ToastrService,
      private walletService: WalletService,
      private profileService: ProfileService,
      private readonly authService: AuthService,
      private spinner: NgxSpinnerService,) {}

  ngOnInit(): void {
     this.profileService.affiliate$.subscribe(state => {
      this.isAffiliate = state;
    });
    this.userId = this.localStorageService.getDataByKey('userId');
    this.isAffiliate = this.localStorageService.getDataByKey('affiliate') || false;
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
        this.localStorageService.clearAllStorage();
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Error in logging out: ', err);
      }
    })
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

}
