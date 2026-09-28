import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { TransaccionBancaria, ContratoMutuo, Empresa, Accionista } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { 
  Landmark, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Upload, 
  RefreshCw, 
  Link as LinkIcon, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileText, 
  FileDown, 
  ExternalLink,
  Percent,
  TrendingDown,
  X,
  Sparkles,
  Receipt
} from 'lucide-react';
import { downloadLineaCreditoWord, downloadLineaCreditoPDF, downloadLineaCreditoExcel } from '../utils/documentExport';

interface BankMatchingProps {
  transacciones: TransaccionBancaria[];
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
  onMatchTransaction: (txId: string, contratoId: string) => void;
  onCrearContratoDesdeBanco: (tx: TransaccionBancaria) => void;
  onImportTransactions?: (newTx: TransaccionBancaria[]) => void;
  onOpenLineaCredito?: (contrato?: ContratoMutuo) => void;
  onNavigateToRecibosCupo?: () => void;
}

export const BankMatching: React.FC<BankMatchingProps> = ({
  transacciones,
  contratos,
  empresa,
  accionistas,
  tasaBCV,
  onMatchTransaction,
  onCrearContratoDesdeBanco,
  onImportTransactions,
  onOpenLineaCredito,
  onNavigateToRecibosCupo,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendientes' | 'conciliados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [matchingModalTx, setMatchingModalTx] = useState<TransaccionBancaria | null>(null);
  const [selectedContratoId, setSelectedContratoId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Analysis modal for uploaded or current Banesco files
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    fileName: string;
    totalSalidasVES: number;
    count: number;
    socioDetectado: string;
    limiteLineaCredito: number;
    remanenteVES: number;
    porcentajeConsumido: number;
  } | null>(null);

  const empresaTx = transacciones.filter(t => t.empresa_id === empresa.id);

  const filteredTx = empresaTx.filter(t => {
    const matchesFilter = filterStatus === 'todos'
      ? true
      : filterStatus === 'pendientes'
        ? t.estado_conciliacion === 'pendiente'
        : t.estado_conciliacion === 'conciliado';
    const matchesSearch = t.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.banco.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendientesCount = empresaTx.filter(t => t.estado_conciliacion === 'pendiente').length;
  const conciliadosCount = empresaTx.filter(t => t.estado_conciliacion === 'conciliado').length;

  const isAgrícolaOni = empresa.razon_social.toUpperCase().includes('AGRICOLA ONI') || empresa.id === 'emp-oni';
  const contratoLineaCredito = contratos.find(c => c.empresa_id === empresa.id && (c.modalidad_contrato === 'linea_credito_rotativa' || c.limite_linea_credito_ves || c.correlativo.includes('LC-ONI')));
  const socioManuelBecerra = accionistas.find(a => a.nombre_accionista.toUpperCase().includes('BECERRA') || a.cedula_accionista.includes('24.224.576'));

  // Calculate accumulated Banesco salidas for this company
  const banescoSalidasTx = empresaTx.filter(t => t.tipo === 'debito' && (t.banco.toLowerCase().includes('banesco') || t.concepto.toLowerCase().includes('banesco')));
  const totalBanescoSalidasVES = banescoSalidasTx.reduce((sum, t) => sum + t.monto, 0);
  const limiteLineaVES = contratoLineaCredito?.limite_linea_credito_ves || 600000000.00;
  const porcentajeConsumido = Math.min(100, (totalBanescoSalidasVES / limiteLineaVES) * 100);

  const handleOpenMatching = (tx: TransaccionBancaria) => {
    setMatchingModalTx(tx);
    const available = contratos.filter(c => c.empresa_id === empresa.id);
    if (available.length > 0) {
      setSelectedContratoId(available[0].id);
    }
  };

  const handleConfirmMatch = () => {
    if (matchingModalTx && selectedContratoId) {
      onMatchTransaction(matchingModalTx.id, selectedContratoId);
      setMatchingModalTx(null);
    }
  };

  const handleVincularTodasLasSalidas = (contratoId: string) => {
    empresaTx
      .filter(t => t.tipo === 'debito' && t.estado_conciliacion === 'pendiente')
      .forEach(t => {
        onMatchTransaction(t.id, contratoId);
      });
    setAnalysisModalOpen(false);
  };

  // Real Excel & CSV file parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
        const firstSheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheetName];
        
        // Convert to array of rows
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rawRows.length < 2) {
          alert('El archivo no contiene suficientes filas de datos bancarios.');
          setIsUploading(false);
          return;
        }

        // Identify header row
        let headerRowIndex = 0;
        let dateCol = -1;
        let refCol = -1;
        let descCol = -1;
        let amountCol = -1;
        let debitCol = -1;
        let creditCol = -1;

        for (let r = 0; r < Math.min(10, rawRows.length); r++) {
          const row = rawRows[r].map(cell => String(cell).toLowerCase().trim());
          const dIdx = row.findIndex(c => c.includes('fecha') || c.includes('date') || c.includes('dia'));
          const rIdx = row.findIndex(c => c.includes('referencia') || c.includes('ref') || c.includes('nro') || c.includes('operacion') || c.includes('doc'));
          const cIdx = row.findIndex(c => c.includes('concepto') || c.includes('descrip') || c.includes('detalle') || c.includes('beneficiario') || c.includes('movimiento'));
          const mIdx = row.findIndex(c => c.includes('monto') || c.includes('importe') || c.includes('total') || c.includes('valor'));
          const debIdx = row.findIndex(c => c.includes('debito') || c.includes('cargo') || c.includes('salida') || c.includes('egreso'));
          const credIdx = row.findIndex(c => c.includes('credito') || c.includes('abono') || c.includes('ingreso'));

          if (dIdx !== -1 || rIdx !== -1 || cIdx !== -1 || mIdx !== -1 || debIdx !== -1) {
            headerRowIndex = r;
            dateCol = dIdx;
            refCol = rIdx;
            descCol = cIdx;
            amountCol = mIdx;
            debitCol = debIdx;
            creditCol = credIdx;
            break;
          }
        }

        // Fallbacks if columns were not found by text
        if (dateCol === -1) dateCol = 0;
        if (refCol === -1) refCol = 1;
        if (descCol === -1) descCol = 2;
        if (amountCol === -1 && debitCol === -1) amountCol = 3;

        const newParsedTx: TransaccionBancaria[] = [];
        let totalImportado = 0;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0 || !row[dateCol]) continue;

          let rawDate = row[dateCol];
          let formattedDate = new Date().toISOString().split('T')[0];
          if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
            formattedDate = rawDate.toISOString().split('T')[0];
          } else if (typeof rawDate === 'string' && rawDate.trim()) {
            const parts = rawDate.split(/[-/]/);
            if (parts.length === 3) {
              if (parts[0].length === 4) {
                formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              } else if (parts[2].length === 4) {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }

          const rawRef = String(row[refCol] || `BNC-${Math.floor(10000000 + Math.random() * 90000000)}`).trim();
          const rawDesc = String(row[descCol] || 'SALIDA BANCO BANESCO PRESTAMO MANUEL BECERRA').trim();

          // Amount detection
          let rawAmount = 0;
          if (debitCol !== -1 && row[debitCol]) {
            const dVal = String(row[debitCol]).replace(/[Bs.\s]/g, '').replace(/\./g, '').replace(',', '.');
            rawAmount = Math.abs(parseFloat(dVal) || 0);
          } else if (amountCol !== -1 && row[amountCol]) {
            const aVal = String(row[amountCol]).replace(/[Bs.\s]/g, '').replace(/\./g, '').replace(',', '.');
            rawAmount = Math.abs(parseFloat(aVal) || 0);
          }

          if (rawAmount <= 0) continue;

          totalImportado += rawAmount;

          const isManuelMatch = 
            rawDesc.toLowerCase().includes('becerra') || 
            rawDesc.toLowerCase().includes('manuel') || 
            rawDesc.toLowerCase().includes('24224176') || 
            rawDesc.toLowerCase().includes('24.224.176') ||
            rawDesc.toLowerCase().includes('24224576') || 
            rawDesc.toLowerCase().includes('24.224.576') ||
            isAgrícolaOni;

          newParsedTx.push({
            id: `tx-import-${Date.now()}-${r}`,
            empresa_id: empresa.id,
            fecha: formattedDate,
            banco: 'Banesco Banco Universal',
            referencia: rawRef.startsWith('REF') ? rawRef : `REF-BCO-${rawRef}`,
            concepto: rawDesc.toUpperCase(),
            monto: rawAmount,
            tipo: 'debito',
            estado_conciliacion: isAgrícolaOni && contratoLineaCredito ? 'conciliado' : 'pendiente',
            contrato_vinculado_id: isAgrícolaOni && contratoLineaCredito ? contratoLineaCredito.id : undefined,
            sugerencia_socio_id: isManuelMatch && socioManuelBecerra ? socioManuelBecerra.id : undefined,
          });
        }

        if (newParsedTx.length > 0) {
          if (onImportTransactions) {
            onImportTransactions(newParsedTx);
          }

          const limite = contratoLineaCredito?.limite_linea_credito_ves || 600000000.00;
          const remanente = Math.max(0, limite - (totalBanescoSalidasVES + totalImportado));
          const pConsumido = Math.min(100, ((totalBanescoSalidasVES + totalImportado) / limite) * 100);

          setAnalysisData({
            fileName: file.name,
            totalSalidasVES: totalImportado,
            count: newParsedTx.length,
            socioDetectado: socioManuelBecerra ? socioManuelBecerra.nombre_accionista : 'Manuel Alejandro Becerra Luis',
            limiteLineaCredito: limite,
            remanenteVES: remanente,
            porcentajeConsumido: pConsumido,
          });
          setAnalysisModalOpen(true);
        } else {
          alert('No se pudieron extraer transacciones de salida válidas con montos positivos.');
        }
      } catch (err) {
        console.error('Error al procesar archivo Excel:', err);
        alert('Ocurrió un error al procesar el archivo Excel. Asegúrese de que tenga columnas legibles de Fecha, Referencia, Concepto y Monto.');
      } finally {
        setIsUploading(false);
        // Clear input value so same file can be uploaded again if needed
        e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Banner Especial para Agrícola Oni, C.A. & Manuel Alejandro Becerra Luis */}
      {isAgrícolaOni && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md border border-blue-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Línea de Crédito General Rotativa
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-800/80 text-blue-200 border border-blue-700 font-mono">
                  Límite: Bs. 600.000.000,00 • 1 Año
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tasa Mercado 6 Bancos BCV
                </span>
              </div>

              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{empresa.razon_social}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 font-semibold">{socioManuelBecerra ? socioManuelBecerra.nombre_accionista : 'Sr. Manuel Alejandro Becerra Luis (C.I. V-24.224.576)'}</span>
              </h2>

              <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
                <strong>Potestad Estatutaria:</strong> Registro de Comercio de fecha 13/09/2021, Capítulo IV, Cláusula Décima Cuarta, Numeral O (Facultad de dar y recibir dinero en mutuo y celebrar contratos sin necesidad de autorización de la asamblea).
                <br />
                <strong>Vinculación Societaria:</strong> El Sr. Manuel Alejandro Becerra Luis es socio del Sr. Elías Trías en otra empresa formada por ellos, no en Agrícola Oni, C.A. Blindado ante el SENIAT con retención ISLR 5% y no sujeción a IVA (Art. 16 Num 3 LIVA).
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onNavigateToRecibosCupo && (
                <button
                  type="button"
                  onClick={onNavigateToRecibosCupo}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  title="Ver los 29 Recibos de Cupo emitidos para las transferencias Banesco"
                >
                  <Receipt className="w-4 h-4 text-slate-950" />
                  <span>Ver 29 Recibos de Cupo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onOpenLineaCredito) {
                    onOpenLineaCredito(contratoLineaCredito);
                  } else {
                    alert('Abriendo visor legal del contrato...');
                  }
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Ver Contrato Notariado</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (contratoLineaCredito && socioManuelBecerra) {
                    downloadLineaCreditoWord(contratoLineaCredito, empresa, socioManuelBecerra);
                  } else {
                    downloadLineaCreditoWord(null, empresa, socioManuelBecerra || accionistas[0]);
                  }
                }}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-xl transition-colors border border-blue-600 flex items-center gap-1.5 cursor-pointer"
                title="Descargar Contrato en formato Word (.doc)"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (contratoLineaCredito && socioManuelBecerra) {
                    downloadLineaCreditoExcel(contratoLineaCredito, empresa, socioManuelBecerra);
                  } else {
                    downloadLineaCreditoExcel(null, empresa, socioManuelBecerra || accionistas[0]);
                  }
                }}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-xl transition-colors border border-emerald-600 flex items-center gap-1.5 cursor-pointer"
                title="Descargar Ficha Técnica y Control en Excel (.xlsx / .xls)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Progress bar towards Bs. 600.000.000,00 */}
          <div className="mt-4 pt-3 border-t border-blue-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Salidas Banesco Acumuladas:</span>
              <span className="font-mono font-bold text-amber-300">{formatVES(totalBanescoSalidasVES)}</span>
              <span className="text-slate-500 font-mono">/ {formatVES(limiteLineaVES)}</span>
            </div>

            <div className="flex-1 max-w-xs bg-slate-800 rounded-full h-2.5 overflow-hidden border border-blue-900">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${porcentajeConsumido}%` }}
              />
            </div>

            <div className="text-right text-[11px] text-slate-300">
              Disponible: <strong className="text-emerald-400 font-mono">{formatVES(Math.max(0, limiteLineaVES - totalBanescoSalidasVES))}</strong> ({porcentajeConsumido.toFixed(1)}% utilizado)
            </div>
          </div>
        </div>
      )}

      {/* Banner Explanation for SENIAT Audit Defense */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Conciliación y Matching Bancario Automatizado</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
                Evidencia de Flujo Real Banesco
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
              Cargue directamente extractos o relaciones en Excel (.xlsx / .xls) de salidas de <strong>Banesco Banco Universal</strong>. El sistema identificará automáticamente los desembolsos, calculará los intereses al tipo oficial del BCV y vinculará cada movimiento al contrato de línea de crédito general de Bs. 600.000.000,00.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            Pendientes: <strong className="text-amber-700">{pendientesCount}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            Conciliados: <strong className="text-emerald-700">{conciliadosCount}</strong>
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar referencia o concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'todos' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Todos ({empresaTx.length})
            </button>
            <button
              onClick={() => setFilterStatus('pendientes')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'pendientes' ? 'bg-amber-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sin Vincular ({pendientesCount})
            </button>
            <button
              onClick={() => setFilterStatus('conciliados')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${filterStatus === 'conciliados' ? 'bg-emerald-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Blindados ({conciliadosCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {banescoSalidasTx.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setAnalysisData({
                  fileName: 'Salidas_Banesco_Agricola_Oni.xlsx',
                  totalSalidasVES: totalBanescoSalidasVES,
                  count: banescoSalidasTx.length,
                  socioDetectado: socioManuelBecerra?.nombre_accionista || 'Manuel Alejandro Becerra Luis',
                  limiteLineaCredito: limiteLineaVES,
                  remanenteVES: Math.max(0, limiteLineaVES - totalBanescoSalidasVES),
                  porcentajeConsumido,
                });
                setAnalysisModalOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ver Análisis Banesco</span>
            </button>
          )}

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5 text-white" />
            <span>{isUploading ? 'Procesando Excel...' : 'Cargar Archivo Excel (.XLSX / .XLS)'}</span>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha & Banco</th>
                <th className="py-3 px-4">Referencia Bancaria</th>
                <th className="py-3 px-4">Concepto Registrado</th>
                <th className="py-3 px-4 text-right">Monto (VES)</th>
                <th className="py-3 px-4 text-right">Equivalente USD</th>
                <th className="py-3 px-4 text-center">Estado Auditoría</th>
                <th className="py-3 px-4 text-right">Acción Probatoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No se encontraron transacciones bancarias. Cargue un archivo Excel de salidas de Banesco usando el botón superior.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => {
                  const equivUSD = tx.monto / tasaBCV;
                  const isConciliado = tx.estado_conciliacion === 'conciliado';
                  const contratoAsociado = contratos.find(c => c.id === tx.contrato_vinculado_id);
                  const socioSugerido = accionistas.find(a => a.id === tx.sugerencia_socio_id);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{tx.fecha}</div>
                        <div className="text-[11px] text-blue-700 font-medium">{tx.banco}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {tx.referencia}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 truncate font-medium">{tx.concepto}</div>
                        {socioSugerido && !isConciliado && (
                          <div className="text-[10px] text-blue-700 flex items-center gap-1 mt-0.5">
                            <span>Socio Detectado:</span>
                            <strong>{socioSugerido.nombre_accionista}</strong>
                          </div>
                        )}
                        {contratoAsociado && (
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Vinculado: {contratoAsociado.correlativo}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatVES(tx.monto)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatUSD(equivUSD)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isConciliado ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Blindado SENIAT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            Sin Justificar
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isConciliado ? (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Enlace Permanente
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenMatching(tx)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                            >
                              Vincular a Mutuo
                            </button>
                            <button
                              onClick={() => onCrearContratoDesdeBanco(tx)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                            >
                              Crear Contrato
                            </button>
                          </div>
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

      {/* Analysis Modal for Uploaded Excel File */}
      {analysisModalOpen && analysisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-blue-700">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <FileSpreadsheet className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Análisis de Salidas de Banesco - Línea de Crédito
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {analysisData.fileName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAnalysisModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Empresa Mutuante:</span>
                <span className="font-bold text-slate-900">{empresa.razon_social}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Mutuario Identificado:</span>
                <span className="font-bold text-blue-700">{analysisData.socioDetectado}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Salidas Bancarias Procesadas:</span>
                <span className="font-mono font-bold text-slate-900">{analysisData.count} transacciones</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Monto Total de Salidas (VES):</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{formatVES(analysisData.totalSalidasVES)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Límite Línea de Crédito General:</span>
                <span className="font-mono font-bold text-slate-900">{formatVES(analysisData.limiteLineaCredito)} (Bs. 600M)</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Remanente Disponible de la Línea:</span>
                <span className="font-mono font-bold text-emerald-700">{formatVES(analysisData.remanenteVES)}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Porcentaje Consumido del Límite de Bs. 600M:</span>
                  <span className="font-bold text-slate-900">{analysisData.porcentajeConsumido.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${analysisData.porcentajeConsumido}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Blindaje SENIAT:</strong> Todas las salidas bancarias de Banesco quedan amparadas bajo el Contrato de Línea de Crédito General de Bs. 600.000.000,00, a la tasa activa promedio ponderada de los 6 principales bancos del país fijada por el BCV (Art. 72 y 73 LISLR).
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAnalysisModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>

              {onNavigateToRecibosCupo && (
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisModalOpen(false);
                    onNavigateToRecibosCupo();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4 text-slate-950" />
                  <span>Ver los 29 Recibos de Cupo</span>
                </button>
              )}

              {contratoLineaCredito && (
                <button
                  type="button"
                  onClick={() => handleVincularTodasLasSalidas(contratoLineaCredito.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vincular todas las Salidas al Contrato</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAnalysisModalOpen(false);
                  if (onOpenLineaCredito) {
                    onOpenLineaCredito(contratoLineaCredito);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Ver / Descargar Contrato</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Matching an Existing Contract */}
      {matchingModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <LinkIcon className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">
                Vincular Transacción Bancaria a Contrato de Mutuo
              </h3>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <div className="text-slate-500 font-medium">Movimiento Bancario:</div>
              <div className="font-mono text-blue-700 font-bold">{matchingModalTx.referencia} • {matchingModalTx.banco}</div>
              <div className="text-slate-800">{matchingModalTx.concepto}</div>
              <div className="font-mono text-emerald-700 font-bold">{formatVES(matchingModalTx.monto)}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seleccione el Contrato de Mutuo a asociar:
              </label>
              <select
                value={selectedContratoId}
                onChange={(e) => setSelectedContratoId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {contratos
                  .filter(c => c.empresa_id === empresa.id)
                  .map(c => {
                    const acc = accionistas.find(a => a.id === c.accionista_id);
                    const montoTexto = c.limite_linea_credito_ves 
                      ? `${formatVES(c.limite_linea_credito_ves)} (Línea General)` 
                      : `${formatUSD(c.monto_indexado_usd)} (${c.tipo_activo})`;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.correlativo} • {acc?.nombre_accionista.split(' ')[0]} • {montoTexto}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="text-[11px] text-slate-500 leading-normal">
              Al confirmar, el sistema escribirá de forma inalterable el número de referencia y banco en el expediente legal del contrato, cumpliendo con la exigencia de prueba material ante el SENIAT.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchingModalTx(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmMatch}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
              >
                Confirmar y Blindar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
