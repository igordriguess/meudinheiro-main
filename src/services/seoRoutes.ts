import { GoalType, InvestmentProductType } from '../types/finance';

export interface RouteMetadata {
  path: string;
  title: string;
  description: string;
  heading?: string;
  subheading?: string;
  preset?: {
    initialAmount?: number;
    monthlyContribution?: number;
    months?: number;
    goalType?: GoalType;
    targetAmount?: number;
    desiredMonthlyIncome?: number;
    cdbPercentCdi?: number;
    compareA?: InvestmentProductType;
    compareB?: InvestmentProductType;
    viewMode?: 'HOME' | 'CDB_CALCULATOR' | 'DIRECT_COMPARE' | 'GOAL_100K' | 'MONTHLY_INCOME' | 'SOURCES';
  };
  editorialNote?: string;
}

export const SEO_ROUTES: Record<string, RouteMetadata> = {
  '/': {
    path: '/',
    title: 'Meu Dinheiro – Quanto seu dinheiro pode render?',
    description:
      'Compare CDB, Tesouro Selic, Poupança e LCI/LCA e descubra de forma simples quanto seu dinheiro pode render no final.',
    heading: 'Quanto seu dinheiro pode render?',
    subheading: 'Compare investimentos e descubra quanto você pode ter no final.',
    preset: {
      initialAmount: 10000,
      monthlyContribution: 1000,
      months: 12,
      goalType: 'RENDER',
      viewMode: 'HOME',
    },
  },
  '/quanto-rende-10-mil': {
    path: '/quanto-rende-10-mil',
    title: 'Quanto rende R$ 10 mil? Simule seus investimentos | Meu Dinheiro',
    description:
      'Compare CDB, Tesouro Selic, Poupança e LCI/LCA e descubra quanto R$ 10.000 podem render por mês e em 1 ano já descontando impostos.',
    heading: 'Quanto rende R$ 10.000 hoje?',
    subheading:
      'Veja o resultado real em dinheiro de R$ 10 mil aplicados em Poupança, CDB, Tesouro Selic e LCI/LCA.',
    preset: {
      initialAmount: 10000,
      monthlyContribution: 0,
      months: 12,
      goalType: 'RENDER',
      viewMode: 'HOME',
    },
    editorialNote:
      'Com R$ 10.000 investidos em renda fixa, a escolha entre a Poupança e um CDB 100% do CDI ou LCI isenta de imposto faz diferença direta no saldo líquido ao final de 12 meses, mantendo liquidez e segurança.',
  },
  '/quanto-rende-50-mil': {
    path: '/quanto-rende-50-mil',
    title: 'Quanto rende R$ 50 mil na Renda Fixa? | Meu Dinheiro',
    description:
      'Simule quanto R$ 50.000 rendem na Poupança, CDB 100% CDI, Tesouro Selic e LCI/LCA. Veja o ganho líquido e impostos descontados.',
    heading: 'Quanto rende R$ 50.000?',
    subheading:
      'Descubra quanto um patrimônio de R$ 50 mil acumula líquido em diferentes opções de renda fixa.',
    preset: {
      initialAmount: 50000,
      monthlyContribution: 0,
      months: 12,
      goalType: 'RENDER',
      viewMode: 'HOME',
    },
    editorialNote:
      'Para valores a partir de R$ 50.000, o impacto do Imposto de Renda regressivo e da taxa de custódia da B3 (no Tesouro Selic acima de R$ 10 mil) passa a ser relevante na comparação com LCI e LCA isentas.',
  },
  '/quanto-rende-100-mil': {
    path: '/quanto-rende-100-mil',
    title: 'Quanto rende R$ 100 mil por mês e por ano? | Meu Dinheiro',
    description:
      'Veja quanto R$ 100.000 rendem líquido em CDB, Tesouro Selic, LCI/LCA e Poupança com dados atualizados da taxa Selic e CDI.',
    heading: 'Quanto rende R$ 100.000?',
    subheading:
      'Simulação transparente do rendimento líquido de R$ 100 mil nas principais opções do mercado brasileiro.',
    preset: {
      initialAmount: 100000,
      monthlyContribution: 0,
      months: 12,
      goalType: 'RENDER',
      viewMode: 'HOME',
    },
    editorialNote:
      'O marco de R$ 100.000 é um divisor clássico na formação de patrimônio: nesse patamar, os juros compostos mensais frequentemente superam o valor de novos aportes mensais.',
  },
  '/quanto-rende-500-mil': {
    path: '/quanto-rende-500-mil',
    title: 'Quanto rende R$ 500 mil? Simulação Líquida | Meu Dinheiro',
    description:
      'Descubra quanto R$ 500.000 rendem por mês e no ano em CDB, Tesouro Selic, LCI/LCA e Poupança. Calcule impostos e ganho líquido.',
    heading: 'Quanto rende R$ 500.000?',
    subheading:
      'Compare o retorno líquido em reais para meio milhão investido com segurança na renda fixa.',
    preset: {
      initialAmount: 500000,
      monthlyContribution: 0,
      months: 12,
      goalType: 'RENDER',
      viewMode: 'HOME',
    },
    editorialNote:
      'Em aplicações de R$ 500.000, vale lembrar que o Fundo Garantidor de Créditos (FGC) cobre até R$ 250.000 por CPF e instituição financeira em CDBs e LCIs/LCAs, enquanto o Tesouro Selic possui garantia soberana do Tesouro Nacional.',
  },
  '/cdb-100-cdi': {
    path: '/cdb-100-cdi',
    title: 'Quanto rende um CDB 100% do CDI hoje? Simulador | Meu Dinheiro',
    description:
      'Calcule exatamente quanto rende um CDB a 100% do CDI já descontando o Imposto de Renda regressivo de renda fixa.',
    heading: 'Quanto rende um CDB a 100% do CDI?',
    subheading: 'Simule valor investido, rendimento bruto, imposto de renda e valor líquido final.',
    preset: {
      initialAmount: 10000,
      months: 12,
      cdbPercentCdi: 100,
      viewMode: 'CDB_CALCULATOR',
    },
    editorialNote:
      'Um CDB que paga 100% do CDI acompanha integralmente a taxa DI interbancária, muito próxima à taxa Selic. É a referência base para reserva de emergência com liquidez diária.',
  },
  '/cdb-110-cdi': {
    path: '/cdb-110-cdi',
    title: 'Quanto rende um CDB 110% do CDI? Simulador Líquido | Meu Dinheiro',
    description:
      'Simule o rendimento líquido de um CDB pagando 110% do CDI. Veja quanto você ganha de verdade após o Imposto de Renda.',
    heading: 'Quanto rende um CDB a 110% do CDI?',
    subheading: 'Veja quanto um CDB de 110% do CDI entrega de retorno líquido acima da média.',
    preset: {
      initialAmount: 10000,
      months: 12,
      cdbPercentCdi: 110,
      viewMode: 'CDB_CALCULATOR',
    },
    editorialNote:
      'CDBs a 110% do CDI costumam ser oferecidos por bancos médios ou digitais e entregam um prêmio extra sobre a taxa básica, mesmo após o desconto do Imposto de Renda.',
  },
  '/cdb-120-cdi': {
    path: '/cdb-120-cdi',
    title: 'Quanto rende um CDB 120% do CDI? Calcule Agora | Meu Dinheiro',
    description:
      'Descubra quanto rende um CDB de 120% do CDI em 6, 12 ou 24 meses com cálculo automático da tabela regressiva de IR.',
    heading: 'Quanto rende um CDB a 120% do CDI?',
    subheading: 'Calcule o ganho líquido real de um CDB com rentabilidade de 120% do CDI.',
    preset: {
      initialAmount: 10000,
      months: 12,
      cdbPercentCdi: 120,
      viewMode: 'CDB_CALCULATOR',
    },
    editorialNote:
      'Rentabilidades de 120% do CDI geralmente estão associadas a prazos de vencimento fechados (sem resgate antecipado) ou campanhas promocionais com limite de aporte.',
  },
  '/cdb-ou-poupanca': {
    path: '/cdb-ou-poupanca',
    title: 'CDB ou Poupança: Qual rende mais dinheiro? | Meu Dinheiro',
    description:
      'Compare lado a lado CDB 100% do CDI e Poupança. Veja a diferença exata em reais no seu bolso já descontando o Imposto de Renda.',
    heading: 'CDB ou Poupança?',
    subheading: 'Comparação direta em reais entre o CDB (mesmo pagando IR) e a caderneta de Poupança.',
    preset: {
      initialAmount: 10000,
      months: 12,
      compareA: 'CDB',
      compareB: 'POUPANCA',
      viewMode: 'DIRECT_COMPARE',
    },
    editorialNote:
      'Mesmo sofrendo incidência de Imposto de Renda sobre os rendimentos, o CDB a 100% do CDI historicamente supera a Poupança em cenários de Selic elevada.',
  },
  '/cdb-ou-tesouro-selic': {
    path: '/cdb-ou-tesouro-selic',
    title: 'CDB ou Tesouro Selic: Comparativo Líquido | Meu Dinheiro',
    description:
      'Compare CDB 100% CDI e Tesouro Selic lado a lado. Entenda o efeito do IR e da taxa de custódia da B3 no valor final.',
    heading: 'CDB ou Tesouro Selic?',
    subheading: 'Descubra a diferença líquida em dinheiro entre títulos bancários (FGC) e títulos públicos.',
    preset: {
      initialAmount: 10000,
      months: 12,
      compareA: 'CDB',
      compareB: 'TESOURO_SELIC',
      viewMode: 'DIRECT_COMPARE',
    },
    editorialNote:
      'Tanto o CDB de liquidez diária quanto o Tesouro Selic possuem tributação idêntica pelo IR regressivo. No Tesouro Selic, valores até R$ 10.000 são isentos da taxa de custódia de 0,20% a.a. da B3.',
  },
  '/lci-ou-cdb': {
    path: '/lci-ou-cdb',
    title: 'LCI/LCA ou CDB: Qual deixa mais dinheiro líquido? | Meu Dinheiro',
    description:
      'Compare uma LCI/LCA isenta de Imposto de Renda com um CDB tributado. Descubra qual opção deixa mais dinheiro no final.',
    heading: 'LCI/LCA ou CDB?',
    subheading: 'Compare a isenção de Imposto de Renda da LCI/LCA contra a taxa bruta maior do CDB.',
    preset: {
      initialAmount: 10000,
      months: 12,
      compareA: 'LCI_LCA',
      compareB: 'CDB',
      viewMode: 'DIRECT_COMPARE',
    },
    editorialNote:
      'Como LCI e LCA são isentas de Imposto de Renda para pessoa física, uma taxa de 90% do CDI em LCI equivale a mais de 109% do CDI em um CDB no prazo de 1 ano.',
  },
  '/tesouro-selic-ou-poupanca': {
    path: '/tesouro-selic-ou-poupanca',
    title: 'Tesouro Selic ou Poupança: Comparação em Reais | Meu Dinheiro',
    description:
      'Veja quanto seu dinheiro rende no Tesouro Selic comparado à Poupança e calcule a diferença líquida em reais.',
    heading: 'Tesouro Selic ou Poupança?',
    subheading: 'Veja lado a lado quanto você acumula no título mais seguro do país versus a Poupança.',
    preset: {
      initialAmount: 10000,
      months: 12,
      compareA: 'TESOURO_SELIC',
      compareB: 'POUPANCA',
      viewMode: 'DIRECT_COMPARE',
    },
    editorialNote:
      'O Tesouro Selic remunera 100% da taxa básica de juros da economia, enquanto a Poupança é limitada a 0,5% ao mês + TR quando a Selic está acima de 8,5% ao ano.',
  },
  '/quanto-preciso-investir-para-ganhar-1000': {
    path: '/quanto-preciso-investir-para-ganhar-1000',
    title: 'Quanto preciso investir para ganhar R$ 1.000 por mês? | Meu Dinheiro',
    description:
      'Descubra qual patrimônio acumulado é necessário para gerar R$ 1.000 por mês de renda passiva em CDB, Tesouro Selic, LCI/LCA e Poupança.',
    heading: 'Quanto preciso investir para gerar R$ 1.000 por mês?',
    subheading: 'Calcule o patrimônio estimado para viver de renda mensal nas principais opções de renda fixa.',
    preset: {
      desiredMonthlyIncome: 1000,
      viewMode: 'MONTHLY_INCOME',
    },
    editorialNote:
      'Para estimar a geração de renda mensal recorrente, consideramos o rendimento mensal líquido de cada alternativa já descontando o Imposto de Renda quando aplicável.',
  },
  '/como-chegar-aos-100-mil': {
    path: '/como-chegar-aos-100-mil',
    title: 'Como chegar aos R$ 100 mil investindo por mês | Meu Dinheiro',
    description:
      'Calcule em quanto tempo você pode atingir seus primeiros R$ 100.000 investindo mensalmente na renda fixa.',
    heading: 'Quero chegar a R$ 100 mil',
    subheading: 'Descubra em quantos anos e meses você alcança seu objetivo e como a rentabilidade encurta o caminho.',
    preset: {
      initialAmount: 20000,
      monthlyContribution: 1000,
      targetAmount: 100000,
      viewMode: 'GOAL_100K',
    },
    editorialNote:
      'A combinação de aportes mensais constantes com uma taxa líquida superior reduz em vários meses o tempo necessário para atingir os primeiros R$ 100.000.',
  },
  '/fontes': {
    path: '/fontes',
    title: 'Fontes de Dados e Metodologia de Cálculo | Meu Dinheiro',
    description:
      'Conheça as fontes oficiais (Banco Central do Brasil e Tesouro Nacional) e a metodologia matemática utilizada nas simulações do Meu Dinheiro.',
    heading: 'Fontes de dados e metodologia',
    subheading: 'Transparência total sobre as taxas, impostos e fórmulas matemáticas utilizadas no simulador.',
    preset: {
      viewMode: 'SOURCES',
    },
  },
};
