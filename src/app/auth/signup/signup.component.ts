import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FLAG_COUNTRY_CODES } from 'src/app/helpers/phone-number.helper';
import { ICountryCode, KYC_STATUS } from 'src/app/interfaces/common..interface';
import { AuthService } from 'src/app/services/auth.service';
import { IpAddressService } from 'src/app/services/ip-address.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { FormValidator } from './form-validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  @Input() currentWalletAddress:string = ''
  public account: any;
  public countryList: any;
  public isRegister: boolean = false;
  public kycForm: FormGroup;
  public showKYCModal: boolean = false;
  public frontImage: string;
  public backImage: string;
  public user: any;
  public frontImageExtension: any;
  public backImageExtension: any;
  walletAddress: string;
  ipAddress: string = '';
  timestamp: any;
  date: any;
  isAffliateChecked: boolean = false;
  isCampaignerChecked: boolean = false;
  selectedCountryCode?: ICountryCode | null;
  selectedCountry?: ICountryCode | null;
  public countryDetailsList: any[] = FLAG_COUNTRY_CODES;
  filteredCountryDetailsList: any[] = this.countryDetailsList;
  searchText!: string;
  toggleList!: boolean;
  phoneNumber!: number;

  signUpForm!: FormGroup;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService,
    private ipAddressAervice: IpAddressService
  ) {
  }

  ngOnInit() {
    this.walletAddress = this.localStorageService.getDataByKey('address');
    this.initSignupForm();
    this.fetchIPAddress();

    this.timestamp = new Date().toLocaleTimeString();
    this.date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });

    this.signUpForm.controls['wallet_address'].setValue(this.walletAddress);

  }

  /**
   * Getter for KYC status enum.
   */
  get kycStatus(): typeof KYC_STATUS{
    return KYC_STATUS
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
   * Initializes the sign-up form.
   *
   */
  initSignupForm(){
    this.signUpForm = new FormGroup({
      first_name: new FormControl('', FormValidator.firstName),
      last_name: new FormControl('', FormValidator.lastName),
      email: new FormControl('', FormValidator.userEmail),
      country_code: new FormControl(''),
      phone_number: new FormControl('', FormValidator.phoneNumber),
      wallet_address: new FormControl([], FormValidator.wallet),
      full_address: new FormControl('', FormValidator.full_address),
      city: new FormControl('', FormValidator.city),
      state: new FormControl('', FormValidator.state),
      country: new FormControl('', FormValidator.country),
      zip_code: new FormControl('', FormValidator.zip_code),
      is_being_affilate: new FormControl(false),
      is_being_campaigner: new FormControl(false),
      location: new FormControl('', FormValidator.location),
      timestamp: new FormControl('', FormValidator.timestamp),
      date: new FormControl('', FormValidator.date),
      reference_affilate_code: new FormControl('', FormValidator.affiliate_code),
      password: new FormControl('', FormValidator.password),
      confirm_password: new FormControl('', FormValidator.confirmPassword),
    });
    this.selectedCountry = this.countryDetailsList[68];
    this.setCountryDetails(this.selectedCountry?.code,this.selectedCountry?.dialCode)
  }

  /**
   * Fetchs ipaddres
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
   * Handles the Signup API
   */
  onSubmit() {
    this.spinner.show();

    const affilate_code = this.localStorageService.getDataByKey('affiliateCode');

    if (affilate_code) {
      this.signUpForm.patchValue({
        reference_affilate_code: affilate_code
      });
    }else {
       this.signUpForm.removeControl('reference_affilate_code');
    }
    // Get form values
    const params = { ...this.signUpForm.value };

    if (params.password !== params.confirm_password) {
      this.spinner.hide();
      this.toastr.error('Password and Confirm Password do not match!');
      return;
    }else {
      delete params.confirm_password;
      params.wallet_address = [];

      if (params.is_being_affilate || params.is_being_campaigner) {
        params.location = this.ipAddress;
        params.timestamp = this.timestamp;
        params.date = this.date;
      }else {
        delete params.location;
        delete params.timestamp;
        delete params.date;
      }

      if (this.signUpForm.valid){
        this.authService.signUp(params).subscribe({
          next: (response: any) => {
            this.isRegister = true
            const token = response.data.session.session_token;
            this.localStorageService.storeData('token', token);
            const userId = response.data.user._id;
            this.localStorageService.storeData('userId', userId);
            const affiliate = response.data.user.is_being_affilate;
            this.localStorageService.storeData('affiliate', affiliate);
            const kycStatus = response.data.user.kyc_verified;
            this.localStorageService.storeData('kycStatus', kycStatus);
            this.localStorageService.removeData('affiliateCode');
            this.localStorageService.storeData('docUploaded', false);
            this.spinner.hide();
            this.toastr.success('User Registered Successfully!');
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
  }


  /**
   * Detect change on phone number component

   * @param{any} event
   */
  public detectChangePhonenumber(event: any): void {
    if (event) {
      if (event?.type === 1) {
        this.signUpForm.patchValue({
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
    this.signUpForm.patchValue({
      country_code: countryCode,
      flag_code: flag
    })
  }

  /**
   * Toggles password visibility
   * @param field
   */
  togglePasswordVisibility(field: string): void {
    if (field === 'password'){
      this.isPasswordVisible = !this.isPasswordVisible;
    } else if (field === 'confirm_password') {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible
    }
  }

  /**
   * Navigates to kyc
   */
  navigateToKYC() {
    this.router.navigate(['/kyc']);
  }

  /**
   * Navigates route strategy
   */
  private navigateRouteStrategy() {
    const queryParams = { 'refresh': new Date().getTime() };
    this.router.navigate(['/'], { queryParams: queryParams, relativeTo: this.route });
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
      this.signUpForm.patchValue({
        is_being_affilate: this.isAffliateChecked
      });
    } else if (id === 2) {
      this.isCampaignerChecked = true;
      this.signUpForm.patchValue({
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
      this.signUpForm.patchValue({
        is_being_affilate: false
      });
    } else if (id === 2) {
      this.isCampaignerChecked = false;
      this.signUpForm.patchValue({
        is_being_campaigner: false
      });
    }
 }

}
