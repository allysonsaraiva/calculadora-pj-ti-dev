# 🚀 Calculadora PJ & Simulador de Pejotização (2026)

Um simulador avançado para profissionais de TI, focado em fornecer precisão tributária e embasamento estratégico para negociações de contratos PJ (Pejotização).

## 🌟 Principais Funcionalidades

Este simulador foi projetado para oferecer uma visão fiel da realidade financeira do profissional e da empresa contratante, permitindo uma análise comparativa profunda entre os modelos CLT e PJ.

### 1. 📊 Comparativo Realista (CLT vs. PJ)

- **Replicação exata de Holerite**: Suporte para overrides manuais de INSS e IRRF, permitindo bater os cálculos com o seu contracheque real.
- **Detalhamento de Benefícios**: Inclusão de VR/VA, Plano de Saúde e outros descontos personalizados.
- **Provisões CLT**: Cálculo automático de 13º, Férias + 1/3 e FGTS (8%) projetados mensalmente para comparação justa.

### 2. 🏢 Análise de Custo Patronal

- **Custo Total da Empresa**: Descubra o desembolso total do empregador (Bruto + Encargos + Provisões), permitindo identificar o seu "teto" de faturamento PJ.
- **Alvo de Negociação Win-Win**: Sugestão de faturamento ideal que equilibra o ganho para o profissional e a economia para a empresa.

### 3. ⚖️ Inteligência Tributária (Simples Nacional)

- **Otimização via Fator R**: Cálculo automático entre Anexo III (6%) e Anexo V (15,5%) baseado no faturamento e pró-labore.
- **Custo Operacional Flexível**: Configure custos contábeis de forma opcional para uma simulação personalizada.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animações**: Framer Motion
- **Icons**: Lucide React

## 🚀 Como Executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 📈 Lógica de Cálculo

As fórmulas estão centralizadas em `src/lib/calc.ts` e seguem as normas tributárias brasileiras vigentes em 2026:

- **Anexo III/V**: Alíquotas progressivas e regras do Simples Nacional.
- **Tabela Progressiva PF**: Cálculos de INSS e IRRF para Pró-labore e CLT.
- **Encargos Sociais**: INSS Patronal (20%), RAT (2%) e Terceiros (5,8%) para empresas de Lucro Presumido/Real.

---

_Desenvolvido para ajudar desenvolvedores a tomarem decisões financeiras mais inteligentes._

