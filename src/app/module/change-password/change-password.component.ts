import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PasswordValidator } from 'src/app/auth/forgot-password/passwordValidator';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SidebarComponent } from "../../shared/component/sidebar/sidebar.component";
import { AppKitService } from 'src/app/services/appkit.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [SidebarComponent, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  isOldPasswordVisible: boolean = false;

  userId: string | null = null;

  constructor(
    private localStorageService: LocalStorageService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private appKitService: AppKitService,
  ) { }

  ngOnInit(): void {

    this.userId = this.localStorageService.getDataByKey('userId');

    this.initializeForm();
  }

  /**
   * Initializes form
   */
  initializeForm() {
    this.passwordForm = new FormGroup({
      oldPassword: new FormControl(''),
      newPassword: new FormControl('', PasswordValidator.password),
      confirmPassword: new FormControl('', PasswordValidator.confirmPassword),
    });
  }

  /**
   * Toggles password visibility
   * @param field
   */
  togglePasswordVisibility(field: string): void {
    if (field === 'oldPassword') {
      this.isOldPasswordVisible = !this.isOldPasswordVisible;
    } else if (field === 'confirmPassword') {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    } else if (field === 'newPassword') {
      this.isPasswordVisible = !this.isPasswordVisible;
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

      if (params.newPassword !== params.confirmPassword) {
        this.toastr.error('New Password and Confirm Password do not match!');
        this.spinner.hide();
      } else if (params.oldPassword === params.newPassword) {
        this.toastr.error('New Password and Old Password cannot be same!');
        this.spinner.hide();
      } else {
        delete params.confirmPassword;

        this.authService.changePassword(this.userId ?? '', params).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            this.toastr.success('Password has been changed successfully!');
            this.passwordForm.reset();
            this.localStorageService.removeData('address');
            this.appKitService.disconnect();
            this.localStorageService.clearAllStorage();
            this.router.navigate(['/login']);
          },
          error: (err: any) => {
            this.spinner.hide();
            console.error('Error in changing password: ', err.error.message);
            this.toastr.error(err.error.message);
          }
        })
      }
    }

  }
}
