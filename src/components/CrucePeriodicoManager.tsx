import React, { useState } from 'react';
import { Empresa, Accionista, ContratoMutuo, MovimientoCrucePeriodico } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Receipt, 
  Download, 
  Scale, 
  BookOpen, 
  Layers, 
  Landmark, 
  Info, 
  ChevronRight, 
  TrendingDown, 
  TrendingUp,
  Percent,
  Coins,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { downloadCrucePeriodicoExcel } from '../utils/documentExport';
import { 
  MOVIMIENTOS_CRUCE_PERIODICO, 
  TOTAL_CUPOS_DESEMBOLSADOS_VES, 
  TOTAL_PAGOS_RECIBIDOS_VES, 
  TOTAL_INTERESES_DEVENGADOS_VES, 
  TOTAL_RETENCION_ISLR_5PCT_VES, 
  TOTAL_INTERES_NETO_PERCIBIDO_VES, 
  TOTAL_AMORTIZACION_CAPITAL_VES, 
  SALDO_CAPITAL_VIVO_FINAL_VES, 
  CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES, 
  LIMITE_LINEA_CREDITO_GLOBAL_VES,
  PORCENTAJE_UTILIZACION_FINAL
} from '../data/crucePeriodicoData';
import { RECIBOS_CUPO_AGRICOLA_ONI } from '../data/recibosCupoData';
import { RECIBOS_PAGOS_AGRICOLA_ONI } from '../data/recibosPagosData';

interface CrucePeriodicoManagerProps {
  empresa: Empresa;
  accionistas: Accionista[];
  contratos: ContratoMutuo[];
  tasaBCV: number;
  onOpenLineaCredito?: (contrato?: ContratoMutuo) => void;
  onNavigateToRecibosCupo?: () => void;
  onNavigateToRecibosPagos?: () => void;
}

export const CrucePeriodicoManager: React.FC<CrucePeriodicoManagerProps> = ({
  empresa,
  accionistas,
  contratos,
  tasaBCV,
  onOpenLineaCredito,
  onNavigateToRecibosCupo,
  onNavigateToRecibosPagos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'CUPOS' | 'PAGOS'>('TODOS');
  const [activeTabSubView, setActiveTabSubView] = useState<'TABLA' | 'ASIENTOS' | 'DICTAMEN'>('TABLA');

  // Identify partner Manuel Alejandro Becerra Luis
  const mutuario = accionistas.find(
    a => a.nombre_accionista.toUpperCase().includes('BECERRA') || a.cedula_accionista.includes('24.224.176') || a.cedula_accionista.includes('24224176')
  ) || {
    id: 'acc-manuel-becerra',
    empresa_id: empresa.id,
    nombre_accionista: 'Manuel Alejandro Becerra Luis',
    cedula_accionista: '24.224.176',
    rif_accionista: 'V-24224176-9',
    porcentaje_acciones: 0,
    cargo_o_condicion: 'Mutuario / Socio en Empresa Vinculada',
    es_accionista: false,
    telefono: '+58 (412) 555-7890',
    email: 'mbecerra@inversiones-triasbecerra.com.ve',
  };

  const contratoLinea = contratos.find(
    c => c.empresa_id === empresa.id && (c.modalidad_contrato === 'linea_credito_rotativa' || c.correlativo.includes('LC-ONI'))
  ) || contratos[0];

  const movimientos = MOVIMIENTOS_CRUCE_PERIODICO;

  const filteredMovimientos = movimientos.filter(m => {
    // Tipo filter
    if (filtroTipo === 'CUPOS' && m.tipo !== 'CUPO_DISPOSICION') return false;
    if (filtroTipo === 'PAGOS' && m.tipo !== 'PAGO_AMORTIZACION') return false;

    // Search query
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.recibo_codigo.toLowerCase().includes(q) ||
      m.referencia_bancaria.toLowerCase().includes(q) ||
      m.fecha.includes(q) ||
      m.concepto.toLowerCase().includes(q) ||
      m.debito_cupo_ves.toString().includes(q) ||
      m.pago_total_recibido_ves.toString().includes(q)
    );
  });

  const handleDownloadExcel = () => {
    downloadCrucePeriodicoExcel(
      movimientos,
      empresa,
      mutuario,
      contratoLinea,
      RECIBOS_CUPO_AGRICOLA_ONI,
      RECIBOS_PAGOS_AGRICOLA_ONI
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Scale className="w-3.5 h-3.5" />
                <span>Cruce Periódico Consolidado (47 Movimientos)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/80 text-blue-200 border border-blue-700/60 font-mono">
                29 Cupos + 18 Pagos
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dictamen VEN-NIF • Art. 529 C.Com • Art. 72 LISLR</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{empresa.razon_social}</span>
                <ArrowRight className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-semibold">{mutuario.nombre_accionista}</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Relación periódica cronológica de la <strong>Línea de Crédito Rotativa (LC-ONI-2026-0001)</strong>. Conciliación estricta de cada cargo por desembolso de cupo y cada abono de pago recibido, liquidando legalmente los intereses devengados con 5% de retención de ISLR y amortización neta a capital vivo.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer border border-emerald-300/80 active:scale-95"
              title="Descargar libro Excel (.xls) completo con 4 hojas (Cruce, Dictamen Contable, 29 Cupos y 18 Pagos)"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              <span>DESCARGAR CRUCE EN EXCEL (.XLS)</span>
            </button>

            {onNavigateToRecibosCupo && (
              <button
                type="button"
                onClick={onNavigateToRecibosCupo}
                className="px-3.5 py-2.5 bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 text-xs font-bold rounded-xl transition-colors border border-blue-700/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-blue-300" />
                <span>Ver 29 Cupos</span>
              </button>
            )}

            {onNavigateToRecibosPagos && (
              <button
                type="button"
                onClick={onNavigateToRecibosPagos}
                className="px-3.5 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-bold rounded-xl transition-colors border border-emerald-700/50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Ver 18 Pagos</span>
              </button>
            )}

            {onOpenLineaCredito && (
              <button
                type="button"
                onClick={() => onOpenLineaCredito(contratoLinea)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Contrato Notarial</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Key Financial Metric Cards */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Límite Aprobado:</div>
            <div className="text-sm font-black text-white font-mono mt-0.5">{formatVES(LIMITE_LINEA_CREDITO_GLOBAL_VES)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Techo Anual 100%</div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/60">
            <div className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Total 29 Cupos [+]</div>
            <div className="text-sm font-black text-blue-300 font-mono mt-0.5">{formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}</div>
            <div className="text-[10px] text-blue-200/70 mt-0.5">Disposiciones Banesco</div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-950/60 border border-teal-800/60">
            <div className="text-[10px] text-teal-300 font-medium uppercase tracking-wider">Total 18 Pagos [-]</div>
            <div className="text-sm font-black text-teal-300 font-mono mt-0.5">{formatVES(TOTAL_PAGOS_RECIBIDOS_VES)}</div>
            <div className="text-[10px] text-teal-200/70 mt-0.5">Entradas Recibidas</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/60">
            <div className="text-[10px] text-amber-300 font-medium uppercase tracking-wider">Intereses Pagados:</div>
            <div className="text-sm font-black text-amber-400 font-mono mt-0.5">{formatVES(TOTAL_INTERESES_DEVENGADOS_VES)}</div>
            <div className="text-[10px] text-amber-200/70 mt-0.5">Ret. ISLR: {formatVES(TOTAL_RETENCION_ISLR_5PCT_VES)}</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/60">
            <div className="text-[10px] text-rose-300 font-medium uppercase tracking-wider">Saldo Deudor Vivo:</div>
            <div className="text-sm font-black text-rose-300 font-mono mt-0.5">{formatVES(SALDO_CAPITAL_VIVO_FINAL_VES)}</div>
            <div className="text-[10px] text-rose-200/70 mt-0.5">Capital Pendiente (59.5%)</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
            <div className="text-[10px] text-emerald-300 font-medium uppercase tracking-wider">Cupo Reconstituido:</div>
            <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{formatVES(CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES)}</div>
            <div className="text-[10px] text-emerald-200/70 mt-0.5">Disponible Actual (40.5%)</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSubView('TABLA')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTabSubView === 'TABLA'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tabla de Cruce Cronológico (47)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSubView('ASIENTOS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTabSubView === 'ASIENTOS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Asientos de Diario (VEN-NIF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSubView('DICTAMEN')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTabSubView === 'DICTAMEN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dictamen Tributario SENIAT</span>
          </button>
        </div>

        {activeTabSubView === 'TABLA' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filtrar:</span>
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFiltroTipo('TODOS')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtroTipo === 'TODOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos (47)
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('CUPOS')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtroTipo === 'CUPOS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Cupos (29)
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('PAGOS')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtroTipo === 'PAGOS' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Pagos (18)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW: MAIN TABLE */}
      {activeTabSubView === 'TABLA' && (
        <div className="space-y-4">
          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por recibo (RC-0015, RP-0004), referencia Banesco o monto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                29 Cupos Disposición
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                18 Pagos Amortización
              </span>
              <span>Mostrando <strong>{filteredMovimientos.length}</strong> de 47 movimientos</span>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-2 text-center w-10">N°</th>
                    <th className="py-3 px-2.5 text-center">Fecha</th>
                    <th className="py-3 px-3 text-center">Operación</th>
                    <th className="py-3 px-2.5 text-center">Recibo</th>
                    <th className="py-3 px-3">Ref. Banesco</th>
                    <th className="py-3 px-3 text-right bg-blue-900/40 text-blue-200">Débito Cupo [+]</th>
                    <th className="py-3 px-3 text-right bg-emerald-900/40 text-emerald-200">Pago Recibido</th>
                    <th className="py-3 px-3 text-right bg-emerald-900/40 text-emerald-200">Intereses</th>
                    <th className="py-3 px-2.5 text-right bg-emerald-900/40 text-emerald-200">Ret. ISLR (5%)</th>
                    <th className="py-3 px-3 text-right bg-emerald-900/40 text-emerald-200">Abono Capital [-]</th>
                    <th className="py-3 px-3.5 text-right font-black">Saldo Capital Deudor</th>
                    <th className="py-3 px-3 text-right">Cupo Disponible</th>
                    <th className="py-3 px-2.5 text-center">% Usado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovimientos.map((m) => {
                    const isCupo = m.tipo === 'CUPO_DISPOSICION';

                    return (
                      <tr 
                        key={`${m.tipo}-${m.correlativo}`}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCupo ? 'bg-white' : 'bg-emerald-50/20'
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-400 font-bold">
                          {m.correlativo}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono text-slate-700 whitespace-nowrap">
                          {m.fecha}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isCupo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Receipt className="w-3 h-3 text-blue-600" />
                              CUPO OTORGADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              PAGO RECIBIDO
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                          {m.recibo_codigo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {m.referencia_bancaria}
                        </td>
                        
                        {/* Débito Cupo */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold bg-blue-50/30 text-blue-700">
                          {m.debito_cupo_ves > 0 ? formatVES(m.debito_cupo_ves) : '-'}
                        </td>

                        {/* Pago Recibido */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold bg-emerald-50/30 text-emerald-700">
                          {m.pago_total_recibido_ves > 0 ? formatVES(m.pago_total_recibido_ves) : '-'}
                        </td>

                        {/* Intereses Pagados */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 bg-emerald-50/30">
                          {m.intereses_pagados_ves > 0 ? formatVES(m.intereses_pagados_ves) : '-'}
                        </td>

                        {/* Retención ISLR */}
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-500 bg-emerald-50/30">
                          {m.retencion_islr_ves > 0 ? formatVES(m.retencion_islr_ves) : '-'}
                        </td>

                        {/* Amortización a Capital */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/40">
                          {m.credito_capital_ves > 0 ? formatVES(m.credito_capital_ves) : '-'}
                        </td>

                        {/* Saldo Capital Deudor */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-black text-slate-900 bg-slate-50/50">
                          {formatVES(m.saldo_capital_vivo_ves)}
                        </td>

                        {/* Cupo Disponible */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                          {formatVES(m.cupo_disponible_ves)}
                        </td>

                        {/* % Usado */}
                        <td className="py-2.5 px-2.5 text-center font-mono text-[11px] text-slate-600">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.porcentaje_utilizado > 80 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.porcentaje_utilizado.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Totales Generales */}
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-950">
                    <td colSpan={5} className="py-3 px-3 text-right uppercase tracking-wider text-slate-300">
                      TOTALES GENERALES CONSOLIDADOS (47 MOVIMIENTOS):
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-300 bg-blue-950/70 border-l border-slate-800">
                      {formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300 bg-emerald-950/70">
                      {formatVES(TOTAL_PAGOS_RECIBIDOS_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300 bg-emerald-950/70">
                      {formatVES(TOTAL_INTERESES_DEVENGADOS_VES)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-emerald-300 bg-emerald-950/70">
                      {formatVES(TOTAL_RETENCION_ISLR_5PCT_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-200 bg-emerald-900/80 font-black">
                      {formatVES(TOTAL_AMORTIZACION_CAPITAL_VES)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-white font-black bg-slate-950">
                      {formatVES(SALDO_CAPITAL_VIVO_FINAL_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-teal-300 bg-teal-950/70">
                      {formatVES(CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES)}
                    </td>
                    <td className="py-3 px-2.5 text-center font-mono text-amber-300 bg-slate-950 font-bold">
                      {PORCENTAJE_UTILIZACION_FINAL.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ASIENTOS DE DIARIO VEN-NIF */}
      {activeTabSubView === 'ASIENTOS' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Libro Diario Legal (Asientos Resumen VEN-NIF PYME)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro contable de la totalidad de las operaciones en partida doble comprobada al céntimo.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Partida Doble Cuadrada 100%
              </span>
            </div>

            {/* Asiento 1 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>ASIENTO N° 01 • PERÍODO 16/01/2026 AL 25/03/2026 (DESEMBOLSO DE 29 CUPOS)</span>
                <span className="font-mono text-slate-600">Comprobante N° DIA-2026-0038</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Descripción de Cuenta</th>
                    <th className="py-2 px-3 text-right">DEBE (Bs.)</th>
                    <th className="py-2 px-3 text-right">HABER (Bs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 text-slate-500">1.1.2.03.01</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                      Cuentas por Cobrar Socios y Directores (Manuel Becerra Luis)
                    </td>
                    <td className="py-2 px-3 text-right text-blue-700 font-bold">{formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}</td>
                    <td className="py-2 px-3 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-500">1.1.1.02.01</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans pl-6">
                      a: Banco Banesco Banco Universal (Cuenta Corriente N° 5128)
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">-</td>
                    <td className="py-2 px-3 text-right text-blue-700 font-bold">{formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={2} className="py-2 px-3 text-right font-sans text-xs">SUMAS IGUALES ASIENTO 01:</td>
                    <td className="py-2 px-3 text-right font-mono text-blue-800">{formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}</td>
                    <td className="py-2 px-3 text-right font-mono text-blue-800">{formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="p-3 bg-slate-50/50 text-[11px] text-slate-600 border-t border-slate-100">
                <strong>Glosa:</strong> Para registrar la concesión y desembolso de veintinueve (29) cupos rotativos de dinero conforme al Contrato Marco de Línea de Crédito Rotativa N° LC-ONI-2026-0001, facultades estatutarias de Agrícola Oni, C.A. (Cap. IV, Cláusula Décima Cuarta, Numeral O) y Recibos Oficiales de Cupo N° RC-ONI-2026-0001 al RC-ONI-2026-0029.
              </div>
            </div>

            {/* Asiento 2 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <div className="bg-slate-100/80 px-4 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>ASIENTO N° 02 • PERÍODO 14/07/2026 AL 11/09/2026 (COBRO DE 18 PAGOS Y AMORTIZACIÓN)</span>
                <span className="font-mono text-slate-600">Comprobante N° DIA-2026-0089</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Código</th>
                    <th className="py-2 px-3">Descripción de Cuenta</th>
                    <th className="py-2 px-3 text-right">DEBE (Bs.)</th>
                    <th className="py-2 px-3 text-right">HABER (Bs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 text-slate-500">1.1.1.02.01</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                      Banco Banesco Banco Universal (Cuenta Corriente N° 5128)
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                      {formatVES(TOTAL_PAGOS_RECIBIDOS_VES - TOTAL_RETENCION_ISLR_5PCT_VES)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-500">1.1.3.05.02</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans">
                      Anticipo de ISLR Retenido por Clientes / Socios (5% Decreto 1808)
                    </td>
                    <td className="py-2 px-3 text-right text-amber-700 font-bold">
                      {formatVES(TOTAL_RETENCION_ISLR_5PCT_VES)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-500">4.2.1.01.01</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans pl-6">
                      a: Ingresos Financieros por Intereses de Financiamiento (Tasa 60%)
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">-</td>
                    <td className="py-2 px-3 text-right text-amber-700 font-bold">
                      {formatVES(TOTAL_INTERESES_DEVENGADOS_VES)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-500">1.1.2.03.01</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 font-sans pl-6">
                      a: Cuentas por Cobrar Socios y Directores (Manuel Becerra Luis)
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">-</td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                      {formatVES(TOTAL_AMORTIZACION_CAPITAL_VES)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td colSpan={2} className="py-2 px-3 text-right font-sans text-xs">SUMAS IGUALES ASIENTO 02:</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-800">{formatVES(TOTAL_PAGOS_RECIBIDOS_VES)}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-800">{formatVES(TOTAL_PAGOS_RECIBIDOS_VES)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="p-3 bg-slate-50/50 text-[11px] text-slate-600 border-t border-slate-100">
                <strong>Glosa:</strong> Para registrar la recaudación bancaria de dieciocho (18) transferencias por un total de Bs. 186.376.000,00, imputando en prelación legal (Art. 529 Código de Comercio) el cobro de intereses devengados con retención del 5% de ISLR enterable ante el SENIAT y amortización directa al capital del socio por Bs. 141.280.653,54, según Recibos Oficiales RP-ONI-2026-0001 al RP-ONI-2026-0018.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DICTAMEN TRIBUTARIO SENIAT */}
      {activeTabSubView === 'DICTAMEN' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Dictamen Pericial Contable y Fiscal ante el SENIAT
                </h3>
                <p className="text-xs text-slate-500">
                  Conformidad tributaria y mercantil de la Cuenta Corriente Mercantil y Línea de Crédito Rotativa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1. Cumplimiento de Prelación de Pagos (Art. 529 C.Com)</span>
                </div>
                <p className="text-slate-600">
                  El Artículo 529 del Código de Comercio de Venezuela establece de forma vinculante que todo pago realizado a cuenta de capital e intereses debe imputarse en primer término a la cancelación de los intereses devengados. En el presente expediente, de los <strong>Bs. 186.376.000,00</strong> recibidos, se imputaron primero <strong>Bs. 45.095.346,46</strong> a intereses y el remanente de <strong>Bs. 141.280.653,54</strong> a capital, extinguiendo legítimamente la deuda principal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>2. Enervación de Presunción de Dividendo Ficticio (Art. 72 LISLR)</span>
                </div>
                <p className="text-slate-600">
                  La Administración Tributaria (SENIAT) presume como dividendo presunto los retiros a socios que carecen de soporte contractual y de causación de intereses. En este caso se demuestra la plena naturaleza mercantil y financiera: existe Contrato Marco notariado, causación de intereses a tasa activa de mercado (60% anual), retención enterada y 18 amortizaciones bancarias fehacientes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>3. Retención de ISLR Aplicada (Decreto N° 1.808)</span>
                </div>
                <p className="text-slate-600">
                  Conforme al Art. 9, Numeral 1, Literal a) del Reglamento de Retenciones de la LISLR, la empresa practicó la retención del <strong>5% de ISLR</strong> sobre los intereses cobrados a la persona natural residente, totalizando <strong>Bs. 2.254.767,33</strong>, los cuales constituyen crédito fiscal deducible para el contribuyente y pago a cuenta para el Fisco Nacional.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>4. No Sujeción a IVA (Art. 16 Numeral 3 LIVA)</span>
                </div>
                <p className="text-slate-600">
                  De conformidad con la Ley que establece el Impuesto al Valor Agregado (LIVA), las operaciones de mutuo, financiamiento dinerario y los intereses percibidos por tales conceptos califican expresamente como <strong>servicios no sujetos a IVA</strong>, no debiendo emitirse factura comercial con IVA sino Notas de Débito de Intereses y Recibos Oficiales.
                </p>
              </div>
            </div>

            {/* Certifying Signature Box */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">Certificación Profesional Colegiada</div>
                <div className="text-[11px] text-slate-500">Colegio de Contadores Públicos del Distrito Capital y Estado Miranda (CPC)</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Dictamen Completo en Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
