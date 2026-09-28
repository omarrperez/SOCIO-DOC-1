import React, { useState } from 'react';
import { Empresa, Accionista, ActaAsamblea, ContratoMutuo, TransaccionBancaria } from '../types';
import { formatVES, formatUSD, formatFechaLarga } from '../utils/formatters';
import { RiskSemaphore } from './RiskSemaphore';
import { FirstStepsGuide } from './FirstStepsGuide';
import { 
  FileText, 
  Landmark, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Receipt, 
  BookOpen, 
  Scale, 
  ArrowRight, 
  ExternalLink, 
  Sparkles,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardProps {
  empresa: Empresa;
  accionistas: Accionista[];
  actas: ActaAsamblea[];
  contratos: ContratoMutuo[];
  transacciones: TransaccionBancaria[];
  tasaBCV: number;
  onOpenContractWizard: () => void;
  onOpenActaWizard: () => void;
  onOpenViewDocument: (contrato: ContratoMutuo) => void;
  onOpenCapitalization: (contrato?: ContratoMutuo) => void;
  onNavigateTab: (tab: string) => void;
  onOpenCompanyManager?: () => void;
  onOpenFiscalReport?: () => void;
  onOpenLineaCredito?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  empresa,
  accionistas,
  actas,
  contratos,
  transacciones,
  tasaBCV,
  onOpenContractWizard,
  onOpenActaWizard,
  onOpenViewDocument,
  onOpenCapitalization,
  onNavigateTab,
  onOpenCompanyManager,
  onOpenFiscalReport,
  onOpenLineaCredito,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const empresaContratos = contratos.filter(c => c.empresa_id === empresa.id);
  const empresaActas = actas.filter(a => a.empresa_id === empresa.id);
  const empresaTx = transacciones.filter(t => t.empresa_id === empresa.id);

  // Totals
  const totalPagarVES = empresaContratos
    .filter(c => c.tipo_flujo === 'socio_a_empresa' && c.estado === 'activo')
    .reduce((sum, c) => sum + c.monto_indexado_ves, 0);

  const totalPagarUSD = totalPagarVES / tasaBCV;

  const totalCobrarVES = empresaContratos
    .filter(c => c.tipo_flujo === 'empresa_a_socio' && c.estado === 'activo')
    .reduce((sum, c) => sum + c.monto_indexado_ves, 0);

  const totalCobrarUSD = totalCobrarVES / tasaBCV;

  const pendingTx = empresaTx.filter(t => t.estado_conciliacion === 'pendiente').length;
  const hasActaVigente = empresaActas.some(a => a.estatus_libro_fisico);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Blindaje Corporativo SENIAT
              </span>
              <span className="text-xs text-slate-500 font-medium">• Ejercicio Fiscal 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {empresa.razon_social}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Sistema de control probatorio de préstamos mutuos, conciliación bancaria de cuentas 103/203, control de IGTF y certificación de fecha cierta.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenCompanyManager && (
              <button
                onClick={onOpenCompanyManager}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
                title="Directorio y administración multi-empresa"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Gestionar Empresas</span>
              </button>
            )}

            {onOpenFiscalReport && (
              <button
                onClick={onOpenFiscalReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
                title="Exportar resumen consolidado en Excel para el Cierre Fiscal SENIAT"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Reporte Cierre Fiscal (Excel)</span>
              </button>
            )}

            {onOpenLineaCredito && (
              <button
                onClick={onOpenLineaCredito}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 font-medium text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
                title="Abrir Contrato Marco de Línea de Crédito Rotativa (1 Notaría Anual para agrupar múltiples transferencias)"
              >
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                <span>Contrato Marco de Línea</span>
                <span className="bg-blue-200/70 text-blue-800 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                  1 Notaría/Año
                </span>
              </button>
            )}

            <button
              onClick={onOpenContractWizard}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Contrato de Mutuo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strategic Note for Línea de Crédito Rotativa */}
      {onOpenLineaCredito && (
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 sm:p-4.5 shadow-2xs relative text-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                <Scale className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.2 rounded">
                    Blindaje Notarial
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    1 Notaría Anual para Múltiples Transferencias al Mes
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  Ampara todos los retiros mensuales de los socios con un solo Contrato Marco autenticado al año (Art. 503 C.Com y Art. 73 LISLR), liquidado mediante Memoria de Cálculo y Nota de Débito mensual No Sujeta a IVA.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={onOpenLineaCredito}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>Ver Contrato Marco</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Especial de 29 Recibos de Cupo para Agrícola Oni & Manuel Alejandro Becerra Luis */}
      {(empresa.id === 'emp-oni' || empresa.razon_social.toUpperCase().includes('AGRICOLA ONI')) && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-sm">
                  <Receipt className="w-5 h-5 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                      29 Recibos de Cupo Listos
                    </span>
                    <span className="text-xs font-mono text-blue-200">
                      Banesco Cta. 5128 • Salidas: Bs. 498.400.605,30
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Expediente de Desembolsos de Línea de Crédito: Sr. Manuel Alejandro Becerra Luis
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Cada una de las 29 transferencias cuenta con su comprobante oficial de cupo, desglose acumulado y remanente disponible.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onNavigateTab('recibos_cupo')}
                  className="w-full md:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ver los 29 Recibos de Cupo</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>

          {/* Banner de los 18 Recibos de Pagos Recibidos (Amortizaciones de Intereses y Capital) */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-600/60 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                      18 Recibos de Pagos Recibidos Listos
                    </span>
                    <span className="text-xs font-mono text-emerald-200">
                      Banesco Cta. 5128 • Total Pagado: Bs. 186.376.000,00
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Expediente de Amortización: Intereses (Bs. 45.095.346,46) y Capital (Bs. 141.280.653,54)
                  </h3>
                  <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
                    Aplicación legal de pagos (Art. 529 Cód. Comercio): cobro de intereses con 5% de Retención ISLR y abono neto a capital. Saldo deudor reducido a Bs. 357.119.951,76 y cupo disponible reconstituido a Bs. 242.880.048,24.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onNavigateTab('recibos_pagos')}
                  className="w-full md:w-auto px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ver los 18 Recibos de Pago</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>

          {/* Banner Maestro: Cruce Periódico de 47 Movimientos & Descarga Excel */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-amber-500/50 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
                  <FileSpreadsheet className="w-5 h-5 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                      Cruce Periódico Integral (47 Movimientos)
                    </span>
                    <span className="text-xs font-mono text-amber-200">
                      Saldo Vivo: Bs. 357.119.951,76 • Cupo Disp.: Bs. 242.880.048,24
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Libro Maestro de Control: 29 Cupos Desembolsados vs. 18 Amortizaciones de Intereses y Capital
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Estado de cuenta cronológico completo con dictamen pericial contable venezolano, asientos de diario VEN-NIF PYME, aplicación del Art. 529 Código de Comercio y exportación a Excel (.xls) en 4 hojas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onNavigateTab('cruce_periodico')}
                  className="w-full md:w-auto px-4.5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                  <span>Ver Cruce &amp; Descargar Excel</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Cuentas por Pagar (90% case) */}
        <div 
          onClick={() => onNavigateTab('contratos')}
          className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Cuentas por Pagar Socios</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pasivo (90%)
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
            {formatUSD(totalPagarUSD)}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            {formatVES(totalPagarVES)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Blindadas contra Ventas Omitidas</span>
          </div>
        </div>

        {/* Metric 2: Cuentas por Cobrar (Alto Riesgo) */}
        <div 
          onClick={() => onNavigateTab('contratos')}
          className="bg-white border border-slate-200 hover:border-rose-400 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Cuentas por Cobrar Socios</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Activo (Riesgo)
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-slate-900 group-hover:text-rose-700 transition-colors">
            {formatUSD(totalCobrarUSD)}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1">
            {formatVES(totalCobrarVES)}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sujeto a control Art. 72 LISLR</span>
          </div>
        </div>

        {/* Metric 3: Gobierno Corporativo */}
        <div 
          onClick={() => onNavigateTab('asamblea')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Actas de Asamblea Macro</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Gobierno
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
            {empresaActas.length} Actas
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {hasActaVigente ? 'Asentada en libro físico mercantil' : 'Pendiente asentar'}
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Líneas de Mutuo Autorizadas</span>
          </div>
        </div>

        {/* Metric 4: Tasa Oficial BCV */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Tasa Oficial BCV</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Referencia
            </span>
          </div>
          <div className="font-mono text-2xl font-black text-blue-700">
            Bs. {tasaBCV.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Indexación automática en contratos
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Actualización diaria de cotización
          </div>
        </div>

      </div>

      {/* Módulo 4: Semáforo de Riesgo y Subcapitalización (Injected) */}
      <RiskSemaphore
        contratos={contratos}
        empresa={empresa}
        tasaBCV={tasaBCV}
        onOpenCapitalization={onOpenCapitalization}
      />

      {/* Quick Access Modules Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Module 1 Card */}
        <div 
          onClick={() => onNavigateTab('matching')}
          className="bg-white border border-slate-200 hover:border-blue-500/60 p-5 rounded-2xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Módulo 1: Matching Bancario
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Vincule cada transferencia bancaria con el contrato de mutuo para crear un rastro de auditoría irrefutable.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-amber-700 font-semibold">{pendingTx} sin conciliar</span>
            <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Abrir Conciliador <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Module 2 Card */}
        <div 
          onClick={() => onNavigateTab('asientos')}
          className="bg-white border border-slate-200 hover:border-emerald-500/60 p-5 rounded-2xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Módulo 2: Asientos VEN-NIF
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Descargue asientos de diario con cuentas 2.01.03 para Saint, Profit Plus o Galac Software con glosas blindadas.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">Simetría Contable</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Exportar Asientos <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Module 3 Card */}
        <div 
          onClick={() => onNavigateTab('igtf')}
          className="bg-white border border-slate-200 hover:border-amber-500/60 p-5 rounded-2xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Módulo 3: Control de IGTF (3%)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Cálculo y emisión de comprobantes guía para el entero del 3% en aportes de divisas físicas o USDT de accionistas.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-600 font-medium">
              {empresa.tipo_contribuyente === 'Especial' ? 'Sujeto Pasivo Especial' : 'Contribuyente Ordinario'}
            </span>
            <span className="text-amber-700 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ver Guías IGTF <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* Cierre Fiscal SENIAT Consolidated Export Banner */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                Auditoría SENIAT
              </span>
              <span className="text-xs font-semibold text-emerald-900">
                Cierre Fiscal y Declaración Definitiva ISLR
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Reporte Consolidado de Cuentas por Pagar y Cobrar Socios ({empresa.razon_social})
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Genera la cédula analítica en formato Excel para conciliar saldos de las cuentas 2.1.03 y 1.1.03, verificar retenciones IGTF 3% y sustentar los préstamos mutuos ante los auditores fiscales.
            </p>
          </div>
        </div>

        {onOpenFiscalReport && (
          <button
            onClick={onOpenFiscalReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Abrir Cédula Fiscal Excel</span>
          </button>
        )}
      </div>

      {/* Fiscal Shield 5-Step Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Checklist de Blindaje ante una Fiscalización del SENIAT
              </h3>
              <p className="text-xs text-slate-500">
                Protocolo estricto para evitar actas de reparo y multas en cuentas de socios
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Acta Macro</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Autorización previa asentada en Libro de Actas sellado por Registro Mercantil.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Contrato de Mutuo</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cláusula de gratuidad (frena intereses presuntos) e indexación a tasa oficial BCV.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>3. Soporte Material</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Referencia bancaria vinculada, Recibo de Caja o Hash Blockchain (TXID).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Asiento VEN-NIF</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Registro estricto en Pasivo 2.01.03, nunca en cuentas de ingresos corrientes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>5. Fecha Cierta</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Sellado criptográfico en Blockchain con verificación pública inalterable para el fiscal.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
