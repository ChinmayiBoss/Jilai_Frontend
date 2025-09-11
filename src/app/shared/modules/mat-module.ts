import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ClipboardModule,
    NgxSpinnerModule,
    ModalModule.forRoot(),
  ],
  exports: [ReactiveFormsModule, FormsModule, ClipboardModule, NgxSpinnerModule ]
})
export class MatModule { }