import React from 'react';
import { ChevronRight } from 'lucide-react';
import { APP_PAGES, ViewMode } from '../services/navigation';

interface ToolLinksProps {
  currentViewMode: ViewMode;
  onNavigate: (path: string) => void;
  title?: string;
}

export const ToolLinks: React.FC<ToolLinksProps> = ({
  currentViewMode,
  onNavigate,
  title = 'Outras ferramentas',
}) => {
  const pages = APP_PAGES.filter((page) => page.viewMode !== currentViewMode);

  return (
    <section className="space-y-5 border-t border-white/8 pt-8" aria-labelledby="tool-links-heading">
      <h2
        id="tool-links-heading"
        className="text-xl sm:text-2xl font-display font-semibold text-[#F4F5F7] tracking-tight"
      >
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pages.map(({ path, label, description, icon: Icon }) => (
          <a
            key={path}
            href={path}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(path);
            }}
            className="group flex items-start gap-3.5 p-5 rounded-2xl bg-[#121418] border border-white/8 hover:border-[#10B981]/40 transition-colors"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/6 text-[#10B981] transition-colors group-hover:bg-[#10B981]/15">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#F4F5F7]">
                {label}
                <ChevronRight
                  className="h-4 w-4 text-[#646973] transition-transform group-hover:translate-x-0.5 group-hover:text-[#10B981]"
                  aria-hidden="true"
                />
              </span>
              <span className="block text-xs text-[#9499A3] leading-relaxed">{description}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};
