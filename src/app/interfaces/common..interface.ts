/**
 * Enum for KYC status.
 */
export enum KYC_STATUS {
  NOT_INITIATED = 0,
  VERIFIED = 1,
  REJECTED = 2,
  PROCESSING = 3,
}

export enum VestingButton {
  NoContributionYet = "NO CONTRIBUTION YET",
  ClaimYourTokens = "CLAIM YOUR TOKENS",
  WaitForNextClaimDate = "WAIT FOR NEXT CLAIM DATE",
  AlreadyClaimed = "ALREADY CLAIMED",
  VestingDurationEnded = "VESTING DURATION ENDED",
  SaleNotEnded = "SALE NOT ENDED",
}

export enum UserType {
  AFFILIATED = 1, // Registered and making transactions under a salesperson
  NORMAL = 2     // Regular user without affiliation to a salesperson
}

/**
 * phone number interface
 */
export interface ICountryCode {
  code?: string;
  dialCode?: string;
}
