import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PasswordValidator } from '../forgot-password/passwordValidator';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss'
})
export class ResetComponent implements OnInit {

  passwordForm!: FormGroup;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  email: string | null = null;
  token: string | null = null;
  userId: string | null = null;

  constructor(private localStorageService: LocalStorageService, private toastr: ToastrService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.userId = params['id'] || '';
    })
    this.initializeForm();

    this.email = this.localStorageService.getDataByKey('email');

    if (this.token) {
      this.passwordForm.patchValue({
        token: this.token
      });
    }
  }
  
  /**
   * Initializes form
   */
  initializeForm() {
      this.passwordForm = new FormGroup({
        token: new FormControl(''),
        password: new FormControl('', PasswordValidator.password),
        confirmPassword: new FormControl('', PasswordValidator.confirmPassword),
      });
    }

  /**
   * Toggles password visibility
   * @param field 
   */
  togglePasswordVisibility(field: string): void {
    if (field === 'password'){
      this.isPasswordVisible = !this.isPasswordVisible;
    }else if (field === 'confirmPassword'){
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    }
  }

  /**
   * Determines whether submit on
   */
  onSubmit() {

    this.spinner.show();

    if (this.passwordForm.invalid) {
      this.toastr.error('Form is invalid. Please fill the required fields!');
    } else {
      const params = this.passwordForm.value;

      console.log('params: ', params)

      if (params.password !== params.confirmPassword) {
        this.toastr.error('Password and Confirm Password do not match!');
        this.spinner.hide();
      } else {
        delete params.confirmPassword;

        this.authService.resetPassword(this.userId ?? '', params).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            this.toastr.success('Password has been reset successfully!');

            const login = {
              email: this.email,
              password: params.password
            }
            this.spinner.show();
            this.authService.getLogin(login).subscribe({
              next: (res: any) => {
                this.spinner.hide();
                this.toastr.success('Logged in successfully');
                this.localStorageService.storeData('token', res.data.session.session_token);
                this.localStorageService.storeData('userId', res.data.user._id);
                this.localStorageService.storeData('affiliate', res.data.user.is_being_affilate);
                this.localStorageService.storeData('kycStatus', res.data.user.kyc_verified);
                this.router.navigate(['/home']);
              },
              error: (err: any) => {
                this.spinner.hide();
                console.error('Error in login: ',err);
                this.toastr.error('Error in login!');
                this.router.navigate(['/login']);
              }
            });
          }
        })
      }
    }

  }
}
