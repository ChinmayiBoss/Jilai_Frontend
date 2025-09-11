import { Validators } from "@angular/forms";

export class PasswordValidator {
    static password = [Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,15}$/)];
    static confirmPassword = [Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,15}$/)];
    static email = [Validators.required, Validators.email, Validators.pattern(/^(?!\s*$).+/)];
    
}