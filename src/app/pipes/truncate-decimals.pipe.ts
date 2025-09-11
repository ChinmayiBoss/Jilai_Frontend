import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateDecimals'
})
export class TruncateDecimalsPipe implements PipeTransform {
  transform(value: number, decimalPlaces: number = 4): string {
    if (isNaN(value)) return '';

    const factor = Math.pow(10, decimalPlaces);
    const truncated = Math.trunc(value * factor) / factor;

    const [intPart, decimalPart] = truncated.toString().split('.');
    
    // Format the integer part with commas
    const formattedInt = new Intl.NumberFormat().format(+intPart);

    if (!decimalPart) return formattedInt;

    const trimmedDecimal = decimalPart.replace(/0+$/, '');
    return trimmedDecimal ? `${formattedInt}.${trimmedDecimal}` : formattedInt;
  }
}
