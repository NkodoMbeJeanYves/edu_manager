export interface MonthlyRecovery {
  month: string;
  expected: number;
  recovered: number;
}

export interface FiliereStats {
  filiere: string;
  expected: number;
  recovered: number;
  rate: number;
}

export interface PaymentMethodShare {
  method: string;
  amount: number;
  share: number;
}

export interface TopDebtor {
  name: string;
  registrationNumber: string;
  outstanding: number;
}

export interface RapportFinancier {
  periodLabel: string;
  currency: string;
  totalExpected: number;
  totalRecovered: number;
  recoveryRate: number;
  outstanding: number;
  monthly: MonthlyRecovery[];
  byFiliere: FiliereStats[];
  byMethod: PaymentMethodShare[];
  topDebtors: TopDebtor[];
}
