import React from 'react';
import { X, Scale, Landmark, ShieldCheck, Info, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { TABLA_CRONOLOGICA_TASAS_BCV, SEIS_PRINCIPALES_BANCOS_VENEZUELA } from '../data/tasasInteresBancariasBcv';

interface TablaTasasInteresBcvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TablaTasasInteresBcvModal: React.FC<TablaTasasInteresBcvModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Tasas de Interés para Préstamos Bancarios (BCV)
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40 uppercase font-semibold">
                  Mayo - Agosto 2026
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                Marco Normativo Oficial Unificado para los 6 Principales Bancos de Venezuela
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Institutional Note */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-start gap-2.5 text-slate-800 font-semibold">
              <Landmark className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Regulación Centralizada por el Banco Central de Venezuela (BCV)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              En Venezuela, las tasas de interés activas para los préstamos bancarios (comerciales y microcréditos) no las define de manera libre cada banco, sino que están unificadas y reguladas por el Banco Central de Venezuela (BCV). Durante el período de <strong>mayo a agosto de 2026</strong>, todos los principales bancos debieron regirse estrictamente bajo el mismo marco normativo del BCV.
            </p>
            <p className="text-slate-600 leading-relaxed">
              En este lapso, la tasa de interés aplicable para <strong>créditos comerciales y microcréditos indexados en Unidades de Valor de Crédito (UVC)</strong> estuvo fijada en un rango mínimo de <strong>13%</strong> y un máximo de <strong>16% anual</strong> (antes de la reforma de septiembre de 2026 que elevó el piso al 16%). Por lo tanto, la cronología es idéntica para los 6 principales bancos.
            </p>
          </div>

          {/* 6 Main Banks Chips */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Los 6 Principales Bancos Comerciales de Venezuela Regulados:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {SEIS_PRINCIPALES_BANCOS_VENEZUELA.map((banco, i) => (
                <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{banco.sigla}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{banco.nombre}</div>
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {banco.tipo === 'Banca Pública' ? 'Pública' : 'Privada'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Table */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              Tabla Cronológica: Tasas de Interés para Préstamos Bancarios (Mayo - Agosto 2026)
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">Mes (2026)</th>
                    <th className="p-3 bg-emerald-50 text-emerald-950 border-x border-slate-200">
                      Créditos Comerciales y Microcréditos (Indexados a UVC)
                    </th>
                    <th className="p-3">Créditos de la Cartera Única Productiva Nacional</th>
                    <th className="p-3">Tarjetas de Crédito (Financiamiento)</th>
                    <th className="p-3 text-right">Tasa Interbancaria (Promedio Ref.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {TABLA_CRONOLOGICA_TASAS_BCV.map((fila, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{fila.mes} {fila.ano}</td>
                      <td className="p-3 bg-emerald-50/50 text-emerald-900 border-x border-slate-200 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          <span>{fila.creditosComercialesUvc}</span>
                        </div>
                        <span className="text-[10px] font-normal text-emerald-700 block mt-0.5">
                          (Tope bancario aplicado: 16% anual)
                        </span>
                      </td>
                      <td className="p-3 text-blue-900 font-semibold">
                        {fila.carteraProductivaNacional}
                      </td>
                      <td className="p-3 text-slate-700">
                        {fila.tarjetasCredito}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {fila.tasaInterbancariaRef}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Aspects Explained */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Aspectos Clave del Cálculo de Préstamos en Venezuela:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Indexación Obligatoria (UVC)
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed text-justify">
                  El cálculo de los intereses de préstamos comerciales no se realiza directamente sobre el monto nominal en bolívares, sino expresando el capital en <strong>Unidades de Valor de Crédito (UVC)</strong>. Este mecanismo varía diariamente según el tipo de cambio oficial del BCV, resguardando el valor real del préstamo frente a la devaluación.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-4 h-4 text-blue-700 shrink-0" />
                  Comportamiento Bancario Unánime
                </div>
                <p className="text-xs text-blue-900/90 leading-relaxed text-justify">
                  En préstamos comerciales indexados a UVC, los 6 principales bancos aplicaron de forma unánime el <strong>tope máximo legal del 16% anual</strong>. En el rubro de tarjetas de crédito y financiamientos libres, las instituciones financieras aplicaron el tope legal del <strong>60% anual</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Application to the 18 receipts */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-950">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-700" />
              Aplicación en los 18 Recibos de Pago de Agrícola Oni, C.A.:
            </div>
            <p className="leading-relaxed text-justify">
              Los 18 recibos de Manuel Becerra han sido calculados aplicando la tasa legal activa unificada del <strong>16.00% anual (1.33% mensual)</strong> bajo el régimen de indexación en UVC. Cada transferencia recibida cubre prioritariamente los intereses causados al tipo de cambio BCV oficial del día del pago; se descuenta el <strong>5% de retención de I.S.L.R.</strong> conforme al Decreto 1808 y el remanente amortiza directamente el capital en UVC y bolívares.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Gaceta Oficial de la República Bolivariana de Venezuela • Resoluciones BCV</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Entendido y Conforme
          </button>
        </div>
      </div>
    </div>
  );
};
