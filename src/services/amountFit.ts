// Classes de tamanho por faixa de comprimento do texto, do maior para o menor.
// Garante que valores grandes (ex.: R$ 17.241.379.310) caibam nos cards sem estourar.
export const AMOUNT_SIZES = {
  hero: [
    'text-4xl sm:text-5xl md:text-6xl',
    'text-3xl sm:text-4xl md:text-5xl',
    'text-2xl sm:text-3xl md:text-4xl',
    'text-xl sm:text-2xl md:text-3xl',
  ],
  xl: ['text-3xl sm:text-4xl', 'text-2xl sm:text-3xl', 'text-xl sm:text-2xl', 'text-lg sm:text-xl'],
  lg: ['text-2xl sm:text-3xl', 'text-xl sm:text-2xl', 'text-lg sm:text-xl', 'text-base sm:text-lg'],
  md: ['text-2xl', 'text-xl', 'text-lg', 'text-base'],
  sm: ['text-base sm:text-lg', 'text-base', 'text-sm sm:text-base', 'text-sm'],
} as const;

const LENGTH_BREAKPOINTS = [12, 15, 18];

export const fitAmount = (text: string, size: keyof typeof AMOUNT_SIZES): string => {
  const steps = AMOUNT_SIZES[size];
  const index = LENGTH_BREAKPOINTS.findIndex((limit) => text.length <= limit);
  const sizeClass = steps[index === -1 ? steps.length - 1 : index];
  return `${sizeClass} wrap-anywhere`;
};
