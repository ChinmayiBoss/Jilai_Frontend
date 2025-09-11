import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  // Allow numbers with up to 4 decimal places
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,4}$/);
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    // Allow only numbers and one decimal point
    const currentValue: string = this.el.nativeElement.value;
    const nextValue = currentValue + event.key;

    if (!this.regex.test(nextValue)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (!this.regex.test(clipboardData)) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInputChange(event: InputEvent) {
    let input = this.el.nativeElement.value;
    
    // Allow only numbers with up to 4 decimals
    this.el.nativeElement.value = input.replace(/[^0-9.]/g, '') // Remove non-numeric characters except '.'
                                       .replace(/^(\d*\.?\d{0,4}).*$/, '$1'); // Allow up to 4 decimal places
  }
}
