import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { NgxMaskDirective } from 'ngx-mask';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormValidator } from 'src/app/auth/signup/form-validator';
import { VerificationStatus } from 'src/app/enums/verification-status';
import { FLAG_COUNTRY_CODES } from 'src/app/helpers/phone-number.helper';
import { ICountryCode } from 'src/app/interfaces/common..interface';
import { AuthService } from 'src/app/services/auth.service';
import { IpAddressService } from 'src/app/services/ip-address.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProfileService } from 'src/app/services/profile.service';
import { WalletService } from 'src/app/services/wallet.service';
import { SidebarComponent } from "../../shared/component/sidebar/sidebar.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SidebarComponent, ReactiveFormsModule, RouterModule, CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  userId: string | null = null;
  profile: any;
  profileForm: FormGroup;
  walletAddress: string = ''; // This will hold the comma-separated addresses
  referralCode: string = '';
  walletAddressArray: string[] = [];
  uniqueWallets: string[] = [];
  public isRegister: boolean = false;
  ipAddress: string = '';
  timestamp: any;
  date: any;
  isAffliateChecked: boolean = false;
  isCampaignerChecked: boolean = false;
  affiliate: boolean = false;
  campaigner: boolean = false;
  toggleList!: boolean;
  selectedCountryCode?: ICountryCode | null;
  selectedCountry?: ICountryCode | null;
  public countryDetailsList: any[] = FLAG_COUNTRY_CODES;
  filteredCountryDetailsList: any[] = this.countryDetailsList;
  phoneNumber!: number;
  searchText!: string;
  kycStatus: number = 0;
  intervalId: any;
  verification_status: string | null = null;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private copyToClipboardService: ClipboardService,
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService,
    private ipAddressAervice: IpAddressService,
    private cdr: ChangeDetectorRef,
    private walletService: WalletService,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.spinner.show();

    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
    });

    this.fetchIPAddress();

    this.timestamp = new Date().toLocaleTimeString();
    this.date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });

    this.profileForm = new FormGroup({
      first_name: new FormControl(''),
      last_name: new FormControl(''),
      email: new FormControl(''),
      country_code: new FormControl(''),
      phone_number: new FormControl('', FormValidator.phoneNumber),
      full_address: new FormControl('', FormValidator.full_address),
      city: new FormControl('', FormValidator.city),
      state: new FormControl('', FormValidator.state),
      country: new FormControl('', FormValidator.country),
      zip_code: new FormControl('', FormValidator.zip_code),
      wallet_address: new FormControl(''),
      // verification_status: new FormControl(''),
      is_being_affilate: new FormControl(false),
      is_being_campaigner: new FormControl(false),
    });

    this.getProfile();

    const kyc_verified = this.localStorageService.getDataByKey('kycStatus');
    this.kycStatus = kyc_verified ? kyc_verified : 0;

    if ( kyc_verified === 0 || kyc_verified !== 1) {
      this.checkVerificationStatus();
    }

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
   * Gets profile details
   */
  getProfile() {
    this.profileService.getProfile(this.userId ?? '').subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.profile = response.data;
        this.affiliate = this.profile.is_being_affilate;
        this.campaigner = this.profile.is_being_campaigner;
        console.log("verification", this.profile.verification_status);

        // Map API status to enum value
        switch (this.profile.verification_status) {
          case 'approved':
            this.verification_status = VerificationStatus.Approved;
            break;
          case 'pending':
            this.verification_status = VerificationStatus.Pending;
            break;
        }

        // Patch the form and set other fields
        this.profileForm.patchValue(this.profile);

        this.selectedCountry = {
          dialCode: this.profile.country_code,
        }

        // Join wallet addresses with commas and set to the form control

        if (this.profile.wallet_address && Array.isArray(this.profile.wallet_address)) {
          // Remove duplicates
          this.uniqueWallets = Array.from(new Set(this.profile.wallet_address));

          this.walletAddressArray = this.uniqueWallets;
          this.walletAddress = this.uniqueWallets.join(', ');
        } else {
          this.walletAddressArray = [];
          this.walletAddress = '';
        }

        // Update the form control with the comma-separated wallet addresses
        this.profileForm.controls['wallet_address'].setValue(this.walletAddress);
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


  /**
   * Function to find the index of an object with a specific code
   * @param codeToFind
   * @returns index by code
   */
  private findIndexByCode(codeToFind: string): number {
    return this.countryDetailsList.findIndex(country => country.code === codeToFind);
  }

  /**
 * get selected country's flag
 * @param{string}dialCode
 * @return{string}
 */
  getCountryEmojiByDialCode(dialCode: string) {
    const country = FLAG_COUNTRY_CODES.find(country => country.dialCode === dialCode);
    return country ? country.emoji : null;
  }

  /**
   *search country codes
   */
  searchCountryCode() {
    this.filteredCountryDetailsList = FLAG_COUNTRY_CODES.filter(country =>
      country.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      country.dialCode.includes(this.searchText)
    );
  }
  /**
     * Detect change on phone number component

     * @param{any} event
     */
    public detectChangePhonenumber(event: any): void {
      if (event) {
        if (event?.type === 1) {
          this.profileForm.patchValue({
            phone_number: event.value
          })
        } else {
          this.selectedCountryCode = event.value;
        }

      }
    }

    /**
   * on selecting country in phone number field
   * @param{string}selectedCountryCode
   */
    onSelectingCountry(selectedCountryCode: string) {
      this.selectedCountryCode = {
        ...this.selectedCountryCode,
        dialCode: selectedCountryCode
      }
    }

    /**
   * keyup phone number
   * @param{any}event
   */
    keyUpPhoneNumber(event: any) {
      this.phoneNumber = event.target.value;
    }

    /**
     * select country
     * @param{{}}data
     */
    selectCountry(data: ICountryCode) {
      this.selectedCountry = {
        dialCode: data.dialCode,
        code: data.code
      }
      this.toggleList = false;
      this.setCountryDetails(data?.code,data?.dialCode)
    }

    /**
     * Sets country details
     * @param flag
     * @param countryCode
     */
    setCountryDetails(flag: any, countryCode: any) {
      this.profileForm.patchValue({
        country_code: countryCode,
        flag_code: flag
      })
    }

  /**
   * Fetchs ipaddress
   */
  fetchIPAddress() {
    this.ipAddressAervice.getIPAddress().subscribe({
      next: (res: any) => {
        this.ipAddress = res.ip;
      },
      error: (error) => {
        console.error('Error fetching IP address:', error);
      }
    });
  }

  /**
   * Determines whether submit on button click
   * Handles the update API
   */
  onSubmit2() {
    this.spinner.show();

    const params = { ...this.profileForm.value };

    delete params.wallet_address;
    delete params.first_name;
    delete params.last_name;
    delete params.email;

    if (params.is_being_affilate || params.is_being_campaigner) {
      params.location = this.ipAddress;
      params.timestamp = this.timestamp;
      params.date = this.date;
    }else {
      delete params.location;
      delete params.timestamp;
      delete params.date;
    }

    if (this.profileForm.valid){
      this.profileService.profileUpdate(this.userId ?? '', params).subscribe({
        next: (response: any) => {
          this.isRegister = true
          this.spinner.hide();
          const affiliate = response.data.is_being_affilate;
          this.localStorageService.storeData('affiliate', affiliate);
          this.profileService.setAffiliate(true);
          this.getProfile();
          this.toastr.success('Profile Updated Successfully!');
        },
        error: (error) => {
          this.spinner.hide();
          this.isRegister = false;
          console.error(error);
          this.toastr.error(error.error.message);
        }
      });
    } else {
      this.toastr.error('Form is invalid! Please fill all required fields');
      this.spinner.hide();
    }
  }

  /**
   * Restricts the input to numbers only.
   */
  restrictToNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete']; // Allowed control keys
    const isNumber = /^[0-9]$/.test(event.key); // Allow only digits (0-9)

    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault(); // Block invalid input
    }
  }


  /**
   * Determines whether agree on button clicked
   * @param id
   */
  onAgree(id: number) {
    if (id === 1) {
      this.isAffliateChecked = true;
      this.profileForm.patchValue({
        is_being_affilate: this.isAffliateChecked
      });
    } else if (id === 2) {
      this.isCampaignerChecked = true;
      this.profileForm.patchValue({
        is_being_campaigner: this.isCampaignerChecked
      });
    }
 }


 /**
  * Determines whether disagree on
  * @param id
  */
 onDisagree(id: number) {
  if (id === 1) {
    this.isAffliateChecked = false;
    this.profileForm.patchValue({
      is_being_affilate: false
    });
  } else if (id === 2) {
    this.isCampaignerChecked = false;
    this.profileForm.patchValue({
      is_being_campaigner: false
    });
  }
}
}
