import { Validators } from "@angular/forms";

export class LoginValidator {
    static email = [Validators.required, Validators.email, Validators.pattern(/^(?!\s*$).+/)];
    static password = [Validators.required];
}