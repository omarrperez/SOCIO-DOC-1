import React, { useState, useMemo } from 'react';
import { Empresa, Accionista, ContratoMutuo } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { 
  downloadFiscalClosingExcel, 
  copyFiscalClosingToClipboard, 
  FiscalCsvOptions 
} from '../utils/csvExport';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  Search, 
  Info, 
  Building2, 
  Coins, 
  Scale, 
  FileCheck2,
  Calendar
} from 'lucide-react';

interface FiscalClosingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa;
  contratos: ContratoMutuo[];
  accionistas: Accionista[];
  tasaBCV: number;
}

export const FiscalClosingReportModal: React.FC<FiscalClosingReportModalProps> = ({
  isOpen,
  onClose,
  empresa,
  contratos,
  accionistas,
  tasaBCV,
}) => {
  const [delimiter, setDelimiter] = useState<';' | ','>(';');
  const [filterFlujo, setFilterFlujo] = useState<'todos' | 'pagar' | 'cobrar'>('todos');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'cancelado' | 'capitalizado'>('todos');
  const [filterActivo, setFilterActivo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);

  // Filter contracts for this company
  const empresaContratos = useMemo(() => {
    return contratos.filter(c => c.empresa_id === empresa.id);
  }, [contratos, empresa.id]);

  // Filtered dataset for preview and export
  const filteredContratos = useMemo(() => {
    return empresaContratos.filter(c => {
      const acc = accionistas.find(a => a.id === c.accionista_id);
      const matchesSearch = c.correlativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.destino_fondos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (acc?.nombre_accionista.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (acc?.cedula_accionista.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesFlujo = filterFlujo === 'todos'
        ? true
        : filterFlujo === 'pagar'
          ? c.tipo_flujo === 'socio_a_empresa'
          : c.tipo_flujo === 'empresa_a_socio';

      const matchesEstado = filterEstado === 'todos' ? true : c.estado === filterEstado;
      const matchesActivo = filterActivo === 'todos' ? true : c.tipo_activo === filterActivo;

      return matchesSearch && matchesFlujo && matchesEstado && matchesActivo;
    });
  }, [empresaContratos, accionistas, searchTerm, filterFlujo, filterEstado, filterActivo]);

  // Aggregate totals
  const totals = useMemo(() => {
    const pagar = filteredContratos
      .filter(c => c.tipo_flujo === 'socio_a_empresa')
      .reduce((acc, c) => acc + c.saldo_pendiente, 0);

    const cobrar = filteredContratos
      .filter(c => c.tipo_flujo === 'empresa_a_socio')
      .reduce((acc, c) => acc + c.saldo_pendiente, 0);

    const igtfUSD = filteredContratos.reduce((acc, c) => acc + (c.soporte?.igtf_monto_usd || 0), 0);
    const igtfVES = filteredContratos.reduce((acc, c) => acc + (c.soporte?.igtf_monto_ves || 0), 0);

    return {
      totalPagarUSD: pagar,
      totalPagarVES: pagar * tasaBCV,
      totalCobrarUSD: cobrar,
      totalCobrarVES: cobrar * tasaBCV,
      saldoNetoUSD: pagar - cobrar,
      saldoNetoVES: (pagar - cobrar) * tasaBCV,
      totalIgtfUSD: igtfUSD,
      totalIgtfVES: igtfVES,
      countPagar: filteredContratos.filter(c => c.tipo_flujo === 'socio_a_empresa').length,
      countCobrar: filteredContratos.filter(c => c.tipo_flujo === 'empresa_a_socio').length,
    };
  }, [filteredContratos, tasaBCV]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const options: FiscalCsvOptions = {
      delimiter,
      filterFlujo,
      filterEstado,
      filterActivo,
      fechaCorte,
      includeHeaderMetadata: true,
      includeSummary,
    };
    downloadFiscalClosingExcel(empresa, contratos, accionistas, tasaBCV, options);
  };

  const handleCopyClipboard = async () => {
    const options: FiscalCsvOptions = {
      filterFlujo,
      filterEstado,
      filterActivo,
      fechaCorte,
      includeHeaderMetadata: true,
      includeSummary,
    };
    const success = await copyFiscalClosingToClipboard(empresa, contratos, accionistas, tasaBCV, options);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Cierre Fiscal SENIAT
                </span>
                <span className="text-xs text-slate-300">
                  Exportación Consolidada Excel
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Resumen de Cuentas por Pagar y Cobrar Socios
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company & Fiscal Context Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">{empresa.razon_social}</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              RIF: {empresa.rif_empresa}
            </span>
            <span className={`px-2 py-0.5 rounded font-semibold ${
              empresa.tipo_contribuyente === 'Especial' 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {empresa.tipo_contribuyente === 'Especial' ? 'Sujeto Pasivo Especial' : 'Contribuyente Ordinario'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-500">Tasa Oficial BCV:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                Bs. {tasaBCV.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500">Fecha Corte:</span>
              <input 
                type="date" 
                value={fechaCorte}
                onChange={(e) => setFechaCorte(e.target.value)}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* KPI Cards: Fiscal Balance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Cuentas por Pagar (Pasivos) */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-emerald-800">CxP Socios (Pasivo)</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  Cuenta 2.1.03
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatUSD(totals.totalPagarUSD)}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                {formatVES(totals.totalPagarVES)}
              </div>
              <div className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{totals.countPagar} contratos de mutuo recibidos</span>
              </div>
            </div>

            {/* Cuentas por Cobrar (Activos) */}
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-blue-800">CxC Socios (Activo)</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Cuenta 1.1.03
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatUSD(totals.totalCobrarUSD)}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                {formatVES(totals.totalCobrarVES)}
              </div>
              <div className="text-[11px] text-blue-700 mt-2 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                <span>{totals.countCobrar} préstamos a socios (Art. 72 LISLR)</span>
              </div>
            </div>

            {/* Saldo Neto */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">Posición Neta Accionistas</span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                  totals.saldoNetoUSD >= 0 
                    ? 'bg-slate-100 text-slate-700 border-slate-300' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {totals.saldoNetoUSD >= 0 ? 'Acreedora' : 'Deudora'}
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatUSD(totals.saldoNetoUSD)}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                {formatVES(totals.saldoNetoVES)}
              </div>
              <div className="text-[11px] text-slate-600 mt-2">
                {totals.saldoNetoUSD >= 0 
                  ? 'La empresa adeuda fondos a los socios' 
                  : 'Los socios adeudan fondos a la empresa'}
              </div>
            </div>

            {/* Retenciones IGTF */}
            <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-purple-800">Retención IGTF 3%</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                  G.O. 6.687
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatUSD(totals.totalIgtfUSD)}
              </div>
              <div className="text-xs font-mono text-purple-700 mt-0.5 font-medium">
                {formatVES(totals.totalIgtfVES)}
              </div>
              <div className="text-[11px] text-purple-700 mt-2 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                <span>Percibido en pagos divisas/cripto</span>
              </div>
            </div>
          </div>

          {/* Filter Bar & Export Configuration */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filtros y Parámetros del Archivo Excel:</span>
              </div>

              {/* Format options */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-normal text-slate-600">Incluir bloque de resumen ejecutivo</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-normal">Delimitador:</span>
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value as ';' | ',')}
                    className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-mono font-semibold"
                  >
                    <option value=";">Punto y coma (;) - Excel en Español</option>
                    <option value=",">Coma (,) - Internacional / PowerBI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar socio, correlativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Flujo filter */}
              <div>
                <select
                  value={filterFlujo}
                  onChange={(e) => setFilterFlujo(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="todos">Todos los flujos (CxP y CxC)</option>
                  <option value="pagar">Solo Cuentas por Pagar (Pasivo)</option>
                  <option value="cobrar">Solo Cuentas por Cobrar (Activo)</option>
                </select>
              </div>

              {/* Estado filter */}
              <div>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="todos">Todos los estatus</option>
                  <option value="activo">Solo Activos (Saldos Vivos)</option>
                  <option value="cancelado">Cancelados / Liquidados</option>
                  <option value="capitalizado">Capitalizados a Capital Social</option>
                </select>
              </div>

              {/* Activo filter */}
              <div>
                <select
                  value={filterActivo}
                  onChange={(e) => setFilterActivo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="todos">Todas las monedas/activos</option>
                  <option value="USD_EFECTIVO">USD Efectivo (Caja)</option>
                  <option value="USD_TRANSFERENCIA">USD Transferencia</option>
                  <option value="VES">Bolívares (VES)</option>
                  <option value="USDT">Criptomonedas (USDT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Data Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Vista previa de registros a exportar ({filteredContratos.length} contratos seleccionados):
              </span>
              <span className="text-slate-500 text-[11px]">
                Mostrando datos consolidados para la contabilidad
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Correlativo</th>
                      <th className="py-2.5 px-3">Cuenta VEN-NIF</th>
                      <th className="py-2.5 px-3">Accionista</th>
                      <th className="py-2.5 px-3">Moneda</th>
                      <th className="py-2.5 px-3 text-right">Saldo USD</th>
                      <th className="py-2.5 px-3 text-right">Saldo VES</th>
                      <th className="py-2.5 px-3">Soporte</th>
                      <th className="py-2.5 px-3">IGTF</th>
                      <th className="py-2.5 px-3">Riesgo SENIAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContratos.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500">
                          No se encontraron contratos con los filtros aplicados para {empresa.razon_social}.
                        </td>
                      </tr>
                    ) : (
                      filteredContratos.map(c => {
                        const accionista = accionistas.find(a => a.id === c.accionista_id);
                        const isSocioAEmpresa = c.tipo_flujo === 'socio_a_empresa';
                        const saldoVES = c.saldo_pendiente * tasaBCV;

                        return (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">
                              {c.correlativo}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isSocioAEmpresa 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {isSocioAEmpresa ? '2.1.03 CxP' : '1.1.03 CxC'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-800">
                                {accionista?.nombre_accionista || 'Accionista'}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {accionista?.rif_accionista || accionista?.cedula_accionista}
                              </div>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {c.tipo_activo}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {formatUSD(c.saldo_pendiente)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">
                              {formatVES(saldoVES)}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-600">
                              {c.soporte?.tipo_soporte === 'bancario' ? 'Bancos' : c.soporte?.tipo_soporte === 'blockchain_txid' ? 'Cripto' : 'Caja'}
                            </td>
                            <td className="py-2 px-3">
                              {c.soporte?.igtf_aplica ? (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                  3% ({formatUSD(c.soporte.igtf_monto_usd)})
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              {isSocioAEmpresa ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Bajo (Gratuito)
                                </span>
                              ) : c.aplica_interes ? (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Medio (Con Int.)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  Alto (Art. 72)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Legal / Fiscal SENIAT Note Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Instrucciones para Auditoría Fiscal del SENIAT y Cierre de Ejercicio:
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Este reporte consolidado en formato Excel contiene la codificación probatoria requerida por el SENIAT para verificar el origen y destino de fondos entre la sociedad mercantil y sus socios. Para las <strong>Cuentas por Pagar (2.1.03)</strong>, acredita la no causación de ingresos presuntos o ventas omitidas mediante el contrato de mutuo y soporte bancarizado. Para las <strong>Cuentas por Cobrar (1.1.03)</strong>, documenta los préstamos otorgados y mitiga reparos por dividendos presuntos conforme al Art. 72 de la Ley de ISLR.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Archivo codificado en <strong>UTF-8 con BOM</strong> para apertura inmediata en Excel sin descuadre de caracteres.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Copiar datos tabulados para pegar directamente en Excel"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">¡Copiado a Excel!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copiar al Portapapeles</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Excel para SENIAT</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
