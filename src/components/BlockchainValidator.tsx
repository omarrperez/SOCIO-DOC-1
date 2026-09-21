import React, { useState } from 'react';
import { ContratoMutuo, Empresa, Accionista } from '../types';
import { formatVES, formatUSD, formatFechaLarga } from '../utils/formatters';
import { ShieldCheck, Copy, Check, FileCheck } from 'lucide-react';

interface BlockchainValidatorProps {
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  initialContratoId?: string;
}

export const BlockchainValidator: React.FC<BlockchainValidatorProps> = ({
  contratos,
  empresa,
  accionistas,
  initialContratoId,
}) => {
  const empresaContratos = contratos.filter(c => c.empresa_id === empresa.id);
  const [selectedId, setSelectedId] = useState<string>(
    initialContratoId || empresaContratos[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const selectedContrato = empresaContratos.find(c => c.id === selectedId) || empresaContratos[0];
  const accionista = accionistas.find(a => a.id === selectedContrato?.accionista_id);

  if (!selectedContrato) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
        No hay contratos de mutuo con registro criptográfico para validar.
      </div>
    );
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(selectedContrato.soporte.hash_documento_sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Módulo 5: Sellado de Tiempo Digital & Archivo Probatorio de Fecha Cierta</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
                Control Interno
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Garantiza la trazabilidad contable interna de la empresa, certificando la fecha exacta mediante Hash SHA-256 inalterable y bloque criptográfico para el expediente probatorio de defensa fiscal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Hash Copiado' : 'Copiar Hash SHA-256'}</span>
          </button>
        </div>
      </div>

      {/* Contract selector */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          Seleccionar Contrato para Inspección:
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {empresaContratos.map(c => {
            const acc = accionistas.find(a => a.id === c.accionista_id);
            return (
              <option key={c.id} value={c.id}>
                {c.correlativo} • {acc?.nombre_accionista} • {formatUSD(c.monto_indexado_usd)} (Bloque #{c.soporte.block_number})
              </option>
            );
          })}
        </select>
      </div>

      {/* Simulated SENIAT Public Validator Screen */}
      <div className="bg-white border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Verification Verified Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-800 font-extrabold text-sm sm:text-base tracking-wide">
                  EXPEDIENTE DE FECHA CIERTA REGISTRADO
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  Certificado
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Expediente de Control Interno de la Empresa: Custodia de Fecha Cierta Inalterable
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-emerald-800">
            <div>Timestamp: <strong className="text-slate-900">{selectedContrato.soporte.timestamp_iso}</strong></div>
            <div className="text-[11px] text-slate-500">Bloque #{selectedContrato.soporte.block_number}</div>
          </div>
        </div>

        {/* Verification Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Transaction Details */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              Ficha Técnica del Instrumento Contractual
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Empresa (Persona Jurídica):</span>
                <span className="font-bold text-slate-900">{empresa.razon_social}</span>
                <div className="text-[11px] font-mono text-slate-600">R.I.F.: {empresa.rif_empresa}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Accionista Interviniente:</span>
                <span className="font-bold text-slate-900">{accionista?.nombre_accionista}</span>
                <div className="text-[11px] font-mono text-slate-600">C.I.: V-{accionista?.cedula_accionista} • R.I.F.: {accionista?.rif_accionista}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Naturaleza Jurídica del Flujo:</span>
                <span className="font-bold text-blue-700">
                  {selectedContrato.tipo_flujo === 'socio_a_empresa' ? 'Cuentas por Pagar Socios (Préstamo de Accionista)' : 'Cuentas por Cobrar Socios (Préstamo Corporativo)'}
                </span>
                <div className="text-[11px] text-slate-600">
                  {selectedContrato.aplica_interes ? `Interés comercial ${selectedContrato.tasa_interes}% mensual` : 'A título gratuito (Sin intereses corrientes)'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Monto y Moneda Pactada:</span>
                <span className="font-mono text-base font-bold text-emerald-700">
                  {selectedContrato.tipo_activo === 'VES' ? formatVES(selectedContrato.monto_original) : formatUSD(selectedContrato.monto_original)}
                </span>
                <div className="text-[11px] font-mono text-slate-600">
                  Tasa BCV de la fecha: Bs. {selectedContrato.tasa_bcv_fecha.toFixed(2)}/USD
                </div>
              </div>
            </div>

            {/* Cryptographic Hashes */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">UUID de Control Interno del Expediente:</span>
                <span className="text-slate-900 break-all select-all font-bold">{selectedContrato.uuid_publico}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Hash Criptográfico SHA-256 del Documento:</span>
                <span className="text-emerald-700 break-all select-all font-semibold">{selectedContrato.soporte.hash_documento_sha256}</span>
              </div>
              <div>
                <span className="text-slate-500 block">TxHash Registro Blockchain Pública (Polygon Network):</span>
                <span className="text-indigo-700 break-all select-all font-semibold">{selectedContrato.soporte.txhash_blockchain_polygon}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Custodia y Archivo Probatorio de la Empresa */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3.5">
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/20 border-2 border-emerald-400 flex flex-col items-center justify-center text-emerald-700 shadow-2xs">
              <ShieldCheck className="w-9 h-9 text-emerald-600 mb-1" />
              <span className="text-[9px] font-extrabold tracking-wider uppercase text-emerald-800">FECHA CIERTA</span>
              <span className="text-[8px] font-mono text-emerald-600 font-bold">CUSTODIADA</span>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900 flex items-center justify-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Archivo Probatorio de la Empresa</span>
              </span>
              <p className="text-[10px] text-slate-600 leading-tight">
                Respaldo técnico conservado internamente en la contabilidad para justificar la preexistencia y autenticidad del contrato conforme al Art. 72 de la Ley de ISLR.
              </p>
            </div>

            <div className="w-full py-2.5 px-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1.5 text-left font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Estatus:</span>
                <span className="font-semibold text-emerald-700 font-sans">Archivado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Red:</span>
                <span className="text-[10px] text-slate-800">Polygon PoS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">Bloque:</span>
                <span className="font-bold text-slate-900">#{selectedContrato.soporte.block_number}</span>
              </div>
            </div>

            <button
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer w-full justify-center"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? 'Hash Copiado' : 'Copiar Hash de Archivo'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
