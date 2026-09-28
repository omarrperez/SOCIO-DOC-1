import React, { useState } from 'react';
import { Empresa, Accionista, ContratoMutuo, ReciboPagoRecibido } from '../types';
import { formatVES, formatUSD, formatFechaLarga, numeroALetras } from '../utils/formatters';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Landmark, 
  Receipt, 
  FileDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Info,
  Calendar,
  Building,
  CreditCard,
  Percent,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Layers,
  Coins,
  Scale
} from 'lucide-react';
import { 
  downloadReciboPagoWord, 
  downloadReciboPagoPDF, 
  downloadTodosRecibosPagosWord, 
  downloadLibroPagosExcel 
} from '../utils/documentExport';
import { 
  RECIBOS_PAGOS_AGRICOLA_ONI, 
  TOTAL_ENTRADAS_BANESCO_VES, 
  TOTAL_INTERESES_PAGADOS_VES, 
  TOTAL_RETENCION_ISLR_VES, 
  TOTAL_AMORTIZACION_CAPITAL_VES, 
  SALDO_CAPITAL_INICIAL_VES, 
  SALDO_CAPITAL_RESTANTE_VES, 
  CUPO_DISPONIBLE_RESTAURADO_VES, 
  LIMITE_LINEA_CREDITO_VES 
} from '../data/recibosPagosData';

interface RecibosPagosManagerProps {
  empresa: Empresa;
  accionistas: Accionista[];
  contratos: ContratoMutuo[];
  tasaBCV: number;
  onOpenLineaCredito?: (contrato?: ContratoMutuo) => void;
  onNavigateToRecibosCupo?: () => void;
  onNavigateToCrucePeriodico?: () => void;
}

export const RecibosPagosManager: React.FC<RecibosPagosManagerProps> = ({
  empresa,
  accionistas,
  contratos,
  tasaBCV,
  onOpenLineaCredito,
  onNavigateToRecibosCupo,
  onNavigateToCrucePeriodico,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecibo, setSelectedRecibo] = useState<ReciboPagoRecibido | null>(null);

  // Identify partner Manuel Alejandro Becerra Luis
  const pagadorManuelBecerra = accionistas.find(
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

  const contratoLineaCredito = contratos.find(
    c => c.empresa_id === empresa.id && (c.modalidad_contrato === 'linea_credito_rotativa' || c.correlativo.includes('LC-ONI'))
  ) || contratos[0];

  const recibos = RECIBOS_PAGOS_AGRICOLA_ONI;

  const filteredRecibos = recibos.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      r.numero_recibo.toLowerCase().includes(q) ||
      r.referencia_bancaria.toLowerCase().includes(q) ||
      r.fecha.includes(q) ||
      r.monto_total_ves.toString().includes(q) ||
      r.concepto.toLowerCase().includes(q)
    );
  });

  const handleNextRecibo = () => {
    if (!selectedRecibo) return;
    const currentIndex = recibos.findIndex(r => r.id === selectedRecibo.id);
    if (currentIndex < recibos.length - 1) {
      setSelectedRecibo(recibos[currentIndex + 1]);
    }
  };

  const handlePrevRecibo = () => {
    if (!selectedRecibo) return;
    const currentIndex = recibos.findIndex(r => r.id === selectedRecibo.id);
    if (currentIndex > 0) {
      setSelectedRecibo(recibos[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold tracking-wide border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                CONCILIACIÓN DE ENTRADAS BANESCO • ART. 529 CÓDIGO DE COMERCIO
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Recibos de Pago Recibido (18 Amortizaciones)
              </h1>
              <p className="text-emerald-100/90 text-sm leading-relaxed">
                Expediente oficial de los 18 pagos recibidos en <strong>Banesco Banco Universal</strong> por 
                <strong> {empresa.razon_social}</strong> (R.I.F. {empresa.rif_empresa}) transferidos por el 
                ciudadano <strong>{pagadorManuelBecerra.nombre_accionista}</strong> (C.I. V-{pagadorManuelBecerra.cedula_accionista}), 
                aplicados primero a la cancelación de <strong>intereses devengados</strong> y el remanente a la <strong>amortización directa de capital</strong> conforme al Contrato de Línea de Crédito Rotativa.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 pt-1">
                <span>Cuenta Banesco: <strong>0134-0055-12-0000005128</strong></span>
                <span>•</span>
                <span>Contrato Marco: <strong>{contratoLineaCredito?.correlativo || 'LC-ONI-2026-0001'}</strong></span>
                <span>•</span>
                <span>Límite Rotativo: <strong>{formatVES(LIMITE_LINEA_CREDITO_VES)}</strong></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              <button
                onClick={() => downloadTodosRecibosPagosWord(recibos, empresa, pagadorManuelBecerra, contratoLineaCredito)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar TODOS (18 Word)
              </button>

              <button
                onClick={() => downloadLibroPagosExcel(recibos, empresa, pagadorManuelBecerra, contratoLineaCredito)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Libro Amortización (Excel)
              </button>

              {onNavigateToCrucePeriodico && (
                <button
                  onClick={onNavigateToCrucePeriodico}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-slate-950" />
                  Ver Cruce Periódico (47)
                </button>
              )}

              {onNavigateToRecibosCupo && (
                <button
                  onClick={onNavigateToRecibosCupo}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-200 text-xs rounded-xl border border-emerald-600/30 transition-all cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                  Ver 29 Recibos de Cupo (Salidas)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Pagado */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            <span>Total Pagado (18)</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mb-1">
            {formatVES(TOTAL_ENTRADAS_BANESCO_VES)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            100% Entradas Conciliadas Banesco
          </div>
        </div>

        {/* Card 2: Intereses Pagados */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            <span>Intereses Pagados</span>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mb-1">
            {formatVES(TOTAL_INTERESES_PAGADOS_VES)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Tasa BCV 59.12% anual • Exento IVA
          </div>
        </div>

        {/* Card 3: Retención ISLR 5% */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">
            <span>Retención ISLR 5%</span>
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mb-1">
            {formatVES(TOTAL_RETENCION_ISLR_VES)}
          </div>
          <div className="text-[11px] text-red-600 font-medium">
            Dec. 1808 Art. 9 num. 1 SENIAT
          </div>
        </div>

        {/* Card 4: Amortizado Capital */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            <span>Amortizado a Capital</span>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingDown className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 mb-1">
            {formatVES(TOTAL_AMORTIZACION_CAPITAL_VES)}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium">
            75.8% del monto total pagado
          </div>
        </div>

        {/* Card 5: Saldo Capital Restante */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            <span>Saldo Deudor Restante</span>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Layers className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mb-1">
            {formatVES(SALDO_CAPITAL_RESTANTE_VES)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Reducción desde {formatVES(SALDO_CAPITAL_INICIAL_VES)}
          </div>
        </div>

        {/* Card 6: Cupo Disponible Restaurado */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            <span>Cupo Restaurado</span>
            <div className="p-2 bg-teal-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-xl font-black text-teal-700 mb-1">
            {formatVES(CUPO_DISPONIBLE_RESTAURADO_VES)}
          </div>
          <div className="text-[11px] text-teal-800 font-medium">
            40.5% disponible s/Bs. 600M
          </div>
        </div>
      </div>

      {/* Legal Imputation Notice Box */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs text-emerald-900 leading-relaxed">
            <strong className="font-semibold text-emerald-950">Mecanismo de Imputación de Pagos (Código de Comercio Art. 529 & Código Civil Art. 1.292):</strong>
            <span className="block mt-0.5 text-emerald-800">
              Cada transferencia recibida se imputa con prelación a los <strong>intereses causados</strong> sobre el saldo diario del período, y el saldo restante se aplica a la <strong>amortización del capital principal</strong>. Conforme al régimen rotativo, el capital amortizado reconstituye automáticamente la capacidad crediticia del beneficiario hasta el tope de Bs. 600.000.000,00.
            </span>
          </div>
        </div>
        {onOpenLineaCredito && (
          <button
            onClick={() => onOpenLineaCredito(contratoLineaCredito)}
            className="shrink-0 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
          >
            Ver Contrato Marco
          </button>
        )}
      </div>

      {/* Receipts Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Detalle de los 18 Recibos de Pagos Recibidos
              </h2>
              <p className="text-xs text-slate-500">
                Mostrando {filteredRecibos.length} de {recibos.length} comprobantes bancarios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por recibo, ref, fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 text-center">N°</th>
                <th className="py-3 px-3">Recibo</th>
                <th className="py-3 px-3">Fecha & Ref. Banesco</th>
                <th className="py-3 px-3 text-right">Monto Total Pagado</th>
                <th className="py-3 px-3 text-right">Interés Cubierto</th>
                <th className="py-3 px-3 text-right">Ret. ISLR (5%)</th>
                <th className="py-3 px-3 text-right text-emerald-800">Amortizado Capital</th>
                <th className="py-3 px-3 text-right">Saldo Deudor</th>
                <th className="py-3 px-3 text-right text-teal-800">Cupo Disponible</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecibos.map((r) => (
                <tr 
                  key={r.id} 
                  className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedRecibo(r)}
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-400 group-hover:text-emerald-700">
                    {r.numero_pago}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      {r.numero_recibo}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{r.fecha}</div>
                    <div className="font-mono text-[10px] text-slate-500">{r.referencia_bancaria}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    <div>{formatVES(r.monto_total_ves)}</div>
                    <div className="text-[10px] font-normal text-slate-400">${formatUSD(r.monto_total_usd)} USD</div>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-amber-700">
                    {formatVES(r.intereses_pagados_ves)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-red-600">
                    - {formatVES(r.monto_retencion_islr_ves)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 bg-emerald-50/20">
                    {formatVES(r.capital_amortizado_ves)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-800">
                    {formatVES(r.nuevo_saldo_capital_ves)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-teal-700">
                    {formatVES(r.cupo_disponible_actual_ves)}
                  </td>
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Ver Comprobante Oficial"
                        onClick={() => setSelectedRecibo(r)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        title="Descargar Word (.doc)"
                        onClick={() => downloadReciboPagoWord(r, empresa, pagadorManuelBecerra, contratoLineaCredito)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        title="Descargar PDF"
                        onClick={() => downloadReciboPagoPDF(r, empresa, pagadorManuelBecerra, contratoLineaCredito)}
                        className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 text-xs font-bold text-slate-800 border-t-2 border-slate-300">
                <td colSpan={3} className="py-3 px-3 text-right uppercase text-slate-600">
                  TOTALES (18 PAGOS RECIBIDOS):
                </td>
                <td className="py-3 px-3 text-right text-emerald-900 font-extrabold">
                  {formatVES(TOTAL_ENTRADAS_BANESCO_VES)}
                </td>
                <td className="py-3 px-3 text-right text-amber-800">
                  {formatVES(TOTAL_INTERESES_PAGADOS_VES)}
                </td>
                <td className="py-3 px-3 text-right text-red-700">
                  - {formatVES(TOTAL_RETENCION_ISLR_VES)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 font-extrabold bg-emerald-100/40">
                  {formatVES(TOTAL_AMORTIZACION_CAPITAL_VES)}
                </td>
                <td className="py-3 px-3 text-right text-slate-900">
                  {formatVES(SALDO_CAPITAL_RESTANTE_VES)}
                </td>
                <td className="py-3 px-3 text-right text-teal-800 font-extrabold">
                  {formatVES(CUPO_DISPONIBLE_RESTAURADO_VES)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: View Single Receipt */}
      {selectedRecibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Recibo de Pago {selectedRecibo.numero_recibo}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                      Cuota {selectedRecibo.numero_pago} de 18
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatFechaLarga(selectedRecibo.fecha)} • Ref: {selectedRecibo.referencia_bancaria}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevRecibo}
                  disabled={selectedRecibo.numero_pago === 1}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Recibo Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextRecibo}
                  disabled={selectedRecibo.numero_pago === recibos.length}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Recibo Siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedRecibo(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Paper Preview */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
              {/* Paper Voucher Document */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/40 space-y-5 shadow-xs">
                {/* Letterhead */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-300 pb-4 gap-3">
                  <div>
                    <h4 className="text-base font-black text-emerald-900 tracking-tight">
                      {empresa.razon_social}
                    </h4>
                    <p className="text-xs text-slate-500">
                      R.I.F. {empresa.rif_empresa} • {empresa.registro_mercantil}
                    </p>
                    <p className="text-xs text-slate-500">
                      Domicilio: {empresa.direccion_fiscal}, {empresa.ciudad}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                      COMPROBANTE OFICIAL DE PAGO
                    </span>
                    <div className="font-mono text-sm font-extrabold text-slate-900 mt-1">
                      {selectedRecibo.numero_recibo}
                    </div>
                    <div className="text-xs text-slate-500">
                      Fecha: {formatFechaLarga(selectedRecibo.fecha)}
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-center space-y-1">
                  <h5 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    RECIBO DE PAGO RECIBIDO • AMORTIZACIÓN A INTERESES Y CAPITAL (CUOTA {selectedRecibo.numero_pago} DE 18)
                  </h5>
                  <p className="text-xs text-slate-500">
                    Línea de Crédito General Rotativa • Contrato Marco Nro. {selectedRecibo.contrato_correlativo}
                  </p>
                </div>

                {/* Preamble */}
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  Por medio del presente documento, la sociedad mercantil <strong>{empresa.razon_social}</strong> (R.I.F. <strong>{empresa.rif_empresa}</strong>), en su carácter de <strong>MUTUANTE (ACREDITANTE)</strong>, válidamente representada por su Director Presidente, ciudadano <strong>{empresa.representante_legal}</strong> (C.I. <strong>{empresa.cedula_representante}</strong>), actuando con fundamento en la potestad estatutaria directa contenida en el <strong>{empresa.facultad_estatutaria_mutuo || 'Capítulo IV, Cláusula Décima Cuarta, Numeral O de los Estatutos Sociales (Registro de Comercio 13/09/2021)'}</strong>, hace constar que ha recibido a su entera y cabal satisfacción en su Cuenta Corriente Nro. <strong>{selectedRecibo.cuenta_receptora}</strong> de <strong>{selectedRecibo.banco_receptor}</strong>, la cantidad de fondos transferida por el ciudadano <strong>{pagadorManuelBecerra.nombre_accionista}</strong> (C.I. <strong>V-{pagadorManuelBecerra.cedula_accionista}</strong> y R.I.F. <strong>{pagadorManuelBecerra.rif_accionista}</strong>), imputándose conforme al <strong>Artículo 529 del Código de Comercio</strong> y <strong>Artículo 1.292 del Código Civil</strong> venezolano:
                </p>

                {/* Transaction Main Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monto Total Pagado:</span>
                        <strong className="text-emerald-700 font-extrabold">{formatVES(selectedRecibo.monto_total_ves)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monto en Letras:</span>
                        <span className="font-semibold text-right text-[11px] text-slate-700">
                          {numeroALetras(selectedRecibo.monto_total_ves).toUpperCase()} BOLÍVARES
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contravalor BCV:</span>
                        <span className="font-medium">${formatUSD(selectedRecibo.monto_total_usd)} USD (Tasa: Bs. {selectedRecibo.tasa_bcv.toFixed(2)})</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-2 bg-slate-50/50">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Banco Receptor:</span>
                        <span className="font-medium text-slate-800">{selectedRecibo.banco_receptor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cuenta Banesco Receptora:</span>
                        <span className="font-mono text-slate-700">{selectedRecibo.cuenta_receptora}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Referencia Bancaria:</span>
                        <span className="font-mono font-bold text-emerald-800">{selectedRecibo.referencia_bancaria}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Imputation Table */}
                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Discriminación de la Aplicación del Pago (Intereses vs. Capital):
                  </h6>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Concepto Liquidado</th>
                          <th className="p-2.5">Base / Días</th>
                          <th className="p-2.5">Tasa</th>
                          <th className="p-2.5 text-right">Monto (VES)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2.5 font-medium text-slate-800">1. Intereses Devengados en el Período</td>
                          <td className="p-2.5 text-slate-500">{selectedRecibo.dias_transcurridos} días s/{formatVES(selectedRecibo.saldo_capital_anterior_ves)}</td>
                          <td className="p-2.5 text-slate-500">59.12% anual (4.93% mes)</td>
                          <td className="p-2.5 text-right font-bold text-amber-700">{formatVES(selectedRecibo.intereses_pagados_ves)}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-800">2. Retención de I.S.L.R. 5% (Dec. 1808)</td>
                          <td className="p-2.5 text-slate-500">Sujeto a Comprobante ARC/AR-I</td>
                          <td className="p-2.5 text-slate-500">5.00% Persona Natural</td>
                          <td className="p-2.5 text-right font-semibold text-red-600">- {formatVES(selectedRecibo.monto_retencion_islr_ves)}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-800">3. Interés Neto Percibido por Mutuante</td>
                          <td className="p-2.5 text-slate-500">Ingreso a Tesorería</td>
                          <td className="p-2.5 text-slate-500">Neto tras ISLR</td>
                          <td className="p-2.5 text-right font-semibold text-slate-700">{formatVES(selectedRecibo.interes_neto_percibido_ves)}</td>
                        </tr>
                        <tr className="bg-emerald-50/50 font-bold text-emerald-950">
                          <td className="p-2.5">4. Amortización Directa a Capital (Principal)</td>
                          <td className="p-2.5 font-normal text-slate-600">Disminución Pasivo Deudor</td>
                          <td className="p-2.5 font-normal text-slate-600">Remanente de Pago</td>
                          <td className="p-2.5 text-right text-emerald-700 text-sm font-extrabold">{formatVES(selectedRecibo.capital_amortizado_ves)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Line Status Table */}
                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Estado Actualizado de la Línea de Crédito General Rotativa:
                  </h6>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-100 rounded-lg text-xs text-center border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">LÍMITE TOTAL</div>
                      <div className="font-bold text-slate-900 mt-0.5">{formatVES(selectedRecibo.limite_linea_ves)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">SALDO PREVIO</div>
                      <div className="font-bold text-slate-700 mt-0.5">{formatVES(selectedRecibo.saldo_capital_anterior_ves)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-700 font-semibold">AMORTIZACIÓN</div>
                      <div className="font-bold text-emerald-700 mt-0.5">- {formatVES(selectedRecibo.capital_amortizado_ves)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">NUEVO SALDO</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{formatVES(selectedRecibo.nuevo_saldo_capital_ves)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-teal-700 font-semibold">CUPO DISPONIBLE</div>
                      <div className="font-bold text-teal-700 mt-0.5">{formatVES(selectedRecibo.cupo_disponible_actual_ves)}</div>
                    </div>
                  </div>
                </div>

                {/* Tax Note */}
                <div className="text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <strong>BLINDAJE Y CONFORMIDAD TRIBUTARIA ANTE EL SENIAT:</strong>
                  <p>
                    Operación de financiamiento exenta de IVA según el Artículo 16, Numeral 3 de la Ley de Impuesto al Valor Agregado. 
                    Retención de ISLR del 5% enterada oportunamente bajo el calendario de Sujetos Pasivos Especiales. 
                    El comprobante digital cuenta con firma de autenticidad SHA-256: <span className="font-mono text-[9px]">{selectedRecibo.hash_sha256}</span>.
                  </p>
                </div>

                {/* Signatures */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-1 border-t border-slate-400 pt-2">
                    <strong className="block text-slate-900 uppercase">POR LA EMPRESA MUTUANTE</strong>
                    <div className="font-semibold text-slate-800">{empresa.razon_social}</div>
                    <div className="text-slate-600">{empresa.representante_legal}</div>
                    <div className="text-slate-500 text-[11px]">C.I. V-{empresa.cedula_representante} • R.I.F. {empresa.rif_representante || 'V-23997829-7'}</div>
                    <div className="text-slate-500 text-[11px] font-semibold">{empresa.cargo_representante}</div>
                  </div>

                  <div className="space-y-1 border-t border-slate-400 pt-2">
                    <strong className="block text-slate-900 uppercase">POR EL MUTUARIO PAGADOR</strong>
                    <div className="font-semibold text-slate-800">{pagadorManuelBecerra.nombre_accionista}</div>
                    <div className="text-slate-600">C.I. V-{pagadorManuelBecerra.cedula_accionista} • R.I.F. {pagadorManuelBecerra.rif_accionista}</div>
                    <div className="text-emerald-700 font-semibold text-[11px]">CONFORME PAGADO Y AMORTIZADO</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
              <div className="text-xs text-slate-500">
                Hash Documento: <span className="font-mono text-[10px] text-slate-700">{selectedRecibo.hash_sha256?.substring(0, 16)}...</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadReciboPagoWord(selectedRecibo, empresa, pagadorManuelBecerra, contratoLineaCredito)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Word (.doc)
                </button>
                <button
                  onClick={() => downloadReciboPagoPDF(selectedRecibo, empresa, pagadorManuelBecerra, contratoLineaCredito)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => setSelectedRecibo(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
