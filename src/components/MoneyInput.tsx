import React, { useState, useEffect } from 'react';
import { formatBRL } from '../services/simulationEngine';

export const MAX_MONEY_VALUE = 999_000_000;

const formatInteger = (value: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);

interface MoneyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  helperText?: string;
  quickAmounts?: number[];
  suffix?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  id,
  label,
  value,
  onChange,
  helperText,
  quickAmounts,
  suffix,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => formatInteger(value));
  const [isFocused, setIsFocused] = useState(false);
  const [hitMax, setHitMax] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatInteger(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setHitMax(false);
      setDisplayValue('0');
      onChange(0);
      return;
    }
    const parsed = parseInt(rawDigits, 10);
    const numeric = Math.min(MAX_MONEY_VALUE, parsed);
    setHitMax(parsed > MAX_MONEY_VALUE);
    setDisplayValue(formatInteger(numeric));
    onChange(numeric);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#F4F5F7] tracking-wide"
      >
        {label}
      </label>

      <div
        className={`relative flex items-center rounded-xl bg-[#0A0B0D] border transition-colors duration-150 ${
          isFocused
            ? 'border-[#10B981] ring-1 ring-[#10B981]/30'
            : 'border-white/[0.09] hover:border-white/[0.18]'
        }`}
      >
        <span className="shrink-0 pl-4 pr-2 text-lg sm:text-xl font-mono text-[#9499A3] select-none">
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleInputChange}
          aria-describedby={hitMax ? `${id}-max` : helperText ? `${id}-helper` : undefined}
          className={`min-w-0 w-full py-3.5 pr-4 bg-transparent ${
            displayValue.length > 9 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          } font-mono font-semibold text-[#F4F5F7] tabular-nums focus:outline-none`}
        />
        {suffix && (
          <span className="pr-4 text-sm font-mono text-[#9499A3] whitespace-nowrap select-none">
            {suffix}
          </span>
        )}
      </div>

      {hitMax && (
        <p id={`${id}-max`} role="status" className="text-xs text-[#F59E0B]">
          Valor máximo permitido: {formatBRL(MAX_MONEY_VALUE)}.
        </p>
      )}

      {quickAmounts && quickAmounts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {quickAmounts.map((amt) => {
            const isSelected = value === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setHitMax(false);
                  onChange(amt);
                }}
                className={`min-h-[34px] px-2.5 py-1 text-xs font-mono tabular-nums rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#10B981] font-medium'
                    : 'bg-[#121418] border-white/[0.06] text-[#9499A3] hover:text-[#F4F5F7] hover:border-white/[0.14]'
                }`}
              >
                {formatBRL(amt)}
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p id={`${id}-helper`} className="text-xs text-[#646973]">
          {helperText}
        </p>
      )}
    </div>
  );
};
