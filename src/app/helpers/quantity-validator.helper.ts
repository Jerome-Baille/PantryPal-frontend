import { AbstractControl, ValidatorFn } from '@angular/forms';

export function quantityValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (typeof value !== 'string') {
            return null;
        }
        const locale = navigator.language;
        const decimalSeparator = (1.1).toLocaleString(locale).substring(1, 2);
        const regex = new RegExp(`^[0-9]+(${decimalSeparator}[0-9]+)?$`);
        const sanitizedValue = value.replace(',', '.');
        if (!regex.test(sanitizedValue)) {
            return { invalidQuantity: true };
        }
        const numberValue = parseFloat(sanitizedValue);
        control.setValue(numberValue);
        return null;
    };
}