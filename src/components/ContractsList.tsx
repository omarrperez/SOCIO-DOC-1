import React, { useState } from 'react';
import { ContratoMutuo, Empresa, Accionista } from '../types';
import { formatVES, formatUSD, formatUSDT, formatFechaLarga } from '../utils/formatters';
import { 
  FileText, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Coins, 
  Sparkles, 
  BookOpen, 
  Plus, 
  ExternalLink,
  Receipt,
  Download,
  FileDown,
  FileSpreadsheet,
  Calculator,
  Scale
} from 'lucide-react';
import { downloadContractPDF, downloadContractWord } from '../utils/documentExport';

interface ContractsListProps {
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
  onOpenContractWizard: () => void;
  onOpenViewDocument: (contrato: ContratoMutuo) => void;
  onOpenAccountingEntry: (contrato: ContratoMutuo) => void;
  onOpenCapitalization: (contrato: ContratoMutuo) => void;
  onOpenValidator: (contratoId: string) => void;
  onOpenFiscalReport?: () => void;
  onOpenMonthlyCalc?: (contrato: ContratoMutuo) => void;
  onOpenLineaCredito?: () => void;
}

export const ContractsList: React.FC<ContractsListProps> = ({
  contratos,
  empresa,
  accionistas,
  tasaBCV,
  onOpenContractWizard,
  onOpenViewDocument,
  onOpenAccountingEntry,
  onOpenCapitalization,
  onOpenValidator,
  onOpenFiscalReport,
  onOpenMonthlyCalc,
  onOpenLineaCredito,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlujo, setFilterFlujo] = useState<'todos' | 'pagar' | 'cobrar'>('todos');
  const [filterActivo, setFilterActivo] = useState<string>('todos');

  const empresaContratos = contratos.filter(c => c.empresa_id === empresa.id);

  const filteredContratos = empresaContratos.filter(c => {
    const acc = accionistas.find(a => a.id === c.accionista_id);
    const matchesSearch = c.correlativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.destino_fondos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc?.nombre_accionista.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFlujo = filterFlujo === 'todos'
      ? true
      : filterFlujo === 'pagar'
        ? c.tipo_flujo === 'socio_a_empresa'
        : c.tipo_flujo === 'empresa_a_socio';

    const matchesActivo = filterActivo === 'todos' ? true : c.tipo_activo === filterActivo;

    return matchesSearch && matchesFlujo && matchesActivo;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar correlativo, socio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterFlujo('todos')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${filterFlujo === 'todos' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Todos ({empresaContratos.length})
            </button>
            <button
              onClick={() => setFilterFlujo('pagar')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${filterFlujo === 'pagar' ? 'bg-emerald-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Por Pagar (Aportes)
            </button>
            <button
              onClick={() => setFilterFlujo('cobrar')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${filterFlujo === 'cobrar' ? 'bg-rose-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Por Cobrar (Préstamos)
            </button>
          </div>

          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="todos">Cualquier Moneda</option>
            <option value="USD_EFECTIVO">USD en Efectivo</option>
            <option value="USD_TRANSFERENCIA">USD Transferencia</option>
            <option value="VES">Bolívares (VES)</option>
            <option value="USDT">Cripto (USDT)</option>
          </select>

        </div>

        <div className="flex items-center gap-2">
          {onOpenMonthlyCalc && empresaContratos.length > 0 && (
            <button
              onClick={() => {
                const conInteres = empresaContratos.find(c => c.tipo_flujo === 'empresa_a_socio' || c.aplica_interes) || empresaContratos[0];
                onOpenMonthlyCalc(conInteres);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Calcular memoria de intereses mensuales y emitir Nota de Débito Fiscal bajo Art. 72 LISLR"
            >
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>Memoria & Nota Débito</span>
            </button>
          )}

          {onOpenFiscalReport && (
            <button
              onClick={onOpenFiscalReport}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Exportar resumen consolidado de cuentas por pagar y cobrar en Excel para el SENIAT"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Cierre Fiscal (Excel)</span>
            </button>
          )}

          {onOpenLineaCredito && (
            <button
              onClick={onOpenLineaCredito}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 text-xs font-medium rounded-xl transition-colors cursor-pointer shadow-2xs"
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contrato de Mutuo</span>
          </button>
        </div>
      </div>

      {/* Contracts Table/Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Correlativo & Fecha</th>
                <th className="py-3.5 px-4">Flujo & Accionista</th>
                <th className="py-3.5 px-4">Monto & Moneda</th>
                <th className="py-3.5 px-4">Soporte Probatorio SENIAT</th>
                <th className="py-3.5 px-4">Condición Fiscal</th>
                <th className="py-3.5 px-4 text-center">Fecha Cierta</th>
                <th className="py-3.5 px-4 text-right">Acciones Documentales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContratos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No se encontraron contratos de mutuo registrados.
                  </td>
                </tr>
              ) : (
                filteredContratos.map(contrato => {
                  const acc = accionistas.find(a => a.id === contrato.accionista_id);
                  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';
                  const isCapitalizado = contrato.estado === 'capitalizado';

                  return (
                    <tr key={contrato.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{contrato.correlativo}</span>
                          {isCapitalizado && (
                            <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 font-semibold px-1.5 py-0.5 rounded">
                              Capitalizado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{contrato.fecha_inicio}</div>
                        <div className="text-[10px] text-slate-500">Vence: {contrato.fecha_vencimiento}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{acc?.nombre_accionista}</div>
                        <div className="text-[11px] text-slate-500">C.I. V-{acc?.cedula_accionista} ({acc?.porcentaje_acciones}%)</div>
                        <span className={`inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          isSocioAEmpresa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isSocioAEmpresa ? 'Cuenta por Pagar' : 'Cuenta por Cobrar (Art. 72)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 text-sm">
                          {contrato.tipo_activo === 'VES' ? formatVES(contrato.monto_original) : (contrato.tipo_activo === 'USDT' ? formatUSDT(contrato.monto_original) : formatUSD(contrato.monto_original))}
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium">
                          Equiv. {contrato.tipo_activo === 'VES' ? formatUSD(contrato.monto_indexado_usd) : formatVES(contrato.monto_indexado_ves)}
                        </div>
                        <div className="text-[10px] text-slate-500">BCV: Bs. {contrato.tasa_bcv_fecha.toFixed(2)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {contrato.tipo_activo === 'USD_EFECTIVO' ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-amber-800 font-bold flex items-center gap-1">
                              <Receipt className="w-3.5 h-3.5 text-amber-600" />
                              {contrato.soporte.recibo_caja_correlativo || 'REC-CAJA'}
                            </span>
                            <div className="text-[10px] text-slate-500">Caja Principal M.E.</div>
                            {contrato.soporte.igtf_aplica && (
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium inline-block mt-0.5">
                                IGTF 3%: {formatUSD(contrato.soporte.igtf_monto_usd)}
                              </span>
                            )}
                          </div>
                        ) : contrato.tipo_activo === 'USDT' ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-emerald-800 font-semibold truncate max-w-xs block">
                              TXID: {contrato.soporte.txid_blockchain?.substring(0, 14)}...
                            </span>
                            <div className="text-[10px] text-slate-500">{contrato.soporte.red_blockchain}</div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-slate-800 font-semibold">
                              {contrato.soporte.referencia_bancaria || 'REF-BANCARIA'}
                            </span>
                            <div className="text-[10px] text-slate-500">{contrato.soporte.banco_origen || 'Banco'}</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {!contrato.aplica_interes ? (
                          <span className="text-blue-800 text-[11px] font-semibold block">
                            Gratuito (Sin Interés)
                            <span className="text-[10px] text-slate-500 font-normal block">Art. 1.745 CC • Tasa 0%</span>
                          </span>
                        ) : (
                          <span className="text-emerald-800 text-[11px] font-semibold block">
                            {contrato.modalidad_tasa === 'indexada_12_usd' || contrato.modalidad_tasa === 'indexada_usd_12' 
                              ? 'Indexado 12% Anual USD' 
                              : `Tasa: ${contrato.tasa_interes}%/mes`}
                            <span className="text-[10px] text-slate-500 font-normal block font-mono">
                              Retención 5% • No Sujeto IVA
                            </span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onOpenValidator(contrato.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Bloque #{contrato.soporte.block_number}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const socio = accionistas.find(a => a.id === contrato.accionista_id) || accionistas[0];
                              downloadContractPDF(contrato, empresa, socio);
                            }}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                            title="Descargar Contrato en PDF"
                          >
                            <Download className="w-4 h-4 text-rose-600" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const socio = accionistas.find(a => a.id === contrato.accionista_id) || accionistas[0];
                              downloadContractWord(contrato, empresa, socio);
                            }}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                            title="Descargar Contrato en Word (.doc editable)"
                          >
                            <FileDown className="w-4 h-4 text-blue-600" />
                          </button>

                          <button
                            onClick={() => onOpenViewDocument(contrato)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Ver Contrato & Recibo"
                          >
                            <FileText className="w-4 h-4 text-slate-600" />
                          </button>

                          <button
                            onClick={() => onOpenAccountingEntry(contrato)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Ver Asiento Contable VEN-NIF"
                          >
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                          </button>

                          {onOpenMonthlyCalc && (
                            <button
                              onClick={() => onOpenMonthlyCalc(contrato)}
                              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                !isSocioAEmpresa || contrato.aplica_interes
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title="Memoria de Cálculo de Intereses & Nota de Débito Fiscal"
                            >
                              <Calculator className="w-4 h-4 text-amber-700" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenValidator(contrato.id)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Ver Expediente de Fecha Cierta"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                          </button>

                          {isSocioAEmpresa && !isCapitalizado && (
                            <button
                              onClick={() => onOpenCapitalization(contrato)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Capitalizar este pasivo a Capital Social"
                            >
                              Capitalizar
                            </button>
                          )}
                        </div>
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
  );
};
