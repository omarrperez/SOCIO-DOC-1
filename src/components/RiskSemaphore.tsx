import React from 'react';
import { ContratoMutuo, Empresa } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

interface RiskSemaphoreProps {
  contratos: ContratoMutuo[];
  empresa: Empresa;
  tasaBCV: number;
  onOpenCapitalization: (contrato?: ContratoMutuo) => void;
}

export const RiskSemaphore: React.FC<RiskSemaphoreProps> = ({
  contratos,
  empresa,
  tasaBCV,
  onOpenCapitalization,
}) => {
  const empresaContratos = contratos.filter(c => c.empresa_id === empresa.id && c.estado === 'activo');

  // Sum of payables to partners (pasivo con accionistas)
  const totalPasivoVES = empresaContratos
    .filter(c => c.tipo_flujo === 'socio_a_empresa')
    .reduce((acc, c) => acc + c.monto_indexado_ves, 0);

  const totalPasivoUSD = totalPasivoVES / tasaBCV;
  const capitalSocialVES = empresa.capital_social_ves || 350000;
  const capitalSocialUSD = capitalSocialVES / tasaBCV;

  // Mathematical ratio
  const ratio = capitalSocialVES > 0 ? (totalPasivoVES / capitalSocialVES) * 100 : 0;

  // Determine Semaphore status
  let semaforo: 'verde' | 'amarillo' | 'rojo' = 'verde';
  let mensaje = 'Riesgo Bajo: La relación entre préstamos de socios y capital social es equilibrada.';

  if (ratio > 150) {
    semaforo = 'rojo';
    mensaje = 'ALTO RIESGO DE FISCALIZACIÓN: El pasivo acumulado con socios supera en más de 1.5 veces el Capital Social. El SENIAT presume subcapitalización o simulación de pasivos (ingresos omitidos). Se recomienda capitalizar la acreencia con urgencia.';
  } else if (ratio > 50) {
    semaforo = 'amarillo';
    mensaje = 'Riesgo Moderado: El pasivo con socios representa entre el 50% y 150% del patrimonio de la empresa. Conviene planificar amortizaciones o evaluar aumento de capital por capitalización de deuda.';
  }

  // Find candidate contract with largest debt to capitalize
  const highestContract = empresaContratos
    .filter(c => c.tipo_flujo === 'socio_a_empresa')
    .sort((a, b) => b.monto_indexado_ves - a.monto_indexado_ves)[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
            semaforo === 'rojo' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
            semaforo === 'amarillo' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {semaforo === 'rojo' ? '🔴' : semaforo === 'amarillo' ? '🟡' : '🟢'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Módulo 4: Semáforo de Riesgo Fiscal & Subcapitalización</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Evaluación matemática de pasivos con socios vs. Capital Social de la empresa
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          semaforo === 'rojo' ? 'bg-rose-50 text-rose-700 border-rose-200' :
          semaforo === 'amarillo' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          Ratio Pasivo/Capital: {ratio.toFixed(1)}%
        </span>
      </div>

      {/* Visual Bar / Gauge */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-500 font-mono font-medium">
          <span>0%</span>
          <span className="text-emerald-700 font-semibold">50% (Verde)</span>
          <span className="text-amber-700 font-semibold">150% (Amarillo)</span>
          <span className="text-rose-700 font-semibold">&gt;150% (Rojo Alerta SENIAT)</span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 flex">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              semaforo === 'rojo' ? 'bg-rose-500' :
              semaforo === 'amarillo' ? 'bg-amber-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(ratio, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Numbers Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">Capital Social Registrado:</span>
          <span className="font-mono text-slate-900 font-bold text-sm">{formatVES(capitalSocialVES)}</span>
          <div className="text-[10px] text-slate-500 font-mono">({formatUSD(capitalSocialUSD)})</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">Pasivo Vivo Cuentas de Socios:</span>
          <span className="font-mono text-slate-900 font-bold text-sm">{formatVES(totalPasivoVES)}</span>
          <div className="text-[10px] text-slate-500 font-mono">({formatUSD(totalPasivoUSD)})</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium">Contratos Activos Vigentes:</span>
          <span className="font-mono text-slate-900 font-bold text-sm">{empresaContratos.length} Contratos</span>
          <div className="text-[10px] text-emerald-700 font-medium">100% Soportados</div>
        </div>
      </div>

      {/* Action / Warning Notice */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
        semaforo === 'rojo' ? 'bg-rose-50 border-rose-200 text-rose-900' :
        semaforo === 'amarillo' ? 'bg-amber-50 border-amber-200 text-amber-900' :
        'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start gap-2.5">
          {semaforo === 'rojo' ? (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : semaforo === 'amarillo' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{mensaje}</span>
        </div>

        {(semaforo === 'rojo' || semaforo === 'amarillo') && (
          <button
            onClick={() => onOpenCapitalization(highestContract)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Capitalizar Acreencias</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
