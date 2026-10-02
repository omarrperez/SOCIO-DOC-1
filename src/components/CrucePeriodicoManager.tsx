import React, { useState, useMemo } from 'react';
import { Empresa, Accionista, ContratoMutuo, MovimientoCrucePeriodico } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Receipt, 
  Download, 
  Scale, 
  BookOpen, 
  Layers, 
  Landmark, 
  Info, 
  ChevronRight, 
  TrendingDown, 
  TrendingUp,
  Percent,
  Coins,
  FileCheck2,
  Calendar,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { downloadCrucePeriodicoExcel } from '../utils/documentExport';
import { 
  MOVIMIENTOS_CRUCE_PERIODICO, 
  TOTAL_CUPOS_DESEMBOLSADOS_VES, 
  TOTAL_PAGOS_RECIBIDOS_VES, 
  TOTAL_INTERESES_DEVENGADOS_VES, 
  TOTAL_RETENCION_ISLR_5PCT_VES, 
  TOTAL_INTERES_NETO_PERCIBIDO_VES, 
  TOTAL_AMORTIZACION_CAPITAL_VES, 
  SALDO_CAPITAL_VIVO_FINAL_VES, 
  CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES, 
  LIMITE_LINEA_CREDITO_GLOBAL_VES,
  PORCENTAJE_UTILIZACION_FINAL
} from '../data/crucePeriodicoData';
import { RECIBOS_CUPO_AGRICOLA_ONI } from '../data/recibosCupoData';
import { RECIBOS_PAGOS_AGRICOLA_ONI } from '../data/recibosPagosData';
import { 
  obtenerConfiguracionFiscal, 
  calcularRecibosConConfiguracionFiscal,
  REGLAS_CONTABLES_OBLIGATORIAS_APP
} from '../utils/fiscalUtils';

interface CrucePeriodicoManagerProps {
  empresa: Empresa;
  accionistas: Accionista[];
  contratos: ContratoMutuo[];
  tasaBCV: number;
  onOpenLineaCredito?: (contrato?: ContratoMutuo) => void;
  onNavigateToRecibosCupo?: () => void;
  onNavigateToRecibosPagos?: () => void;
  onNavigateToAsientos?: () => void;
}

export const CrucePeriodicoManager: React.FC<CrucePeriodicoManagerProps> = ({
  empresa,
  accionistas,
  contratos,
  tasaBCV,
  onOpenLineaCredito,
  onNavigateToRecibosCupo,
  onNavigateToRecibosPagos,
  onNavigateToAsientos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'CUPOS' | 'PAGOS'>('TODOS');
  const [activeTabSubView, setActiveTabSubView] = useState<'TABLA' | 'ASIENTOS' | 'DICTAMEN'>('TABLA');
  const [filtroAsientos, setFiltroAsientos] = useState<
    'TODOS' | 'SALIDAS' | 'ENTRADAS' | 'ISLR' | 'RESUMEN' | 'REGLAS'
  >('TODOS');
  const [searchAsiento, setSearchAsiento] = useState('');
  const [copiedAsientoId, setCopiedAsientoId] = useState<string | null>(null);
  const [copiedAllAsientos, setCopiedAllAsientos] = useState(false);

  // Identify partner Manuel Alejandro Becerra Luis
  const mutuario = accionistas.find(
    a => a.nombre_accionista.toUpperCase().includes('BECERRA') || a.cedula_accionista.includes('24.224.176') || a.cedula_accionista.includes('24224176')
  ) || {
    id: 'acc-manuel-becerra',
    empresa_id: empresa.id,
    nombre_accionista: 'Manuel Alejandro Becerra Luis',
    cedula_accionista: '24.224.176',
    rif_accionista: 'V-24224176-9',
    porcentaje_acciones: 0,
    cargo_o_condicion: 'Mutuario / Socio en Empresa Vinculada',
    es_accionista: false,
    telefono: '+58 (412) 555-7890',
    email: 'mbecerra@inversiones-triasbecerra.com.ve',
  };

  const contratoLinea = contratos.find(
    c => c.empresa_id === empresa.id && (c.modalidad_contrato === 'linea_credito_rotativa' || c.correlativo.includes('LC-ONI'))
  ) || contratos[0];

  const movimientos = MOVIMIENTOS_CRUCE_PERIODICO;

  const fiscalConfig = useMemo(() => obtenerConfiguracionFiscal(empresa), [empresa]);
  const { recibosRecalculados } = useMemo(() => {
    return calcularRecibosConConfiguracionFiscal(RECIBOS_PAGOS_AGRICOLA_ONI, fiscalConfig);
  }, [fiscalConfig]);

  const filteredMovimientos = useMemo(() => {
    return MOVIMIENTOS_CRUCE_PERIODICO.filter(m => {
      // Tipo filter
      if (filtroTipo === 'CUPOS' && m.tipo !== 'CUPO_DISPOSICION') return false;
      if (filtroTipo === 'PAGOS' && m.tipo !== 'PAGO_AMORTIZACION') return false;

      // Search query
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        m.recibo_codigo.toLowerCase().includes(q) ||
        m.referencia_bancaria.toLowerCase().includes(q) ||
        m.fecha.includes(q) ||
        m.concepto.toLowerCase().includes(q) ||
        m.debito_cupo_ves.toString().includes(q) ||
        m.pago_total_recibido_ves.toString().includes(q)
      );
    });
  }, [filtroTipo, searchTerm]);

  // Generate the complete list of 49 Journal Entries
  const todosLosAsientos = useMemo(() => {
    const list: any[] = [];

    // ASIENTO 0: Apertura de Línea en Cuentas de Orden estatutarias (Bs. 600.000.000,00)
    list.push({
      id: 'asiento-0-apertura',
      comprobanteNro: 'COMP-APERT-2026-0001',
      fecha: '15/01/2026',
      tipo: 'apertura',
      tipoEtiqueta: 'Apertura de Línea (Cuentas de Orden)',
      reciboCodigo: 'CONTRATO-MARCO-001',
      referenciaBancaria: 'NOTARIA-CHACAO-T12',
      renglones: [
        {
          codigo: '7.1.01.01.001',
          nombre: 'Contratos de Crédito Autorizados y Concedidos a Socios',
          debito: 600000000.00,
          credito: 0.00,
        },
        {
          codigo: '7.2.01.01.001',
          nombre: 'Responsabilidad por Líneas de Crédito Rotativas Concedidas',
          debito: 0.00,
          credito: 600000000.00,
        },
      ],
      glosa: `Registro de orden y control estatutario de apertura de Línea de Crédito Rotativa General por Bs. 600.000.000,00 concedida al ciudadano ${mutuario.nombre_accionista} según Contrato Notariado N° LC-ONI-2026-0001 y Acta de Asamblea Extraordinaria. VEN-NIF PYME Sección 11.`,
      totalDebito: 600000000.00,
      totalCredito: 600000000.00,
    });

    // ASIENTOS 1 al 29: Los 29 Desembolsos de Salida (Cupos Rotativos)
    RECIBOS_CUPO_AGRICOLA_ONI.forEach(cupo => {
      list.push({
        id: `asiento-cupo-${cupo.numero_cupo}`,
        comprobanteNro: `COMP-CUP-${String(cupo.numero_cupo).padStart(4, '0')}`,
        fecha: cupo.fecha,
        tipo: 'salida',
        tipoEtiqueta: `Desembolso Cupo N° ${cupo.numero_cupo} (Salida)`,
        reciboCodigo: cupo.numero_recibo,
        referenciaBancaria: cupo.referencia_bancaria,
        renglones: [
          {
            codigo: '1.1.2.03.01',
            nombre: `Cuentas por Cobrar Socios y Directores - ${mutuario.nombre_accionista.toUpperCase()}`,
            debito: cupo.monto_ves,
            credito: 0.00,
          },
          {
            codigo: '1.1.1.02.01',
            nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 0134-0987-5128)',
            debito: 0.00,
            credito: cupo.monto_ves,
          },
        ],
        glosa: `Desembolso de cupo rotativo N° ${cupo.numero_cupo} mediante transferencia bancaria de salida por Bs. ${formatVES(cupo.monto_ves)} (${formatUSD(cupo.monto_usd)} a tasa BCV ${cupo.tasa_bcv.toFixed(2)}) imputado a la Línea de Crédito Rotativa general. Soporte: Recibo de Cupo ${cupo.numero_recibo} y Transferencia Banesco Ref. ${cupo.referencia_bancaria}. Art. 72 LISLR y VEN-NIF PYME Sección 11.`,
        totalDebito: cupo.monto_ves,
        totalCredito: cupo.monto_ves,
      });
    });

    // ASIENTOS 30 al 47: Las 18 Cobranzas con Partida Cuádruple e ISLR 5%
    recibosRecalculados.forEach(pago => {
      const entradaBancoNeto = Math.round((pago.monto_total_ves - pago.monto_retencion_islr_ves) * 100) / 100;
      const islrRet = pago.monto_retencion_islr_ves;
      const intereses = pago.intereses_pagados_ves;
      const capital = pago.capital_amortizado_ves;

      list.push({
        id: `asiento-pago-${pago.numero_pago}`,
        comprobanteNro: `COMP-PAG-${String(pago.numero_pago).padStart(4, '0')}`,
        fecha: pago.fecha,
        tipo: 'entrada',
        tipoEtiqueta: `Pago Recibido N° ${pago.numero_pago} (Amortización e ISLR)`,
        reciboCodigo: pago.numero_recibo,
        referenciaBancaria: pago.referencia_bancaria,
        renglones: [
          {
            codigo: '1.1.1.02.01',
            nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 0134-0987-5128) [Entrada Neta]',
            debito: entradaBancoNeto,
            credito: 0.00,
          },
          {
            codigo: '1.1.3.05.02',
            nombre: 'Anticipo de ISLR Retenido por Clientes y Socios (5% Decreto 1808)',
            debito: islrRet,
            credito: 0.00,
          },
          {
            codigo: '4.2.1.01.01',
            nombre: 'Ingresos Financieros por Intereses de Financiamiento (Art. 529 C.Com)',
            debito: 0.00,
            credito: intereses,
          },
          {
            codigo: '1.1.2.03.01',
            nombre: `Cuentas por Cobrar Socios y Directores - ${mutuario.nombre_accionista.toUpperCase()} [Amortización Capital]`,
            debito: 0.00,
            credito: capital,
          },
        ],
        glosa: `Cobranza de transferencia Banesco de abono por Bs. ${formatVES(pago.monto_total_ves)}. Se imputa con prelación legal imperativa primero a intereses devengados (Bs. ${formatVES(intereses)}) según mandato del Art. 529 del Código de Comercio, reconociendo el anticipo de ISLR retenido en fuente (5% por Bs. ${formatVES(islrRet)}) según Decreto N° 1.808 y el remanente a amortización efectiva del capital (Bs. ${formatVES(capital)}). Saldo deudor resultante: Bs. ${formatVES(pago.nuevo_saldo_capital_ves)}. Soporte: Recibo de Pago ${pago.numero_recibo} y Ref. Banesco ${pago.referencia_bancaria}.`,
        totalDebito: pago.monto_total_ves,
        totalCredito: pago.monto_total_ves,
      });
    });

    // ASIENTO 48: Cierre y Compensación Fiscal de ISLR
    const totalRetencionAcumulada = Math.round(
      recibosRecalculados.reduce((sum, r) => sum + r.monto_retencion_islr_ves, 0) * 100
    ) / 100;

    list.push({
      id: 'asiento-48-cierre-islr',
      comprobanteNro: 'COMP-ISLR-2026-0001',
      fecha: '31/12/2026',
      tipo: 'islr',
      tipoEtiqueta: 'Compensación de ISLR Retenido (Decreto 1808)',
      reciboCodigo: 'ARC-SENIAT-2026',
      referenciaBancaria: 'COMP-ARC-ACUMULADO',
      renglones: [
        {
          codigo: '2.1.3.01.01',
          nombre: 'Impuesto Sobre la Renta (ISLR) por Pagar (Pasivo Corriente)',
          debito: totalRetencionAcumulada,
          credito: 0.00,
        },
        {
          codigo: '1.1.3.05.02',
          nombre: 'Anticipo de ISLR Retenido por Clientes y Socios (5% Decreto 1808)',
          debito: 0.00,
          credito: totalRetencionAcumulada,
        },
      ],
      glosa: `Compensación fiscal de retenciones de ISLR acumuladas por Bs. ${formatVES(totalRetencionAcumulada)} practicadas al 5% sobre la totalidad de los intereses de mutuo devengados en el período 2026, conforme al Art. 9 del Decreto N° 1.808. Soportado formalmente con los Comprobantes de Retención ARC emitidos por el mutuario pagador, deduciéndose directamente de la cuota tributaria en la Declaración Definitiva de Rentas ante el SENIAT.`,
      totalDebito: totalRetencionAcumulada,
      totalCredito: totalRetencionAcumulada,
    });

    return list;
  }, [mutuario, recibosRecalculados]);

  // Summary Master Entries (Consolidated)
  const asientosConsolidados = useMemo(() => {
    const totalCupos = 600000000.00;
    const totalPagos = Math.round(recibosRecalculados.reduce((sum, r) => sum + r.monto_total_ves, 0) * 100) / 100;
    const totalIntereses = Math.round(recibosRecalculados.reduce((sum, r) => sum + r.intereses_pagados_ves, 0) * 100) / 100;
    const totalRetencion = Math.round(recibosRecalculados.reduce((sum, r) => sum + r.monto_retencion_islr_ves, 0) * 100) / 100;
    const totalBancoNeto = Math.round((totalPagos - totalRetencion) * 100) / 100;
    const totalAmortizado = Math.round(recibosRecalculados.reduce((sum, r) => sum + r.capital_amortizado_ves, 0) * 100) / 100;

    return [
      {
        id: 'resumen-1',
        titulo: 'Apertura de Línea de Crédito en Cuentas de Orden',
        fecha: '15/01/2026',
        comprobante: 'COMP-APERT-0001',
        renglones: [
          { codigo: '7.1.01.01.001', nombre: 'Contratos de Crédito Autorizados a Socios', debito: 600000000.00, credito: 0 },
          { codigo: '7.2.01.01.001', nombre: 'Responsabilidad por Líneas de Crédito Concedidas', debito: 0, credito: 600000000.00 },
        ],
        glosa: 'Control estatutario de apertura de cupo según Acta y Contrato Notariado LC-ONI-2026-0001.',
      },
      {
        id: 'resumen-2',
        titulo: 'Registro Consolidado de los 29 Desembolsos de Cupo Rotativo',
        fecha: '16/01/2026 al 25/03/2026',
        comprobante: 'COMP-CUP-0001 al 0029',
        renglones: [
          { codigo: '1.1.2.03.01', nombre: `Cuentas por Cobrar Socios y Directores - ${mutuario.nombre_accionista.toUpperCase()}`, debito: totalCupos, credito: 0 },
          { codigo: '1.1.1.02.01', nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 5128)', debito: 0, credito: totalCupos },
        ],
        glosa: '29 Transferencias de desembolso según Recibos Oficiales RC-ONI-2026-0001 al 0029. VEN-NIF PYME Sección 11.',
      },
      {
        id: 'resumen-3',
        titulo: 'Cobranza Consolidada de 18 Pagos, Intereses y Retención ISLR 5%',
        fecha: '14/07/2026 al 11/09/2026',
        comprobante: 'COMP-PAG-0001 al 0018',
        renglones: [
          { codigo: '1.1.1.02.01', nombre: 'Banco Banesco C.A. (Entrada Neta a Banco)', debito: totalBancoNeto, credito: 0 },
          { codigo: '1.1.3.05.02', nombre: 'Anticipo de ISLR Retenido por Clientes (5% Decreto 1808)', debito: totalRetencion, credito: 0 },
          { codigo: '4.2.1.01.01', nombre: 'Ingresos Financieros por Intereses de Financiamiento (Art. 529 C.Com)', debito: 0, credito: totalIntereses },
          { codigo: '1.1.2.03.01', nombre: `Cuentas por Cobrar Socios y Directores (Amortización Capital)`, debito: 0, credito: totalAmortizado },
        ],
        glosa: `Cobranza de 18 transferencias Banesco por ${formatVES(totalPagos)} con prelación imperativa a intereses devengados según Art. 529 C.Com y retención 5% ISLR. Saldo vivo: Bs. ${formatVES(600000000 - totalAmortizado)}.`,
      },
      {
        id: 'resumen-4',
        titulo: 'Compensación Fiscal de ISLR Retenido al Cierre del Ejercicio',
        fecha: '31/12/2026',
        comprobante: 'COMP-ISLR-2026-0001',
        renglones: [
          { codigo: '2.1.3.01.01', nombre: 'Impuesto Sobre la Renta (ISLR) por Pagar', debito: totalRetencion, credito: 0 },
          { codigo: '1.1.3.05.02', nombre: 'Anticipo de ISLR Retenido por Clientes y Socios', debito: 0, credito: totalRetencion },
        ],
        glosa: 'Compensación del crédito fiscal por retenciones de ISLR 5% contra el impuesto definitivo a pagar ante el SENIAT.',
      }
    ];
  }, [recibosRecalculados, mutuario]);

  const asientosFiltrados = useMemo(() => {
    let list = todosLosAsientos;
    if (filtroAsientos === 'SALIDAS') {
      list = list.filter(a => a.tipo === 'salida');
    } else if (filtroAsientos === 'ENTRADAS') {
      list = list.filter(a => a.tipo === 'entrada');
    } else if (filtroAsientos === 'ISLR') {
      list = list.filter(a => a.tipo === 'islr' || a.tipo === 'entrada');
    }

    if (searchAsiento.trim()) {
      const q = searchAsiento.toLowerCase();
      list = list.filter(a =>
        a.comprobanteNro.toLowerCase().includes(q) ||
        a.reciboCodigo.toLowerCase().includes(q) ||
        a.referenciaBancaria.toLowerCase().includes(q) ||
        a.fecha.toLowerCase().includes(q) ||
        a.glosa.toLowerCase().includes(q) ||
        a.renglones.some((r: any) => r.codigo.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q))
      );
    }
    return list;
  }, [todosLosAsientos, filtroAsientos, searchAsiento]);

  const handleCopySingleAsiento = (a: any) => {
    let text = `COMPROBANTE: ${a.comprobanteNro} | FECHA: ${a.fecha}\n`;
    text += `TIPO: ${a.tipoEtiqueta} | SOPORTE: ${a.reciboCodigo} (Ref: ${a.referenciaBancaria})\n`;
    text += `CUENTA\tDESCRIPCIÓN\tDEBE\tHABER\n`;
    a.renglones.forEach((r: any) => {
      text += `${r.codigo}\t${r.nombre}\t${formatVES(r.debito)}\t${formatVES(r.credito)}\n`;
    });
    text += `TOTALES: DEBE ${formatVES(a.totalDebito)} | HABER ${formatVES(a.totalCredito)}\n`;
    text += `GLOSA: "${a.glosa}"`;
    navigator.clipboard.writeText(text);
    setCopiedAsientoId(a.id);
    setTimeout(() => setCopiedAsientoId(null), 2000);
  };

  const handleCopyAllAsientos = () => {
    let allText = `LIBRO DIARIO LEGAL COMPLETO (49 ASIENTOS) - ${empresa.razon_social}\n`;
    todosLosAsientos.forEach(a => {
      allText += `\n============================================================\n`;
      allText += `COMPROBANTE: ${a.comprobanteNro} | FECHA: ${a.fecha} | TIPO: ${a.tipoEtiqueta}\n`;
      allText += `SOPORTE: ${a.reciboCodigo} | REF BANCO: ${a.referenciaBancaria}\n`;
      a.renglones.forEach((r: any) => {
        allText += `${r.codigo}\t${r.nombre}\t${formatVES(r.debito)}\t${formatVES(r.credito)}\n`;
      });
      allText += `GLOSA: ${a.glosa}\n`;
    });
    navigator.clipboard.writeText(allText);
    setCopiedAllAsientos(true);
    setTimeout(() => setCopiedAllAsientos(false), 2000);
  };

  const handleDownloadExcel = () => {
    downloadCrucePeriodicoExcel(
      movimientos,
      empresa,
      mutuario,
      contratoLinea,
      RECIBOS_CUPO_AGRICOLA_ONI,
      recibosRecalculados
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Scale className="w-3.5 h-3.5" />
                <span>Cruce Periódico Consolidado (47 Movimientos)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/80 text-blue-200 border border-blue-700/60 font-mono">
                29 Cupos + 18 Pagos
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dictamen VEN-NIF • Art. 529 C.Com • Art. 72 LISLR</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{empresa.razon_social}</span>
                <ArrowRight className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-semibold">{mutuario.nombre_accionista}</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Relación periódica cronológica de la <strong>Línea de Crédito Rotativa (LC-ONI-2026-0001)</strong>. Conciliación estricta de cada cargo por desembolso de cupo y cada abono de pago recibido, liquidando legalmente los intereses devengados con 5% de retención de ISLR y amortización neta a capital vivo.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer border border-emerald-300/80 active:scale-95"
              title="Descargar libro Excel (.xlsx) completo con 4 hojas (Cruce, Dictamen Contable, 29 Cupos y 18 Pagos)"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              <span>DESCARGAR CRUCE EN EXCEL (.XLSX)</span>
            </button>

            {onNavigateToRecibosCupo && (
              <button
                type="button"
                onClick={onNavigateToRecibosCupo}
                className="px-3.5 py-2.5 bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 text-xs font-bold rounded-xl transition-colors border border-blue-700/50 flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-blue-300" />
                <span>Ver 29 Cupos</span>
              </button>
            )}

            {onNavigateToRecibosPagos && (
              <button
                type="button"
                onClick={onNavigateToRecibosPagos}
                className="px-3.5 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-bold rounded-xl transition-colors border border-emerald-700/50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Ver 18 Pagos</span>
              </button>
            )}

            {onOpenLineaCredito && (
              <button
                type="button"
                onClick={() => onOpenLineaCredito(contratoLinea)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Contrato Notarial</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Key Financial Metric Cards */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Límite Aprobado:</div>
            <div className="text-sm font-black text-white font-mono mt-0.5">{formatVES(LIMITE_LINEA_CREDITO_GLOBAL_VES)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Techo Anual 100%</div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/60">
            <div className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Total 29 Cupos [+]</div>
            <div className="text-sm font-black text-blue-300 font-mono mt-0.5">{formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}</div>
            <div className="text-[10px] text-blue-200/70 mt-0.5">Disposiciones Banesco</div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-950/60 border border-teal-800/60">
            <div className="text-[10px] text-teal-300 font-medium uppercase tracking-wider">Total 18 Pagos [-]</div>
            <div className="text-sm font-black text-teal-300 font-mono mt-0.5">{formatVES(TOTAL_PAGOS_RECIBIDOS_VES)}</div>
            <div className="text-[10px] text-teal-200/70 mt-0.5">Entradas Recibidas</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/60">
            <div className="text-[10px] text-amber-300 font-medium uppercase tracking-wider">Intereses Pagados:</div>
            <div className="text-sm font-black text-amber-400 font-mono mt-0.5">{formatVES(TOTAL_INTERESES_DEVENGADOS_VES)}</div>
            <div className="text-[10px] text-amber-200/70 mt-0.5">Ret. ISLR: {formatVES(TOTAL_RETENCION_ISLR_5PCT_VES)}</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/60">
            <div className="text-[10px] text-rose-300 font-medium uppercase tracking-wider">Saldo Deudor Vivo:</div>
            <div className="text-sm font-black text-rose-300 font-mono mt-0.5">{formatVES(SALDO_CAPITAL_VIVO_FINAL_VES)}</div>
            <div className="text-[10px] text-rose-200/70 mt-0.5">Capital Pendiente ({PORCENTAJE_UTILIZACION_FINAL.toFixed(1)}%)</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
            <div className="text-[10px] text-emerald-300 font-medium uppercase tracking-wider">Cupo Reconstituido:</div>
            <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">{formatVES(CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES)}</div>
            <div className="text-[10px] text-emerald-200/70 mt-0.5">Disponible Actual ({(100 - PORCENTAJE_UTILIZACION_FINAL).toFixed(1)}%)</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSubView('TABLA')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTabSubView === 'TABLA'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tabla de Cruce Cronológico (47)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSubView('ASIENTOS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTabSubView === 'ASIENTOS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Asientos de Diario (VEN-NIF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSubView('DICTAMEN')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTabSubView === 'DICTAMEN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dictamen Tributario SENIAT</span>
          </button>
        </div>

        {activeTabSubView === 'TABLA' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filtrar:</span>
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFiltroTipo('TODOS')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtroTipo === 'TODOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos (47)
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('CUPOS')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtroTipo === 'CUPOS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Cupos (29)
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('PAGOS')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtroTipo === 'PAGOS' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Pagos (18)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW: MAIN TABLE */}
      {activeTabSubView === 'TABLA' && (
        <div className="space-y-4">
          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por recibo (RC-0015, RP-0004), referencia Banesco o monto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                29 Cupos Disposición
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                18 Pagos Amortización
              </span>
              <span>Mostrando <strong>{filteredMovimientos.length}</strong> de 47 movimientos</span>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-2 text-center w-10">N°</th>
                    <th className="py-3 px-2.5 text-center">Fecha</th>
                    <th className="py-3 px-3 text-center">Operación</th>
                    <th className="py-3 px-2.5 text-center">Recibo</th>
                    <th className="py-3 px-3">Ref. Banesco</th>
                    <th className="py-3 px-3 text-right bg-blue-900/40 text-blue-200">Débito Cupo [+]</th>
                    <th className="py-3 px-3 text-right bg-emerald-900/40 text-emerald-200">Pago Recibido</th>
                    <th className="py-3 px-3 text-right bg-emerald-900/40 text-emerald-200">Intereses</th>
                    <th className="py-3 px-2.5 text-right bg-emerald-900/40 text-emerald-200">Ret. ISLR (5%)</th>
                    <th className="py-3 px-3 text-right bg-emerald-900/40 text-emerald-200">Abono Capital [-]</th>
                    <th className="py-3 px-3.5 text-right font-black">Saldo Capital Deudor</th>
                    <th className="py-3 px-3 text-right">Cupo Disponible</th>
                    <th className="py-3 px-2.5 text-center">% Usado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovimientos.map((m) => {
                    const isCupo = m.tipo === 'CUPO_DISPOSICION';

                    return (
                      <tr 
                        key={`${m.tipo}-${m.correlativo}`}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCupo ? 'bg-white' : 'bg-emerald-50/20'
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-400 font-bold">
                          {m.correlativo}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono text-slate-700 whitespace-nowrap">
                          {m.fecha}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isCupo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Receipt className="w-3 h-3 text-blue-600" />
                              CUPO OTORGADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              PAGO RECIBIDO
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                          {m.recibo_codigo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {m.referencia_bancaria}
                        </td>
                        
                        {/* Débito Cupo */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold bg-blue-50/30 text-blue-700">
                          {m.debito_cupo_ves > 0 ? formatVES(m.debito_cupo_ves) : '-'}
                        </td>

                        {/* Pago Recibido */}
                        <td className="py-2.5 px-3 text-right font-mono font-semibold bg-emerald-50/30 text-emerald-700">
                          {m.pago_total_recibido_ves > 0 ? formatVES(m.pago_total_recibido_ves) : '-'}
                        </td>

                        {/* Intereses Pagados */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 bg-emerald-50/30">
                          {m.intereses_pagados_ves > 0 ? formatVES(m.intereses_pagados_ves) : '-'}
                        </td>

                        {/* Retención ISLR */}
                        <td className="py-2.5 px-2.5 text-right font-mono text-slate-500 bg-emerald-50/30">
                          {m.retencion_islr_ves > 0 ? formatVES(m.retencion_islr_ves) : '-'}
                        </td>

                        {/* Amortización a Capital */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/40">
                          {m.credito_capital_ves > 0 ? formatVES(m.credito_capital_ves) : '-'}
                        </td>

                        {/* Saldo Capital Deudor */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-black text-slate-900 bg-slate-50/50">
                          {formatVES(m.saldo_capital_vivo_ves)}
                        </td>

                        {/* Cupo Disponible */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                          {formatVES(m.cupo_disponible_ves)}
                        </td>

                        {/* % Usado */}
                        <td className="py-2.5 px-2.5 text-center font-mono text-[11px] text-slate-600">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.porcentaje_utilizado > 80 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.porcentaje_utilizado.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Totales Generales */}
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-950">
                    <td colSpan={5} className="py-3 px-3 text-right uppercase tracking-wider text-slate-300">
                      TOTALES GENERALES CONSOLIDADOS (47 MOVIMIENTOS):
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-300 bg-blue-950/70 border-l border-slate-800">
                      {formatVES(TOTAL_CUPOS_DESEMBOLSADOS_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300 bg-emerald-950/70">
                      {formatVES(TOTAL_PAGOS_RECIBIDOS_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300 bg-emerald-950/70">
                      {formatVES(TOTAL_INTERESES_DEVENGADOS_VES)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-emerald-300 bg-emerald-950/70">
                      {formatVES(TOTAL_RETENCION_ISLR_5PCT_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-200 bg-emerald-900/80 font-black">
                      {formatVES(TOTAL_AMORTIZACION_CAPITAL_VES)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-white font-black bg-slate-950">
                      {formatVES(SALDO_CAPITAL_VIVO_FINAL_VES)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-teal-300 bg-teal-950/70">
                      {formatVES(CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES)}
                    </td>
                    <td className="py-3 px-2.5 text-center font-mono text-amber-300 bg-slate-950 font-bold">
                      {PORCENTAJE_UTILIZACION_FINAL.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ASIENTOS DE DIARIO VEN-NIF */}
      {activeTabSubView === 'ASIENTOS' && (
        <div className="space-y-6">
          {/* Regla Fundamental de la Aplicación Banner */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Regla Obligatoria de la Aplicación: Ciclo Completo de Asientos</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.2 rounded-md">
                    Prohibición de Asiento Único de Bs. 600M
                  </span>
                </h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  Por mandato de las normas <strong>VEN-NIF PYME Sección 11</strong> y el <strong>Art. 72 de la LISLR</strong>, la aplicación tiene como regla rectora e invariable que <strong>NUNCA debe hacer solo el asiento global de Bs. 600.000.000,00</strong>. El sistema genera obligatoriamente el desglose de los <strong>29 desembolsos de salida</strong>, las <strong>18 cobranzas de entrada en partida cuádruple</strong> y el <strong>asiento de compensación fiscal del 5% de ISLR</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFiltroAsientos('REGLAS')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Ver Reglas de la App</span>
              </button>
              {onNavigateToAsientos && (
                <button
                  type="button"
                  onClick={onNavigateToAsientos}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Módulo Contable</span>
                </button>
              )}
            </div>
          </div>

          {/* Module Action & Sub-Tabs Header */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFiltroAsientos('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroAsientos === 'TODOS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos los Asientos ({todosLosAsientos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroAsientos('SALIDAS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroAsientos === 'SALIDAS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>29 Salidas (Cupos Bs. 600M)</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroAsientos('ENTRADAS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroAsientos === 'ENTRADAS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>18 Entradas e ISLR 5%</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroAsientos('ISLR')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroAsientos === 'ISLR'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Compensación ISLR (ARC)</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroAsientos('RESUMEN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroAsientos === 'RESUMEN'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Resumen Mayor (4)</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroAsientos('REGLAS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtroAsientos === 'REGLAS'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Reglas de la App</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAllAsientos}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs"
                title="Copiar todos los comprobantes al portapapeles"
              >
                {copiedAllAsientos ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedAllAsientos ? '¡Copiado!' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Descargar libro diario y cruce periódico completo en Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Descargar Diario (Excel)</span>
              </button>
            </div>
          </div>

          {/* Quick Search */}
          {filtroAsientos !== 'RESUMEN' && filtroAsientos !== 'REGLAS' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAsiento}
                  onChange={(e) => setSearchAsiento(e.target.value)}
                  placeholder="Buscar asiento por Comprobante (COMP-CUP-0001, COMP-PAG-0001), Recibo, Ref. Banesco o Cuenta..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
              <div className="text-xs text-slate-500 font-medium px-2 whitespace-nowrap">
                Mostrando <strong>{asientosFiltrados.length}</strong> de <strong>{todosLosAsientos.length}</strong> comprobantes
              </div>
            </div>
          )}

          {/* TAB CONTENT: REGLAS CONTABLES DE LA APLICACIÓN */}
          {filtroAsientos === 'REGLAS' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Reglas Contables y Tributarias Obligatorias de la Aplicación SOCIO-DOC
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Estas directrices normativas están programadas de forma obligatoria en la arquitectura contable del sistema para garantizar el blindaje pleno de la sociedad mercantil ante revisiones y fiscalizaciones del SENIAT.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REGLAS_CONTABLES_OBLIGATORIAS_APP.map(regla => (
                  <div key={regla.id} className={`p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 ${regla.numero === 5 ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        {regla.numero}
                      </span>
                      <span>{regla.titulo}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {regla.descripcionDetallada}
                    </p>
                    <div className="pl-8 text-[11px] font-mono text-amber-800 font-semibold">
                      Base Legal: {regla.baseJuridica}
                    </div>
                    <div className="pl-8 text-[11px] text-slate-500 italic">
                      Implementación en el Sistema: {regla.aplicacionEnApp}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Todas las 5 reglas están activas y gobernando los 49 comprobantes generados en esta aplicación.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFiltroAsientos('TODOS')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Ver Asientos Contables
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: RESUMEN MAYOR (CONSOLIDADO) */}
          {filtroAsientos === 'RESUMEN' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Libro Diario Maestro: 4 Asientos Consolidados del Ejercicio</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    Resumen Ejecutivo
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Representación consolidada de las 4 fases contables: Apertura en Cuentas de Orden, 29 Desembolsos de Salida, 18 Cobros con Retención de ISLR 5% e Intereses, y Compensación Fiscal Anual.
                </p>
              </div>

              {asientosConsolidados.map((as) => (
                <div key={as.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-bold text-xs text-slate-900">{as.titulo}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span>Comprobante: <strong>{as.comprobante}</strong></span>
                      <span>Fecha: <strong>{as.fecha}</strong></span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Código Cuenta</th>
                          <th className="py-2.5 px-4 font-bold">Descripción de la Cuenta</th>
                          <th className="py-2.5 px-4 text-right font-bold">Debe (VES)</th>
                          <th className="py-2.5 px-4 text-right font-bold">Haber (VES)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {as.renglones.map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80">
                            <td className="py-2 px-4 text-slate-500 font-semibold">{r.codigo}</td>
                            <td className="py-2 px-4 font-sans text-slate-900 font-medium">{r.nombre}</td>
                            <td className="py-2 px-4 text-right text-slate-900 font-bold">
                              {r.debito > 0 ? formatVES(r.debito) : '-'}
                            </td>
                            <td className="py-2 px-4 text-right text-slate-900 font-bold">
                              {r.credito > 0 ? formatVES(r.credito) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 bg-slate-50/60 text-[11px] text-slate-600 border-t border-slate-200">
                    <strong>Glosa:</strong> {as.glosa}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: LIST OF JOURNAL ENTRIES (TODOS, SALIDAS, ENTRADAS, ISLR) */}
          {filtroAsientos !== 'RESUMEN' && filtroAsientos !== 'REGLAS' && (
            <div className="space-y-4">
              {asientosFiltrados.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-500">No se encontraron asientos con el criterio ingresado.</p>
                </div>
              ) : (
                asientosFiltrados.map((asiento) => {
                  const isCupo = asiento.tipo === 'salida';
                  const isPago = asiento.tipo === 'entrada';
                  const isApertura = asiento.tipo === 'apertura';
                  const isISLR = asiento.tipo === 'islr';

                  return (
                    <div
                      key={asiento.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
                    >
                      {/* Entry Header */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                              isApertura
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : isCupo
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : isPago
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {asiento.tipoEtiqueta}
                          </span>
                          <span className="font-mono text-xs font-black text-slate-900">
                            {asiento.comprobanteNro}
                          </span>
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {asiento.fecha}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            Soporte: <strong>{asiento.reciboCodigo}</strong> (Ref: {asiento.referenciaBancaria})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySingleAsiento(asiento)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Copiar comprobante contable"
                          >
                            {copiedAsientoId === asiento.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Entry Rows Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/60 text-[11px] text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                            <tr>
                              <th className="py-2 px-4 w-32">Código</th>
                              <th className="py-2 px-4">Descripción de Cuenta Contable</th>
                              <th className="py-2 px-4 text-right w-44">DEBE (Bs.)</th>
                              <th className="py-2 px-4 text-right w-44">HABER (Bs.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {asiento.renglones.map((r: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-slate-50/70">
                                <td className="py-2 px-4 text-slate-500 font-semibold">{r.codigo}</td>
                                <td className="py-2 px-4 font-sans text-slate-900 font-medium">
                                  {r.credito > 0 && <span className="text-slate-400 mr-2 font-mono">a:</span>}
                                  {r.nombre}
                                </td>
                                <td className="py-2 px-4 text-right text-slate-900 font-bold">
                                  {r.debito > 0 ? formatVES(r.debito) : '-'}
                                </td>
                                <td className="py-2 px-4 text-right text-slate-900 font-bold">
                                  {r.credito > 0 ? formatVES(r.credito) : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900 font-mono">
                              <td colSpan={2} className="py-2 px-4 text-right font-sans text-xs uppercase text-slate-500">
                                Sumas Iguales Comprobante:
                              </td>
                              <td className="py-2 px-4 text-right text-blue-800 font-black">
                                {formatVES(asiento.totalDebito)}
                              </td>
                              <td className="py-2 px-4 text-right text-blue-800 font-black">
                                {formatVES(asiento.totalCredito)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Entry Glosa */}
                      <div className="p-3 bg-slate-50/40 text-[11px] text-slate-600 border-t border-slate-100 leading-relaxed">
                        <strong className="text-slate-800">Glosa Contable y Legal:</strong> {asiento.glosa}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: DICTAMEN TRIBUTARIO SENIAT */}
      {activeTabSubView === 'DICTAMEN' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Dictamen Pericial Contable y Fiscal ante el SENIAT
                </h3>
                <p className="text-xs text-slate-500">
                  Conformidad tributaria y mercantil de la Cuenta Corriente Mercantil y Línea de Crédito Rotativa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>1. Cumplimiento de Prelación de Pagos (Art. 529 C.Com)</span>
                </div>
                <p className="text-slate-600">
                  El Artículo 529 del Código de Comercio de Venezuela establece de forma vinculante que todo pago realizado a cuenta de capital e intereses debe imputarse en primer término a la cancelación de los intereses devengados. En el presente expediente, de los <strong>Bs. 186.376.000,00</strong> recibidos en Banesco, se imputaron primero <strong>{formatVES(TOTAL_INTERESES_DEVENGADOS_VES)}</strong> a intereses devengados (a la tasa activa oficial unificada BCV del 16.00% anual en UVC regulada para los 6 principales bancos) y el remanente de <strong>{formatVES(TOTAL_AMORTIZACION_CAPITAL_VES)}</strong> directamente a amortización de capital, extinguiendo legítimamente el pasivo principal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>2. Enervación de Presunción de Dividendo Ficticio (Art. 72 LISLR)</span>
                </div>
                <p className="text-slate-600">
                  La Administración Tributaria (SENIAT) presume como dividendo presunto los retiros a socios que carecen de soporte contractual y de causación de intereses. En este caso se demuestra la plena naturaleza mercantil y financiera: existe Contrato Marco notariado, causación de intereses a la tasa activa legal unificada regulada por el BCV para préstamos comerciales y microcréditos (16.00% anual UVC), retención enterada y 18 amortizaciones bancarias fehacientes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>3. Retención de ISLR Aplicada (Decreto N° 1.808)</span>
                </div>
                <p className="text-slate-600">
                  Conforme al Art. 9, Numeral 1, Literal a) del Reglamento de Retenciones de la LISLR, la empresa practicó la retención del <strong>5% de ISLR</strong> sobre los intereses cobrados a la persona natural residente, totalizando <strong>{formatVES(TOTAL_RETENCION_ISLR_5PCT_VES)}</strong> (5% sobre {formatVES(TOTAL_INTERESES_DEVENGADOS_VES)} de intereses devengados), los cuales constituyen crédito fiscal deducible para el contribuyente y pago a cuenta para el Fisco Nacional.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>4. No Sujeción a IVA (Art. 16 Numeral 3 LIVA)</span>
                </div>
                <p className="text-slate-600">
                  De conformidad con la Ley que establece el Impuesto al Valor Agregado (LIVA), las operaciones de mutuo, financiamiento dinerario y los intereses percibidos por tales conceptos califican expresamente como <strong>servicios no sujetos a IVA</strong>, no debiendo emitirse factura comercial con IVA sino Notas de Débito de Intereses y Recibos Oficiales.
                </p>
              </div>
            </div>

            {/* Certifying Signature Box */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">Certificación Profesional Colegiada</div>
                <div className="text-[11px] text-slate-500">Colegio de Contadores Públicos del Distrito Capital y Estado Miranda (CPC)</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Dictamen Completo en Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
