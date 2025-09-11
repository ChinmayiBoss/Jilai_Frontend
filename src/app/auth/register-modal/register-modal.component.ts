import { Component, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent {

  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}


  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
 }

 ngOnInit(): void {
}

}
