import React, { useState } from 'react';
import { ContratoMutuo, Empresa, Accionista } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { Coins, AlertTriangle, ShieldCheck, FileCheck, Download, Printer } from 'lucide-react';

interface IgtfManagerProps {
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
}

export const IgtfManager: React.FC<IgtfManagerProps> = ({
  contratos,
  empresa,
  accionistas,
  tasaBCV,
}) => {
  const isEspecial = empresa.tipo_contribuyente === 'Especial';
  const empresaContratos = contratos.filter(c => c.empresa_id === empresa.id);

  // Filter contracts that trigger IGTF (cash USD or USDT where company is Sujeto Pasivo Especial)
  const igtfContratos = empresaContratos.filter(c => c.soporte.igtf_aplica);

  const totalBaseUSD = igtfContratos.reduce((acc, c) => acc + c.monto_indexado_usd, 0);
  const totalIgtfUSD = igtfContratos.reduce((acc, c) => acc + c.soporte.igtf_monto_usd, 0);
  const totalIgtfVES = igtfContratos.reduce((acc, c) => acc + c.soporte.igtf_monto_ves, 0);

  const [selectedContratoComprobante, setSelectedContratoComprobante] = useState<ContratoMutuo | null>(
    igtfContratos[0] || null
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Módulo 3: Control y Alertas de IGTF (Grandes Transacciones Financieras)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${isEspecial ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {isEspecial ? 'Empresa: Sujeto Pasivo Especial (Alícuota 3%)' : 'Contribuyente Ordinario'}
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Monitorea los cobros y recepciones de divisas en efectivo o criptoactivos en cuentas de socios, emitiendo la guía de cálculo para el entero quincenal ante el SENIAT.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-500">Total IGTF Determinado:</div>
            <div className="font-mono text-base font-extrabold text-amber-700">{formatUSD(totalIgtfUSD)}</div>
            <div className="text-[10px] font-mono text-slate-500">({formatVES(totalIgtfVES)})</div>
          </div>
        </div>
      </div>

      {/* Tax Warning Card */}
      {!isEspecial ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Esta empresa está catalogada como <strong>Contribuyente Ordinario</strong> ante el SENIAT, por lo que no funge como agente de percepción del 3% de IGTF en transacciones directas en efectivo.
          </span>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-950 font-bold block">Deber Formal de Percepción Tributaria:</strong>
            <span>
              Al ser <strong>Sujeto Pasivo Especial</strong>, la empresa debe percibir el 3% sobre los aportes o préstamos recibidos en moneda extranjera en efectivo o criptoactivos, emitir el comprobante de percepción correspondiente y enterarlo al SENIAT según el calendario de contribuyentes especiales.
            </span>
          </div>
        </div>
      )}

      {/* Transactions subject to IGTF */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900">
            Movimientos Sujetos a Control de IGTF ({igtfContratos.length})
          </h4>
          <span className="text-[11px] text-slate-500">
            Base Imponible Acumulada: <strong className="text-slate-900 font-mono">{formatUSD(totalBaseUSD)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Contrato & Fecha</th>
                <th className="py-3 px-4 font-bold">Accionista / Mutuante</th>
                <th className="py-3 px-4 font-bold">Medio de Pago</th>
                <th className="py-3 px-4 text-right font-bold">Base Imponible</th>
                <th className="py-3 px-4 text-center font-bold">Alícuota</th>
                <th className="py-3 px-4 text-right font-bold">IGTF (3% USD)</th>
                <th className="py-3 px-4 text-right font-bold">Equivalente VES</th>
                <th className="py-3 px-4 text-right font-bold">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {igtfContratos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No se registran movimientos en efectivo o criptoactivos sujetos a retención de IGTF.
                  </td>
                </tr>
              ) : (
                igtfContratos.map(c => {
                  const acc = accionistas.find(a => a.id === c.accionista_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        <div>{c.correlativo}</div>
                        <div className="text-[10px] text-slate-500">{c.fecha_inicio}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{acc?.nombre_accionista}</div>
                        <div className="text-[10px] text-slate-500">C.I. {acc?.cedula_accionista}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                          {c.tipo_activo === 'USD_EFECTIVO' ? 'Dólares Efectivo' : 'USDT Cripto'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-900 font-semibold">
                        {formatUSD(c.monto_indexado_usd)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-amber-700">
                        3.00%
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        {formatUSD(c.soporte.igtf_monto_usd)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatVES(c.soporte.igtf_monto_ves)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedContratoComprobante(c)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Ver Guía
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Preview of IGTF Withholding Certificate */}
      {selectedContratoComprobante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">
                  Comprobante Guía de Percepción / Entero de IGTF
                </h3>
              </div>
              <button
                onClick={() => setSelectedContratoComprobante(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-3">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{empresa.razon_social}</div>
                <div className="text-slate-500 text-[11px]">R.I.F. {empresa.rif_empresa} • Sujeto Pasivo Especial</div>
                <div className="text-blue-700 font-bold mt-1">COMPROBANTE GUÍA DE IGTF Nro. IGTF-2026-{selectedContratoComprobante.correlativo.slice(-4)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Sujeto Percibido (Accionista):</span>
                  <span className="text-slate-900 font-bold">{accionistas.find(a => a.id === selectedContratoComprobante.accionista_id)?.nombre_accionista}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cédula / RIF del Accionista:</span>
                  <span className="text-slate-900 font-mono">{accionistas.find(a => a.id === selectedContratoComprobante.accionista_id)?.rif_accionista}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha de Operación:</span>
                  <span className="text-slate-900">{selectedContratoComprobante.fecha_inicio}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contrato de Mutuo Asociado:</span>
                  <span className="text-blue-700 font-bold">{selectedContratoComprobante.correlativo}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Imponible en Divisas/Cripto:</span>
                  <span className="text-slate-900 font-bold">{formatUSD(selectedContratoComprobante.monto_indexado_usd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tasa Oficial BCV aplicable:</span>
                  <span className="text-slate-800">Bs. {selectedContratoComprobante.tasa_bcv_fecha.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Imponible en Bolívares (VES):</span>
                  <span className="text-slate-800">{formatVES(selectedContratoComprobante.monto_indexado_ves)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Alícuota Impositiva de Ley:</span>
                  <span className="text-amber-700 font-bold">3.00%</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-300 pt-2 text-emerald-700">
                  <span>Impuesto a Enterar al SENIAT:</span>
                  <span>{formatUSD(selectedContratoComprobante.soporte.igtf_monto_usd)} ({formatVES(selectedContratoComprobante.soporte.igtf_monto_ves)})</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedContratoComprobante(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer shadow-2xs"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Comprobante</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
