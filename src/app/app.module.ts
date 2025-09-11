import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { RegisterModalComponent } from './auth/register-modal/register-modal.component';
import { SignupComponent } from './auth/signup/signup.component';
import { NgImageUploadDirective } from './directives/ng-image-upload.directive';
import { HomeComponent } from './module/home/home.component';
import { TruncateDecimalsPipe } from './pipes/truncate-decimals.pipe';
import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgxSpinner } from 'ngx-spinner';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxMaskDirective,
    ToastrModule.forRoot({
      timeOut: 3000,
      preventDuplicates: true,
      maxOpened: 1,
    }),
    SharedModule,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterModalComponent,
    SignupComponent,
    NgImageUploadDirective,
    TruncateDecimalsPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideNgxMask()
  ],
})
export class AppModule {}
