# Meu Dinheiro

Aplicação web em português para simulação e comparação de investimentos de renda fixa no Brasil. O site ajuda a visualizar a evolução do patrimônio, comparar produtos e planejar objetivos financeiros com base em aportes, prazos e taxas de mercado.

## Funcionalidades

- Simulação de investimentos a partir de valor inicial, aporte mensal e prazo.
- Comparação entre:
  - CDB;
  - Tesouro Selic;
  - LCI/LCA;
  - Poupança.
- Cálculo de rendimento líquido, impostos estimados e valor final projetado.
- Gráfico de evolução do patrimônio ao longo do tempo.
- Calculadora para descobrir em quanto tempo um objetivo financeiro pode ser alcançado.
- Calculadora do capital necessário para gerar uma renda mensal desejada.
- Simulador específico de CDB, com percentual do CDI configurável.
- Comparação direta entre produtos de investimento.
- Dados de Selic, CDI, IPCA e poupança obtidos de fontes públicas, com atualização periódica.
- Consulta de produtos do Tesouro Nacional.
- Compartilhamento de simulações por meio de um cartão.
- Rotas amigáveis para mecanismos de busca e preenchimento de simulações por parâmetros de URL.
- Layout responsivo para computadores e dispositivos móveis.

> **Aviso:** as simulações são estimativas educacionais. Elas não representam recomendação de investimento, promessa de rentabilidade ou garantia de resultados futuros.

## Tecnologias

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [Motion](https://motion.dev/)

## Pré-requisitos

- Node.js 20.19 ou superior, ou Node.js 22 ou superior.
- npm.

## Instalação e execução

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/igordriguess/meudinheiro-main.git
cd meudinheiro-main
npm install
```

Crie o arquivo de variáveis de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em [http://localhost:8443](http://localhost:8443).

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor Express integrado ao Vite em modo de desenvolvimento. |
| `npm run build` | Gera a versão otimizada da aplicação na pasta `dist`. |
| `npm start` | Inicia o servidor da aplicação. |
| `npm run preview` | Serve o build do Vite para pré-visualização na porta `8443`. |
| `npm run lint` | Executa a verificação de tipos do TypeScript. |
| `npm run clean` | Remove os artefatos `dist` e `server.js`. |

## Variáveis de ambiente

O arquivo `.env.example` contém:

| Variável | Descrição | Valor padrão |
| --- | --- | --- |
| `APP_URL` | URL pública ou local da aplicação. | `http://localhost:8443` |
| `PORT` | Porta usada pelo servidor Express. | `8443` |

`PORT` é lida diretamente pelo servidor. `APP_URL` pode ser usada por ambientes de hospedagem e integrações que precisem conhecer a URL da aplicação.

## API

O servidor Express disponibiliza os seguintes endpoints:

| Endpoint | Método | Descrição |
| --- | --- | --- |
| `/api/rates` | `GET` | Retorna Selic, CDI, IPCA, poupança e metadados da fonte. |
| `/api/treasury` | `GET` | Retorna produtos públicos do Tesouro e seus dados de referência. |
| `/api/simulation` | `GET` ou `POST` | Executa uma simulação usando os parâmetros informados. |

Exemplo de consulta de simulação:

```text
/api/simulation?initial_amount=10000&monthly_contribution=1000&period=12
```

Parâmetros aceitos por `/api/simulation`:

- `initial_amount` ou `initialAmount`;
- `monthly_contribution` ou `monthlyContribution`;
- `period` ou `months`;
- `cdb_percent_cdi` ou `cdbPercentCdi`;
- `lci_percent_cdi` ou `lciPercentCdi`.

As taxas do Banco Central são consultadas pelo servidor e mantidas em cache por cinco minutos. Quando a consulta externa não está disponível, a aplicação utiliza taxas de fallback para continuar funcionando e sinalizar os dados disponíveis na interface.

## Estrutura do projeto

```text
.
├── src/
│   ├── components/          # Componentes da interface e calculadoras
│   ├── services/            # Motor de simulação, API e rotas SEO
│   ├── types/               # Tipos compartilhados da aplicação
│   ├── App.tsx              # Composição principal da aplicação
│   └── main.tsx             # Ponto de entrada do React
├── server.ts                # Servidor Express, API e integração com o Vite
├── index.html               # Metadados, SEO e ponto de montagem do React
├── vite.config.ts           # Configuração do Vite
└── package.json              # Scripts e dependências
```

## Build e execução em produção

Gere o build:

```bash
npm run build
```

Depois, inicie o servidor em modo de produção:

```bash
set NODE_ENV=production
npm start
```

No Windows PowerShell:

```powershell
$env:NODE_ENV = "production"
npm start
```

Em produção, o Express serve os arquivos gerados em `dist` e mantém as rotas da aplicação de página única funcionando.

## Fontes de dados

- Banco Central do Brasil, por meio das séries SGS, para indicadores de mercado.
- Tesouro Nacional/Tesouro Transparente, para informações de títulos públicos exibidas no site.

Os valores apresentados podem mudar conforme as fontes oficiais são atualizadas. Confira sempre as condições vigentes antes de tomar qualquer decisão financeira.

## Licença

Este projeto ainda não possui uma licença de código aberto definida. Consulte os mantenedores antes de reutilizar ou distribuir o código.
