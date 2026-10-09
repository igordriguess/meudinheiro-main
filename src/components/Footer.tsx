import React from 'react';

interface FooterProps {
  onNavigate: (path: string, sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent, path: string, sectionId?: string) => {
    e.preventDefault();
    onNavigate(path, sectionId);
  };

  return (
    <footer className="border-t border-white/[0.07] bg-[#0A0B0D] mt-16 py-12">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2.5">
            <span className="font-display font-semibold text-lg text-[#F4F5F7] tracking-tight block">
              MEU DINHEIRO
            </span>
            <p className="text-xs text-[#9499A3] leading-relaxed max-w-xs">
              Descubra quanto seu dinheiro pode render. Ferramenta independente de simulação e comparação de renda fixa no Brasil.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[#F4F5F7] tracking-wide">
              Simulações por valor
            </h4>
            <ul className="space-y-2 text-xs text-[#9499A3]">
              <li>
                <a
                  href="/quanto-rende-10-mil"
                  onClick={(e) => handleNav(e, '/quanto-rende-10-mil')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Quanto rende R$ 10 mil?
                </a>
              </li>
              <li>
                <a
                  href="/quanto-rende-50-mil"
                  onClick={(e) => handleNav(e, '/quanto-rende-50-mil')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Quanto rende R$ 50 mil?
                </a>
              </li>
              <li>
                <a
                  href="/quanto-rende-100-mil"
                  onClick={(e) => handleNav(e, '/quanto-rende-100-mil')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Quanto rende R$ 100 mil?
                </a>
              </li>
              <li>
                <a
                  href="/quanto-rende-500-mil"
                  onClick={(e) => handleNav(e, '/quanto-rende-500-mil')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Quanto rende R$ 500 mil?
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[#F4F5F7] tracking-wide">
              Comparações diretas
            </h4>
            <ul className="space-y-2 text-xs text-[#9499A3]">
              <li>
                <a
                  href="/cdb-ou-poupanca"
                  onClick={(e) => handleNav(e, '/cdb-ou-poupanca')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  CDB ou Poupança?
                </a>
              </li>
              <li>
                <a
                  href="/cdb-ou-tesouro-selic"
                  onClick={(e) => handleNav(e, '/cdb-ou-tesouro-selic')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  CDB ou Tesouro Selic?
                </a>
              </li>
              <li>
                <a
                  href="/lci-ou-cdb"
                  onClick={(e) => handleNav(e, '/lci-ou-cdb')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  LCI/LCA ou CDB?
                </a>
              </li>
              <li>
                <a
                  href="/tesouro-selic-ou-poupanca"
                  onClick={(e) => handleNav(e, '/tesouro-selic-ou-poupanca')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Tesouro Selic ou Poupança?
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[#F4F5F7] tracking-wide">
              Calculadoras de objetivos
            </h4>
            <ul className="space-y-2 text-xs text-[#9499A3]">
              <li>
                <a
                  href="/como-chegar-aos-100-mil"
                  onClick={(e) => handleNav(e, '/como-chegar-aos-100-mil')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Como chegar aos R$ 100 mil
                </a>
              </li>
              <li>
                <a
                  href="/quanto-preciso-investir-para-ganhar-1000"
                  onClick={(e) => handleNav(e, '/quanto-preciso-investir-para-ganhar-1000')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Gerar R$ 1.000/mês de renda
                </a>
              </li>
              <li>
                <a
                  href="/cdb-100-cdi"
                  onClick={(e) => handleNav(e, '/cdb-100-cdi')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Simulador CDB (100%, 110%, 120% CDI)
                </a>
              </li>
              <li>
                <a
                  href="/fontes"
                  onClick={(e) => handleNav(e, '/fontes')}
                  className="hover:text-[#10B981] transition-colors"
                >
                  Fontes de dados e metodologia
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#646973]">
          <p>
            © {new Date().getFullYear()} Meu Dinheiro. Desenvolvido por{" "}
            <span className="font-semibold text-white">IDV Labs</span>.
          </p>
          <p>
            Dados públicos de referência: Banco Central do Brasil e Tesouro Nacional.
          </p>
        </div>
      </div>
    </footer>
  );
};
