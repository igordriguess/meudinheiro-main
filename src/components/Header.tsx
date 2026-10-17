import React, { useState } from 'react';
import { ChevronRight, Menu, X } from 'lucide-react';
import { APP_PAGES, ViewMode } from '../services/navigation';

interface HeaderProps {
  activeViewMode: ViewMode;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeViewMode, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0B0D]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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

        <nav
          className="hidden lg:flex items-center gap-1 text-sm font-medium text-[#9499A3]"
          aria-label="Navegação principal"
        >
          {APP_PAGES.map(({ path, label, viewMode }) => {
            const isActive = viewMode === activeViewMode;
            return (
              <a
                key={path}
                href={path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(path);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'hover:text-[#F4F5F7] hover:bg-white/5'
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className={`lg:hidden min-h-10.5 min-w-10.5 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              mobileMenuOpen
                ? 'bg-[#10B981]/10 border-[#10B981]/35 text-[#10B981]'
                : 'border-transparent text-[#9499A3] hover:text-[#F4F5F7] hover:bg-white/5'
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
            className="fixed inset-x-0 top-14 bottom-0 bg-black/55 lg:hidden cursor-default"
          />

          <div
            id="mobile-navigation"
            className="fixed inset-x-0 top-14 lg:hidden max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-white/10 bg-[#121418] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="Navegação mobile">
                {APP_PAGES.map(({ label, description, icon: Icon, path, viewMode }) => {
                  const isActive = viewMode === activeViewMode;
                  return (
                    <a
                      key={path}
                      href={path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(path);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex min-h-15 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                        isActive
                          ? 'border-[#10B981]/35 bg-[#10B981]/8'
                          : 'border-white/7 bg-[#0A0B0D]/60 hover:border-[#10B981]/35 hover:bg-[#10B981]/6'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/6 text-[#10B981] transition-colors group-hover:bg-[#10B981]/15">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#F4F5F7]">{label}</span>
                        <span className="block text-xs text-[#9499A3] leading-snug">{description}</span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[#646973] transition-transform group-hover:translate-x-0.5 group-hover:text-[#10B981]"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
