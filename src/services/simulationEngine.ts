import {
  FullSimulationResult,
  GoalReachProductResult,
  InvestmentProductType,
  MarketRates,
  MonthlyIncomeProductResult,
  SingleProductSimulation,
  SimulationPoint,
} from '../types/finance';

export const DEFAULT_FALLBACK_RATES: MarketRates = {
  selic: 11.25,
  cdi: 11.15,
  ipca: 4.42,
  poupancaAnnual: 7.18,
  trMonthly: 0.08,
  updatedAt: '06/10/2026',
  source: 'Banco Central do Brasil (SGS) / Tesouro Nacional',
  isLiveBcb: false,
  available: true,
};

export function getRegressiveIrRate(months: number): number {
  const approximateDays = months * 30;
  if (approximateDays <= 180) return 22.5;
  if (approximateDays <= 360) return 20.0;
  if (approximateDays <= 720) return 17.5;
  return 15.0;
}

export function annualToMonthlyDecimal(annualRatePercent: number): number {
  if (annualRatePercent <= 0) return 0;
  return Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1;
}

export function calculatePoupancaAnnualRate(selicAnnual: number, trMonthly = 0.08): number {
  if (selicAnnual > 8.5) {
    const monthlyRate = (0.5 + trMonthly) / 100;
    return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  }
  const baseAnnual = selicAnnual * 0.7;
  const baseMonthly = annualToMonthlyDecimal(baseAnnual);
  const totalMonthly = baseMonthly + trMonthly / 100;
  return (Math.pow(1 + totalMonthly, 12) - 1) * 100;
}

export function simulateSingleProduct(params: {
  product: InvestmentProductType;
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  rates: MarketRates;
  cdbPercentCdi?: number;
  lciPercentCdi?: number;
}): SingleProductSimulation {
  const {
    product,
    initialAmount,
    monthlyContribution,
    months,
    rates,
    cdbPercentCdi = 100,
    lciPercentCdi = 90,
  } = params;

  const safeInitial = Math.max(0, initialAmount);
  const safeMonthly = Math.max(0, monthlyContribution);
  const safeMonths = Math.max(1, Math.min(600, Math.round(months)));

  let name = '';
  let subtitle = '';
  let rateLabel = '';
  let annualRateEffective = 0;
  let isTaxExempt = false;
  let annualCustodyFeePercent = 0;

  if (product === 'POUPANCA') {
    name = 'Poupança';
    subtitle = 'Isenta de Imposto de Renda';
    annualRateEffective = calculatePoupancaAnnualRate(rates.selic, rates.trMonthly);
    rateLabel = `${annualRateEffective.toFixed(2).replace('.', ',')}% a.a. (0,5% a.m. + TR)`;
    isTaxExempt = true;
  } else if (product === 'CDB') {
    name = `CDB ${cdbPercentCdi}% CDI`;
    subtitle = 'Com Imposto de Renda regressivo';
    annualRateEffective = (rates.cdi * cdbPercentCdi) / 100;
    rateLabel = `${cdbPercentCdi}% do CDI (${annualRateEffective.toFixed(2).replace('.', ',')}% a.a.)`;
    isTaxExempt = false;
  } else if (product === 'TESOURO_SELIC') {
    name = 'Tesouro Selic';
    subtitle = 'Título público federal pós-fixado';
    annualRateEffective = rates.selic;
    rateLabel = `100% da Selic (${annualRateEffective.toFixed(2).replace('.', ',')}% a.a.)`;
    isTaxExempt = false;
    annualCustodyFeePercent = 0.2;
  } else {
    name = `LCI / LCA ${lciPercentCdi}% CDI`;
    subtitle = 'Isenta de Imposto de Renda para PF';
    annualRateEffective = (rates.cdi * lciPercentCdi) / 100;
    rateLabel = `${lciPercentCdi}% do CDI (${annualRateEffective.toFixed(2).replace('.', ',')}% a.a.)`;
    isTaxExempt = true;
  }

  const monthlyRate = annualToMonthlyDecimal(annualRateEffective);
  const totalContributions = safeMonthly * safeMonths;
  const totalInvested = safeInitial + totalContributions;

  const initialGrossFinal = safeInitial * Math.pow(1 + monthlyRate, safeMonths);

  let contributionsGrossFinal = 0;
  for (let m = 1; m <= safeMonths; m++) {
    const monthsInvested = safeMonths - m;
    const trancheFinal = safeMonthly * Math.pow(1 + monthlyRate, monthsInvested);
    contributionsGrossFinal += trancheFinal;
  }

  const rawGrossFinal = initialGrossFinal + contributionsGrossFinal;
  const grossReturn = Math.max(0, rawGrossFinal - totalInvested);

  let feeAmount = 0;
  if (annualCustodyFeePercent > 0) {
    const avgBalance = (safeInitial + rawGrossFinal) / 2;
    const taxableBalance = Math.max(0, avgBalance - 10000);
    feeAmount = taxableBalance * (annualCustodyFeePercent / 100) * (safeMonths / 12);
  }

  const adjustedGrossReturn = Math.max(0, grossReturn - feeAmount);
  const nominalIrRate = isTaxExempt ? 0 : getRegressiveIrRate(safeMonths);

  const taxes = isTaxExempt ? 0 : adjustedGrossReturn * (nominalIrRate / 100);
  const netReturn = Math.max(0, adjustedGrossReturn - taxes);
  const finalAmount = totalInvested + netReturn;

  return {
    product,
    name,
    subtitle,
    rateLabel,
    annualRateEffective,
    initialAmount: safeInitial,
    monthlyContribution: safeMonthly,
    months: safeMonths,
    totalInvested,
    totalContributions,
    grossReturn,
    taxRatePercent: nominalIrRate,
    taxes,
    feeAmount,
    netReturn,
    finalAmount,
    isTaxExempt,
  };
}

export function runFullSimulation(params: {
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  rates: MarketRates;
  cdbPercentCdi?: number;
  lciPercentCdi?: number;
}): FullSimulationResult {
  const {
    initialAmount,
    monthlyContribution,
    months,
    rates,
    cdbPercentCdi = 100,
    lciPercentCdi = 90,
  } = params;

  const safeMonths = Math.max(1, Math.min(360, Math.round(months)));

  const poupanca = simulateSingleProduct({
    product: 'POUPANCA',
    initialAmount,
    monthlyContribution,
    months: safeMonths,
    rates,
  });

  const cdb = simulateSingleProduct({
    product: 'CDB',
    initialAmount,
    monthlyContribution,
    months: safeMonths,
    rates,
    cdbPercentCdi,
  });

  const tesouroSelic = simulateSingleProduct({
    product: 'TESOURO_SELIC',
    initialAmount,
    monthlyContribution,
    months: safeMonths,
    rates,
  });

  const lciLca = simulateSingleProduct({
    product: 'LCI_LCA',
    initialAmount,
    monthlyContribution,
    months: safeMonths,
    rates,
    lciPercentCdi,
  });

  const all = [cdb, tesouroSelic, lciLca, poupanca];
  const sorted = [...all].sort((a, b) => b.finalAmount - a.finalAmount);

  const bestProduct = sorted[0];
  const worstProduct = sorted[sorted.length - 1];
  const maxDifference = Math.max(0, bestProduct.finalAmount - worstProduct.finalAmount);

  all.forEach((item) => {
    item.isBestOption = item.product === bestProduct.product;
  });

  const timeline: SimulationPoint[] = [];
  const step = safeMonths <= 24 ? 1 : safeMonths <= 60 ? 3 : 6;

  for (let m = 0; m <= safeMonths; m += step) {
    if (m === 0) {
      timeline.push({
        month: 0,
        invested: initialAmount,
        poupancaNet: initialAmount,
        cdbNet: initialAmount,
        tesouroSelicNet: initialAmount,
        lciLcaNet: initialAmount,
      });
      continue;
    }

    const pM = simulateSingleProduct({
      product: 'POUPANCA',
      initialAmount,
      monthlyContribution,
      months: m,
      rates,
    });
    const cM = simulateSingleProduct({
      product: 'CDB',
      initialAmount,
      monthlyContribution,
      months: m,
      rates,
      cdbPercentCdi,
    });
    const tM = simulateSingleProduct({
      product: 'TESOURO_SELIC',
      initialAmount,
      monthlyContribution,
      months: m,
      rates,
    });
    const lM = simulateSingleProduct({
      product: 'LCI_LCA',
      initialAmount,
      monthlyContribution,
      months: m,
      rates,
      lciPercentCdi,
    });

    timeline.push({
      month: m,
      invested: initialAmount + monthlyContribution * m,
      poupancaNet: pM.finalAmount,
      cdbNet: cM.finalAmount,
      tesouroSelicNet: tM.finalAmount,
      lciLcaNet: lM.finalAmount,
    });
  }

  if (timeline[timeline.length - 1]?.month !== safeMonths) {
    timeline.push({
      month: safeMonths,
      invested: cdb.totalInvested,
      poupancaNet: poupanca.finalAmount,
      cdbNet: cdb.finalAmount,
      tesouroSelicNet: tesouroSelic.finalAmount,
      lciLcaNet: lciLca.finalAmount,
    });
  }

  return {
    initialAmount,
    monthlyContribution,
    months: safeMonths,
    cdbPercentCdi,
    lciPercentCdi,
    products: {
      POUPANCA: poupanca,
      CDB: cdb,
      TESOURO_SELIC: tesouroSelic,
      LCI_LCA: lciLca,
    },
    orderedProducts: sorted,
    bestProduct,
    worstProduct,
    maxDifference,
    timeline,
    ratesUsed: rates,
  };
}

export function formatMonthsHuman(months: number): string {
  if (months <= 0) return '0 meses';
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const yearStr = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  if (remMonths === 0) return yearStr;
  const monthStr = `${remMonths} ${remMonths === 1 ? 'mês' : 'meses'}`;
  return `${yearStr} e ${monthStr}`;
}

export function calculateGoalTimeline(params: {
  initialAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  rates: MarketRates;
  cdbPercentCdi?: number;
  lciPercentCdi?: number;
}): GoalReachProductResult[] {
  const {
    initialAmount,
    monthlyContribution,
    targetAmount,
    rates,
    cdbPercentCdi = 100,
    lciPercentCdi = 90,
  } = params;

  const products: InvestmentProductType[] = ['CDB', 'LCI_LCA', 'TESOURO_SELIC', 'POUPANCA'];
  const maxMonths = 600;

  const results: GoalReachProductResult[] = products.map((product) => {
    if (initialAmount >= targetAmount) {
      const base = simulateSingleProduct({
        product,
        initialAmount,
        monthlyContribution,
        months: 1,
        rates,
        cdbPercentCdi,
        lciPercentCdi,
      });
      return {
        product,
        name: base.name,
        rateLabel: base.rateLabel,
        monthsToReach: 0,
        yearsPart: 0,
        monthsPart: 0,
        formattedTime: 'Meta já atingida',
        totalInvested: initialAmount,
        netReturn: 0,
        finalAmount: initialAmount,
      };
    }

    let reachedMonth = maxMonths;
    let finalSim: SingleProductSimulation | null = null;

    for (let m = 1; m <= maxMonths; m++) {
      const sim = simulateSingleProduct({
        product,
        initialAmount,
        monthlyContribution,
        months: m,
        rates,
        cdbPercentCdi,
        lciPercentCdi,
      });
      if (sim.finalAmount >= targetAmount) {
        reachedMonth = m;
        finalSim = sim;
        break;
      }
    }

    if (!finalSim) {
      finalSim = simulateSingleProduct({
        product,
        initialAmount,
        monthlyContribution,
        months: maxMonths,
        rates,
        cdbPercentCdi,
        lciPercentCdi,
      });
    }

    const yearsPart = Math.floor(reachedMonth / 12);
    const monthsPart = reachedMonth % 12;

    return {
      product,
      name: finalSim.name,
      rateLabel: finalSim.rateLabel,
      monthsToReach: reachedMonth,
      yearsPart,
      monthsPart,
      formattedTime: reachedMonth >= maxMonths ? 'Mais de 50 anos' : formatMonthsHuman(reachedMonth),
      totalInvested: finalSim.totalInvested,
      netReturn: finalSim.netReturn,
      finalAmount: finalSim.finalAmount,
    };
  });

  const sorted = [...results].sort((a, b) => a.monthsToReach - b.monthsToReach);
  if (sorted.length > 0) {
    const minM = sorted[0].monthsToReach;
    results.forEach((r) => {
      r.isFastest = r.monthsToReach === minM;
    });
  }

  return results;
}

export function calculateRequiredForMonthlyIncome(params: {
  desiredMonthlyIncome: number;
  rates: MarketRates;
  cdbPercentCdi?: number;
  lciPercentCdi?: number;
}): MonthlyIncomeProductResult[] {
  const { desiredMonthlyIncome, rates, cdbPercentCdi = 100, lciPercentCdi = 90 } = params;
  const safeIncome = Math.max(0, desiredMonthlyIncome);

  const configs: Array<{
    product: InvestmentProductType;
    name: string;
    rateLabel: string;
    grossAnnual: number;
    taxPercent: number;
    feeAnnual: number;
  }> = [
    {
      product: 'CDB',
      name: `CDB ${cdbPercentCdi}% CDI`,
      rateLabel: `${cdbPercentCdi}% do CDI (IR 15% LP)`,
      grossAnnual: (rates.cdi * cdbPercentCdi) / 100,
      taxPercent: 15,
      feeAnnual: 0,
    },
    {
      product: 'LCI_LCA',
      name: `LCI / LCA ${lciPercentCdi}% CDI`,
      rateLabel: `${lciPercentCdi}% do CDI (Isento de IR)`,
      grossAnnual: (rates.cdi * lciPercentCdi) / 100,
      taxPercent: 0,
      feeAnnual: 0,
    },
    {
      product: 'TESOURO_SELIC',
      name: 'Tesouro Selic',
      rateLabel: `100% da Selic (IR 15% LP)`,
      grossAnnual: rates.selic,
      taxPercent: 15,
      feeAnnual: 0.2,
    },
    {
      product: 'POUPANCA',
      name: 'Poupança',
      rateLabel: '0,5% a.m. + TR (Isenta de IR)',
      grossAnnual: calculatePoupancaAnnualRate(rates.selic, rates.trMonthly),
      taxPercent: 0,
      feeAnnual: 0,
    },
  ];

  const results: MonthlyIncomeProductResult[] = configs.map((cfg) => {
    const netAnnualGrossAfterFee = Math.max(0.1, cfg.grossAnnual - cfg.feeAnnual);
    const grossMonthlyDecimal = annualToMonthlyDecimal(netAnnualGrossAfterFee);
    const netMonthlyDecimal = grossMonthlyDecimal * (1 - cfg.taxPercent / 100);
    const requiredCapital = netMonthlyDecimal > 0 ? safeIncome / netMonthlyDecimal : 0;
    const annualNetRatePercent = (Math.pow(1 + netMonthlyDecimal, 12) - 1) * 100;

    return {
      product: cfg.product,
      name: cfg.name,
      rateLabel: cfg.rateLabel,
      requiredCapital,
      monthlyNetRatePercent: netMonthlyDecimal * 100,
      annualNetRatePercent,
    };
  });

  const minCap = Math.min(...results.map((r) => r.requiredCapital));
  results.forEach((r) => {
    r.isLowestCapital = Math.abs(r.requiredCapital - minCap) < 1;
  });

  return results;
}

export function formatBRL(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0,00%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}
