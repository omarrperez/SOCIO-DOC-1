import React, { useState } from 'react';
import { ActaAsamblea, Empresa, Accionista } from '../types';
import { formatUSD, formatFechaLarga } from '../utils/formatters';
import { Landmark, FileText, CheckCircle2, AlertTriangle, Plus, Printer, Shield, BookCheck, FileDown, FileSpreadsheet } from 'lucide-react';
import { downloadActaWord, downloadActaExcel } from '../utils/documentExport';

interface CorporateAssemblyProps {
  actas: ActaAsamblea[];
  empresa: Empresa;
  accionistas: Accionista[];
  onOpenViewDocument: (acta: ActaAsamblea) => void;
  onSaveNewActa: (nuevaActa: ActaAsamblea) => void;
  onToggleLibroFisico: (actaId: string) => void;
}

export const CorporateAssembly: React.FC<CorporateAssemblyProps> = ({
  actas,
  empresa,
  accionistas,
  onOpenViewDocument,
  onSaveNewActa,
  onToggleLibroFisico,
}) => {
  const [showNewActaModal, setShowNewActaModal] = useState(false);
  const empresaActas = actas.filter(a => a.empresa_id === empresa.id);

  // Form State
  const [tipoAsamblea, setTipoAsamblea] = useState<'extraordinaria' | 'ordinaria'>('extraordinaria');
  const [fechaAsamblea, setFechaAsamblea] = useState<string>(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState<string>('10:00 AM');
  const [horaFin, setHoraFin] = useState<string>('11:30 AM');
  const [montoMaxPagar, setMontoMaxPagar] = useState<number>(150000);
  const [montoMaxCobrar, setMontoMaxCobrar] = useState<number>(25000);
  const [quorum, setQuorum] = useState<number>(100);
  const [asentadoLibro, setAsentadoLibro] = useState<boolean>(true);
  const [libroPaginas, setLibroPaginas] = useState<string>('45 a la 48');
  const [regimenInteresAutorizado, setRegimenInteresAutorizado] = useState<'nominal_bcv_59' | 'indexado_uvc_16' | 'divisas_usd' | 'mixto_segun_contrato'>('mixto_segun_contrato');
  const [observaciones, setObservaciones] = useState<string>(
    'Autorización estatutaria expresa para celebración de contratos de mutuo con socios, fijando régimen de intereses bancarios BCV/UVC (Art. 73 LISLR) para blindaje tributario.'
  );

  const handleCreate = () => {
    const numActa = `ASAM-${tipoAsamblea === 'extraordinaria' ? 'EXT' : 'ORD'}-2026-0${empresaActas.length + 1}`;
    const nueva: ActaAsamblea = {
      id: 'acta-' + Date.now(),
      empresa_id: empresa.id,
      numero_acta: numActa,
      tipo_asamblea: tipoAsamblea,
      fecha_asamblea: fechaAsamblea,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      monto_maximo_autorizado_pagar: montoMaxPagar,
      monto_maximo_autorizado_cobrar: montoMaxCobrar,
      quorum_capital_porcentaje: quorum,
      estatus_libro_fisico: asentadoLibro,
      fecha_asentamiento_libro: asentadoLibro ? fechaAsamblea : undefined,
      libro_paginas: libroPaginas,
      registro_mercantil_asiento: empresa.registro_mercantil,
      regimen_interes_autorizado: regimenInteresAutorizado,
      presidente_mesa: empresa.representante_legal,
      secretario_mesa: accionistas[1]?.nombre_accionista || empresa.representante_legal,
      observaciones: observaciones,
    };

    onSaveNewActa(nueva);
    setShowNewActaModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Gobierno Corporativo: Actas de Asamblea Macro</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                Soporte Estatutario Previo
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Un contrato de mutuo firmado sólo entre el presidente y el socio puede ser impugnado por el SENIAT. El Acta de Asamblea es el mandato legal del máximo órgano que autoriza los préstamos, límites e indexación.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewActaModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Acta de Asamblea</span>
        </button>
      </div>

      {/* Actas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empresaActas.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs shadow-xs">
            No se han registrado Actas de Asamblea de Autorización para esta empresa. Haga clic en "Nueva Acta de Asamblea" para habilitar las líneas de financiamiento de socios.
          </div>
        ) : (
          empresaActas.map((acta) => (
            <div
              key={acta.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {acta.numero_acta}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Asamblea {acta.tipo_asamblea}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatFechaLarga(acta.fecha_asamblea)}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Autorización de Líneas de Mutuo de Socios
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">
                  {acta.observaciones || 'Línea de financiamiento corporativo temporal para apalancamiento de capital de trabajo.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Límite Autorizado a Pagar:</span>
                    <span className="font-mono text-emerald-700 font-bold">{formatUSD(acta.monto_maximo_autorizado_pagar)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Límite Autorizado a Cobrar:</span>
                    <span className="font-mono text-blue-700 font-bold">{formatUSD(acta.monto_maximo_autorizado_cobrar)}</span>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Quórum Accionario Presente:</span>
                    <span className="font-bold text-slate-900">{acta.quorum_capital_porcentaje}% del Capital</span>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Folios Libro de Actas:</span>
                    <span className="font-mono font-bold text-purple-700">{acta.libro_paginas || '45 a la 48'}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Régimen Autorizado:</span>
                    <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {acta.regimen_interes_autorizado === 'nominal_bcv_59' 
                        ? 'Nominal BCV ~59%' 
                        : (acta.regimen_interes_autorizado === 'indexado_uvc_16' 
                            ? 'Indexada UVC 16%' 
                            : (acta.regimen_interes_autorizado === 'divisas_usd' ? 'Divisas USD 12%' : 'BCV / UVC / Mutuo Libre'))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Book Status Checklist */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div
                  onClick={() => onToggleLibroFisico(acta.id)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    acta.estatus_libro_fisico
                      ? 'bg-emerald-600 text-white font-bold text-xs'
                      : 'bg-slate-100 border border-slate-300 text-transparent'
                  }`}>
                    ✓
                  </div>
                  <span className={`text-[11px] font-semibold transition-colors ${
                    acta.estatus_libro_fisico ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    {acta.estatus_libro_fisico ? 'Asentado en Libro Físico Sellado' : 'Pendiente Asentar en Libro'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => downloadActaWord(acta, empresa, accionistas)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                    title="Descargar Acta en Word (.doc) alineada y formateada"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Word</span>
                  </button>

                  <button
                    onClick={() => downloadActaExcel(acta, empresa, accionistas)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                    title="Descargar Acta y Resumen en Excel (.xls)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>

                  <button
                    onClick={() => onOpenViewDocument(acta)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ver Acta</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal New Acta */}
      {showNewActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Landmark className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">
                  Emitir Acta de Asamblea Macro de Socios
                </h3>
              </div>
              <button
                onClick={() => setShowNewActaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tipo de Asamblea:
                  </label>
                  <select
                    value={tipoAsamblea}
                    onChange={(e) => setTipoAsamblea(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="extraordinaria">Extraordinaria</option>
                    <option value="ordinaria">Ordinaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Fecha de Celebración:
                  </label>
                  <input
                    type="date"
                    value={fechaAsamblea}
                    onChange={(e) => setFechaAsamblea(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Límite Recibido a Pagar ($ USD):
                  </label>
                  <input
                    type="number"
                    value={montoMaxPagar}
                    onChange={(e) => setMontoMaxPagar(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Límite Otorgado a Cobrar ($ USD):
                  </label>
                  <input
                    type="number"
                    value={montoMaxCobrar}
                    onChange={(e) => setMontoMaxCobrar(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Folios en el Libro de Actas:
                  </label>
                  <input
                    type="text"
                    value={libroPaginas}
                    onChange={(e) => setLibroPaginas(e.target.value)}
                    placeholder="Ej. 45 a la 48"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Régimen de Intereses Autorizado:
                  </label>
                  <select
                    value={regimenInteresAutorizado}
                    onChange={(e) => setRegimenInteresAutorizado(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="mixto_segun_contrato">Marco Mixto (BCV / UVC / Mutuo)</option>
                    <option value="nominal_bcv_59">Tasa Nominal BCV (~59%)</option>
                    <option value="indexado_uvc_16">Indexada en UVC (16% Anual)</option>
                    <option value="divisas_usd">Divisas USD (12% Anual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quórum Representado:
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
                  <span>100% del Capital Social (Asamblea Universal)</span>
                  <span className="text-emerald-700 font-bold">Sin Convocatoria por Prensa</span>
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={asentadoLibro}
                  onChange={(e) => setAsentadoLibro(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Confirmar que esta acta se imprimirá y asentará en el Libro de Actas sellado por el Registro Mercantil
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowNewActaModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer shadow-2xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Generar y Guardar Acta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
