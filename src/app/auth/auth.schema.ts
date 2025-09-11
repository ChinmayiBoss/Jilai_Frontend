export interface RegisterSchema {
    name: string;
    email: string;
    wallet_address?: string;
    agreements?: boolean;
  }