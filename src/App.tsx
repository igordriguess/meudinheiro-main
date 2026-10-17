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
import { getPageByViewMode, ViewMode } from './services/navigation';
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
import { MAX_MONEY_VALUE } from './components/MoneyInput';
import { PageHeader } from './components/PageHeader';
import { ToolLinks } from './components/ToolLinks';
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
    const refreshMarketData = async () => {
      const [marketRates, treasuryData] = await Promise.all([
        fetchMarketRatesClient(),
        fetchTreasuryProductsClient(),
      ]);
      if (!mounted) return;
      setRates(marketRates);
      if (treasuryData.products) setTreasuryProducts(treasuryData.products);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshMarketData();
      }
    };

    void refreshMarketData();
    const refreshInterval = window.setInterval(refreshMarketData, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        setInitialAmount(Math.min(MAX_MONEY_VALUE, Math.max(0, Number(qInicial))));
      }
      if (qMensal !== null && Number.isFinite(Number(qMensal))) {
        setMonthlyContribution(Math.min(MAX_MONEY_VALUE, Math.max(0, Number(qMensal))));
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

  const navigateTo = (path: string) => {
    const cleanPath = SEO_ROUTES[path] ? path : '/';
    if (cleanPath !== currentPath) {
      window.history.pushState({}, '', cleanPath);
      setCurrentPath(cleanPath);
    }
    window.scrollTo({ top: 0, behavior: cleanPath !== currentPath ? 'auto' : 'smooth' });
  };

  const goalTimelineResults = useMemo(() => {
    if (goalType !== 'TARGET_AMOUNT') return [];
    return calculateGoalTimeline({
      initialAmount,
      monthlyContribution,
      targetAmount,
      rates,
    });
  }, [goalType, initialAmount, monthlyContribution, targetAmount, rates]);

  const monthlyIncomeResults = useMemo(() => {
    return calculateRequiredForMonthlyIncome({
      desiredMonthlyIncome,
      rates,
    });
  }, [desiredMonthlyIncome, rates]);

  // Tempo para cada investimento acumular o próprio patrimônio que gera a renda desejada.
  const incomeGoalTimeline = useMemo(() => {
    if (goalType !== 'MONTHLY_INCOME') return [];
    const results = monthlyIncomeResults.map(
      (income) =>
        calculateGoalTimeline({
          initialAmount,
          monthlyContribution,
          targetAmount: income.requiredCapital,
          rates,
          products: [income.product],
        })[0]
    );
    const fastestMonths = Math.min(...results.map((r) => r.monthsToReach));
    return results.map((r) => ({ ...r, isFastest: r.monthsToReach === fastestMonths }));
  }, [goalType, initialAmount, monthlyContribution, monthlyIncomeResults, rates]);

  // O prazo só é escolhido em "Fazer meu dinheiro render"; nas metas, a projeção vai até atingi-las.
  const projectionMonths = useMemo(() => {
    const timeline = goalType === 'TARGET_AMOUNT' ? goalTimelineResults : incomeGoalTimeline;
    if (goalType === 'RENDER' || timeline.length === 0) return months;
    return Math.max(1, Math.min(...timeline.map((r) => r.monthsToReach)));
  }, [goalType, months, goalTimelineResults, incomeGoalTimeline]);

  const simulation = useMemo(() => {
    return runFullSimulation({
      initialAmount,
      monthlyContribution,
      months: projectionMonths,
      rates,
      cdbPercentCdi: 100,
      lciPercentCdi: 90,
    });
  }, [initialAmount, monthlyContribution, projectionMonths, rates]);

  const handleCalculateClick = () => {
    setHighlightKey((prev) => prev + 1);

    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const activeRouteMeta = SEO_ROUTES[currentPath] || SEO_ROUTES['/'];
  const viewMode: ViewMode = activeRouteMeta.preset?.viewMode || 'HOME';
  const activePage = getPageByViewMode(viewMode);
  const preset = activeRouteMeta.preset;

  const renderToolPage = (content: React.ReactNode) => (
    <div className="space-y-10">
      <PageHeader
        page={activePage}
        heading={activeRouteMeta.heading || activePage.label}
        subheading={activeRouteMeta.subheading}
        editorialNote={activeRouteMeta.editorialNote}
      />
      {content}
      <ToolLinks currentViewMode={viewMode} onNavigate={(p) => navigateTo(p)} />
      <Disclaimer />
    </div>
  );

  const renderPage = () => {
    switch (viewMode) {
      case 'DIRECT_COMPARE':
        return renderToolPage(
          <ComparisonCard
            rates={rates}
            defaultProductA={compareProductA}
            defaultProductB={compareProductB}
            defaultAmount={preset?.initialAmount ?? 10000}
            defaultMonths={preset?.months ?? 12}
            onNavigateRoute={(p) => navigateTo(p)}
            hideTitle
          />
        );

      case 'CDB_CALCULATOR':
        return renderToolPage(
          <CdbCalculator
            rates={rates}
            defaultAmount={preset?.initialAmount ?? 10000}
            defaultMonths={preset?.months ?? 12}
            defaultPercentCdi={cdbPresetPercent}
            onNavigateRoute={(p) => navigateTo(p)}
            hideTitle
          />
        );

      case 'GOAL_100K':
        return renderToolPage(
          <GoalCalculator
            rates={rates}
            defaultInitial={preset?.initialAmount ?? 20000}
            defaultMonthly={preset?.monthlyContribution ?? 1000}
            defaultTarget={preset?.targetAmount ?? 100000}
            hideTitle
          />
        );

      case 'MONTHLY_INCOME':
        return renderToolPage(
          <div className="space-y-8">
            <MonthlyIncomeCalculator
              rates={rates}
              defaultIncome={preset?.desiredMonthlyIncome ?? 1000}
            />
            <PassiveIncomeByCapital
              rates={rates}
              defaultCapital={simulation.bestProduct.finalAmount}
            />
          </div>
        );

      case 'LEARN':
        return renderToolPage(<EducationalSection rates={rates} hideTitle />);

      case 'SOURCES':
        return renderToolPage(
          <DataSource rates={rates} treasuryProducts={treasuryProducts} isFullPage={true} />
        );

      default:
        return (
          <>
            <section id="simulador" className="space-y-7">
              <PageHeader
                page={activePage}
                heading={activeRouteMeta.heading || 'Quanto seu dinheiro pode render?'}
                subheading={
                  activeRouteMeta.subheading ||
                  'Compare investimentos e descubra quanto você pode ter no final.'
                }
                editorialNote={activeRouteMeta.editorialNote}
              />

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
                incomeGoalTimeline={incomeGoalTimeline}
                targetAmount={targetAmount}
                monthlyIncomeResults={monthlyIncomeResults}
                desiredMonthlyIncome={desiredMonthlyIncome}
                highlightKey={highlightKey}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onNavigate={(p) => navigateTo(p)}
              />
            </div>

            <ComparisonTable simulation={simulation} />

            <PerformanceChart timeline={simulation.timeline} />

            <ToolLinks
              currentViewMode={viewMode}
              onNavigate={(p) => navigateTo(p)}
              title="Continue planejando"
            />

            <Disclaimer />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B0D] text-[#F4F5F7]">
      <Header activeViewMode={viewMode} onNavigate={navigateTo} />

      <main
        key={currentPath}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-12 sm:space-y-16"
      >
        {renderPage()}
      </main>

      <Footer onNavigate={navigateTo} />

      {showScrollToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Voltar ao início da página"
          title="Voltar ao início"
          className="fixed right-4 bottom-5 sm:right-7 sm:bottom-7 z-40 min-h-11.5 min-w-11.5 flex items-center justify-center rounded-full bg-[#10B981] text-[#05100B] shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-[#34D399] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4F5F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0D] transition-all cursor-pointer"
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
