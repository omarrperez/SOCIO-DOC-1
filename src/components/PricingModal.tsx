import React from 'react';
import { Check, X, Shield, Sparkles, Building2, Briefcase, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Planes de Suscripción SaaS: SOCIO-DOC
              </h2>
              <p className="text-xs text-slate-500">
                Diseñado para Contadores Públicos Independientes, Firmas de Asesoría y Empresas en Venezuela
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

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Aceptamos pagos directos:</strong> Bolívares (Pago Móvil / Transferencia a tasa oficial BCV), USDT (TRC-20/ERC-20) y Zelle.
              </span>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full text-emerald-800">
              Facturación Fiscal con IVA
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Plan 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all">
              <div>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Plan Emprendedor</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Dueños de PYMES y negocios individuales que gestionan su propia empresa.</p>
                <div className="mb-4">
                  <span className="text-2xl font-black text-slate-900">$9.99</span>
                  <span className="text-xs text-slate-500"> / mes</span>
                  <div className="text-[11px] text-blue-600 font-medium">o $99.00 / año (Ahorro 20%)</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1 Empresa</strong> legalmente registrada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Hasta 3 contratos y recibos al mes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Soporte de Bolívares (VES) y Divisas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Alertas fiscales básicas SENIAT</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                Comenzar Plan
              </button>
            </div>

            {/* Plan 2 - Best Seller */}
            <div className="rounded-xl border-2 border-blue-600 bg-blue-50/30 p-5 flex flex-col justify-between relative shadow-md shadow-blue-500/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider shadow-2xs">
                El Más Vendido para Contadores
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1 mt-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Plan Contador Pro</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">Para contadores independientes y consultores tributarios con cartera de clientes.</p>
                <div className="mb-4">
                  <span className="text-3xl font-black text-blue-700">$24.99</span>
                  <span className="text-xs text-slate-500"> / mes</span>
                  <div className="text-[11px] text-emerald-700 font-semibold">o $249.00 / año (2 meses gratis)</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-800 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Hasta 10 Empresas</strong> contratantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Contratos de Mutuo ilimitados</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Soporte Criptoactivos (USDT) + Hash TXID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Generación automática Recibos de Caja</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Asientos contables para Saint / Profit / Galac</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Módulo Cierre Fiscal (Capitalización)</strong></span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Suscribirme a Contador Pro
              </button>
            </div>

            {/* Plan 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all">
              <div>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Firmas & Escritorios</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Grandes firmas contables, bufetes corporativos y consorcios empresariales.</p>
                <div className="mb-4">
                  <span className="text-2xl font-black text-slate-900">$59.99</span>
                  <span className="text-xs text-slate-500"> / mes</span>
                  <div className="text-[11px] text-blue-600 font-medium">o $599.00 / año (Soporte VIP)</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Empresas ilimitadas</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Multi-usuario (hasta 5 contadores/auxiliares)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Módulo de auditoría y conciliación bancaria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Expediente probatorio y reporte fiscal consolidado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Soporte prioritario tributario vía WhatsApp</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                Contactar para Firma
              </button>
            </div>

          </div>

          {/* ROI note */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-semibold text-amber-950">¿Por qué este software se paga solo?</span>
              <p className="text-amber-800 mt-0.5">
                Una sola fiscalización del SENIAT con reparo de ventas omitidas o dividendo presunto acarrea multas del 150% al 300% del impuesto, equivalentes a miles de dólares.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
