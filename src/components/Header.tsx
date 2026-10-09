import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

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
            className="md:hidden min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl text-[#9499A3] hover:text-[#F4F5F7] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#121418] px-4 py-3 space-y-1">
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'simulador')}
            className="w-full min-h-[44px] px-3 text-left text-sm font-medium text-[#F4F5F7] rounded-lg hover:bg-white/[0.05] flex items-center"
          >
            Simulador principal
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'comparar')}
            className="w-full min-h-[44px] px-3 text-left text-sm font-medium text-[#F4F5F7] rounded-lg hover:bg-white/[0.05] flex items-center"
          >
            Comparar opções
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'objetivo-100k')}
            className="w-full min-h-[44px] px-3 text-left text-sm font-medium text-[#F4F5F7] rounded-lg hover:bg-white/[0.05] flex items-center"
          >
            Objetivos (R$ 100 mil e Renda Mensal)
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/', 'sobre')}
            className="w-full min-h-[44px] px-3 text-left text-sm font-medium text-[#F4F5F7] rounded-lg hover:bg-white/[0.05] flex items-center"
          >
            Sobre e Educação Financeira
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('/fontes')}
            className="w-full min-h-[44px] px-3 text-left text-sm font-medium text-[#10B981] rounded-lg hover:bg-white/[0.05] flex items-center"
          >
            Fontes de dados (/fontes)
          </button>
        </div>
      )}
    </header>
  );
};
