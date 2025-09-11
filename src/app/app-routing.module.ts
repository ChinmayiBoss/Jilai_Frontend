import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.gaurd';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { KycComponent } from './auth/kyc/kyc.component';
import { loginGuard } from './auth/login.guard';
import { ResetComponent } from './auth/reset/reset.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AffiliateComponent } from './module/affiliate/affiliate.component';
import { ChangePasswordComponent } from './module/change-password/change-password.component';
import { ComingSoonComponent } from './module/coming-soon/coming-soon.component';
import { HomeComponent } from './module/home/home.component';
import { LandingComponent } from './module/landing/landing.component';
import { MyReferralComponent } from './module/my-referral/my-referral.component';
import { ProfileComponent } from './module/profile/profile.component';
import { TermsOfServiceComponent } from './shared/component/terms-of-service/terms-of-service.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path:'home', component:HomeComponent, pathMatch:'full', canActivate: [AuthGuard]},
  { path:'login', component:LandingComponent, pathMatch:'full', canActivate: [loginGuard]},
  { path:'change-password', component:ChangePasswordComponent, pathMatch:'full', canActivate: [AuthGuard]},
  { path:'profile/:id', component:ProfileComponent, canActivate: [AuthGuard]},
  { path:'my-referral', component:MyReferralComponent, canActivate: [AuthGuard]},
  { path:'terms-of-service', component:TermsOfServiceComponent},
  { path:'signup', component:SignupComponent,pathMatch:'full', canActivate: [loginGuard]},
  { path:'coming-soon', component:ComingSoonComponent, pathMatch:'full'},
  { path:'kyc', component:KycComponent, pathMatch:'full'},
  { path:'affiliate/:id', component: AffiliateComponent, pathMatch: 'full'},
  { path:'forgot-password', component:ForgotPasswordComponent, pathMatch:'full', canActivate: [loginGuard]},
  { path:'reset-password', component:ResetComponent, pathMatch: 'full', canActivate: [loginGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
