# Calculadora PJ TI/Programador — Simples Nacional

Simulador de impostos e líquido mensal para desenvolvedores e profissionais de TI que atuam como Pessoa Jurídica (ME) no regime do Simples Nacional.

## Funcionalidades

- **Slider de faturamento** — simula de R$ 3.000 a R$ 30.000 em tempo real
- **Comparativo Anexo III vs Anexo V** — mostra qual regime se aplica e a diferença de carga tributária
- **Cálculo de IRRF** atualizado com a tabela progressiva 2026 (MP 1.294/2025 + Lei 15.270/2025)
- **Campo opcional de honorário do contador** — quando preenchido, entra automaticamente no cálculo e aparece como linha separada no breakdown
- **Resumo visual** com métricas de faturamento, total de impostos, líquido no bolso e economia vs Anexo V
- **Breakdown completo** de todos os custos (DAS, INSS, IRRF, contador)
- **Dark mode** nativo via `prefers-color-scheme`

## Como usar

Basta abrir o arquivo `index.html` diretamente no navegador — sem dependências, sem build, sem servidor.

```bash
# Clonar ou baixar o arquivo e abrir
open index.html
```

## Cálculos

### Anexo III (recomendado)

Aplicável quando o pró-labore representa **≥ 28% do faturamento**.

| Item       | Cálculo                                    |
| ---------- | ------------------------------------------ |
| DAS        | 6% sobre o faturamento                     |
| Pró-labore | 28% do faturamento                         |
| INSS       | 11% sobre o pró-labore                     |
| IRRF       | Tabela progressiva 2026 sobre o pró-labore |

### Anexo V (evitar)

Aplicável quando o pró-labore representa **< 28% do faturamento**.

| Item       | Cálculo                                    |
| ---------- | ------------------------------------------ |
| DAS        | 15,5% sobre o faturamento                  |
| Pró-labore | ~5% do faturamento                         |
| INSS       | 11% sobre o pró-labore                     |
| IRRF       | Tabela progressiva 2026 sobre o pró-labore |

### IRRF 2026

Tabela vigente desde maio/2025 conforme MP 1.294/2025 e Reforma da Renda (Lei 15.270/2025):

| Base de cálculo           | Alíquota | Dedução   |
| ------------------------- | -------- | --------- |
| Até R$ 2.428,80           | —        | Isento    |
| R$ 2.428,81 a R$ 2.826,65 | 7,5%     | R$ 182,16 |
| R$ 2.826,66 a R$ 3.751,05 | 15%      | R$ 394,16 |
| R$ 3.751,06 a R$ 4.664,68 | 22,5%    | R$ 675,49 |
| Acima de R$ 4.664,68      | 27,5%    | R$ 908,73 |

Redutor adicional (Lei 15.270/2025):

- Renda ≤ R$ 5.000 → isenção total
- R$ 5.000,01 a R$ 7.350 → redutor = `978,62 - (0,133145 × renda)`
- Acima de R$ 7.350 → sem redutor

### Campo do contador

Quando informado, o valor é:

- Deduzido do líquido final
- Exibido como linha separada nos cards de Anexo III e Anexo V
- Incluído no breakdown detalhado com a nota "Honorário mensal"
- Refletido no label "Total impostos + contador" nos cards de resumo

Quando zerado (padrão), é completamente ignorado — o cálculo fica idêntico ao cenário sem contador.

## Tecnologias

HTML, CSS e JavaScript puros — zero dependências externas.

## Aviso

> Os valores são estimativas para fins de simulação. Consulte um contador para decisões financeiras.
> Fontes: Receita Federal · [gov.br/receitafederal/tabelas/2026](https://www.gov.br/receitafederal)
