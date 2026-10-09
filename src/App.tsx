import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GoalType,
  InvestmentProductType,
  MarketRates,
  TreasuryProduct,
} from './types/finance';
import {
  calculateGoalTimeline,
  calculateRequiredForMonthlyIncome,
  DEFAULT_FALLBACK_RATES,
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
import { EducationalSection } from './components/EducationalSection';
import { DataSource } from './components/DataSource';
import { Disclaimer } from './components/Disclaimer';
import { Footer } from './components/Footer';
import { ArrowUp } from 'lucide-react';

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
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

            </div>

            <ComparisonTable simulation={simulation} />

            <section className="space-y-6" aria-labelledby="analysis-heading">
              <div className="border-t border-white/[0.08] pt-8">
                <p className="text-xs font-mono font-semibold tracking-[0.12em] text-[#10B981]">
                  ANÁLISE DA PROJEÇÃO
                </p>
                <h2
                  id="analysis-heading"
                  className="mt-1 text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7]"
                >
                  Acompanhe a evolução do seu patrimônio
                </h2>
                <p className="mt-1 text-sm text-[#9499A3]">
                  Veja o crescimento ao longo do tempo e o potencial de renda mensal do valor acumulado.
                </p>
              </div>

              <PerformanceChart timeline={simulation.timeline} />

              <PassiveIncomeByCapital
                rates={rates}
                defaultCapital={simulation.bestProduct.finalAmount}
              />
            </section>

            <section className="space-y-8" aria-labelledby="tools-heading">
              <div className="border-t border-white/[0.08] pt-8">
                <p className="text-xs font-mono font-semibold tracking-[0.12em] text-[#10B981]">
                  FERRAMENTAS PARA DECIDIR
                </p>
                <h2
                  id="tools-heading"
                  className="mt-1 text-2xl sm:text-3xl font-display font-semibold text-[#F4F5F7]"
                >
                  Planeje os próximos passos
                </h2>
                <p className="mt-1 text-sm text-[#9499A3]">
                  Explore metas, renda mensal e comparações com os mesmos critérios da simulação principal.
                </p>
              </div>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Atalhos de planejamento">
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
            </section>

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

      {showScrollToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Voltar ao início da página"
          title="Voltar ao início"
          className="fixed right-4 bottom-5 sm:right-7 sm:bottom-7 z-40 min-h-[46px] min-w-[46px] flex items-center justify-center rounded-full bg-[#10B981] text-[#05100B] shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-[#34D399] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4F5F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0D] transition-all cursor-pointer"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ArrowUp className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        simulation={simulation}
      />
    </div>
  );
}

export default App;
