import React from 'react';
import { GoalType } from '../types/finance';
import { MoneyInput } from './MoneyInput';
import { PeriodSelector } from './PeriodSelector';
import { GoalSelector } from './GoalSelector';

interface SimulationFormProps {
  initialAmount: number;
  onInitialAmountChange: (v: number) => void;
  monthlyContribution: number;
  onMonthlyContributionChange: (v: number) => void;
  months: number;
  onMonthsChange: (m: number) => void;
  goalType: GoalType;
  onGoalTypeChange: (g: GoalType) => void;
  targetAmount: number;
  onTargetAmountChange: (v: number) => void;
  desiredMonthlyIncome: number;
  onDesiredMonthlyIncomeChange: (v: number) => void;
  onCalculate: () => void;
}

export const SimulationForm: React.FC<SimulationFormProps> = ({
  initialAmount,
  onInitialAmountChange,
  monthlyContribution,
  onMonthlyContributionChange,
  months,
  onMonthsChange,
  goalType,
  onGoalTypeChange,
  targetAmount,
  onTargetAmountChange,
  desiredMonthlyIncome,
  onDesiredMonthlyIncomeChange,
  onCalculate,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121418] border border-white/[0.08] rounded-2xl p-5 sm:p-7 space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MoneyInput
          id="initial-amount"
          label="Quanto você tem hoje?"
          value={initialAmount}
          onChange={onInitialAmountChange}
          quickAmounts={[1000, 10000, 50000, 100000]}
        />

        <MoneyInput
          id="monthly-contribution"
          label="Quanto consegue investir por mês?"
          value={monthlyContribution}
          onChange={onMonthlyContributionChange}
          quickAmounts={[0, 300, 1000, 2500]}
          suffix="/mês"
        />
      </div>

      <PeriodSelector valueMonths={months} onChange={onMonthsChange} />

      <GoalSelector value={goalType} onChange={onGoalTypeChange} />

      {goalType === 'TARGET_AMOUNT' && (
        <div className="pt-2 border-t border-white/[0.06]">
          <MoneyInput
            id="target-amount"
            label="Quero chegar a:"
            value={targetAmount}
            onChange={onTargetAmountChange}
            quickAmounts={[50000, 100000, 300000, 1000000]}
          />
        </div>
      )}

      {goalType === 'MONTHLY_INCOME' && (
        <div className="pt-2 border-t border-white/[0.06]">
          <MoneyInput
            id="desired-monthly-income"
            label="Quero gerar aproximadamente:"
            value={desiredMonthlyIncome}
            onChange={onDesiredMonthlyIncomeChange}
            quickAmounts={[500, 1000, 3000, 5000]}
            suffix="/mês"
          />
        </div>
      )}

      <div className="pt-1">
        <button
          type="submit"
          className="w-full min-h-[52px] py-3.5 px-6 rounded-xl bg-[#10B981] hover:bg-[#34D399] active:scale-[0.99] text-[#05100B] font-semibold text-base tracking-tight transition-all duration-150 cursor-pointer whitespace-nowrap"
        >
          Calcular
        </button>
      </div>
    </form>
  );
};
