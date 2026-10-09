import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GoalType,
  InvestmentProductType,
  MarketRates,
  SimulationHistoryItem,
  TreasuryProduct,
} from './types/finance';
import {
  calculateGoalTimeline,
  calculateRequiredForMonthlyIncome,
  DEFAULT_FALLBACK_RATES,
  formatBRL,
  runFullSimulation,
} from './services/simulationEngine';
import { fetchMarketRatesClient, fetchTreasuryProductsClient } from './services/apiClient';
import { SEO_ROUTES } from './services/seoRoutes';
import { Header } from './components/Header';
import { SimulationForm } from './components/SimulationForm';
import { SimulationResult } from './components/SimulationResult';
import { ComparisonTable } from './components/ComparisonTable';
import { PerformanceChart } from './components/PerformanceChart';
import { GoalCalculator } from './components/GoalCalculator';
import { MonthlyIncomeCalculator, PassiveIncomeByCapital } from './components/MonthlyIncomeCalculator';
import { CdbCalculator } from './components/CdbCalculator';
import { ComparisonCard } from './components/ComparisonCard';
import { ShareCardModal } from './components/ShareCardModal';
import { LocalHistory } from './components/LocalHistory';
import { AdSlot, PartnerOffersSection } from './components/AdSlot';
import { EducationalSection } from './components/EducationalSection';
import { DataSource } from './components/DataSource';
import { Disclaimer } from './components/Disclaimer';
import { Footer } from './components/Footer';

const LOCAL_STORAGE_HISTORY_KEY = 'meu_dinheiro_history_v1';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return SEO_ROUTES[p] ? p : '/';
  });

  const [rates, setRates] = useState<MarketRates>(DEFAULT_FALLBACK_RATES);
  const [treasuryProducts, setTreasuryProducts] = useState<TreasuryProduct[]>([]);

  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [months, setMonths] = useState<number>(12);
  const [goalType, setGoalType] = useState<GoalType>('RENDER');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState<number>(1000);

  const [cdbPresetPercent, setCdbPresetPercent] = useState<number>(100);
  const [compareProductA, setCompareProductA] = useState<InvestmentProductType>('CDB');
  const [compareProductB, setCompareProductB] = useState<InvestmentProductType>('POUPANCA');

  const [highlightKey, setHighlightKey] = useState<number>(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<SimulationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    const now = Date.now();
    return [
      {
        id: 'seed-1',
        timestamp: now - 1000 * 60 * 15,
        initialAmount: 10000,
        monthlyContribution: 1000,
        months: 12,
        bestFinalAmount: 23315,
        bestProductName: 'CDB 100% CDI',
        goalType: 'RENDER',
      },
      {
        id: 'seed-2',
        timestamp: now - 1000 * 60 * 60 * 26,
        initialAmount: 50000,
        monthlyContribution: 0,
        months: 24,
        bestFinalAmount: 60024,
        bestProductName: 'LCI / LCA 90% CDI',
        goalType: 'RENDER',
      },
    ];
  });

  const resultSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetchMarketRatesClient().then((data) => {
      if (mounted) setRates(data);
    });
    fetchTreasuryProductsClient().then((data) => {
      if (mounted && data.products) setTreasuryProducts(data.products);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const routeMeta = SEO_ROUTES[currentPath] || SEO_ROUTES['/'];

    document.title = routeMeta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', routeMeta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', routeMeta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', routeMeta.description);

    const params = new URLSearchParams(window.location.search);
    const qInicial = params.get('inicial');
    const qMensal = params.get('mensal');
    const qMeses = params.get('meses');

    if (qInicial !== null || qMensal !== null || qMeses !== null) {
      if (qInicial !== null && Number.isFinite(Number(qInicial))) {
        setInitialAmount(Math.max(0, Number(qInicial)));
      }
      if (qMensal !== null && Number.isFinite(Number(qMensal))) {
        setMonthlyContribution(Math.max(0, Number(qMensal)));
      }
      if (qMeses !== null && Number.isFinite(Number(qMeses))) {
        setMonths(Math.max(1, Math.min(360, Number(qMeses))));
      }
      return;
    }

    const preset = routeMeta.preset;
    if (preset) {
      if (typeof preset.initialAmount === 'number') setInitialAmount(preset.initialAmount);
      if (typeof preset.monthlyContribution === 'number')
        setMonthlyContribution(preset.monthlyContribution);
      if (typeof preset.months === 'number') setMonths(preset.months);
      if (preset.goalType) setGoalType(preset.goalType);
      if (typeof preset.targetAmount === 'number') setTargetAmount(preset.targetAmount);
      if (typeof preset.desiredMonthlyIncome === 'number')
        setDesiredMonthlyIncome(preset.desiredMonthlyIncome);
      if (typeof preset.cdbPercentCdi === 'number') setCdbPresetPercent(preset.cdbPercentCdi);
      if (preset.compareA) setCompareProductA(preset.compareA);
      if (preset.compareB) setCompareProductB(preset.compareB);
    }
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(SEO_ROUTES[p] ? p : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, sectionId?: string) => {
    const cleanPath = SEO_ROUTES[path] ? path : '/';
    if (cleanPath !== currentPath) {
      window.history.pushState({}, '', cleanPath);
      setCurrentPath(cleanPath);
    }
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const simulation = useMemo(() => {
    return runFullSimulation({
      initialAmount,
      monthlyContribution,
      months,
      rates,
      cdbPercentCdi: 100,
      lciPercentCdi: 90,
    });
  }, [initialAmount, monthlyContribution, months, rates]);

  const goalTimelineResults = useMemo(() => {
    return calculateGoalTimeline({
      initialAmount,
      monthlyContribution,
      targetAmount,
      rates,
    });
  }, [initialAmount, monthlyContribution, targetAmount, rates]);

  const monthlyIncomeResults = useMemo(() => {
    return calculateRequiredForMonthlyIncome({
      desiredMonthlyIncome,
      rates,
    });
  }, [desiredMonthlyIncome, rates]);

  const handleCalculateClick = () => {
    setHighlightKey((prev) => prev + 1);

    const newItem: SimulationHistoryItem = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      initialAmount,
      monthlyContribution,
      months,
      bestFinalAmount: simulation.bestProduct.finalAmount,
      bestProductName: simulation.bestProduct.name,
      goalType,
    };

    const updated = [
      newItem,
      ...historyItems.filter(
        (h) =>
          !(
            h.initialAmount === initialAmount &&
            h.monthlyContribution === monthlyContribution &&
            h.months === months
          )
      ),
    ].slice(0, 8);

    setHistoryItems(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleSelectHistoryItem = (item: SimulationHistoryItem) => {
    setInitialAmount(item.initialAmount);
    setMonthlyContribution(item.monthlyContribution);
    setMonths(item.months);
    setGoalType(item.goalType);
    setHighlightKey((prev) => prev + 1);
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch {
      // Ignore
    }
  };

  const activeRouteMeta = SEO_ROUTES[currentPath] || SEO_ROUTES['/'];
  const viewMode = activeRouteMeta.preset?.viewMode || 'HOME';

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B0D] text-[#F4F5F7]">
      <Header currentPath={currentPath} onNavigate={navigateTo} />

      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-12 sm:space-y-16">
        {viewMode === 'SOURCES' ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="text-xs font-medium text-[#10B981] hover:underline cursor-pointer"
              >
                ← Voltar para a calculadora principal
              </button>
              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[#F4F5F7] tracking-tight">
                {activeRouteMeta.heading}
              </h1>
              <p className="text-base text-[#9499A3]">{activeRouteMeta.subheading}</p>
            </div>

            <DataSource
              rates={rates}
              treasuryProducts={treasuryProducts}
              isFullPage={true}
            />
            <Disclaimer />
          </div>
        ) : (
          <>
            <section id="simulador" className="max-w-[720px] mx-auto space-y-7">
              <div className="space-y-2.5 text-left sm:text-center">
                {currentPath !== '/' && (
                  <div className="flex sm:justify-center">
                    <button
                      type="button"
                      onClick={() => navigateTo('/')}
                      className="text-xs font-medium text-[#10B981] hover:underline cursor-pointer"
                    >
                      ← Ver simulador geral
                    </button>
                  </div>
                )}

                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#F4F5F7] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {activeRouteMeta.heading || 'Quanto seu dinheiro pode render?'}
                </h1>

                <p className="text-base sm:text-lg text-[#9499A3] max-w-xl sm:mx-auto">
                  {activeRouteMeta.subheading ||
                    'Compare investimentos e descubra quanto você pode ter no final.'}
                </p>
              </div>

              {activeRouteMeta.editorialNote && (
                <div className="p-4 rounded-xl bg-[#121418] border border-white/[0.07] text-xs sm:text-sm text-[#9499A3] leading-relaxed">
                  {activeRouteMeta.editorialNote}
                </div>
              )}

              <SimulationForm
                initialAmount={initialAmount}
                onInitialAmountChange={setInitialAmount}
                monthlyContribution={monthlyContribution}
                onMonthlyContributionChange={setMonthlyContribution}
                months={months}
                onMonthsChange={setMonths}
                goalType={goalType}
                onGoalTypeChange={setGoalType}
                targetAmount={targetAmount}
                onTargetAmountChange={setTargetAmount}
                desiredMonthlyIncome={desiredMonthlyIncome}
                onDesiredMonthlyIncomeChange={setDesiredMonthlyIncome}
                onCalculate={handleCalculateClick}
              />
            </section>

            <div ref={resultSectionRef} className="space-y-6">
              <SimulationResult
                simulation={simulation}
                goalType={goalType}
                goalTimelineResults={goalTimelineResults}
                targetAmount={targetAmount}
                monthlyIncomeResults={monthlyIncomeResults}
                desiredMonthlyIncome={desiredMonthlyIncome}
                highlightKey={highlightKey}
                onOpenShareModal={() => setIsShareModalOpen(true)}
              />

              <LocalHistory
                items={historyItems}
                onSelectHistory={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
              />
            </div>

            <ComparisonTable simulation={simulation} />

            <AdSlot label="Espaço publicitário" />

            <PerformanceChart timeline={simulation.timeline} />

            <PassiveIncomeByCapital
              rates={rates}
              defaultCapital={simulation.bestProduct.finalAmount}
            />

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#121418] border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#10B981]">
                    PLANEJAMENTO POR OBJETIVO
                  </span>
                  <h3 className="text-lg font-display font-semibold text-[#F4F5F7]">
                    Quer atingir um objetivo específico?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9499A3]">
                    Descubra em quanto tempo você chega aos R$ 100 mil ou quanto precisa acumular para gerar R$ 1.000 por mês.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigateTo('/como-chegar-aos-100-mil', 'objetivo-100k')}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Chegar a R$ 100 mil
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo('/quanto-preciso-investir-para-ganhar-1000', 'renda-mensal')
                    }
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Gerar R$ 1.000/mês
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#121418] border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#10B981]">
                    COMPARATIVOS RÁPIDOS
                  </span>
                  <h3 className="text-lg font-display font-semibold text-[#F4F5F7]">
                    Compare investimentos lado a lado
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9499A3]">
                    Veja a diferença líquida direta entre duas alternativas para qualquer valor:
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('/cdb-ou-poupanca', 'comparacao-direta')}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0A0B0D] border border-white/[0.08] hover:border-[#10B981]/50 text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    CDB x Poupança
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/cdb-ou-tesouro-selic', 'comparacao-direta')}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0A0B0D] border border-white/[0.08] hover:border-[#10B981]/50 text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    CDB x Tesouro
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/lci-ou-cdb', 'comparacao-direta')}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0A0B0D] border border-white/[0.08] hover:border-[#10B981]/50 text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    LCI x CDB
                  </button>
                </div>
              </div>
            </section>

            <GoalCalculator
              rates={rates}
              defaultInitial={activeRouteMeta.preset?.initialAmount ?? 20000}
              defaultMonthly={activeRouteMeta.preset?.monthlyContribution ?? 1000}
              defaultTarget={activeRouteMeta.preset?.targetAmount ?? 100000}
            />

            <MonthlyIncomeCalculator
              rates={rates}
              defaultIncome={activeRouteMeta.preset?.desiredMonthlyIncome ?? 1000}
            />

            <CdbCalculator
              rates={rates}
              defaultAmount={10000}
              defaultMonths={12}
              defaultPercentCdi={cdbPresetPercent}
              onNavigateRoute={(p) => navigateTo(p, 'simulador-cdb')}
            />

            <ComparisonCard
              rates={rates}
              defaultProductA={compareProductA}
              defaultProductB={compareProductB}
              defaultAmount={10000}
              defaultMonths={12}
              onNavigateRoute={(p) => navigateTo(p, 'comparacao-direta')}
            />

            <PartnerOffersSection
              onSimulateOfferRate={(pct) => {
                setCdbPresetPercent(pct);
                const el = document.getElementById('simulador-cdb');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <EducationalSection rates={rates} />

            <DataSource
              rates={rates}
              treasuryProducts={treasuryProducts}
              onNavigate={(p) => navigateTo(p)}
            />

            <Disclaimer />
          </>
        )}
      </main>

      <Footer onNavigate={navigateTo} />

      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        simulation={simulation}
      />
    </div>
  );
}

export default App;
