import React, { useState } from 'react';
import { 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Coins, 
  Building, 
  User, 
  Percent,
  Calendar,
  FileCheck2,
  Info,
  TrendingUp,
  FileDown
} from 'lucide-react';
import { ContratoMutuo, Empresa, Accionista } from '../types';
import { formatUSD, formatVES, formatFechaLarga } from '../utils/formatters';
import { downloadMemoriaCalculoExcel } from '../utils/csvExport';
import { 
  generateReciboInteresesText, 
  downloadReciboInteresesWord, 
  downloadReciboInteresesPDF 
} from '../utils/documentExport';

interface MonthlyCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato?: ContratoMutuo | null;
  empresa: Empresa;
  accionista?: Accionista | null;
  tasaBCVActual?: number;
  tasaBCV?: number;
}

export const MonthlyCalculationModal: React.FC<MonthlyCalculationModalProps> = ({
  isOpen,
  onClose,
  contrato,
  empresa,
  accionista,
  tasaBCVActual,
  tasaBCV,
}) => {
  const effectiveBCV = tasaBCVActual || tasaBCV || 43.20;
  const [activeTab, setActiveTab] = useState<'memoria' | 'nota_debito' | 'recibo' | 'marco_legal'>('memoria');
  const [tasaAnual, setTasaAnual] = useState<number>(contrato?.tasa_interes_anual || 12);
  const [tasaBCVCierre, setTasaBCVCierre] = useState<number>(effectiveBCV ? Number((effectiveBCV * 1.025).toFixed(2)) : 44.50);
  const [diasLiquidacion, setDiasLiquidacion] = useState<number>(30);
  const [tipoBeneficiario, setTipoBeneficiario] = useState<'pn_residente' | 'pj_domiciliada' | 'no_residente'>('pn_residente');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !contrato || !accionista) return null;

  // Fiscal calculations
  const montoUSD = contrato.monto_indexado_usd || (contrato.tipo_activo === 'VES' ? contrato.monto_original / contrato.tasa_bcv_fecha : contrato.monto_original);
  const montoOperacionVES = contrato.monto_original * (contrato.tipo_activo === 'VES' ? 1 : contrato.tasa_bcv_fecha);
  
  // Daily interest accrued in USD
  const interesMesUSD = (montoUSD * (tasaAnual / 100) * diasLiquidacion) / 360;
  // Converted to VES at month-end BCV rate
  const interesMesVES = interesMesUSD * tasaBCVCierre;

  // Retention percentage per Decree 1808
  const pctRetencion = tipoBeneficiario === 'pn_residente' ? 5 : (tipoBeneficiario === 'pj_domiciliada' ? 3 : 34);
  const retencionISLRVES = (interesMesVES * pctRetencion) / 100;
  const netoACobrarVES = interesMesVES - retencionISLRVES;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    downloadMemoriaCalculoExcel(contrato, empresa, accionista, tasaBCVCierre, tasaAnual, pctRetencion);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Memoria de Cálculo de Intereses Indexados & Nota de Débito
                </h2>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  {contrato.correlativo}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Indexación con Doble Moneda (USD / Bs. BCV) • Tasa 12% USD • Art. 73 LISLR & No Sujeto a IVA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadReciboInteresesWord(contrato, empresa, accionista, 'Cierre Mensual 2026', tasaBCVCierre)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar Recibo Mensual de Intereses en formato Word (.doc)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Recibo Word</span>
            </button>

            <button
              onClick={() => downloadReciboInteresesPDF(contrato, empresa, accionista, 'Cierre Mensual 2026', tasaBCVCierre)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar Recibo Mensual de Intereses en formato PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Recibo PDF</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar Memoria de Cálculo en formato Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Descargar Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('memoria')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'memoria'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Memoria de Cálculo (Doble Moneda)</span>
            </button>

            <button
              onClick={() => setActiveTab('recibo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'recibo'
                  ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Recibo Mensual de Intereses</span>
            </button>

            <button
              onClick={() => setActiveTab('nota_debito')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'nota_debito'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Nota de Débito Fiscal (No Sujeta a IVA)</span>
            </button>

            <button
              onClick={() => setActiveTab('marco_legal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'marco_legal'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Blindaje SENIAT (Art. 73 LISLR & LIVA)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tasa BCV de Corte: <strong>Bs. {tasaBCVCierre.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">

          {/* Interactive Parameters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tasa Anual Indexada (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={tasaAnual}
                  onChange={(e) => setTasaAnual(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Fijado al 12% en contrato indexado</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tasa BCV Cierre de Mes (Bs./USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={tasaBCVCierre}
                  onChange={(e) => setTasaBCVCierre(Number(e.target.value))}
                  className="w-full pl-3 pr-10 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Bs.</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Tasa oficial de corte del mes</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Días de Causación del Mes
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diasLiquidacion}
                  onChange={(e) => setDiasLiquidacion(Number(e.target.value))}
                  className="w-full pl-3 pr-12 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Días</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Base comercial: 360 días anuales</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Retención ISLR (Decreto 1808)
              </label>
              <select
                value={tipoBeneficiario}
                onChange={(e) => setTipoBeneficiario(e.target.value as any)}
                className="w-full px-3 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="pn_residente">Persona Natural Residente (5%)</option>
                <option value="pj_domiciliada">Persona Jurídica Domiciliada (3%)</option>
                <option value="no_residente">No Residente / No Domiciliado (34%)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Alícuota s/ 100% intereses brutos</p>
            </div>
          </div>

          {/* TAB 1: MEMORIA DE CÁLCULO (DOBLE COLUMNA) */}
          {activeTab === 'memoria' && (
            <div className="space-y-4">
              
              {/* Alert notice about double currency */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <p className="font-bold text-blue-950">
                    Mecánica de Indexación con Doble Moneda (Moneda de Cuenta USD / Moneda de Pago Bs.):
                  </p>
                  <p>
                    Para blindar la operación ante el SENIAT y evitar la licuación inflacionaria, la columna 1 registra el movimiento en Bolívares tal como salió del banco, mientras la columna 2 congela su valor en Dólares a la tasa BCV de la fecha exacta. <strong>El cálculo de la tasa del 12% anual se aplica directamente a la columna en Dólares (USD).</strong> Al corte mensual, el resultado se multiplica por la tasa BCV vigente para liquidar la Nota de Débito Fiscal.
                  </p>
                </div>
              </div>

              {/* Two-column table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Libro Auxiliar de Movimientos e Intereses Diarios</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Moneda de Cuenta: USD
                    </span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Período: {diasLiquidacion} Días
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-[11px] font-bold">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Concepto / Operación</th>
                        <th className="py-2.5 px-3">Ref. Bancaria</th>
                        <th className="py-2.5 px-3 text-right bg-amber-50/50 text-amber-900">
                          Col. 1: Mov. Banco (Bs.)
                        </th>
                        <th className="py-2.5 px-3 text-right">Tasa BCV Fecha</th>
                        <th className="py-2.5 px-3 text-right bg-blue-50/50 text-blue-900">
                          Col. 2: Congelado (USD)
                        </th>
                        <th className="py-2.5 px-3 text-right font-bold text-slate-900">
                          Saldo Deudor USD
                        </th>
                        <th className="py-2.5 px-3 text-center">Días</th>
                        <th className="py-2.5 px-3 text-right bg-emerald-50 text-emerald-950 font-bold">
                          Interés ({tasaAnual}% USD)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-700">{contrato.fecha_inicio}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          Disposición Inicial de Fondos
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {contrato.soporte.referencia_bancaria || 'TRANSF-001'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold bg-amber-50/30 text-amber-900">
                          {formatVES(montoOperacionVES)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          Bs. {contrato.tasa_bcv_fecha.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold bg-blue-50/30 text-blue-900">
                          ${formatUSD(montoUSD)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ${formatUSD(montoUSD)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {diasLiquidacion}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold bg-emerald-50/80 text-emerald-800">
                          ${formatUSD(interesMesUSD)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                        <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px]">
                          Totales del Período:
                        </td>
                        <td className="py-3 px-3 text-right font-mono bg-amber-50/80 text-amber-950">
                          {formatVES(montoOperacionVES)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">-</td>
                        <td className="py-3 px-3 text-right font-mono bg-blue-50/80 text-blue-950">
                          ${formatUSD(montoUSD)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-900">
                          ${formatUSD(montoUSD)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{diasLiquidacion}</td>
                        <td className="py-3 px-3 text-right font-mono bg-emerald-100 text-emerald-950 text-sm">
                          ${formatUSD(interesMesUSD)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Monthly settlement summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Total Intereses USD</span>
                    <Coins className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    ${formatUSD(interesMesUSD)} USD
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Causado: ({formatUSD(montoUSD)} × {tasaAnual}% × {diasLiquidacion}) / 360
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Conversión BCV Cierre</span>
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-700">
                    {formatVES(interesMesVES)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Base para Nota de Débito (Tasa: Bs. {tasaBCVCierre.toFixed(2)})
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Retención ISLR ({pctRetencion}%)</span>
                    <Percent className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-600">
                    - {formatVES(retencionISLRVES)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Neto a liquidar: <strong>{formatVES(netoACobrarVES)}</strong>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: NOTA DE DÉBITO FISCAL OFICIAL */}
          {activeTab === 'nota_debito' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  Modelo oficial de <strong>Nota de Débito Fiscal Exenta/No Sujeta de IVA</strong> emitida por la empresa conforme a la Providencia SNAT/2011/00071 del SENIAT y Art. 16 Num 3 LIVA.
                </div>
                <button
                  onClick={() => handleCopy(`NOTA DE DÉBITO FISCAL NRO: ND-${contrato.correlativo.replace('MUT-', '')}\nEMISOR: ${empresa.razon_social} (RIF: ${empresa.rif_empresa})\nRECEPTOR: ${accionista.nombre_accionista} (CI: ${accionista.cedula_accionista}, RIF: ${accionista.rif_accionista})\nCONCEPTO: Intereses devengados s/ Contrato de Mutuo Indexado Nro. ${contrato.correlativo} ($${formatUSD(interesMesUSD)} USD @ Bs. ${tasaBCVCierre.toFixed(2)})\nBASE IMPONIBLE: Bs. ${formatVES(interesMesVES)}\nIVA (0% NO SUJETO): Bs. 0,00\nRETENCIÓN ISLR (${pctRetencion}% DTO 1808): Bs. ${formatVES(retencionISLRVES)}\nNETO A COBRAR: Bs. ${formatVES(netoACobrarVES)}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Texto'}</span>
                </button>
              </div>

              {/* Fiscal Document Sheet */}
              <div className="bg-white border-2 border-slate-300 rounded-xl p-6 font-serif text-slate-900 shadow-md">
                
                {/* Header Table */}
                <div className="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans">
                      {empresa.razon_social}
                    </h3>
                    <p className="text-xs text-slate-600 font-sans">
                      R.I.F. Nro. {empresa.rif_empresa} • {empresa.registro_mercantil}
                    </p>
                    <p className="text-xs text-slate-600 font-sans">
                      Domicilio Fiscal: {empresa.direccion_fiscal}, {empresa.ciudad}, Estado {empresa.estado}
                    </p>
                    <p className="text-[11px] font-semibold text-blue-900 font-sans mt-0.5">
                      Condición Fiscal: Contribuyente {empresa.tipo_contribuyente}
                    </p>
                  </div>

                  <div className="text-right border-2 border-blue-900 px-3 py-2 rounded-lg bg-blue-50/50 font-sans">
                    <div className="text-xs font-bold text-blue-950 uppercase">
                      NOTA DE DÉBITO
                    </div>
                    <div className="text-sm font-mono font-bold text-rose-700">
                      Nro: ND-{contrato.correlativo.replace('MUT-', '')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Control SENIAT: 00-00{contrato.id.padStart(4, '0')}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700 mt-1">
                      Fecha: {formatFechaLarga(new Date().toISOString().split('T')[0])}
                    </div>
                  </div>
                </div>

                {/* Receptor data */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Nombre / Razón Social:</span>{' '}
                      <strong>{accionista.nombre_accionista}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">C.I. / R.I.F.:</span>{' '}
                      <strong>V-{accionista.cedula_accionista} / {accionista.rif_accionista}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Dirección:</span>{' '}
                      <span>{empresa.ciudad}, República Bolivariana de Venezuela</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Condición del Receptor:</span>{' '}
                      <strong>Accionista ({accionista.porcentaje_acciones}% Acciones)</strong>
                    </div>
                  </div>
                </div>

                {/* Concept and Breakdown Table */}
                <div className="border border-slate-300 rounded-lg overflow-hidden mb-4 font-sans">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                      <tr>
                        <th className="py-2 px-3 text-left">Cant.</th>
                        <th className="py-2 px-3 text-left">Descripción y Fundamento Tributario</th>
                        <th className="py-2 px-3 text-right">Precio Unit. (USD)</th>
                        <th className="py-2 px-3 text-right">Tasa BCV</th>
                        <th className="py-2 px-3 text-right">Total Bs.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-3 text-slate-600 font-mono">1</td>
                        <td className="py-3 px-3 text-slate-800">
                          <div className="font-semibold text-slate-900">
                            Intereses Devengados por Línea de Crédito Indexada en Divisas
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Correspondiente a la liquidación mensual sobre el saldo deudor del Contrato de Mutuo Nro. {contrato.correlativo}.
                          </div>
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                            • OPERACIÓN NO SUJETA AL IVA según Artículo 16, Numeral 3 de la Ley de IVA.
                          </div>
                          <div className="text-[10px] text-blue-800 font-semibold">
                            • Cláusula de Indexación con Doble Moneda según Art. 108/529 C.Com y Art. 1.745 CC.
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold">
                          ${formatUSD(interesMesUSD)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          Bs. {tasaBCVCierre.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatVES(interesMesVES)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Fiscal Totals and Retentions */}
                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-[11px] space-y-1">
                    <p className="font-bold text-slate-800">NOTAS FISCALES OBLIGATORIAS:</p>
                    <p>1. Operación NO SUJETA al IVA conforme al Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado.</p>
                    <p>2. Se practica la retención de Impuesto Sobre la Renta (ISLR) por concepto de Intereses conforme a los Artículos 1 y 9 (Numeral 8) del Decreto 1.808.</p>
                    <p>3. El presente débito y recibo desvirtúan el dividendo presunto del Art. 73 de la Ley de ISLR.</p>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600 font-sans">Subtotal / Base Imponible:</span>
                      <span className="font-bold text-slate-900">{formatVES(interesMesVES)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                      <span className="font-sans">Alícuota IVA (NO SUJETO 0%):</span>
                      <span className="font-bold">Bs. 0,00</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                      <span className="font-sans">Retención ISLR ({pctRetencion}% Dto. 1808):</span>
                      <span className="font-bold">- {formatVES(retencionISLRVES)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm font-bold text-slate-900 bg-slate-50 px-2 rounded-sm">
                      <span className="font-sans">MONTO NETO A COBRAR:</span>
                      <span className="text-blue-900">{formatVES(netoACobrarVES)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: RECIBO OFICIAL DE INTERESES (SENIAT) */}
          {activeTab === 'recibo' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Recibo de Cobro de Intereses sobre Préstamo de Socio</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Válido SENIAT Art. 73 LISLR
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Emitido conforme a la Ley de ISLR, LIVA y Decreto 1.808 con retención del {pctRetencion}%.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadReciboInteresesWord(contrato, empresa, accionista, 'Cierre Mensual 2026', tasaBCVCierre)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Descargar Word</span>
                  </button>

                  <button
                    onClick={() => downloadReciboInteresesPDF(contrato, empresa, accionista, 'Cierre Mensual 2026', tasaBCVCierre)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Box */}
              <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-10 shadow-md font-serif text-xs sm:text-[13px] leading-relaxed text-slate-900 whitespace-pre-wrap max-w-3xl mx-auto print-page">
                {generateReciboInteresesText(contrato, empresa, accionista, 'Mes de Liquidación 2026', tasaBCVCierre)}
              </div>
            </div>
          )}

          {/* TAB 3: MARCO LEGAL Y FISCAL SENIAT */}
          {activeTab === 'marco_legal' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card 1: Art 72 y 73 LISLR */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <h4>El Riesgo: Multa Inmediata por Tasa Fija del 12% Nominal</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Si se pacta un contrato con una tasa fija del 12% anual en <strong>Bolívares nominales</strong>, el SENIAT objeta el contrato porque la tasa activa bancaria promedio del BCV es significativamente superior a la tasa pactada (el SENIAT exige que la tasa pactada no sea inferior a 3 puntos porcentuales de la tasa bancaria del mercado).
                  </p>
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900 font-medium">
                    ⚠️ Consecuencia del SENIAT: Reclasifica el préstamo como <strong>Dividendo Presunto (Art. 73 LISLR)</strong>, aplicando una retención forzosa del <strong>34%</strong> sobre el capital total más multas de hasta el 300%.
                  </div>
                </div>

                {/* Card 2: La Solución Blindada */}
                <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <h4>La Solución Legal: Indexación con Doble Moneda</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    La doctrina tributaria y judicial en Venezuela ampara el uso de la <strong>Doble Moneda (Moneda de Cuenta: USD / Moneda de Pago: Bs. BCV)</strong>. Al calcular el 12% directamente sobre los dólares, el valor del préstamo nunca se licúa por la inflación.
                  </p>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 font-medium">
                    ✅ Blindaje SENIAT: La tasa del 12% en USD rinde el valor real del capital. Al convertir a la tasa oficial BCV de fin de mes para emitir la Nota de Débito, la contabilidad refleja fielmente la realidad económica sin contingencias de dividendos presuntos.
                  </div>
                </div>

                {/* Card 3: No Sujeción a IVA */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <FileCheck2 className="w-4 h-4" />
                    <h4>No Sujeción al IVA (Art. 16 Num. 3 LIVA)</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    De conformidad con el <strong>Artículo 16, Numeral 3 del Decreto Constituyente de Reforma Parcial de la Ley de IVA</strong>, las operaciones de préstamos en dinero y los intereses devengados se encuentran NO SUJETOS al Impuesto al Valor Agregado.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Por tanto, la empresa no traslada débito fiscal ni factura con IVA, sino que emite una <strong>Nota de Débito Fiscal Exenta/No Sujeta</strong>.
                  </p>
                </div>

                {/* Card 4: Retenciones de ISLR */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <Building className="w-4 h-4" />
                    <h4>Régimen de Retenciones ISLR (Decreto 1.808)</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Al momento del pago o abono en cuenta de los intereses, se debe aplicar la retención según los Artículos 1 y 9 Numeral 8 del Decreto 1.808:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li><strong>5%</strong> si el beneficiario es Persona Natural Residente.</li>
                    <li><strong>3%</strong> si el beneficiario es Persona Jurídica Domiciliada.</li>
                    <li><strong>34%</strong> si es Persona Natural No Residente o Persona Jurídica No Domiciliada.</li>
                  </ul>
                  <p className="text-[11px] text-slate-500 mt-1">
                    La empresa debe expedir el Comprobante de Retención (Formato ARC) y enterar los fondos al SENIAT.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Blindaje Legal: <strong>VEN-NIF • Art. 72 LISLR • Art. 16 LIVA • Dto. 1808</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
