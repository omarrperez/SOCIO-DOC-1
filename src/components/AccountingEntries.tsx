import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ContratoMutuo, Empresa, Accionista, AsientoContable } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { BookOpen, Copy, Download, Check, FileSpreadsheet, ArrowRight, ShieldCheck } from 'lucide-react';

interface AccountingEntriesProps {
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
}

export const AccountingEntries: React.FC<AccountingEntriesProps> = ({
  contratos,
  empresa,
  accionistas,
  tasaBCV,
}) => {
  const empresaContratos = contratos.filter(c => c.empresa_id === empresa.id);
  const [selectedContratoId, setSelectedContratoId] = useState<string>(
    empresaContratos[0]?.id || ''
  );
  const [sistemaDestino, setSistemaDestino] = useState<'Saint' | 'Profit Plus' | 'Galac' | 'Excel'>('Saint');
  const [copied, setCopied] = useState(false);

  const selectedContrato = empresaContratos.find(c => c.id === selectedContratoId) || empresaContratos[0];
  const accionista = accionistas.find(a => a.id === selectedContrato?.accionista_id);

  if (!selectedContrato) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
        No hay contratos de mutuo registrados para generar asientos contables.
      </div>
    );
  }

  const isSocioAEmpresa = selectedContrato.tipo_flujo === 'socio_a_empresa';
  const isEfectivo = selectedContrato.tipo_activo === 'USD_EFECTIVO';
  const isCrypto = selectedContrato.tipo_activo === 'USDT';
  const isVES = selectedContrato.tipo_activo === 'VES';
  const montoVES = selectedContrato.monto_indexado_ves;

  // Build VEN-NIF Journal Entry
  let cuentaDebitoCodigo = '1.01.01.01.001';
  let cuentaDebitoNombre = 'BANCO NACIONAL CUENTA CORRIENTE';

  if (isEfectivo) {
    cuentaDebitoCodigo = '1.01.01.02.001';
    cuentaDebitoNombre = 'CAJA PRINCIPAL MONEDA EXTRANJERA (ACTIVO)';
  } else if (isCrypto) {
    cuentaDebitoCodigo = '1.01.03.01.001';
    cuentaDebitoNombre = 'ACTIVOS DIGITALES FUNGIBLES - CRIPTOACTIVOS USDT';
  } else if (!isSocioAEmpresa) {
    // Empresa a socio: Débito a cuenta por cobrar
    cuentaDebitoCodigo = '1.02.03.01.001';
    cuentaDebitoNombre = `CUENTAS POR COBRAR ACCIONISTAS - ${accionista?.nombre_accionista.toUpperCase()}`;
  }

  let cuentaCreditoCodigo = '2.01.03.01.001';
  let cuentaCreditoNombre = `CUENTAS POR PAGAR ACCIONISTAS - ${accionista?.nombre_accionista.toUpperCase()} (PASIVO)`;

  if (!isSocioAEmpresa) {
    cuentaCreditoCodigo = '1.01.01.01.002';
    cuentaCreditoNombre = 'BANCO CUENTA EN MONEDA EXTRANJERA (SALIDA)';
  }

  const glosa = isSocioAEmpresa
    ? `Soporte a flujo de caja y capital de trabajo según Contrato de Mutuo Nro. ${selectedContrato.correlativo} de fecha ${selectedContrato.fecha_inicio}. ${isEfectivo ? `Evidencia física en Recibo de Caja Nro. ${selectedContrato.soporte.recibo_caja_correlativo || 'REC-001'}.` : `Ref. Bancaria / TXID: ${selectedContrato.soporte.referencia_bancaria || selectedContrato.soporte.txid_blockchain || 'SOPORTE'}.`} Indexación oficial BCV: Bs. ${selectedContrato.tasa_bcv_fecha.toFixed(2)}/USD. Gratuito sin intereses.`
    : `Préstamo corporativo temporal a socio autorizado bajo Contrato de Mutuo Nro. ${selectedContrato.correlativo}. Art. 72 LISLR con tasa activa de interés comercial pactada. Plazo ${selectedContrato.plazo_meses} meses.`;

  // Generate File Content for Export
  const generateExportContent = (): string | string[][] => {
    if (sistemaDestino === 'Saint') {
      return `* COMPROBANTE DE DIARIO SAINT ENTERPRISE CONTABILIDAD
* EMPRESA: ${empresa.razon_social} (RIF: ${empresa.rif_empresa})
* FECHA: ${selectedContrato.fecha_inicio}
ASIENTO,${selectedContrato.correlativo},${selectedContrato.fecha_inicio}
${cuentaDebitoCodigo},"${cuentaDebitoNombre}",${montoVES.toFixed(2)},0.00,"${glosa.substring(0, 80)}"
${cuentaCreditoCodigo},"${cuentaCreditoNombre}",0.00,${montoVES.toFixed(2)},"${glosa.substring(0, 80)}"`;
    }

    if (sistemaDestino === 'Profit Plus') {
      return `PROFIT PLUS CONTABILIDAD 2KDoce / SQL
EMPRESA: ${empresa.rif_empresa}
COMPROBANTE NRO: ${selectedContrato.correlativo} | FECHA: ${selectedContrato.fecha_inicio}
RENGLON | CODIGO_CUENTA | DESCRIPCION | DEBE | HABER | GLOSA
1 | ${cuentaDebitoCodigo} | ${cuentaDebitoNombre} | ${montoVES.toFixed(2)} | 0.00 | ${glosa}
2 | ${cuentaCreditoCodigo} | ${cuentaCreditoNombre} | 0.00 | ${montoVES.toFixed(2)} | ${glosa}`;
    }

    if (sistemaDestino === 'Galac') {
      return `GALAC SOFTWARE - CONTABILIDAD DEL SISTEMA
FECHA\tCUENTA\tDESCRIPCION\tDEBE\tHABER\tCONCEPTO
${selectedContrato.fecha_inicio}\t${cuentaDebitoCodigo}\t${cuentaDebitoNombre}\t${montoVES.toFixed(2)}\t0.00\t${glosa}
${selectedContrato.fecha_inicio}\t${cuentaCreditoCodigo}\t${cuentaCreditoNombre}\t0.00\t${montoVES.toFixed(2)}\t${glosa}`;
    }

    // Excel structure
    return [
      ['Fecha', 'CodigoCuenta', 'NombreCuenta', 'Debito_VES', 'Credito_VES', 'Glosa_Legal'],
      [selectedContrato.fecha_inicio, cuentaDebitoCodigo, cuentaDebitoNombre, montoVES.toFixed(2), '0.00', glosa],
      [selectedContrato.fecha_inicio, cuentaCreditoCodigo, cuentaCreditoNombre, '0.00', montoVES.toFixed(2), glosa]
    ];
  };

  const handleDownload = () => {
    if (sistemaDestino === 'Excel') {
        const rows = generateExportContent() as any;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Asiento Contable');
        XLSX.writeFile(wb, `Asiento_${selectedContrato.correlativo}.xlsx`);
    } else {
        const content = generateExportContent() as any;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Asiento_${selectedContrato.correlativo}_${sistemaDestino}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    const content = generateExportContent();
    const textToCopy = typeof content === 'string' 
      ? content 
      : content.map(row => row.join('\t')).join('\n');
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Module Header */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Módulo 2: Generador Automatizado de Asientos Contables (VEN-NIF)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Simetría Libros vs. Contratos
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Evita el error crítico de registrar aportes de socios en cuentas de ingresos corrientes (lo cual el SENIAT repara como venta omitida), garantizando asientos limpios en cuentas de pasivo 2.01.03.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-slate-700 shadow-2xs font-medium">
            Norma: <strong className="text-emerald-700">VEN-NIF PYME Sección 11/22</strong>
          </span>
        </div>
      </div>

      {/* Selector bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex-1 max-w-md">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Seleccionar Contrato de Mutuo para Generar Asiento:
          </label>
          <select
            value={selectedContratoId}
            onChange={(e) => setSelectedContratoId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {empresaContratos.map(c => {
              const acc = accionistas.find(a => a.id === c.accionista_id);
              return (
                <option key={c.id} value={c.id}>
                  {c.correlativo} • {acc?.nombre_accionista.split(' ')[0]} • {formatUSD(c.monto_indexado_usd)} ({c.tipo_activo})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Software Contable Destino en Venezuela:
          </label>
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            {(['Saint', 'Profit Plus', 'Galac', 'Excel'] as const).map((sis) => (
              <button
                key={sis}
                onClick={() => setSistemaDestino(sis)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                  sistemaDestino === sis
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sis}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Voucher / Asiento Representation */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-xs text-slate-900">
              Comprobante de Diario Nro. COMP-{selectedContrato.correlativo}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Fecha: {selectedContrato.fecha_inicio}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar {sistemaDestino}</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Código Cuenta (VEN-NIF)</th>
                <th className="py-3 px-4 font-bold">Descripción de la Cuenta</th>
                <th className="py-3 px-4 text-right font-bold">Debe (VES)</th>
                <th className="py-3 px-4 text-right font-bold">Haber (VES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-blue-700">{cuentaDebitoCodigo}</td>
                <td className="py-3 px-4 text-slate-900 font-sans">{cuentaDebitoNombre}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatVES(montoVES)}</td>
                <td className="py-3 px-4 text-right text-slate-400">Bs. 0,00</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-blue-700">{cuentaCreditoCodigo}</td>
                <td className="py-3 px-4 text-slate-900 font-sans">{cuentaCreditoNombre}</td>
                <td className="py-3 px-4 text-right text-slate-400">Bs. 0,00</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatVES(montoVES)}</td>
              </tr>
              <tr className="bg-slate-50/80 font-bold border-t-2 border-slate-300 text-slate-900">
                <td colSpan={2} className="py-3 px-4 text-right uppercase font-sans text-xs">
                  Totales Cuadrados (Partida Doble):
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">{formatVES(montoVES)}</td>
                <td className="py-3 px-4 text-right text-emerald-700">{formatVES(montoVES)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Glosa section */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Glosa Legal y Contable Automatizada (Blindaje de Auditoría):
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] leading-relaxed shadow-2xs">
            "{glosa}"
          </div>
        </div>

      </div>

    </div>
  );
};
