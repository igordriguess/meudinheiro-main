import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <section
      aria-label="Aviso legal"
      className="p-5 sm:p-6 rounded-2xl bg-[#121418]/60 border border-white/[0.06] text-xs text-[#9499A3] leading-relaxed"
    >
      <p>
        <strong className="text-[#F4F5F7] font-medium">Aviso legal:</strong> Este
        simulador tem finalidade exclusivamente informativa e educacional. As
        simulações são estimativas matemáticas e não constituem recomendação,
        oferta ou promessa de rentabilidade. Rentabilidade passada não garante
        resultados futuros.
      </p>
    </section>
  );
};
