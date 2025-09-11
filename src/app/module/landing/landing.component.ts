import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Modal } from 'bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { WalletService } from 'src/app/services/wallet.service';
import { LoginValidator } from './loginValidator';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent implements OnInit, AfterViewInit{

  walletAddress: string = '';
  @ViewChild('closeModalBtn') closeModalBtn!: ElementRef<HTMLButtonElement>;
  loginForm!: FormGroup;
  isPasswordVisible: boolean = false;
  @ViewChild('documentUploadModalRef') documentUploadModalRef!: ElementRef;
  documentUploadModal: any;


    constructor(
      private walletService: WalletService,
      private readonly authService: AuthService,
      private readonly localStorageService: LocalStorageService,
      private spinner: NgxSpinnerService,
      private toastr: ToastrService,
      private router: Router) {}

    connectorInfo: any;
    isLoading = false;


    ngOnInit(): void {
      this.spinner.hide();
      this.initializeForm();
    }

  initializeForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', LoginValidator.email),
      password: new FormControl('', LoginValidator.password),
    })
  }

    // async connectWallet() {
    //   try {
    //     await this.walletService.connectMetamask();
    //     this.getWalletAddress();
    //     this.walletService.loading$.subscribe(loading => {
    //       console.log(loading,"loading")
    //       if (!loading && this.walletAddress) {
    //         this.localStorageService.storeData('address', this.walletAddress);
    //         this.authService.checkLogin(this.walletAddress).subscribe({
    //           next: async (response: any) => {
    //             console.log(response,"tests")
    //             this.toastr.success('Logged in successfully');
    //             const token = response.data.session.session_token;
    //             this.localStorageService.storeData('token', token);
    //             const userId = response.data.user._id;
    //             this.localStorageService.storeData('userId', userId);
    //             const affiliate = response.data.user.is_being_affilate;
    //             this.localStorageService.storeData('affiliate', affiliate);
    //             const kycStatus = response.data.user.kyc_verified;
    //             this.localStorageService.storeData('kycStatus', kycStatus);
    //             this.router.navigate(['/home']);
    //           }, error: (error) => {
    //             console.log('Error: ', error.error.message);
    //             const errorMessage = error.error.message;
    //             this.toastr.warning(error.error.message);
    //             if (errorMessage === 'No user exist with this wallet address') {
    //               console.log('checking')
    //               this.router.navigate(['/signup']);
    //             }
    //           }
    //         })
    //       }
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     this.handleError(error);
    //   }

    // }


  /**
   * Toggles password visibility
   * @param field
   */
  togglePasswordVisibility(field: string): void {
    if (field === 'password'){
      this.isPasswordVisible = !this.isPasswordVisible;
    }
  }

  ngAfterViewInit(): void {
    // Initialize modal only after view is loaded
    if (this.documentUploadModalRef) {
      this.documentUploadModal = new Modal(this.documentUploadModalRef.nativeElement);
    }
  }


  goToKYC(): void {
    if (this.documentUploadModal) {
      this.documentUploadModal.hide();
    }

    setTimeout(() => {
      this.router.navigate(['/kyc']);
    }, 200);
  }

  /**
   * Determines whether submit on
   */
  onSubmit() {
    const params = this.loginForm.value;

    if (this.loginForm.valid) {
      this.spinner.show();
      this.authService.getLogin(params).subscribe({
        next: (response: any) => {
          const userId = response.data.user._id;
          this.localStorageService.storeData('userId', userId);
          const token = response.data.session.session_token;
          this.localStorageService.storeData('token', token);
          const affiliate = response.data.user.is_being_affilate;
          this.localStorageService.storeData('affiliate', affiliate);
          const kycStatus = response.data.user.kyc_verified;
          this.localStorageService.storeData('kycStatus', kycStatus);
          const docUploaded = response.data.user.document_uploaded;
          this.localStorageService.storeData('docUploaded', docUploaded);
          this.spinner.hide();
          if (docUploaded === false) {
            this.documentUploadModal.show();
            // this.toastr.warning('You have not completed the verification process. Please upload your documents to verify!')
          }else {
            this.router.navigate(['/home']);
            this.toastr.success('Logged in successfully');
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log('Error: ', error.error.message);
          const errorMessage = error.error.message;
          this.toastr.error(error.error.message);
          if (errorMessage === 'No user exists with this email address') {
            this.router.navigate(['/signup']);
          }
        }
      })
    } else {
      this.toastr.error('Please enter the valid details');
      this.spinner.hide();
    }
  }

  /**
   * Closes the modal by clicking the close button.
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
      this.walletAddress = account?.address || '';
      this.connectorInfo = account;
    })
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
}


