const fmt = (v) =>
  "R$ " +
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const pct = (v) => (v * 100).toFixed(1) + "%";

// Tabela IRRF 2026 — vigente desde mai/2025 (MP 1.294/2025) + Reforma da Renda (Lei 15.270/2025)
// Fonte: Receita Federal — gov.br/receitafederal/tabelas/2026
function calcIRRF(base) {
  // Passo 1: tabela progressiva base (sem alteração nas alíquotas, só faixas atualizadas)
  let irrf = 0;
  if (base <= 2428.8) irrf = 0;
  else if (base <= 2826.65) irrf = base * 0.075 - 182.16;
  else if (base <= 3751.05) irrf = base * 0.15 - 394.16;
  else if (base <= 4664.68) irrf = base * 0.225 - 675.49;
  else irrf = base * 0.275 - 908.73;

  // Passo 2: redutor adicional — Lei 15.270/2025 (vigor jan/2026)
  // Faixa 1: renda ≤ R$ 5.000 → redução de até R$ 312,89 (zera o imposto)
  // Faixa 2: R$ 5.000,01 a R$ 7.350 → redução = 978,62 - (0,133145 × renda)
  // Acima de R$ 7.350 → sem redutor
  // Nota: o redutor usa a renda bruta (pró-labore), não a base
  if (base <= 5000) {
    irrf = 0; // isenção total
  } else if (base <= 7350) {
    const redutor = 978.62 - 0.133145 * base;
    irrf = Math.max(0, irrf - redutor);
  }
  return irrf;
}

function calcAnexoIII(fat) {
  const aliq = 0.06;
  const das = fat * aliq;
  const prolabore = fat * 0.28;
  const inss = prolabore * 0.11;
  const irrf = calcIRRF(prolabore);
  const total = das + inss + irrf;
  const liquido = fat - total;
  return { das, prolabore, inss, irrf, total, liquido, aliq };
}

function calcAnexoV(fat) {
  const aliq = 0.155;
  const das = fat * aliq;
  const prolabore = fat * 0.05;
  const inss = prolabore * 0.11;
  const irrf = calcIRRF(prolabore);
  const total = das + inss + irrf;
  const liquido = fat - total;
  return { das, prolabore, inss, irrf, total, liquido, aliq };
}

function buildRows(data, anexo, contador = 0) {
  const liquidoFinal = data.liquido - contador;
  const totalFinal = data.total + contador;
  const rows = [
    {
      desc: "Faturamento (NF)",
      val: data.das + data.inss + data.irrf + data.liquido,
      cls: "",
    },
    {
      desc: `DAS (${(data.aliq * 100).toFixed(1)}%)`,
      val: -Math.round(data.das),
      cls: "r",
    },
    {
      desc: `Pró-labore (${anexo === "iii" ? "28%" : "~5%"})`,
      val: Math.round(data.prolabore),
      cls: "",
    },
    {
      desc: "INSS (11% pró-labore)",
      val: -Math.round(data.inss),
      cls: "r",
    },
    {
      desc: "IRRF",
      val: -Math.round(data.irrf),
      cls: "r",
      note: data.irrf === 0 ? "Isento nesta faixa" : "",
    },
    ...(contador > 0
      ? [
          {
            desc: "Contador",
            val: -Math.round(contador),
            cls: "r",
            note: "Honorário mensal",
          },
        ]
      : []),
    {
      desc: "Total impostos" + (contador > 0 ? " + contador" : ""),
      val: -Math.round(totalFinal),
      cls: "r",
    },
    {
      desc: "Líquido no bolso",
      val: Math.round(liquidoFinal),
      cls: "g big",
    },
  ];
  return rows
    .map(
      (r) => `
        <div class="row">
          <span class="desc">${r.desc}${r.note ? `<span class="note">${r.note}</span>` : ""}</span>
          <span class="val ${r.cls}">${r.val < 0 ? "-" : ""}${fmt(Math.abs(r.val))}</span>
        </div>
      `,
    )
    .join("");
}

function render() {
  const fat = parseInt(document.getElementById("fat-slider").value);
  const contador =
    parseFloat(document.getElementById("contador-input").value) || 0;
  document.getElementById("fat-display").textContent = fmt(fat);

  const iii = calcAnexoIII(fat);
  const v = calcAnexoV(fat);
  const minProlabore = fat * 0.28;

  // Liquido considerando contador
  const liquidoIIIFinal = iii.liquido - contador;
  const liquidoVFinal = v.liquido - contador;
  const totalIIIFinal = iii.total + contador;
  const totalVFinal = v.total + contador;

  document.getElementById("info-box").innerHTML =
    `Para cair no <strong>Anexo III</strong>, seu pró-labore precisa ser de no mínimo <strong>${fmt(Math.round(minProlabore))}</strong> (28% de ${fmt(fat)}). Com isso, a alíquota efetiva cai de 15,5% para 6%, economizando <strong>${fmt(Math.round(v.total - iii.total))}/mês</strong>.`;

  document.getElementById("rows-iii").innerHTML = buildRows(
    iii,
    "iii",
    contador,
  );
  document.getElementById("sub-iii").textContent =
    "Carga efetiva: " + pct(totalIIIFinal / fat);
  document.getElementById("rows-v").innerHTML = buildRows(v, "v", contador);
  document.getElementById("sub-v").textContent =
    "Carga efetiva: " + pct(totalVFinal / fat);

  document.getElementById("summary-cards").innerHTML = `
        <div class="metric"><p class="label">Faturamento (NF)</p><p class="value">${fmt(fat)}</p></div>
        <div class="metric"><p class="label">Total de impostos${contador > 0 ? " + contador" : ""}</p><p class="value">${fmt(Math.round(totalIIIFinal))}</p><p class="sub">Carga efetiva ${pct(totalIIIFinal / fat)}</p></div>
        <div class="metric g"><p class="label">Líquido no bolso</p><p class="value">${fmt(Math.round(liquidoIIIFinal))}</p></div>
        <div class="metric r"><p class="label">Economia vs Anexo V</p><p class="value">${fmt(Math.round(v.total - iii.total))}</p><p class="sub">por mês</p></div>
      `;

  const details = [
    {
      desc: "DAS — Simples Nacional (6%)",
      note: "Anexo III, 1ª faixa",
      val: -Math.round(iii.das),
    },
    {
      desc: "INSS sócio (11% sobre pró-labore)",
      note: "Contribuição previdenciária",
      val: -Math.round(iii.inss),
    },
    {
      desc: "IRRF (tabela progressiva)",
      note: iii.irrf === 0 ? "Isento nesta faixa" : "",
      val: -Math.round(iii.irrf),
    },
    ...(contador > 0
      ? [
          {
            desc: "Honorário do contador",
            note: "Custo mensal fixo",
            val: -Math.round(contador),
          },
        ]
      : []),
    {
      desc: "Total de deduções",
      note: "",
      val: -Math.round(totalIIIFinal),
    },
    { desc: "Líquido final", note: "", val: Math.round(liquidoIIIFinal) },
  ];

  document.getElementById("detail-rows").innerHTML = details
    .map(
      (r) => `
        <div class="row">
          <span class="desc">${r.desc}${r.note ? `<span class="note">${r.note}</span>` : ""}</span>
          <span class="val ${r.val < 0 ? "r" : r.desc.includes("Líquido") ? "g big" : ""}">
            ${r.val < 0 ? "-" : ""}${fmt(Math.abs(r.val))}
          </span>
        </div>
      `,
    )
    .join("");
}

document.getElementById("fat-slider").addEventListener("input", render);
document.getElementById("contador-input").addEventListener("input", render);
render();
