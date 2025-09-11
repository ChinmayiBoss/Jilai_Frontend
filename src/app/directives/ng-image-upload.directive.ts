import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Directive({
  selector: '[ngImageUpload]'
})
export class NgImageUploadDirective {

  @Input() maxSize: number = 5242880; // 5MB in bytes
  @Output() imageUploaded = new EventEmitter<File>();

  constructor(
    private toastr: ToastrService
  ) { }

  /**
   * Hosts listener
   * @param files
   * @returns
   */
  @HostListener('change', ['$event.target.files'])
  handleImageUpload(files: FileList) {
    const file = files.item(0);
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Invalid file type. Only PNG, JPEG, GIF & PDF formats are allowed.');
      return;
    }

    // Check file size
    if (file.size > this.maxSize) {
      this.toastr.error('File size exceeds limit. Maximum allowed size is 5MB.');
      return;
    }

    // Emit event with file object
    this.imageUploaded.emit(file);
  }


}
