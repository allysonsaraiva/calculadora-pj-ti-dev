import { useState, useMemo } from 'react';
import {
  calcAnexoIII,
  calcAnexoV,
  calcCLT,
  calcFaturamentoEquivalente,
} from '@/lib/calc';
import { fmt, pct } from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  const [faturamentoStr, setFaturamentoStr] = useState<string>('7500');
  const [contadorStr, setContadorStr] = useState<string>('150');

  // Estados CLT
  const [brutoCLTStr, setBrutoCLTStr] = useState<string>('5000');
  const [vrStr, setVrStr] = useState<string>('0');
  const [saudeStr, setSaudeStr] = useState<string>('0');
  const [outrosDescontosStr, setOutrosDescontosStr] = useState<string>('26.60');

  // Overrides manuais para bater com holerite
  const [inssCLTOverride, setInssCLTOverride] = useState<string>('');
  const [irrfCLTOverride, setIrrfCLTOverride] = useState<string>('');

  // Estado Proposta PJ
  const [propostaPJStr, setPropostaPJStr] = useState<string>('');

  const fat = parseInt(faturamentoStr) || 0;
  const contador = parseFloat(contadorStr) || 0;

  const brutoCLT = parseFloat(brutoCLTStr) || 0;
  const vr = parseFloat(vrStr) || 0;
  const saude = parseFloat(saudeStr) || 0;
  const outrosDescontos = parseFloat(outrosDescontosStr) || 0;

  const iii = useMemo(() => calcAnexoIII(fat), [fat]);
  const v = useMemo(() => calcAnexoV(fat), [fat]);
  const clt = useMemo(
    () => calcCLT(brutoCLT, vr + saude, outrosDescontos),
    [brutoCLT, vr, saude, outrosDescontos],
  );

  // Valores finais CLT considerando overrides
  const inssCLTFinal = inssCLTOverride === '' ? clt.inss : (parseFloat(inssCLTOverride) || 0);
  const irrfCLTFinal = irrfCLTOverride === '' ? clt.irrf : (parseFloat(irrfCLTOverride) || 0);
  const liquidoCLTReal = brutoCLT - inssCLTFinal - irrfCLTFinal - outrosDescontos;
  const totalMensalCLTReal = liquidoCLTReal + vr + saude + clt.fgts + clt.provisaoDecimo + clt.provisaoFerias;

  const minProlabore = fat * 0.28;

  const liquidoIIIFinal = iii.liquido - contador;
  const totalIIIFinal = iii.total + contador;
  const economia = v.total - iii.total;

  const totalVFinal = v.total + contador;
  const liquidoVFinal = v.liquido - contador;

  // Cálculo de Ponto de Equilíbrio
  const pontoEquilibrio = useMemo(
    () => calcFaturamentoEquivalente(totalMensalCLTReal, contador),
    [totalMensalCLTReal, contador],
  );

  // Valor da proposta PJ atual: se o usuário não digitar nada, usamos o break-even + 30%
  const fatProposta =
    propostaPJStr === ''
      ? Math.round(pontoEquilibrio * 1.3)
      : parseFloat(propostaPJStr) || 0;

  const resPJProposta = useMemo(() => calcAnexoIII(fatProposta), [fatProposta]);
  const liqPJProposta = resPJProposta.liquido - contador;
  const vantagem = liqPJProposta - totalMensalCLTReal;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col items-center text-center space-y-4 mb-8 mt-4">
          <Badge
            variant="outline"
            className="text-purple-400 border-purple-500/30 px-4 py-1 text-sm bg-purple-500/10"
          >
            Simulador Tributário 2026
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
            Calculadora PJ
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Decubra a melhor estratégia tributária e compare a viabilidade da
            pjotização frente ao modelo CLT.
          </p>
        </header>

        <Tabs defaultValue="calculadora" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger
                value="calculadora"
                className="px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
              >
                Calculadora Simples
              </TabsTrigger>
              <TabsTrigger
                value="comparativo"
                className="px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
              >
                Comparativo CLT/PJ
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calculadora" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Controls */}
              <div className="md:col-span-4 space-y-6">
                <Card className="bg-zinc-950/50 border-zinc-800 shadow-2xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Parâmetros</CardTitle>
                    <CardDescription className="text-zinc-500">
                      Ajuste seu faturamento e custos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label className="text-zinc-300">
                          Faturamento Mensal
                        </Label>
                        <span className="text-sm font-medium text-purple-400 transition-all">
                          {fmt(fat)}
                        </span>
                      </div>
                      <Slider
                        value={[fat]}
                        max={30000}
                        step={500}
                        onValueChange={(val) =>
                          setFaturamentoStr(val[0].toString())
                        }
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-zinc-300">Custos Contábeis</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">
                          R$
                        </span>
                        <Input
                          type="number"
                          value={contadorStr}
                          onChange={(e) => setContadorStr(e.target.value)}
                          className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200 transition-all"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/20 backdrop-blur-sm shadow-xl">
                  <CardContent className="pt-6">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Para cair no{' '}
                      <strong className="text-purple-400">Anexo III</strong>,
                      seu pró-labore precisa ser de no mínimo{' '}
                      <strong className="text-white">
                        {fmt(Math.round(minProlabore))}
                      </strong>{' '}
                      (28% de {fmt(fat)}).
                    </p>
                    <Separator className="my-4 bg-purple-500/20" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Isso reduz a alíquota efetiva do Simples de 15,5% para 6%,
                      gerando uma economia de{' '}
                      <strong className="text-emerald-400">
                        {fmt(Math.round(economia))}/mês
                      </strong>
                      .
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Results dashboard */}
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm cursor-help hover:bg-zinc-900/50 transition-all group">
                        <CardHeader className="p-4 sm:p-5">
                          <CardDescription className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Líquido no Bolso
                          </CardDescription>
                          <CardTitle className="text-xl sm:text-2xl text-emerald-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                            {fmt(Math.round(liquidoIIIFinal))}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                      <p className="font-semibold text-emerald-400">
                        Lucro Real Disponível
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        O valor que sobra após deduzir todos os impostos (DAS,
                        INSS, IRRF) e o custo fixo do contador. Representa o
                        montante que você pode transferir para sua conta pessoa
                        física sem mais tributação.
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm cursor-help hover:bg-zinc-900/50 transition-all group">
                        <CardHeader className="p-4 sm:p-5">
                          <CardDescription className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Total de Impostos
                          </CardDescription>
                          <CardTitle className="text-xl sm:text-2xl text-red-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                            {fmt(Math.round(totalIIIFinal))}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                      <p className="font-semibold text-red-500">
                        Custo Tributário Mensal
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Soma das obrigações mensais: <br />
                        • DAS: Imposto do Simples Nacional <br />
                        • INSS: 11% sobre o seu pró-labore <br />• IRRF: Imposto
                        de renda retido na fonte (se houver)
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm cursor-help hover:bg-zinc-900/50 transition-all group">
                        <CardHeader className="p-4 sm:p-5">
                          <CardDescription className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Carga Efetiva (Anexo III)
                          </CardDescription>
                          <CardTitle className="text-xl sm:text-2xl text-zinc-100 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                            {pct(totalIIIFinal / (fat || 1))}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                      <p className="font-semibold text-zinc-100">
                        Impacto Real no Faturamento
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        A porcentagem real que você paga de imposto sobre o
                        faturamento bruto. É o indicador mais importante para
                        comparar diferentes regimes e estratégias tributárias.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Card className="bg-zinc-950/80 border-zinc-800 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">
                      Detalhamento Financeiro
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Comparativo das retenções tributárias e descontos mensais.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                            <th className="py-3 font-medium">Descrição</th>
                            <th className="py-3 text-right font-medium">
                              Anexo III (6%)
                            </th>
                            <th className="py-3 text-right font-medium">
                              Anexo V (15.5%)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                          <tr className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 text-zinc-300">
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                                  Pró-labore
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                                  <p className="font-semibold text-purple-400">
                                    Salário do Sócio vs Faturamento
                                  </p>
                                  <p className="text-xs text-zinc-400 leading-relaxed">
                                    •{' '}
                                    <strong className="text-zinc-200">
                                      Faturamento (PJ)
                                    </strong>
                                    : É o valor total das NFs emitidas pela sua
                                    empresa. <br />•{' '}
                                    <strong className="text-zinc-200">
                                      Pró-labore (PF)
                                    </strong>
                                    : É o "salário" fixo que você recebe como
                                    sócio. Sobre ele incidem INSS e IRRF. <br />
                                    <br />
                                    <span className="text-zinc-500 italic">
                                      O que sobra após os impostos e o
                                      pró-labore é distribuído como Lucros
                                      (Isento de IR).
                                    </span>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="py-3 text-right text-zinc-300 transition-all">
                              {fmt(Math.round(iii.prolabore))}
                            </td>
                            <td className="py-3 text-right text-zinc-500 transition-all">
                              {fmt(Math.round(v.prolabore))}
                            </td>
                          </tr>
                          <tr className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 text-zinc-300">
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                                  DAS (Simples)
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 border-zinc-800 p-2">
                                  <p className="text-xs text-zinc-400">
                                    Base de Cálculo:{' '}
                                    <strong className="text-zinc-200">
                                      Faturamento Mensal (NF)
                                    </strong>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="py-3 text-right text-red-400/80 transition-all">
                              -{fmt(Math.round(iii.das))}
                            </td>
                            <td className="py-3 text-right text-red-400/40 transition-all">
                              -{fmt(Math.round(v.das))}
                            </td>
                          </tr>
                          <tr className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 text-zinc-300">
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                                  INSS (11%)
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 border-zinc-800 p-2">
                                  <p className="text-xs text-zinc-400">
                                    Base de Cálculo:{' '}
                                    <strong className="text-zinc-200">
                                      Valor do Pró-labore
                                    </strong>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="py-3 text-right text-red-400/80 transition-all">
                              -{fmt(Math.round(iii.inss))}
                            </td>
                            <td className="py-3 text-right text-red-400/40 transition-all">
                              -{fmt(Math.round(v.inss))}
                            </td>
                          </tr>
                          <tr className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 text-zinc-300">
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                                  IRRF
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 border-zinc-800 p-2">
                                  <p className="text-xs text-zinc-400">
                                    Base de Cálculo:{' '}
                                    <strong className="text-zinc-200">
                                      Valor do Pró-labore
                                    </strong>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              {iii.irrf === 0 && (
                                <span className="ml-3 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full inline-block align-middle transform -translate-y-px">
                                  Isento
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right text-red-400/80 transition-all">
                              -{fmt(Math.round(iii.irrf))}
                            </td>
                            <td className="py-3 text-right text-red-400/40 transition-all">
                              -{fmt(Math.round(v.irrf))}
                            </td>
                          </tr>
                          {contador > 0 && (
                            <tr className="hover:bg-zinc-900/30 transition-colors">
                              <td className="py-3 text-zinc-300">Contador</td>
                              <td className="py-3 text-right text-red-400/80 transition-all">
                                -{fmt(Math.round(contador))}
                              </td>
                              <td className="py-3 text-right text-red-400/40 transition-all">
                                -{fmt(Math.round(contador))}
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-zinc-700 font-semibold bg-zinc-900/20">
                            <td className="py-4 text-zinc-200 pl-2 rounded-bl-lg">
                              Total Retenções
                            </td>
                            <td className="py-4 text-right text-red-400 transition-all">
                              -{fmt(Math.round(totalIIIFinal))}
                            </td>
                            <td className="py-4 text-right text-red-400/50 pr-2 rounded-br-lg transition-all">
                              -{fmt(Math.round(totalVFinal))}
                            </td>
                          </tr>
                          <tr className="bg-emerald-500/5 border-t border-emerald-500/10">
                            <td className="py-4 px-3 rounded-l-lg text-emerald-400/90 font-bold tracking-wide">
                              Liquidez Final
                            </td>
                            <td className="py-4 text-right text-emerald-400 font-bold transition-all">
                              {fmt(Math.round(liquidoIIIFinal))}
                            </td>
                            <td className="py-4 px-3 rounded-r-lg text-right text-zinc-500 transition-all">
                              {fmt(Math.round(liquidoVFinal))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparativo" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Inputs CLT */}
              <div className="md:col-span-4 space-y-6">
                <Card className="bg-zinc-950/50 border-zinc-800 shadow-2xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">
                      Seus Dados CLT
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Insira os valores do seu holerite atual.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">
                        Salário Bruto Mensal
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">
                          R$
                        </span>
                        <Input
                          type="number"
                          value={brutoCLTStr}
                          onChange={(e) => setBrutoCLTStr(e.target.value)}
                          className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">VR / VA</Label>
                        <Input
                          type="number"
                          value={vrStr}
                          onChange={(e) => setVrStr(e.target.value)}
                          className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Plano Saúde</Label>
                        <Input
                          type="number"
                          value={saudeStr}
                          onChange={(e) => setSaudeStr(e.target.value)}
                          className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                      <div className="space-y-2">
                        <Label className="uppercase text-red-300">INSS (Holerite)</Label>
                        <Input
                          type="number"
                          placeholder={clt.inss.toFixed(2)}
                          value={inssCLTOverride}
                          onChange={(e) => setInssCLTOverride(e.target.value)}
                          className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase text-red-300">IRRF (Holerite)</Label>
                        <Input
                          type="number"
                          placeholder={clt.irrf.toFixed(2)}
                          value={irrfCLTOverride}
                          onChange={(e) => setIrrfCLTOverride(e.target.value)}
                          className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-red-300">
                        Outros Descontos (VR em folha, etc.)
                      </Label>
                      <Input
                        type="number"
                        value={outrosDescontosStr}
                        onChange={(e) => setOutrosDescontosStr(e.target.value)}
                        className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                      />
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-semibold">
                        Custo do Contador (Serviço Mensal)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">
                          R$
                        </span>
                        <Input
                          type="number"
                          value={contadorStr}
                          onChange={(e) => setContadorStr(e.target.value)}
                          className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-purple-500 text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-zinc-300 font-semibold">
                        Proposta PJ Recebida
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">
                          R$
                        </span>
                        <Input
                          type="number"
                          placeholder={Math.round(pontoEquilibrio).toString()}
                          value={propostaPJStr}
                          onChange={(e) => setPropostaPJStr(e.target.value)}
                          className="pl-9 bg-purple-500/10 border-purple-500/30 focus-visible:ring-purple-500 text-purple-200"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 italic">
                        Ponto de equilíbrio (mesmo ganho da CLT):{' '}
                        <strong className="text-zinc-400">
                          {fmt(Math.round(pontoEquilibrio))}
                        </strong>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Results */}
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CLT Card */}
                  <Card className="bg-zinc-900/30 border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                      <Badge className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800">
                        Modelo Atual
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-zinc-100 flex items-baseline gap-2">
                        {fmt(Math.round(clt.liquido + vr + saude))}
                        <span className="text-sm font-normal text-zinc-500">
                          /mês líq.
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Patrimônio mensal gerado (c/ provisões)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-zinc-400">
                          <span>Salário Líquido (Banco)</span>
                          <span className="text-zinc-200">
                            {fmt(Math.round(liquidoCLTReal))}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Benefícios (VR/Saúde)</span>
                          <span className="text-zinc-200">
                            +{fmt(Math.round(vr + saude))}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400 border-t border-zinc-800/50 pt-2">
                          <span>FGTS mensal (8%)</span>
                          <span className="text-emerald-500">
                            +{fmt(Math.round(clt.fgts))}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>13º e Férias (Provisão)</span>
                          <span className="text-emerald-500">
                            +
                            {fmt(
                              Math.round(
                                clt.provisaoDecimo + clt.provisaoFerias,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                      <Separator className="bg-zinc-800" />
                      <div className="flex justify-between font-bold text-zinc-100">
                        <span>Total Acumulado/mês</span>
                        <span className="text-emerald-400">
                          {fmt(Math.round(totalMensalCLTReal))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PJ Card */}
                  <Card className="bg-purple-500/5 border-purple-500/20 relative overflow-hidden group border-2">
                    <div className="absolute top-0 right-0 p-3">
                      <Badge className="bg-purple-500 text-white">
                        Cenário PJ (Anexo III)
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-zinc-100 flex items-baseline gap-2">
                        {fmt(Math.round(liqPJProposta))}
                        <span className="text-sm font-normal text-zinc-500">
                          /mês líq.
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Sobrando na sua conta pessoal
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-zinc-400">
                          <span>Faturamento (Proposta)</span>
                          <span className="text-zinc-200">
                            {fmt(Math.round(fatProposta))}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Impostos (Est. 6% DAS + INSS)</span>
                          <span className="text-red-400">
                            -{fmt(Math.round(resPJProposta.total))}
                          </span>
                        </div>
                        {contador > 0 && (
                          <div className="flex justify-between text-zinc-400">
                            <span>Contador</span>
                            <span className="text-red-400">
                              -{fmt(Math.round(contador))}
                            </span>
                          </div>
                        )}
                      </div>
                      <Separator className="bg-purple-500/10" />
                      <div className="flex justify-between font-bold text-zinc-100 pt-2">
                        <span>Ganho Real PJ</span>
                        <span className="text-purple-400">
                          {fmt(Math.round(liqPJProposta))}
                        </span>
                      </div>
                      <div
                        className={`mt-4 p-3 rounded-lg text-center font-bold text-sm ${vantagem > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                      >
                        {vantagem > 0
                          ? `Você lucra ${fmt(Math.round(vantagem))} a mais por mês!`
                          : `PJ desvantajoso em ${fmt(Math.round(Math.abs(vantagem)))}`}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-zinc-950/50 border-zinc-800 border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-zinc-100 flex items-center gap-2">
                        Quanto você custa hoje
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">?</div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Soma do Salário Bruto + INSS Patronal (20%) + RAT + Sistema S (Terceiros) + FGTS + Provisões de 13º e Férias.
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                      <CardDescription>O "teto" real para sua negociação PJ</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-400">
                        {fmt(Math.round(clt.custoEmpresa))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">
                        Este é o valor total que seu patrão "desembolsa" por você mensalmente.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
                    <CardHeader>
                      <CardTitle className="text-zinc-100">Alvo de Negociação (Win-Win)</CardTitle>
                      <CardDescription>O valor justo que divide a economia</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-emerald-400">
                        {fmt(Math.round((clt.custoEmpresa + pontoEquilibrio) / 2))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">
                        Sugestão: Peça este valor para que tanto você quanto a empresa saiam ganhando.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-zinc-950/50 border-zinc-800">
                  <CardContent className="pt-6 text-sm text-zinc-400 leading-relaxed space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                      <div className="flex-1">
                        <p className="text-zinc-200 font-medium">
                          Análise de Rendimento
                        </p>
                        <p className="text-xs">
                          Sua proposta PJ de{' '}
                          <span className="text-purple-400">
                            {fmt(Math.round(fatProposta))}
                          </span>{' '}
                          equivale a aproximadamente
                          <span className="text-white font-bold">
                            {' '}
                            {(fatProposta / (brutoCLT || 1)).toFixed(2)}x{' '}
                          </span>
                          o seu salário bruto CLT.
                          {vantagem > 0
                            ? ' Essa é uma excelente proposta de migração.'
                            : ' O mercado costuma recomendar ao menos 1.5x a 1.7x para compensar a perda de direitos.'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <p>
                        O ponto de equilíbrio calculado (
                        <strong className="text-white">
                          {fmt(Math.round(pontoEquilibrio))}
                        </strong>
                        ) é o valor mínimo para manter seu padrão atual.
                      </p>
                      <p>
                        Para a empresa, qualquer valor abaixo de{' '}
                        <strong className="text-orange-400">
                          {fmt(Math.round(clt.custoEmpresa))}
                        </strong>{' '}
                        PJ é lucro comparado a te manter na CLT.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

