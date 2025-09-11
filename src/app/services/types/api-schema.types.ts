import { HttpStatusCode } from "@angular/common/http";
import { UserType } from "src/app/interfaces/common..interface";

export interface ApiResponse<T> {
    data: T;
    message: string;
    status_code: HttpStatusCode;
    status: boolean;
}

export interface UserRegisterStatus {
    user: UserDetails;
    session: SessionDetails;
    kyc_link?: string;
}

export interface UserDetails {
    _id: string;
    name: string;
    email: string;
    phone_number: string;
    country_code: string;
    kyc_document: Array<string>;
    wallet_address: string;
    is_disclaimer: boolean;
    kyc_verified: number;
    status: number;
    created_at: string;
}
export interface SessionDetails {
    user_id: string;
    session_token: string;
    status: number;
    _id: string;
    created_at: string;
}
export interface TokenInfo {
    tokenAddress: string;
    name: string;
    symbol: string;
    decimal: number;
}

export interface VestingUserInfo {
    availableToClaim: number;
    claimedBalance: number;
    nextClaimDatetime: number;
    monthsCompleted: number;
    totalAmount: number;
    currentIntervalAmount: number;
    isFounder: boolean;
}

export interface VestingDetails {
    amountForClaim: string;
    amountClaimed: string;
    remainingAmount: string;
    nextClaimDate: string;
    vestingMonths: string;
    monthsClaimed: string;
}

export interface UserInfo {
    ethContributed: number;
    jilaiRecieved: number;
}
