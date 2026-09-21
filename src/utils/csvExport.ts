import { Empresa, Accionista, ContratoMutuo } from '../types';
import * as XLSX from 'xlsx';

export interface FiscalCsvOptions {
  delimiter?: ';' | ',';
  filterFlujo?: 'todos' | 'pagar' | 'cobrar';
  filterEstado?: 'todos' | 'activo' | 'cancelado' | 'capitalizado';
  filterActivo?: string;
  fechaCorte?: string;
  includeHeaderMetadata?: boolean;
  includeSummary?: boolean;
}

/**
 * Escapes a cell value for standard CSV compatibility.
 * Replaces double quotes with two double quotes and wraps in quotes if special characters exist.
 */
function escapeCsvValue(val: string | number | boolean | null | undefined, delimiter: string): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const needsQuotes = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r');
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats a number for Latin/Spanish CSV (using comma or dot depending on delimiter)
 */
function formatNumberForCsv(val: number, delimiter: string, decimals = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0.00';
  const fixed = val.toFixed(decimals);
  if (delimiter === ';') {
    // In semicolon delimited CSVs for Spanish Excel, use comma as decimal separator
    return fixed.replace('.', ',');
  }
  return fixed;
}

/**
 * Generates structured CSV content formatted specifically for SENIAT fiscal audits,
 * accounting closing (cierre fiscal) and VEN-NIF compliance.
 */
export function generateFiscalClosingCSV(
  empresa: Empresa,
  contratos: ContratoMutuo[],
  accionistas: Accionista[],
  tasaBCV: number,
  options: FiscalCsvOptions = {}
): string {
  const delimiter = options.delimiter || ';';
  const fechaCorte = options.fechaCorte || new Date().toISOString().split('T')[0];
  const includeHeader = options.includeHeaderMetadata !== false;
  const includeSummary = options.includeSummary !== false;

  // Filter contracts for this company
  let filtered = contratos.filter(c => c.empresa_id === empresa.id);

  if (options.filterFlujo && options.filterFlujo !== 'todos') {
    const targetFlujo = options.filterFlujo === 'pagar' ? 'socio_a_empresa' : 'empresa_a_socio';
    filtered = filtered.filter(c => c.tipo_flujo === targetFlujo);
  }

  if (options.filterEstado && options.filterEstado !== 'todos') {
    filtered = filtered.filter(c => c.estado === options.filterEstado);
  }

  if (options.filterActivo && options.filterActivo !== 'todos') {
    filtered = filtered.filter(c => c.tipo_activo === options.filterActivo);
  }

  const lines: string[] = [];

  // 1. Fiscal and Company Metadata Block (for SENIAT auditor)
  if (includeHeader) {
    lines.push([escapeCsvValue('REPÚBLICA BOLIVARIANA DE VENEZUELA', delimiter)].join(delimiter));
    lines.push([escapeCsvValue('SISTEMA DE CONTROL Y BLINDAJE TRIBUTARIO SOCIO-DOC', delimiter)].join(delimiter));
    lines.push([escapeCsvValue('REPORTE CONSOLIDADO DE CUENTAS POR PAGAR Y COBRAR ACCIONISTAS - CIERRE FISCAL SENIAT', delimiter)].join(delimiter));
    lines.push('');
    lines.push([escapeCsvValue('RAZÓN SOCIAL', delimiter), escapeCsvValue(empresa.razon_social, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('REGISTRO DE INFORMACIÓN FISCAL (R.I.F.)', delimiter), escapeCsvValue(empresa.rif_empresa, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('CONDICIÓN TRIBUTARIA', delimiter), escapeCsvValue(`Contribuyente ${empresa.tipo_contribuyente}`, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('REGISTRO MERCANTIL', delimiter), escapeCsvValue(empresa.registro_mercantil, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('DOMICILIO FISCAL', delimiter), escapeCsvValue(`${empresa.direccion_fiscal}, ${empresa.ciudad}, Edo. ${empresa.estado}`, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('REPRESENTANTE LEGAL', delimiter), escapeCsvValue(`${empresa.representante_legal} (C.I. ${empresa.cedula_representante}, ${empresa.cargo_representante})`, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('FECHA DE CORTE / CIERRE FISCAL', delimiter), escapeCsvValue(fechaCorte, delimiter)].join(delimiter));
    lines.push([escapeCsvValue('TASA OFICIAL BCV AL CIERRE (VES/USD)', delimiter), escapeCsvValue(formatNumberForCsv(tasaBCV, delimiter, 4), delimiter)].join(delimiter));
    lines.push([escapeCsvValue('MARCO JURÍDICO APLICABLE', delimiter), escapeCsvValue('Art. 72 Ley de ISLR (Presunción de Intereses) | Código Civil Venezolano (Arts. 1.735 y sigs.) | Ley de IGTF (G.O. 6.687) | Providencia SNAT/2003/1419 | VEN-NIF NIC 24', delimiter)].join(delimiter));
    lines.push('');
  }

  // 2. Executive Financial Summary Section
  if (includeSummary) {
    const totalPagarUSD = filtered
      .filter(c => c.tipo_flujo === 'socio_a_empresa')
      .reduce((acc, c) => acc + c.saldo_pendiente, 0);
    const totalPagarVES = totalPagarUSD * tasaBCV;

    const totalCobrarUSD = filtered
      .filter(c => c.tipo_flujo === 'empresa_a_socio')
      .reduce((acc, c) => acc + c.saldo_pendiente, 0);
    const totalCobrarVES = totalCobrarUSD * tasaBCV;

    const saldoNetoUSD = totalPagarUSD - totalCobrarUSD;
    const saldoNetoVES = totalPagarVES - totalCobrarVES;

    const totalIgtfUSD = filtered.reduce((acc, c) => acc + (c.soporte?.igtf_monto_usd || 0), 0);
    const totalIgtfVES = filtered.reduce((acc, c) => acc + (c.soporte?.igtf_monto_ves || 0), 0);

    lines.push([escapeCsvValue('=== RESUMEN EJECUTIVO DE CUENTAS SOCIOS AL CIERRE FISCAL ===', delimiter)].join(delimiter));
    lines.push([
      escapeCsvValue('CONCEPTO CONTABLE', delimiter),
      escapeCsvValue('CLASIFICACIÓN VEN-NIF', delimiter),
      escapeCsvValue('TOTAL SALDO USD', delimiter),
      escapeCsvValue('TOTAL SALDO VES (TASA BCV)', delimiter),
      escapeCsvValue('CANTIDAD OPERACIONES', delimiter),
      escapeCsvValue('IMPACTO FISCAL ANTE EL SENIAT', delimiter)
    ].join(delimiter));

    lines.push([
      escapeCsvValue('Cuentas por Pagar Socios (Préstamos Recibidos)', delimiter),
      escapeCsvValue('Pasivo No Financiero (Cuenta 2.1.03)', delimiter),
      escapeCsvValue(formatNumberForCsv(totalPagarUSD, delimiter), delimiter),
      escapeCsvValue(formatNumberForCsv(totalPagarVES, delimiter), delimiter),
      escapeCsvValue(filtered.filter(c => c.tipo_flujo === 'socio_a_empresa').length, delimiter),
      escapeCsvValue('Blindado contra presunción de ingresos omitidos / ventas no registradas', delimiter)
    ].join(delimiter));

    lines.push([
      escapeCsvValue('Cuentas por Cobrar Socios (Préstamos Otorgados)', delimiter),
      escapeCsvValue('Activo Exigible (Cuenta 1.1.03)', delimiter),
      escapeCsvValue(formatNumberForCsv(totalCobrarUSD, delimiter), delimiter),
      escapeCsvValue(formatNumberForCsv(totalCobrarVES, delimiter), delimiter),
      escapeCsvValue(filtered.filter(c => c.tipo_flujo === 'empresa_a_socio').length, delimiter),
      escapeCsvValue('Sujeto a verificación Art. 72 LISLR (Presunción de dividendos fictos e intereses presuntos)', delimiter)
    ].join(delimiter));

    lines.push([
      escapeCsvValue('POSICIÓN NETA CON ACCIONISTAS', delimiter),
      escapeCsvValue(saldoNetoUSD >= 0 ? 'Posición Neta Acreedora (Deuda con Socios)' : 'Posición Neta Deudora (Socio adeuda a Empresa)', delimiter),
      escapeCsvValue(formatNumberForCsv(saldoNetoUSD, delimiter), delimiter),
      escapeCsvValue(formatNumberForCsv(saldoNetoVES, delimiter), delimiter),
      escapeCsvValue(filtered.length, delimiter),
      escapeCsvValue(saldoNetoUSD >= 0 ? 'Empresa en condición deudora frente a sus accionistas' : 'Alerta: Exceso de retiros de accionistas sin dividendos formales decretados', delimiter)
    ].join(delimiter));

    lines.push([
      escapeCsvValue('RETENCIONES / PERCEPCIONES IGTF 3% ACUMULADAS', delimiter),
      escapeCsvValue('Pasivo Fiscal / Retención Tributaria', delimiter),
      escapeCsvValue(formatNumberForCsv(totalIgtfUSD, delimiter), delimiter),
      escapeCsvValue(formatNumberForCsv(totalIgtfVES, delimiter), delimiter),
      escapeCsvValue(filtered.filter(c => c.soporte?.igtf_aplica).length, delimiter),
      escapeCsvValue('Declarado y enterado quincenalmente ante el Portal Fiscal SENIAT', delimiter)
    ].join(delimiter));

    lines.push('');
  }

  // 3. Detailed Records Table
  lines.push([escapeCsvValue('=== DETALLE CONSOLIDADO DE OPERACIONES Y CONTRATOS DE MUTUO ===', delimiter)].join(delimiter));

  const headers = [
    'N° Correlativo',
    'Identificador UUID / Hash',
    'Fecha Inicio',
    'Fecha Vencimiento',
    'Plazo (Meses)',
    'Tipo de Flujo',
    'Código Contable VEN-NIF',
    'Nombre del Accionista / Contraparte',
    'Cédula de Identidad',
    'R.I.F. Accionista',
    '% Participación Accionaria',
    'Tipo de Activo / Moneda',
    'Monto Original',
    'Tasa BCV Fecha Origen (Bs/USD)',
    'Monto Equivalente USD Origen',
    'Monto Equivalente VES Origen',
    'Saldo Pendiente USD',
    'Saldo Pendiente VES (Al Cierre BCV)',
    'Aplica Intereses',
    'Tasa Interés Pactada (%)',
    'Cláusula de Gratuidad (Art. 72 LISLR)',
    'Destino de Fondos / Objeto Comercial',
    'Medio de Entrega / Soporte',
    'Referencia Bancaria / Recibo / TXID',
    'Banco o Red Blockchain',
    'Aplica IGTF 3%',
    'Monto IGTF Retenido (USD)',
    'Monto IGTF Retenido (VES)',
    'Estatus del Contrato',
    'Riesgo Fiscal SENIAT',
    'Certificación Notarial / Blockchain'
  ];

  lines.push(headers.map(h => escapeCsvValue(h, delimiter)).join(delimiter));

  filtered.forEach(contrato => {
    const accionista = accionistas.find(a => a.id === contrato.accionista_id);
    const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';
    const saldoPendienteVES = contrato.saldo_pendiente * tasaBCV;
    const riesgoSeniat = isSocioAEmpresa 
      ? 'Bajo - Mutuo Gratuito Blindado con Soporte' 
      : contrato.aplica_interes 
        ? 'Medio - Interés comercial pactado para mitigar Art. 72 LISLR' 
        : 'ALTO - Riesgo de Presunción de Dividendo (Art. 72 LISLR)';

    const row = [
      contrato.correlativo,
      contrato.uuid_publico,
      contrato.fecha_inicio,
      contrato.fecha_vencimiento,
      contrato.plazo_meses,
      isSocioAEmpresa ? 'Socio a Empresa (CxP)' : 'Empresa a Socio (CxC)',
      isSocioAEmpresa ? '2.1.03 Cuentas por Pagar Socios' : '1.1.03 Cuentas por Cobrar Socios',
      accionista?.nombre_accionista || 'No Identificado',
      accionista?.cedula_accionista || 'S/N',
      accionista?.rif_accionista || 'S/N',
      accionista ? `${accionista.porcentaje_acciones}%` : '0%',
      contrato.tipo_activo,
      formatNumberForCsv(contrato.monto_original, delimiter),
      formatNumberForCsv(contrato.tasa_bcv_fecha, delimiter, 4),
      formatNumberForCsv(contrato.monto_indexado_usd, delimiter),
      formatNumberForCsv(contrato.monto_indexado_ves, delimiter),
      formatNumberForCsv(contrato.saldo_pendiente, delimiter),
      formatNumberForCsv(saldoPendienteVES, delimiter),
      contrato.aplica_interes ? 'SÍ' : 'NO',
      contrato.aplica_interes ? formatNumberForCsv(contrato.tasa_interes || 0, delimiter) : '0.00',
      isSocioAEmpresa ? 'SÍ (Expresa para evitar intereses presuntos)' : 'NO APLICA',
      contrato.destino_fondos,
      contrato.soporte?.tipo_soporte === 'bancario' ? 'Transferencia Bancaria' : contrato.soporte?.tipo_soporte === 'blockchain_txid' ? 'Transferencia Blockchain Cripto' : 'Recibo de Caja Efectivo Divisas',
      contrato.soporte?.referencia_bancaria || contrato.soporte?.txid_blockchain || contrato.soporte?.recibo_caja_correlativo || 'S/R',
      contrato.soporte?.banco_destino || contrato.soporte?.red_blockchain || 'Caja Central USD',
      contrato.soporte?.igtf_aplica ? 'SÍ' : 'NO',
      formatNumberForCsv(contrato.soporte?.igtf_monto_usd || 0, delimiter),
      formatNumberForCsv(contrato.soporte?.igtf_monto_ves || 0, delimiter),
      contrato.estado.toUpperCase(),
      riesgoSeniat,
      contrato.soporte?.hash_documento_sha256 ? `Hash SHA-256: ${contrato.soporte.hash_documento_sha256.substring(0, 16)}...` : 'Sin Hash'
    ];

    lines.push(row.map(val => escapeCsvValue(val, delimiter)).join(delimiter));
  });

  // End of file notice
  lines.push('');
  lines.push([escapeCsvValue('DOCUMENTO GENERADO POR SOCIO-DOC PARA FINES DE AUDITORÍA Y CIERRE FISCAL', delimiter)].join(delimiter));
  lines.push([escapeCsvValue(`FECHA Y HORA DE GENERACIÓN: ${new Date().toLocaleString('es-VE')}`, delimiter)].join(delimiter));

  return lines.join('\r\n');
}

/**
 * Triggers a direct client-side file download of the CSV report.
 * Adds UTF-8 Byte Order Mark (BOM) \uFEFF to ensure Excel opens Spanish accents cleanly.
 */
export function downloadFiscalClosingCSV(
  empresa: Empresa,
  contratos: ContratoMutuo[],
  accionistas: Accionista[],
  tasaBCV: number,
  options: FiscalCsvOptions = {}
): void {
  const csvContent = generateFiscalClosingCSV(empresa, contratos, accionistas, tasaBCV, options);
  
  // UTF-8 BOM so Microsoft Excel automatically recognizes Spanish characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const sanitizedRif = empresa.rif_empresa.replace(/[^a-zA-Z0-9]/g, '');
  const fechaStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `Reporte_Fiscal_SENIAT_CxP_CxC_${sanitizedRif}_${fechaStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates TSV (Tab-Separated Values) format and copies to the clipboard.
 * Allows instant copy-pasting directly into Excel or Google Sheets.
 */
export async function copyFiscalClosingToClipboard(
  empresa: Empresa,
  contratos: ContratoMutuo[],
  accionistas: Accionista[],
  tasaBCV: number,
  options: FiscalCsvOptions = {}
): Promise<boolean> {
  try {
    const tsvContent = generateFiscalClosingCSV(empresa, contratos, accionistas, tasaBCV, {
      ...options,
      delimiter: '\t' as any,
    });
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Generates the CSV for the Monthly Calculation Sheet (Memoria de Cálculo de Intereses Indexados)
 * with the two-column format (Bs. vs USD), interest at 12% USD, and BCV month-end conversion.
 */
export function generateMemoriaCalculoCSV(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista,
  tasaBCVCierre: number,
  tasaAnual: number = 12,
  porcentajeRetencion: number = 5,
  delimiter: ';' | ',' = ';'
): string {
  const lines: string[] = [];
  const montoUSD = contrato.monto_indexado_usd || (contrato.tipo_activo === 'VES' ? contrato.monto_original / contrato.tasa_bcv_fecha : contrato.monto_original);
  const montoVES = contrato.monto_original * (contrato.tipo_activo === 'VES' ? 1 : contrato.tasa_bcv_fecha);

  // Interest math (30 days standard month)
  const diasMes = 30;
  const interesMesUSD = (montoUSD * (tasaAnual / 100) * diasMes) / 360;
  const interesMesVES = interesMesUSD * tasaBCVCierre;
  const retencionISLRVES = (interesMesVES * porcentajeRetencion) / 100;
  const netoVES = interesMesVES - retencionISLRVES;

  lines.push([escapeCsvValue('MEMORIA DE CÁLCULO MENSUAL - INTERESES INDEXADOS CON DOBLE MONEDA', delimiter)].join(delimiter));
  lines.push([escapeCsvValue('SOCIEDAD MERCANTIL', delimiter), escapeCsvValue(empresa.razon_social, delimiter), escapeCsvValue('R.I.F.', delimiter), escapeCsvValue(empresa.rif_empresa, delimiter)].join(delimiter));
  lines.push([escapeCsvValue('ACCIONISTA MUTUARIO', delimiter), escapeCsvValue(accionista.nombre_accionista, delimiter), escapeCsvValue('C.I. / R.I.F.', delimiter), escapeCsvValue(`${accionista.cedula_accionista} / ${accionista.rif_accionista}`, delimiter)].join(delimiter));
  lines.push([escapeCsvValue('CONTRATO DE MUTUO NRO', delimiter), escapeCsvValue(contrato.correlativo, delimiter), escapeCsvValue('FECHA CONTRATO', delimiter), escapeCsvValue(contrato.fecha_inicio, delimiter)].join(delimiter));
  lines.push([escapeCsvValue('BLINDAJE FISCAL', delimiter), escapeCsvValue('Art. 72 LISLR (Presunción de Dividendos) | Art. 16 Num 3 LIVA (No Sujeto a IVA) | Dto. 1808 (Retención ISLR)', delimiter)].join(delimiter));
  lines.push('');

  // Header columns
  lines.push([
    escapeCsvValue('FECHA', delimiter),
    escapeCsvValue('CONCEPTO / OPERACIÓN', delimiter),
    escapeCsvValue('REF. BANCARIA', delimiter),
    escapeCsvValue('COLUMNA 1: MOVIMIENTO BANCO (BS.)', delimiter),
    escapeCsvValue('TASA BCV OPERACIÓN (BS./USD)', delimiter),
    escapeCsvValue('COLUMNA 2: CONVERTIDO A DÓLARES (USD)', delimiter),
    escapeCsvValue('SALDO DEUDOR (USD)', delimiter),
    escapeCsvValue('DÍAS DEVENGADOS', delimiter),
    escapeCsvValue(`INTERÉS DEVENGADO AL ${tasaAnual}% ANUAL (USD)`, delimiter),
  ].join(delimiter));

  // Initial disbursement row
  lines.push([
    escapeCsvValue(contrato.fecha_inicio, delimiter),
    escapeCsvValue('Disposición de Fondos / Desembolso Inicial', delimiter),
    escapeCsvValue(contrato.soporte.referencia_bancaria || 'TX-BANCARIA', delimiter),
    escapeCsvValue(formatNumberForCsv(montoVES, delimiter), delimiter),
    escapeCsvValue(formatNumberForCsv(contrato.tasa_bcv_fecha, delimiter), delimiter),
    escapeCsvValue(formatNumberForCsv(montoUSD, delimiter), delimiter),
    escapeCsvValue(formatNumberForCsv(montoUSD, delimiter), delimiter),
    escapeCsvValue(diasMes.toString(), delimiter),
    escapeCsvValue(formatNumberForCsv(interesMesUSD, delimiter), delimiter),
  ].join(delimiter));

  lines.push('');
  lines.push([escapeCsvValue('RESUMEN Y LIQUIDACIÓN FISCAL DE FIN DE MES PARA NOTA DE DÉBITO', delimiter)].join(delimiter));
  lines.push([escapeCsvValue('Total Intereses Devengados en Moneda de Cuenta (USD)', delimiter), escapeCsvValue(formatNumberForCsv(interesMesUSD, delimiter), delimiter)].join(delimiter));
  lines.push([escapeCsvValue('Tasa Oficial BCV Cierre de Mes (Bs./USD)', delimiter), escapeCsvValue(formatNumberForCsv(tasaBCVCierre, delimiter), delimiter)].join(delimiter));
  lines.push([escapeCsvValue('Total Intereses en Moneda Nacional para Nota de Débito (Bs.)', delimiter), escapeCsvValue(formatNumberForCsv(interesMesVES, delimiter), delimiter)].join(delimiter));
  lines.push([escapeCsvValue('Alícuota IVA (Art. 16 Num. 3 Ley de IVA - NO SUJETO)', delimiter), escapeCsvValue('0,00% (NO SUJETO)', delimiter)].join(delimiter));
  lines.push([escapeCsvValue(`Retención de ISLR (${porcentajeRetencion}% según Dto. 1808 Art. 9 Num. 8)`, delimiter), escapeCsvValue(formatNumberForCsv(retencionISLRVES, delimiter), delimiter)].join(delimiter));
  lines.push([escapeCsvValue('Monto Neto a Liquidar en Bolívares (Bs.)', delimiter), escapeCsvValue(formatNumberForCsv(netoVES, delimiter), delimiter)].join(delimiter));

  return '\ufeff' + lines.join('\r\n');
}


/**
 * Triggers a direct client-side file download of the Excel report.
 */
export function downloadFiscalClosingExcel(
  empresa: Empresa,
  contratos: ContratoMutuo[],
  accionistas: Accionista[],
  tasaBCV: number,
  options: FiscalCsvOptions = {}
): void {
  const csvContent = generateFiscalClosingCSV(empresa, contratos, accionistas, tasaBCV, options);
  const rows = csvContent.split('\r\n').map(line => line.split(';'));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Fiscal');
  
  const sanitizedRif = empresa.rif_empresa.replace(/[^a-zA-Z0-9]/g, '');
  const fechaStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `Reporte_Fiscal_SENIAT_CxP_CxC_${sanitizedRif}_${fechaStr}.xlsx`;
  
  XLSX.writeFile(wb, filename);
}

/**
 * Triggers a direct client-side file download of the Excel Memoria de Calculo.
 */
export function downloadMemoriaCalculoExcel(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista,
  tasaBCVCierre: number,
  tasaAnual: number = 12,
  porcentajeRetencion: number = 5
): void {
  const csv = generateMemoriaCalculoCSV(contrato, empresa, accionista, tasaBCVCierre, tasaAnual, porcentajeRetencion);
  const rows = csv.split('\r\n').map(line => line.split(';'));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Memoria de Calculo');
  
  XLSX.writeFile(wb, `Memoria_Calculo_Intereses_${contrato.correlativo}.xlsx`);
}

