import { Validators } from "@angular/forms";

export class FormValidator {
    static firstName = [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^(?!\s*$).+/)];
    static lastName = [Validators.required, Validators.maxLength(50), Validators.pattern(/^(?!\s*$).+/)];
    static userEmail = [Validators.required, Validators.email, Validators.pattern(/^(?!\s*$).+/)];
    static phoneNumber = [Validators.required, Validators.minLength(6), Validators.maxLength(13)];
    static full_address = [Validators.required, Validators.pattern(/^(?!\s*$).+/)];
    static city = [Validators.required, Validators.pattern(/^(?!\s*$).+/)];
    static state = [Validators.required, Validators.pattern(/^(?!\s*$).+/)];
    static country = [Validators.required, Validators.pattern(/^(?!\s*$).+/)];
    static zip_code = [Validators.required, Validators.minLength(4), Validators.maxLength(13)];
    static wallet = [];
    static affilate = [Validators.requiredTrue];
    static campaigner = [Validators.requiredTrue];
    static location = [];
    static timestamp: [];
    static date: [];
    static affiliate_code: [];
    static password = [Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,15}$/)];
    static confirmPassword = [Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,15}$/)];

    // static eitherAffiliateOrCampaigner = (control:any) => {
    //   const formGroup = control.parent;
    //   if (!formGroup) return null;

    //   const isBeingAffiliate = formGroup.get('is_being_affilate')?.value;
    //   const isBeingCampaigner = formGroup.get('is_being_campaigner')?.value;

    //   return isBeingAffiliate || isBeingCampaigner ? null : { eitherAffiliateOrCampaigner: true };
    // };

}
