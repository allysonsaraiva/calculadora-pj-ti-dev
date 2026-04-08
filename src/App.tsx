import { useState, useMemo } from "react"
import { calcAnexoIII, calcAnexoV } from "@/lib/calc"
import { fmt, pct } from "@/lib/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

function App() {
  const [faturamentoStr, setFaturamentoStr] = useState<string>("7500")
  const [contadorStr, setContadorStr] = useState<string>("150")

  const fat = parseInt(faturamentoStr) || 0
  const contador = parseFloat(contadorStr) || 0

  const iii = useMemo(() => calcAnexoIII(fat), [fat])
  const v = useMemo(() => calcAnexoV(fat), [fat])
  
  const minProlabore = fat * 0.28
  
  const liquidoIIIFinal = iii.liquido - contador
  const totalIIIFinal = iii.total + contador
  const economia = v.total - iii.total

  const totalVFinal = v.total + contador
  const liquidoVFinal = v.liquido - contador

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col items-center text-center space-y-4 mb-12 mt-8">
          <Badge variant="outline" className="text-purple-400 border-purple-500/30 px-4 py-1 text-sm bg-purple-500/10">
            Simulador Tributário 2026
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
            Calculadora PJ
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Descubra a melhor estratégia tributária (Anexo III vs V) e otimize seus lucros aplicando as novas regras da base de isenção de IR.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="md:col-span-4 space-y-6">
            <Card className="bg-zinc-950/50 border-zinc-800 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-zinc-100">Parâmetros</CardTitle>
                <CardDescription className="text-zinc-500">Ajuste seu faturamento e custos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-zinc-300">Faturamento Mensal</Label>
                    <span className="text-sm font-medium text-purple-400 transition-all">{fmt(fat)}</span>
                  </div>
                  <Slider
                    value={[fat]}
                    max={30000}
                    step={500}
                    onValueChange={(val) => setFaturamentoStr(val[0].toString())}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-zinc-300">Custos Contábeis</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">R$</span>
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

            <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Para cair no <strong className="text-purple-400">Anexo III</strong>, seu pró-labore precisa ser de no mínimo <strong className="text-white">{fmt(Math.round(minProlabore))}</strong> (28% de {fmt(fat)}).
                </p>
                <Separator className="my-4 bg-purple-500/20" />
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Isso reduz a alíquota efetiva do Simples de 15,5% para 6%, gerando uma economia de <strong className="text-emerald-400">{fmt(Math.round(economia))}/mês</strong>.
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
                      <CardDescription className="text-zinc-500 group-hover:text-zinc-400 transition-colors">Líquido no Bolso</CardDescription>
                      <CardTitle className="text-xl sm:text-2xl text-emerald-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {fmt(Math.round(liquidoIIIFinal))}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                  <p className="font-semibold text-emerald-400">Lucro Real Disponível</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    O valor que sobra após deduzir todos os impostos (DAS, INSS, IRRF) e o custo fixo do contador. Representa o montante que você pode transferir para sua conta pessoa física sem mais tributação.
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm cursor-help hover:bg-zinc-900/50 transition-all group">
                    <CardHeader className="p-4 sm:p-5">
                      <CardDescription className="text-zinc-500 group-hover:text-zinc-400 transition-colors">Total de Impostos</CardDescription>
                      <CardTitle className="text-xl sm:text-2xl text-red-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {fmt(Math.round(totalIIIFinal))}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                  <p className="font-semibold text-red-500">Custo Tributário Mensal</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Soma das obrigações mensais: <br />
                    • DAS: Imposto do Simples Nacional <br />
                    • INSS: 11% sobre o seu pró-labore <br />
                    • IRRF: Imposto de renda retido na fonte (se houver)
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-sm cursor-help hover:bg-zinc-900/50 transition-all group">
                    <CardHeader className="p-4 sm:p-5">
                      <CardDescription className="text-zinc-500 group-hover:text-zinc-400 transition-colors">Carga Efetiva (Anexo III)</CardDescription>
                      <CardTitle className="text-xl sm:text-2xl text-zinc-100 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {pct(totalIIIFinal / (fat || 1))}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs space-y-2">
                  <p className="font-semibold text-zinc-100">Impacto Real no Faturamento</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A porcentagem real que você paga de imposto sobre o faturamento bruto. É o indicador mais importante para comparar diferentes regimes e estratégias tributárias.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Card className="bg-zinc-950/80 border-zinc-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-zinc-100">Detalhamento Financeiro</CardTitle>
                <CardDescription className="text-zinc-500">Comparativo das retenções tributárias e descontos mensais.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                        <th className="py-3 font-medium">Descrição</th>
                        <th className="py-3 text-right font-medium">Anexo III (6%)</th>
                        <th className="py-3 text-right font-medium">Anexo V (15.5%)</th>
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
                              <p className="font-semibold text-purple-400">Salário do Sócio vs Faturamento</p>
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                • <strong className="text-zinc-200">Faturamento (PJ)</strong>: É o valor total das NFs emitidas pela sua empresa. <br />
                                • <strong className="text-zinc-200">Pró-labore (PF)</strong>: É o "salário" fixo que você recebe como sócio. Sobre ele incidem INSS e IRRF. <br /><br />
                                <span className="text-zinc-500 italic">O que sobra após os impostos e o pró-labore é distribuído como Lucros (Isento de IR).</span>
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-3 text-right text-zinc-300 transition-all">{fmt(Math.round(iii.prolabore))}</td>
                        <td className="py-3 text-right text-zinc-500 transition-all">{fmt(Math.round(v.prolabore))}</td>
                      </tr>
                      <tr className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3 text-zinc-300">
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                              DAS (Simples)
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-900 border-zinc-800 p-2">
                              <p className="text-xs text-zinc-400">Base de Cálculo: <strong className="text-zinc-200">Faturamento Mensal (NF)</strong></p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-3 text-right text-red-400/80 transition-all">-{fmt(Math.round(iii.das))}</td>
                        <td className="py-3 text-right text-red-400/40 transition-all">-{fmt(Math.round(v.das))}</td>
                      </tr>
                      <tr className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3 text-zinc-300">
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                              INSS (11%)
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-900 border-zinc-800 p-2">
                              <p className="text-xs text-zinc-400">Base de Cálculo: <strong className="text-zinc-200">Valor do Pró-labore</strong></p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-3 text-right text-red-400/80 transition-all">-{fmt(Math.round(iii.inss))}</td>
                        <td className="py-3 text-right text-red-400/40 transition-all">-{fmt(Math.round(v.inss))}</td>
                      </tr>
                      <tr className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3 text-zinc-300">
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger className="cursor-help hover:text-white transition-colors underline decoration-dotted decoration-zinc-600 underline-offset-4">
                              IRRF
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-900 border-zinc-800 p-2">
                              <p className="text-xs text-zinc-400">Base de Cálculo: <strong className="text-zinc-200">Valor do Pró-labore</strong></p>
                            </TooltipContent>
                          </Tooltip>
                          {iii.irrf === 0 && <span className="ml-3 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full inline-block align-middle transform -translate-y-px">Isento</span>}
                        </td>
                        <td className="py-3 text-right text-red-400/80 transition-all">-{fmt(Math.round(iii.irrf))}</td>
                        <td className="py-3 text-right text-red-400/40 transition-all">-{fmt(Math.round(v.irrf))}</td>
                      </tr>
                      {contador > 0 && (
                        <tr className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 text-zinc-300">Contador</td>
                          <td className="py-3 text-right text-red-400/80 transition-all">-{fmt(Math.round(contador))}</td>
                          <td className="py-3 text-right text-red-400/40 transition-all">-{fmt(Math.round(contador))}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-700 font-semibold bg-zinc-900/20">
                        <td className="py-4 text-zinc-200 pl-2 rounded-bl-lg">Total Retenções</td>
                        <td className="py-4 text-right text-red-400 transition-all">-{fmt(Math.round(totalIIIFinal))}</td>
                        <td className="py-4 text-right text-red-400/50 pr-2 rounded-br-lg transition-all">-{fmt(Math.round(totalVFinal))}</td>
                      </tr>
                      <tr className="bg-emerald-500/5 border-t border-emerald-500/10">
                        <td className="py-4 px-3 rounded-l-lg text-emerald-400/90 font-bold tracking-wide">Liquidez Final</td>
                        <td className="py-4 text-right text-emerald-400 font-bold transition-all">{fmt(Math.round(liquidoIIIFinal))}</td>
                        <td className="py-4 px-3 rounded-r-lg text-right text-zinc-500 transition-all">{fmt(Math.round(liquidoVFinal))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default App
