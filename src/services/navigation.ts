import {
  BarChart3,
  BookOpen,
  Database,
  Goal,
  Landmark,
  LucideIcon,
  Scale,
  WalletCards,
} from 'lucide-react';
import type { RouteMetadata } from './seoRoutes';

export type ViewMode = NonNullable<NonNullable<RouteMetadata['preset']>['viewMode']>;

export interface AppPage {
  viewMode: ViewMode;
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const APP_PAGES: AppPage[] = [
  {
    viewMode: 'HOME',
    path: '/',
    label: 'Simulador',
    description: 'Veja quanto seu dinheiro rende em CDB, Tesouro, LCI/LCA e Poupança.',
    icon: BarChart3,
  },
  {
    viewMode: 'DIRECT_COMPARE',
    path: '/comparar',
    label: 'Comparar',
    description: 'Coloque dois investimentos lado a lado e veja a diferença em reais.',
    icon: Scale,
  },
  {
    viewMode: 'CDB_CALCULATOR',
    path: '/simulador-cdb',
    label: 'CDB',
    description: 'Calcule o rendimento líquido de um CDB em qualquer % do CDI.',
    icon: Landmark,
  },
  {
    viewMode: 'GOAL_100K',
    path: '/metas',
    label: 'Metas',
    description: 'Descubra em quanto tempo você chega ao valor que deseja.',
    icon: Goal,
  },
  {
    viewMode: 'MONTHLY_INCOME',
    path: '/renda-mensal',
    label: 'Renda mensal',
    description: 'Quanto investir para viver de renda e quanto seu patrimônio rende por mês.',
    icon: WalletCards,
  },
  {
    viewMode: 'LEARN',
    path: '/aprenda',
    label: 'Aprenda',
    description: 'CDI, Selic e Imposto de Renda explicados sem complicação.',
    icon: BookOpen,
  },
  {
    viewMode: 'SOURCES',
    path: '/fontes',
    label: 'Fontes',
    description: 'Taxas em vigor, fontes oficiais e metodologia de cálculo.',
    icon: Database,
  },
];

export const getPageByViewMode = (viewMode: ViewMode): AppPage =>
  APP_PAGES.find((page) => page.viewMode === viewMode) || APP_PAGES[0];
