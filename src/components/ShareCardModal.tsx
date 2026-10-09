import React, { useState } from 'react';
import { FullSimulationResult } from '../types/finance';
import { formatBRL, formatMonthsHuman } from '../services/simulationEngine';
import { X, Check, Share2, Copy } from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: FullSimulationResult;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  simulation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { bestProduct, initialAmount, monthlyContribution, months, maxDifference } =
    simulation;

  const buildShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('inicial', String(initialAmount));
    url.searchParams.set('mensal', String(monthlyContribution));
    url.searchParams.set('meses', String(months));
    return url.toString();
  };

  const shareText = `Simulei no Meu Dinheiro: ${formatBRL(initialAmount)}${
    monthlyContribution > 0 ? ` + ${formatBRL(monthlyContribution)}/mês` : ''
  } por ${formatMonthsHuman(months)} pode chegar a ${formatBRL(
    Math.round(bestProduct.finalAmount)
  )} (${bestProduct.name}).`;

  const handleNativeShare = async () => {
    const shareUrl = buildShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Dinheiro – Simulação de Investimento',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback
      }
    }
    await handleCopy();
  };

  const handleCopy = async () => {
    const shareUrl = buildShareUrl();
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="w-full max-w-md bg-[#121418] border border-white/[0.12] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 id="share-modal-title" className="text-base font-semibold text-[#F4F5F7]">
            Compartilhar simulação
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de compartilhamento"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#9499A3] hover:text-[#F4F5F7] hover:bg-white/[0.06] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0A0B0D] border border-white/[0.1] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <span className="font-display font-semibold text-sm tracking-tight text-[#F4F5F7]">
              MEU DINHEIRO
            </span>
            <span className="text-xs font-mono text-[#9499A3]">
              {formatMonthsHuman(months)}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[#9499A3]">
              {formatBRL(initialAmount)} hoje
              {monthlyContribution > 0
                ? ` + ${formatBRL(monthlyContribution)}/mês`
                : ' (sem aportes mensais)'}
            </p>
            <p className="text-xs font-mono text-[#10B981]">{bestProduct.name}</p>
          </div>

          <div className="pt-2">
            <span className="text-xs text-[#9499A3] block">Resultado líquido estimado:</span>
            <p className="text-3xl font-mono font-semibold text-[#10B981] tabular-nums mt-0.5">
              {formatBRL(Math.round(bestProduct.finalAmount))}
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-[#9499A3]">
            <span>Rendimento líquido: +{formatBRL(Math.round(bestProduct.netReturn))}</span>
            <span>Simule no Meu Dinheiro</span>
          </div>
        </div>

        {maxDifference > 0 && (
          <p className="text-xs text-[#9499A3] text-center">
            Diferença de até +{formatBRL(Math.round(maxDifference))} entre as opções simuladas.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleNativeShare}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#05100B] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#0A0B0D] border border-white/[0.1] hover:border-white/[0.2] text-[#F4F5F7] font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#10B981]" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#9499A3]" />
                <span>Copiar resumo e link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
