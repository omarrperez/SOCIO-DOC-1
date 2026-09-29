import React from 'react';
import { X, Calendar, TrendingUp, Info, ExternalLink } from 'lucide-react';
import { HISTORICO_TASAS_BCV_2026 } from '../data/tasasBcvOficiales';

interface TablaTasasBcvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TablaTasasBcvModal: React.FC<TablaTasasBcvModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Tabla Oficial de Tasas BCV (Bs. / USD) - Año 2026
              </h3>
              <p className="text-xs text-blue-200/80">
                Banco Central de Venezuela • Marco Cambiario Oficial de Referencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal notice */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Fuente Oficial Banco Central de Venezuela:</strong> Valores oficiales publicados por las mesas de cambio bancarias reguladas por el BCV. Para fines de los 29 Recibos de Cupo y los 18 Recibos de Pagos Recibidos de la Línea de Crédito Rotativa, cada operación se liquida a la tasa exacta publicada por el BCV para su fecha valor (o la vigente precedente en fines de semana y feriados bancarios).
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">N°</th>
                <th className="py-2.5 px-3">Fecha (DD/MM/AAAA)</th>
                <th className="py-2.5 px-3">Fecha ISO</th>
                <th className="py-2.5 px-3 text-right">Tasa Oficial (Bs. / USD)</th>
                <th className="py-2.5 px-3">Observaciones / Vigencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {HISTORICO_TASAS_BCV_2026.map((r, i) => (
                <tr key={r.fecha} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-sans font-bold">{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {r.fecha_formato_ve}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{r.fecha}</td>
                  <td className="py-2.5 px-3 text-right font-black text-blue-900 text-sm">
                    Bs. {r.tasa_bcv.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                    {r.vigencia_descripcion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total de cotizaciones registradas: <strong>{HISTORICO_TASAS_BCV_2026.length} fechas clave</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
