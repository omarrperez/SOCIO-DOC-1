import React, { useState } from 'react';
import { TransaccionBancaria, ContratoMutuo, Empresa, Accionista } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { Landmark, ArrowRight, CheckCircle2, AlertCircle, Search, Upload, RefreshCw, Link as LinkIcon, ShieldCheck } from 'lucide-react';

interface BankMatchingProps {
  transacciones: TransaccionBancaria[];
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
  onMatchTransaction: (txId: string, contratoId: string) => void;
  onCrearContratoDesdeBanco: (tx: TransaccionBancaria) => void;
}

export const BankMatching: React.FC<BankMatchingProps> = ({
  transacciones,
  contratos,
  empresa,
  accionistas,
  tasaBCV,
  onMatchTransaction,
  onCrearContratoDesdeBanco,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendientes' | 'conciliados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [matchingModalTx, setMatchingModalTx] = useState<TransaccionBancaria | null>(null);
  const [selectedContratoId, setSelectedContratoId] = useState<string>('');

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

  const handleOpenMatching = (tx: TransaccionBancaria) => {
    setMatchingModalTx(tx);
    // Suggest default contract if available
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

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Banner Explanation for SENIAT Audit Defense */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Módulo 1: Conciliación y Matching Bancario Automatizado</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
                Evidencia de Flujo Real
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
              Destruye el argumento del SENIAT de que los ingresos carecen de correspondencia material, vinculando cada débito o crédito bancario con su Contrato de Mutuo específico.
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
          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Importar Extracto (.CSV / .XLSX)</span>
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={() => alert('Extracto bancario importado satisfactoriamente. Se detectaron 2 movimientos potenciales de socios.')} />
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
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No se encontraron transacciones bancarias con los filtros seleccionados.
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
                        <div className="text-[11px] text-slate-500">{tx.banco}</div>
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
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-medium">
                            Vinculado: {contratoAsociado.correlativo}
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
                    return (
                      <option key={c.id} value={c.id}>
                        {c.correlativo} • {acc?.nombre_accionista.split(' ')[0]} • {formatUSD(c.monto_indexado_usd)} ({c.tipo_activo})
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
