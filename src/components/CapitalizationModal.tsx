import React, { useState } from 'react';
import { ContratoMutuo, Empresa, Accionista, CapitalizacionAcreencia } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { Sparkles, ArrowRight, Check, X, ShieldCheck, FileText, Landmark } from 'lucide-react';

interface CapitalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato?: ContratoMutuo;
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
  onExecuteCapitalization: (data: CapitalizacionAcreencia, contratoId: string) => void;
}

export const CapitalizationModal: React.FC<CapitalizationModalProps> = ({
  isOpen,
  onClose,
  contrato,
  empresa,
  accionistas,
  tasaBCV,
  onExecuteCapitalization,
}) => {
  const [valorNominalAccion, setValorNominalAccion] = useState<number>(100);
  const [nombreComisario, setNombreComisario] = useState<string>('Lic. Gladys Elena Peña Morales');
  const [cpcComisario, setCpcComisario] = useState<string>('CPC Nro. 48.912');
  const [fechaAsamblea, setFechaAsamblea] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen || !contrato) return null;

  const accionista = accionistas.find(a => a.id === contrato.accionista_id);
  const montoCapitalizadoVES = contrato.monto_indexado_ves;
  const montoCapitalizadoUSD = contrato.monto_indexado_usd;
  const capitalAnteriorVES = empresa.capital_social_ves || 350000;
  const capitalNuevoVES = capitalAnteriorVES + montoCapitalizadoVES;
  
  const nuevasAcciones = valorNominalAccion > 0
    ? Math.floor(montoCapitalizadoVES / valorNominalAccion)
    : 0;

  const handleConfirm = () => {
    const data: CapitalizacionAcreencia = {
      id: 'cap-' + Date.now(),
      contrato_id: contrato.id,
      empresa_id: empresa.id,
      accionista_id: contrato.accionista_id,
      fecha_asamblea: fechaAsamblea,
      monto_capitalizado_ves: montoCapitalizadoVES,
      monto_capitalizado_usd: montoCapitalizadoUSD,
      capital_anterior_ves: capitalAnteriorVES,
      capital_nuevo_ves: capitalNuevoVES,
      valor_nominal_accion_ves: valorNominalAccion,
      numero_acciones_nuevas: nuevasAcciones,
      total_acciones_accionista: nuevasAcciones,
      nombre_comisario: nombreComisario,
      cpc_comisario: cpcComisario,
      uuid_acta: 'CAP-2026-' + Math.floor(1000 + Math.random() * 9000),
    };

    onExecuteCapitalization(data, contrato.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Módulo de Cierre Fiscal: Capitalización de Acreencia
              </h2>
              <p className="text-xs text-slate-600">
                Transforme la deuda con el socio en Capital Social de la empresa (Blindaje ante el SENIAT)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed">
            <strong>Beneficio Tributario y Corporativo:</strong> Extingue el pasivo en el balance general de la empresa sin salida de dinero, fortalece el patrimonio neto ante entidades bancarias y el SENIAT, y no genera pago de impuestos por ganancias.
          </div>

          {/* Contract detail */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Contrato de Mutuo Seleccionado para Extinción:
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 block font-sans">Correlativo:</span>
                <span className="text-blue-700 font-bold">{contrato.correlativo}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans">Accionista Acreedor:</span>
                <span className="text-slate-900 font-sans font-medium">{accionista?.nombre_accionista}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans">Monto a Capitalizar (VES):</span>
                <span className="text-emerald-700 font-bold">{formatVES(montoCapitalizadoVES)}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans">Equivalencia Oficial USD:</span>
                <span className="text-slate-800 font-medium">{formatUSD(montoCapitalizadoUSD)}</span>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor Nominal por Acción (Bs.):
              </label>
              <input
                type="number"
                min="1"
                value={valorNominalAccion}
                onChange={(e) => setValorNominalAccion(parseFloat(e.target.value) || 1)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de la Asamblea Extraordinaria:
              </label>
              <input
                type="date"
                value={fechaAsamblea}
                onChange={(e) => setFechaAsamblea(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Comisario Mercantil (CPC):
              </label>
              <input
                type="text"
                value={nombreComisario}
                onChange={(e) => setNombreComisario(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Matrícula CPC:
              </label>
              <input
                type="text"
                value={cpcComisario}
                onChange={(e) => setCpcComisario(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mathematical Results */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Capital Social Anterior:</span>
              <span className="text-slate-800">{formatVES(capitalAnteriorVES)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-sans">Aumento por Capitalización:</span>
              <span className="text-emerald-700 font-bold">+ {formatVES(montoCapitalizadoVES)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
              <span className="text-slate-800 font-sans">Nuevo Capital Social Suscrito:</span>
              <span className="text-emerald-700">{formatVES(capitalNuevoVES)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-blue-700 font-semibold">
              <span className="font-sans">Nuevas Acciones a Emitir:</span>
              <span>{nuevasAcciones.toLocaleString()} Acciones</span>
            </div>
          </div>

          {/* SAREN Guide notice */}
          <div className="text-[11px] text-slate-500">
            * <strong>Nota SAREN:</strong> El sistema generará el Acta de Asamblea de Aumento de Capital y la plantilla del Informe de Aceptación de Acreencia del Comisario para consignar ante el Registro Mercantil correspondiente.
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Aprobar y Generar Acta de Capitalización</span>
          </button>
        </div>

      </div>
    </div>
  );
};
