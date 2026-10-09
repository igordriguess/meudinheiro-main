import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Database,
  Goal,
  Menu,
  Scale,
  X,
} from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string, sectionId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (path: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(path, sectionId);
  };

  const mobileLinks = [
    {
      label: 'Simulador principal',
      description: 'Compare quanto seu dinheiro pode render',
      icon: BarChart3,
      path: '/',
      sectionId: 'simulador',
    },
    {
      label: 'Comparar investimentos',
      description: 'Veja CDB, Poupança e Tesouro lado a lado',
      icon: Scale,
      path: '/',
      sectionId: 'comparar',
    },
    {
      label: 'Planejar objetivos',
      description: 'Metas de patrimônio e renda mensal',
      icon: Goal,
      path: '/',
      sectionId: 'objetivo-100k',
    },
    {
      label: 'Educação financeira',
      description: 'Conceitos para entender cada simulação',
      icon: BookOpen,
      path: '/',
      sectionId: 'sobre',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0B0D]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="font-display font-semibold text-base sm:text-lg tracking-tight text-[#F4F5F7] hover:text-[#10B981] transition-colors whitespace-nowrap"
        >
          MEU DINHEIRO
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9499A3]">
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'simulador')}
            className="hover:text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
          >
            Simulador
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'comparar')}
            className="hover:text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
          >
            Comparar
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'objetivo-100k')}
            className="hover:text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
          >
            Objetivos
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'sobre')}
            className="hover:text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap"
          >
            Sobre
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/fontes')}
            className={`hover:text-[#F4F5F7] transition-colors cursor-pointer whitespace-nowrap ${
              currentPath === '/fontes' ? 'text-[#10B981]' : ''
            }`}
          >
            Fontes
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLinkClick('/cdb-100-cdi')}
            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-[#F4F5F7] bg-[#121418] border border-white/[0.1] rounded-lg hover:border-[#10B981]/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            Simular CDB
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className={`md:hidden min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              mobileMenuOpen
                ? 'bg-[#10B981]/10 border-[#10B981]/35 text-[#10B981]'
                : 'border-transparent text-[#9499A3] hover:text-[#F4F5F7] hover:bg-white/[0.05]'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-x-0 top-14 bottom-0 bg-black/55 md:hidden cursor-default"
          />

          <div
            id="mobile-navigation"
            className="fixed inset-x-0 top-14 md:hidden max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-white/[0.1] bg-[#121418] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="mx-auto max-w-[1140px] px-4 py-5 sm:px-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono font-semibold tracking-[0.12em] text-[#10B981]">
                    NAVEGAÇÃO
                  </p>
                  <p className="mt-1 text-sm text-[#9499A3]">
                    Acesse uma área da calculadora
                  </p>
                </div>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-[#9499A3]">
                  Menu
                </span>
              </div>

              <nav className="grid grid-cols-1 gap-2" aria-label="Navegação mobile">
                {mobileLinks.map(({ label, description, icon: Icon, path, sectionId }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleLinkClick(path, sectionId)}
                    className="group flex min-h-[60px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0A0B0D]/60 px-3.5 py-3 text-left transition-colors hover:border-[#10B981]/35 hover:bg-[#10B981]/[0.06]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[#10B981] transition-colors group-hover:bg-[#10B981]/15">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#F4F5F7]">
                        {label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#9499A3]">
                        {description}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#646973] transition-transform group-hover:translate-x-0.5 group-hover:text-[#10B981]"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </nav>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleLinkClick('/cdb-100-cdi')}
                  className="flex min-h-[48px] items-center gap-3 rounded-xl border border-[#10B981]/25 bg-[#10B981]/[0.08] px-3.5 text-left transition-colors hover:bg-[#10B981]/15"
                >
                  <BarChart3 className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-[#F4F5F7]">
                      Simular CDB
                    </span>
                    <span className="block text-xs text-[#9499A3]">100%, 110% ou 120% do CDI</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLinkClick('/fontes')}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-3.5 text-left transition-colors ${
                    currentPath === '/fontes'
                      ? 'border-[#10B981]/35 bg-[#10B981]/[0.08]'
                      : 'border-white/[0.07] bg-[#0A0B0D]/60 hover:border-white/[0.18] hover:bg-white/[0.05]'
                  }`}
                >
                  <Database className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-[#F4F5F7]">
                      Fontes de dados
                    </span>
                    <span className="block text-xs text-[#9499A3]">Taxas e metodologia</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
