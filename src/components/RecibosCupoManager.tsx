import React, { useState } from 'react';
import { Empresa, Accionista, ContratoMutuo, ReciboCupo } from '../types';
import { formatVES, formatUSD, formatFechaLarga, numeroALetras } from '../utils/formatters';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Printer, 
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
  Scale,
  TrendingUp
} from 'lucide-react';
import { 
  downloadReciboCupoWord, 
  downloadReciboCupoPDF, 
  downloadTodosRecibosWord, 
  downloadLibroCuposExcel 
} from '../utils/documentExport';
import { TablaTasasBcvModal } from './TablaTasasBcvModal';
import { 
  RECIBOS_CUPO_AGRICOLA_ONI, 
  TOTAL_SALIDAS_BANESCO_VES, 
  TOTAL_SALIDAS_BANESCO_USD,
  LIMITE_LINEA_CREDITO_VES, 
  REMANENTE_LINEA_CREDITO_VES 
} from '../data/recibosCupoData';

interface RecibosCupoManagerProps {
  empresa: Empresa;
  accionistas: Accionista[];
  contratos: ContratoMutuo[];
  tasaBCV: number;
  onOpenLineaCredito?: (contrato?: ContratoMutuo) => void;
  onNavigateToRecibosPagos?: () => void;
  onNavigateToCrucePeriodico?: () => void;
}

export const RecibosCupoManager: React.FC<RecibosCupoManagerProps> = ({
  empresa,
  accionistas,
  contratos,
  tasaBCV,
  onOpenLineaCredito,
  onNavigateToRecibosPagos,
  onNavigateToCrucePeriodico,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecibo, setSelectedRecibo] = useState<ReciboCupo | null>(null);
  const [sortOrder, setSortOrder] = useState<'archivo' | 'cronologico'>('archivo');
  const [showBcvModal, setShowBcvModal] = useState<boolean>(false);

  // Identify partner Manuel Alejandro Becerra Luis
  const socioManuelBecerra = accionistas.find(
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

  const recibos = RECIBOS_CUPO_AGRICOLA_ONI;

  const filteredRecibos = [...recibos]
    .filter(r => {
      const q = searchTerm.toLowerCase();
      return (
        r.numero_recibo.toLowerCase().includes(q) ||
        r.referencia_bancaria.toLowerCase().includes(q) ||
        r.fecha.includes(q) ||
        r.monto_ves.toString().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'cronologico') {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      }
      return a.numero_cupo - b.numero_cupo;
    });

  const totalDisposicion = TOTAL_SALIDAS_BANESCO_VES;
  const limiteLinea = LIMITE_LINEA_CREDITO_VES;
  const remanenteLinea = REMANENTE_LINEA_CREDITO_VES;
  const porcentajeConsumido = (totalDisposicion / limiteLinea) * 100;

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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner - Línea de Crédito & Resumen de los 29 Cupos */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border border-blue-900/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Receipt className="w-3.5 h-3.5" />
                <span>Expediente de 29 Recibos de Cupo</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/80 text-blue-200 border border-blue-700/60 font-mono">
                Banesco: TRFMB 0134 J501456380 AGRICOLA ONICA 5128
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SENIAT Blindado • Art. 72 LISLR</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{empresa.razon_social}</span>
                <ArrowRight className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-semibold">{socioManuelBecerra.nombre_accionista}</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Comprobantes oficiales de disposición de cupo de la <strong>Línea de Crédito General Rotativa (LC-ONI-2026-0001)</strong>. Potestad estatutaria directa según Registro de Comercio del 13/09/2021 (Capítulo IV, Cláusula Décima Cuarta, Numeral O). Tasa Activa Promedio Ponderada de los 6 principales bancos fijada por el BCV (59.12% anual / 4.93% mensual), con retención del 5% de ISLR y no sujeción a IVA (Art. 16 Num 3 LIVA).
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToCrucePeriodico && (
              <button
                type="button"
                onClick={onNavigateToCrucePeriodico}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-amber-300"
                title="Ir al Cruce Periódico Consolidado de los 47 Movimientos (29 Cupos + 18 Pagos)"
              >
                <Scale className="w-4 h-4 text-slate-950" />
                <span>Ver Cruce Periódico (47)</span>
              </button>
            )}

            {onNavigateToRecibosPagos && (
              <button
                type="button"
                onClick={onNavigateToRecibosPagos}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-emerald-300"
                title="Ir al expediente de los 18 Recibos de Pagos Recibidos (Intereses y Capital)"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Ver 18 Recibos de Pago</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowBcvModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-indigo-400/40"
              title="Ver tabla oficial de cotizaciones BCV del año 2026 aplicadas a los 29 cupos"
            >
              <TrendingUp className="w-4 h-4 text-indigo-200" />
              <span>Tabla Tasas BCV (Oficial)</span>
            </button>

            <button
              type="button"
              onClick={() => downloadTodosRecibosWord(recibos, empresa, socioManuelBecerra, contratoLineaCredito)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-blue-400/40"
              title="Descargar los 29 recibos organizados en un solo documento Word listo para imprimir"
            >
              <FileDown className="w-4 h-4" />
              <span>Descargar TODOS (29 Word)</span>
            </button>

            <button
              type="button"
              onClick={() => downloadLibroCuposExcel(recibos, empresa, socioManuelBecerra, contratoLineaCredito)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer border border-emerald-400/40"
              title="Descargar libro de control de los 29 cupos en Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Libro Control (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenLineaCredito) {
                  onOpenLineaCredito(contratoLineaCredito);
                }
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ver Contrato Notarial</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div className="mt-6 pt-5 border-t border-blue-900/60 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Límite Autorizado (1 Año):</div>
            <div className="text-base font-black text-white font-mono mt-0.5">{formatVES(limiteLinea)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Techo Máximo Rotativo</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-[11px] text-amber-300 font-medium">Total 29 Salidas Banesco:</div>
            <div className="text-base font-black text-amber-400 font-mono mt-0.5">{formatVES(totalDisposicion)}</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">${formatUSD(TOTAL_SALIDAS_BANESCO_USD)} USD (Tasas BCV)</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-[11px] text-emerald-300 font-medium">Cupo Remanente Disponible:</div>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">{formatVES(remanenteLinea)}</div>
            <div className="text-[10px] text-emerald-200/80 mt-0.5">Disponible para nuevos cupos</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="text-[11px] text-indigo-300 font-medium">Porcentaje Utilizado:</div>
            <div className="text-base font-black text-indigo-400 font-mono mt-0.5">{porcentajeConsumido.toFixed(1)}%</div>
            <div className="w-full bg-slate-700/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-700" 
                style={{ width: `${porcentajeConsumido}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Notes Bar */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong>Blindaje Notarial y Bancario:</strong> Cada uno de estos 29 recibos constituye la prueba material fehaciente de la disposición parcial de la línea de crédito autorizada en los estatutos de <strong>Agrícola Oni, C.A.</strong> (R.I.F. <strong>J-50145638-0</strong>). Amparan las 29 transferencias salientes de la cuenta corriente Banesco terminada en <strong>5128</strong> hacia el Sr. <strong>Manuel Alejandro Becerra Luis</strong> (C.I. <strong>V-24.224.176</strong>).
          </div>
        </div>
        <div className="shrink-0 font-mono text-[11px] font-bold text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-2xs">
          29 de 29 Emitidos
        </div>
      </div>

      {/* Search and Table Control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por correlativo (ej. RC-0015), referencia o monto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setSortOrder('archivo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sortOrder === 'archivo'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ver en el orden original de las filas del archivo de transferencias bancarias (Cupos 1 al 29)"
            >
              Orden de Archivo (1-29)
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('cronologico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sortOrder === 'cronologico'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ver en orden cronológico por fecha (Mayo a Agosto 2026)"
            >
              Orden Cronológico
            </button>
          </div>

          <div className="text-xs text-slate-600 px-2">
            <span>Mostrando <strong>{filteredRecibos.length}</strong> de 29 recibos</span>
          </div>
        </div>
      </div>

      {/* Recibos Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 text-center">N°</th>
                <th className="py-3 px-3.5">Correlativo Recibo</th>
                <th className="py-3 px-3.5">Fecha</th>
                <th className="py-3 px-3.5">Referencia Banesco</th>
                <th className="py-3 px-3.5 text-right">Monto Cupo (VES)</th>
                <th className="py-3 px-3.5 text-right">Equivalente USD</th>
                <th className="py-3 px-3.5 text-right">Total Acumulado</th>
                <th className="py-3 px-3.5 text-right">Remanente Línea</th>
                <th className="py-3 px-3.5 text-center">Estado Auditoría</th>
                <th className="py-3 px-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecibos.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500 text-xs">
                    No se encontraron recibos de cupo con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredRecibos.map((recibo) => (
                  <tr key={recibo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                      {recibo.numero_cupo}
                    </td>

                    <td className="py-3 px-3.5 font-mono font-bold text-blue-700">
                      {recibo.numero_recibo}
                    </td>

                    <td className="py-3 px-3.5 text-slate-800 font-medium">
                      {recibo.fecha}
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-900 font-medium">
                      {recibo.referencia_bancaria}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {formatVES(recibo.monto_ves)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono text-slate-600">
                      <div>${formatUSD(recibo.monto_usd)}</div>
                      <div className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1 py-0.2 rounded inline-block" title={`Tasa Oficial BCV al ${recibo.fecha}`}>
                        Bs. {recibo.tasa_bcv.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-700">
                      {formatVES(recibo.acumulado_actual_ves)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-emerald-700">
                      {formatVES(recibo.remanente_disponible_ves)}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Blindado</span>
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecibo(recibo)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Ver Recibo
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadReciboCupoWord(recibo, empresa, socioManuelBecerra, contratoLineaCredito)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Descargar en Word (.doc)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadReciboCupoPDF(recibo, empresa, socioManuelBecerra, contratoLineaCredito)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Descargar en PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Official Recibo de Cupo Legal Viewer */}
      {selectedRecibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl my-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Recibo Oficial de Disposición de Cupo Rotativo
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedRecibo.numero_recibo} • Cupo {selectedRecibo.numero_cupo} de 29
                  </p>
                </div>
              </div>

              {/* Navigation and Close */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevRecibo}
                  disabled={selectedRecibo.numero_cupo <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Recibo Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-semibold text-slate-300 px-2">
                  {selectedRecibo.numero_cupo} / 29
                </span>

                <button
                  type="button"
                  onClick={handleNextRecibo}
                  disabled={selectedRecibo.numero_cupo >= 29}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Recibo Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={() => setSelectedRecibo(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Actions Bar */}
            <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">
                Operación Bancaria: <strong className="text-blue-700 font-mono">{selectedRecibo.referencia_bancaria}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadReciboCupoWord(selectedRecibo, empresa, socioManuelBecerra, contratoLineaCredito)}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Word (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadReciboCupoPDF(selectedRecibo, empresa, socioManuelBecerra, contratoLineaCredito)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 font-serif leading-relaxed text-sm bg-white">
              
              {/* Official Letterhead */}
              <div className="p-4 rounded-2xl border-2 border-blue-900 bg-slate-50 flex items-start justify-between gap-4 font-sans">
                <div>
                  <h4 className="font-black text-sm uppercase text-blue-900 tracking-wide">
                    {empresa.razon_social}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    R.I.F. <strong>{empresa.rif_empresa}</strong> • {empresa.registro_mercantil}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Cuenta Banesco Origen: <strong className="font-mono">{selectedRecibo.cuenta_origen}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                    Comprobante SENIAT
                  </span>
                  <div className="text-sm font-mono font-bold text-blue-900 mt-1">
                    {selectedRecibo.numero_recibo}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Fecha: {formatFechaLarga(selectedRecibo.fecha)}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1 font-sans">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  RECIBO DE DISPOSICIÓN DE CUPO ROTATIVO NRO. {selectedRecibo.numero_cupo} DE 29
                </h2>
                <p className="text-xs text-slate-500">
                  Amparado bajo el Contrato Marco de Línea de Crédito General Rotativa Nro. <strong>{selectedRecibo.contrato_correlativo}</strong>
                </p>
              </div>

              {/* Main Body */}
              <p className="text-xs sm:text-sm text-justify leading-relaxed">
                Por medio del presente documento, la sociedad mercantil <strong>{empresa.razon_social}</strong> (inscrita en el R.I.F. bajo el Nro. <strong>{empresa.rif_empresa}</strong>), debidamente representada por su Director Presidente, ciudadano <strong>{empresa.representante_legal}</strong>, titular de la Cédula de Identidad Nro. <strong>{empresa.cedula_representante}</strong>, actuando en ejercicio de la potestad estatutaria directa contemplada en el <strong>Registro de Comercio de fecha 13/09/2021, Capítulo IV, Cláusula Décima Cuarta, Numeral O</strong> (facultad de dar y recibir dinero en mutuo y celebrar cualquier acto o contrato sin necesidad de autorización de la asamblea), hace constar la entrega material e irreversible de fondos por concepto de desembolso parcial de cupo de la Línea de Crédito Rotativa autorizada al ciudadano <strong>{socioManuelBecerra.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>V-{socioManuelBecerra.cedula_accionista}</strong> y R.I.F. Nro. <strong>{socioManuelBecerra.rif_accionista}</strong>, bajo las siguientes condiciones y especificaciones:
              </p>

              {/* Details Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden font-sans text-xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600 w-1/3">Concepto de la Operación:</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-medium">Disposición de Cupo Nro. {selectedRecibo.numero_cupo} de 29 en Línea Rotativa</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Monto Desembolsado (VES):</td>
                      <td className="py-2.5 px-3.5 text-base font-black text-blue-900 font-mono">
                        {formatVES(selectedRecibo.monto_ves)} Bs.
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Monto en Letras:</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-bold uppercase">
                        {numeroALetras(selectedRecibo.monto_ves)} BOLÍVARES
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Contravalor Oficial BCV:</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-mono">
                        ${formatUSD(selectedRecibo.monto_usd)} USD (Tasa Oficial BCV: Bs. {selectedRecibo.tasa_bcv.toFixed(2)})
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Banco Emisor & Cuenta Origen:</td>
                      <td className="py-2.5 px-3.5 text-slate-900">
                        {selectedRecibo.banco_emisor} • Cuenta Nro. <span className="font-mono">{selectedRecibo.cuenta_origen}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Cuenta Destino Beneficiario:</td>
                      <td className="py-2.5 px-3.5 text-slate-900">
                        {socioManuelBecerra.nombre_accionista} • Cuenta Banesco Nro. <span className="font-mono">{selectedRecibo.cuenta_destino}</span>
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Referencia Bancaria Electrónica:</td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">
                        {selectedRecibo.referencia_bancaria}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-600">Régimen Fiscal & Tasa:</td>
                      <td className="py-2.5 px-3.5 text-slate-900">
                        Tasa Activa 6 Bancos ({selectedRecibo.tasa_interes_anual}% anual) • Retención ISLR 5% • No Sujeto IVA
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Control Ledger Box */}
              <div className="space-y-2 font-sans">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Control y Estado Rotativo de la Línea de Crédito General (Bs. 600.000.000,00)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Límite Aprobado:</span>
                    <strong className="font-mono text-slate-900">{formatVES(selectedRecibo.limite_linea_ves)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Acumulado Previo:</span>
                    <strong className="font-mono text-slate-700">{formatVES(selectedRecibo.acumulado_anterior_ves)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 block font-semibold">Este Desembolso:</span>
                    <strong className="font-mono text-amber-800">{formatVES(selectedRecibo.monto_ves)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] text-blue-700 block font-semibold">Total Acumulado:</span>
                    <strong className="font-mono text-blue-900">{formatVES(selectedRecibo.acumulado_actual_ves)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-emerald-700 block font-semibold">Cupo Remanente:</span>
                    <strong className="font-mono text-emerald-800">{formatVES(selectedRecibo.remanente_disponible_ves)}</strong>
                  </div>
                </div>
              </div>

              {/* Statutory & SENIAT Compliance Disclaimer */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-sans leading-relaxed">
                <strong>Blindaje y Cumplimiento Legal SENIAT:</strong> La presente entrega se formaliza en el marco del Contrato Marco de Línea de Crédito General Rotativa Nro. {selectedRecibo.contrato_correlativo}. Devenga intereses a la tasa activa promedio ponderada de los 6 principales bancos comerciales de Venezuela fijada por el BCV ({selectedRecibo.tasa_interes_anual}% anual), sujeta a retención del 5% de I.S.L.R. conforme al Decreto 1808 y desvirtuando presunción de dividendo conforme a los Artículos 72 y 73 de la LISLR. Operación no sujeta a IVA (Art. 16 Num 3 LIVA). El Sr. Manuel Alejandro Becerra Luis declara ser socio del Sr. Elías Rafael Trías Abreu en otra entidad jurídica mercantil, sin tenencia accionaria en Agrícola Oni, C.A.
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center font-sans text-xs">
                <div className="space-y-1 border-t border-slate-900 pt-3">
                  <div className="font-bold text-slate-900">POR LA EMPRESA MUTUANTE</div>
                  <div className="font-bold text-blue-900">{empresa.razon_social}</div>
                  <div className="text-slate-700">{empresa.representante_legal}</div>
                  <div className="text-slate-500">C.I. V-{empresa.cedula_representante} • R.I.F. {empresa.rif_representante || 'V-23997829-7'}</div>
                  <div className="text-slate-500 font-semibold">{empresa.cargo_representante}</div>
                </div>

                <div className="space-y-1 border-t border-slate-900 pt-3">
                  <div className="font-bold text-slate-900">POR EL BENEFICIARIO MUTUARIO</div>
                  <div className="font-bold text-emerald-800">CONFORME RECIBIDO</div>
                  <div className="text-slate-700">{socioManuelBecerra.nombre_accionista}</div>
                  <div className="text-slate-500">C.I. V-{socioManuelBecerra.cedula_accionista} • R.I.F. {socioManuelBecerra.rif_accionista}</div>
                  <div className="text-slate-500">Mutuario / Socio Vinculado</div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Hash SHA-256: {selectedRecibo.hash_sha256?.substring(0, 24)}...
              </span>

              <button
                type="button"
                onClick={() => setSelectedRecibo(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* Official BCV Exchange Rates Modal */}
      <TablaTasasBcvModal 
        isOpen={showBcvModal} 
        onClose={() => setShowBcvModal(false)} 
      />
    </div>
  );
};
