import React from 'react';
import { AppPage } from '../services/navigation';

interface PageHeaderProps {
  page: AppPage;
  heading: string;
  subheading?: string;
  editorialNote?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  heading,
  subheading,
  editorialNote,
}) => {
  const Icon = page.icon;

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="flex items-center gap-2 text-xs font-mono font-semibold tracking-[0.12em] text-[#10B981]">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {page.label.toUpperCase()}
        </p>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#F4F5F7] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {heading}
        </h1>

        {subheading && (
          <p className="text-base sm:text-lg text-[#9499A3] max-w-2xl">
            {subheading}
          </p>
        )}
      </div>

      {editorialNote && (
        <div className="p-4 rounded-xl bg-[#121418] border border-white/[0.07] text-left text-xs sm:text-sm text-[#9499A3] leading-relaxed">
          {editorialNote}
        </div>
      )}
    </div>
  );
};
