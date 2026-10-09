export interface MarketRates {
  selic: number;
  cdi: number;
  ipca: number;
  poupancaAnnual: number;
  trMonthly: number;
  updatedAt: string;
  source: string;
  isLiveBcb: boolean;
  available: boolean;
}

export interface TreasuryProduct {
  id: string;
  name: string;
  type: 'SELIC' | 'IPCA' | 'PREFIXADO';
  maturity: string;
  rateDescription: string;
  annualRateEquivalent: number;
  minInvestment: number;
  unitPrice: number;
  updatedAt: string;
}

export type InvestmentProductType = 'POUPANCA' | 'CDB' | 'TESOURO_SELIC' | 'LCI_LCA';

export type GoalType = 'RENDER' | 'TARGET_AMOUNT' | 'MONTHLY_INCOME';

export interface SimulationPoint {
  month: number;
  invested: number;
  poupancaNet: number;
  cdbNet: number;
  tesouroSelicNet: number;
  lciLcaNet: number;
}

export interface SingleProductSimulation {
  product: InvestmentProductType;
  name: string;
  subtitle: string;
  rateLabel: string;
  annualRateEffective: number;
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  totalInvested: number;
  totalContributions: number;
  grossReturn: number;
  taxRatePercent: number;
  taxes: number;
  feeAmount: number;
  netReturn: number;
  finalAmount: number;
  isTaxExempt: boolean;
  isBestOption?: boolean;
}

export interface FullSimulationResult {
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  cdbPercentCdi: number;
  lciPercentCdi: number;
  products: Record<InvestmentProductType, SingleProductSimulation>;
  orderedProducts: SingleProductSimulation[];
  bestProduct: SingleProductSimulation;
  worstProduct: SingleProductSimulation;
  maxDifference: number;
  timeline: SimulationPoint[];
  ratesUsed: MarketRates;
}

export interface GoalReachProductResult {
  product: InvestmentProductType;
  name: string;
  rateLabel: string;
  monthsToReach: number;
  yearsPart: number;
  monthsPart: number;
  formattedTime: string;
  totalInvested: number;
  netReturn: number;
  finalAmount: number;
  isFastest?: boolean;
}

export interface MonthlyIncomeProductResult {
  product: InvestmentProductType;
  name: string;
  rateLabel: string;
  requiredCapital: number;
  monthlyNetRatePercent: number;
  annualNetRatePercent: number;
  isLowestCapital?: boolean;
}

export interface SimulationHistoryItem {
  id: string;
  timestamp: number;
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  bestFinalAmount: number;
  bestProductName: string;
  goalType: GoalType;
}

export interface PartnerOffer {
  id: string;
  title: string;
  issuer: string;
  type: 'CDB' | 'LCI_LCA' | 'TESOURO';
  rateText: string;
  termText: string;
  liquidityText: string;
  protectionText: string;
  minAmount: number;
  simulatedFinalFor10k12m: number;
}
