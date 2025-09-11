import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PasswordValidator } from './passwordValidator';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {

  passwordForm!: FormGroup;

  constructor(private localStorageService: LocalStorageService, private authService: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }
  
  /**
   * Initializes form
   */
  initializeForm() {
    this.passwordForm = new FormGroup({
      email: new FormControl('', PasswordValidator.email),
    });
  }
  
  /**
   * Determines whether submit on
   */
  onSubmit() {
    this.spinner.show();
    const params = this.passwordForm.value;

    this.localStorageService.storeData('email', params.email);

    if (this.passwordForm.invalid) {
      this.toastr.error('Please fill the correct mail address!')
    } else {
      this.authService.forgotPassword(params.email).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.toastr.success('Mail has been sent to your email address');
        },
        error: (err: any) =>{
          this.spinner.hide();
          console.error(err);
          this.toastr.error(err.error.message);
        }
      })
    }
  }


}
