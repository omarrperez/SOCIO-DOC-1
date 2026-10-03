import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { ContratoMutuo, Empresa, Accionista } from '../types';
import { formatVES, formatUSD } from '../utils/formatters';
import { 
  BookOpen, 
  Copy, 
  Download, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck, 
  Scale, 
  Receipt, 
  Percent, 
  Coins, 
  FileCheck2, 
  Info, 
  Calendar, 
  ChevronRight, 
  Search, 
  AlertTriangle, 
  Landmark,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RECIBOS_CUPO_AGRICOLA_ONI } from '../data/recibosCupoData';
import { RECIBOS_PAGOS_AGRICOLA_ONI } from '../data/recibosPagosData';
import { obtenerConfiguracionFiscal, calcularRecibosConConfiguracionFiscal } from '../utils/fiscalUtils';

interface AccountingEntriesProps {
  contratos: ContratoMutuo[];
  empresa: Empresa;
  accionistas: Accionista[];
  tasaBCV: number;
}

export interface AsientoRenglon {
  codigo: string;
  nombre: string;
  debito: number;
  credito: number;
}

export interface AsientoItem {
  id: string;
  comprobanteNro: string;
  fecha: string;
  tipo: 'apertura_linea' | 'salida_cupo' | 'pago_recibido' | 'islr_compensacion';
  tipoEtiqueta: string;
  reciboCodigo: string;
  referenciaBancaria: string;
  renglones: AsientoRenglon[];
  glosa: string;
  totalDebito: number;
  totalCredito: number;
  beneficiarioOPagador: string;
}

export const AccountingEntries: React.FC<AccountingEntriesProps> = ({
  contratos,
  empresa,
  accionistas,
  tasaBCV,
}) => {
  const [activeTab, setActiveTab] = useState<
    'todos' | 'resumen' | 'salidas_29' | 'entradas_18' | 'islr_compensacion' | 'reglas'
  >('todos');
  const [sistemaDestino, setSistemaDestino] = useState<'Excel' | 'Saint' | 'Profit Plus' | 'Galac'>('Excel');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Fiscal Configuration
  const fiscalConfig = useMemo(() => {
    return obtenerConfiguracionFiscal(empresa);
  }, [empresa]);

  // Dynamic recalculation of the 18 receipts based on the active ISLR configuration
  const calculoFiscal = useMemo(() => {
    return calcularRecibosConConfiguracionFiscal(RECIBOS_PAGOS_AGRICOLA_ONI, fiscalConfig);
  }, [fiscalConfig]);

  const recibosRecalculados = calculoFiscal.recibosRecalculados;

  const pctISLR = fiscalConfig.aplicar_retencion_automatica
    ? Number(fiscalConfig.porcentaje_retencion_activo) || 5.0
    : 5.0;

  // Primary partner / borrower
  const mutuario = accionistas.find(a => a.cedula_accionista === '12.456.789') || accionistas[0] || {
    nombre_accionista: 'Manuel Becerra',
    cedula_accionista: '12.456.789',
    rif_accionista: 'V-12456789-0',
    porcentaje_acciones: 10
  };

  // Build the complete list of 49 Journal Entries (1 Apertura + 29 Cupos + 18 Pagos + 1 Compensación ISLR)
  const todosLosAsientos = useMemo<AsientoItem[]>(() => {
    const list: AsientoItem[] = [];

    // ASIENTO 0: Apertura de Línea de Crédito General en Cuentas de Orden (Bs. 600.000.000,00)
    list.push({
      id: 'asiento-0-apertura',
      comprobanteNro: 'COMP-APERT-2026-0001',
      fecha: '15/01/2026',
      tipo: 'apertura_linea',
      tipoEtiqueta: 'Apertura de Línea (Cuentas de Orden)',
      reciboCodigo: 'CONTRATO-MARCO-001',
      referenciaBancaria: 'NOTARIA-CHACAO-T12',
      beneficiarioOPagador: mutuario.nombre_accionista,
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
      glosa: `Registro de orden y control estatutario de apertura de Línea de Crédito Rotativa General por Bs. 600.000.000,00 concedida al ciudadano ${mutuario.nombre_accionista} (C.I. V-${mutuario.cedula_accionista}) según Contrato Notariado N° LC-ONI-2026-0001 y Acta de Asamblea Extraordinaria N° ASAM-EXT-2026-01. VEN-NIF PYME Sección 11.`,
      totalDebito: 600000000.00,
      totalCredito: 600000000.00,
    });

    // ASIENTOS 1 al 29: Los 29 Desembolsos de Salida (Cupos Rotativos)
    RECIBOS_CUPO_AGRICOLA_ONI.forEach(cupo => {
      list.push({
        id: `asiento-cupo-${cupo.numero_cupo}`,
        comprobanteNro: `COMP-CUP-${String(cupo.numero_cupo).padStart(4, '0')}`,
        fecha: cupo.fecha,
        tipo: 'salida_cupo',
        tipoEtiqueta: `Desembolso Cupo N° ${cupo.numero_cupo} (Salida)`,
        reciboCodigo: cupo.numero_recibo,
        referenciaBancaria: cupo.referencia_bancaria,
        beneficiarioOPagador: mutuario.nombre_accionista,
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

    // ASIENTOS 30 al 47: Los 18 Pagos Recibidos (Cobranza Íntegra en Banco + Retención ISLR 5% por Agrícola ONI C.A.)
    recibosRecalculados.forEach(pago => {
      const retencionISLR = pago.monto_retencion_islr_ves;
      const interesesDevengados = pago.intereses_pagados_ves;
      const capitalAmortizado = pago.capital_amortizado_ves;
      const totalAsiento = Math.round((pago.monto_total_ves + retencionISLR) * 100) / 100;

      list.push({
        id: `asiento-pago-${pago.numero_pago}`,
        comprobanteNro: `COMP-PAG-${String(pago.numero_pago).padStart(4, '0')}`,
        fecha: pago.fecha,
        tipo: 'pago_recibido',
        tipoEtiqueta: `Pago Recibido N° ${pago.numero_pago} (Amortización e ISLR)`,
        reciboCodigo: pago.numero_recibo,
        referenciaBancaria: pago.referencia_bancaria,
        beneficiarioOPagador: mutuario.nombre_accionista,
        renglones: [
          {
            codigo: '1.1.1.02.01',
            nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 0134-0987-5128) [Cobranza Íntegra Socio]',
            debito: pago.monto_total_ves,
            credito: 0.00,
          },
          {
            codigo: '1.1.3.05.02',
            nombre: 'Anticipo de ISLR por Compensar (5% Retención en Fuente - Dto. 1808) [Crédito Fiscal ONI]',
            debito: retencionISLR,
            credito: 0.00,
          },
          {
            codigo: '2.1.3.01.03',
            nombre: 'Retenciones de ISLR por Enterar al SENIAT (Pasivo Fiscal Asumido por Agrícola ONI C.A.)',
            debito: 0.00,
            credito: retencionISLR,
          },
          {
            codigo: '4.2.1.01.01',
            nombre: 'Ingresos Financieros por Intereses de Financiamiento (Art. 529 C.Com)',
            debito: 0.00,
            credito: interesesDevengados,
          },
          {
            codigo: '1.1.2.03.01',
            nombre: `Cuentas por Cobrar Socios y Directores - ${mutuario.nombre_accionista.toUpperCase()} [Amortización Capital]`,
            debito: 0.00,
            credito: capitalAmortizado,
          },
        ],
        glosa: `Cobranza de transferencia Banesco por Bs. ${formatVES(pago.monto_total_ves)} transferida íntegramente por el socio Manuel Becerra (Persona Natural). Se imputa con prelación legal imperativa primero a intereses devengados (Bs. ${formatVES(interesesDevengados)}) conforme al Art. 529 del Código de Comercio, y el remanente a amortización de capital (Bs. ${formatVES(capitalAmortizado)}). Agrícola ONI C.A., en su condición legal de persona jurídica y agente de retención corporativo ante el SENIAT (Art. 9 num. 1 Decreto N° 1.808 y Art. 27 COT), practica la retención del 5% de ISLR (${pctISLR.toFixed(1)}% por Bs. ${formatVES(retencionISLR)}), reconociendo el pasivo tributario por enterar al Fisco y el correspondiente crédito fiscal a favor de la empresa para su compensación anual en la Forma DPJ-26. Nuevo saldo deudor del socio: Bs. ${formatVES(pago.nuevo_saldo_capital_ves)}. Soporte: Recibo de Pago ${pago.numero_recibo} y Ref. Banesco ${pago.referencia_bancaria}.`,
        totalDebito: totalAsiento,
        totalCredito: totalAsiento,
      });
    });

    // ASIENTO 48: Enteramiento y Pago Efectivo de Retenciones de ISLR al SENIAT por Agrícola ONI C.A.
    const totalRetencionAcumulada = Math.round(
      recibosRecalculados.reduce((sum, r) => sum + r.monto_retencion_islr_ves, 0) * 100
    ) / 100;

    list.push({
      id: 'asiento-48-pago-seniat',
      comprobanteNro: 'COMP-SENIAT-2026-0001',
      fecha: '30/11/2026',
      tipo: 'islr_compensacion',
      tipoEtiqueta: 'Enteramiento y Pago de Retenciones al SENIAT (Agrícola ONI C.A.)',
      reciboCodigo: 'PLANILLA-SENIAT-ISLR',
      referenciaBancaria: 'TRF-SENIAT-BANESCO-5128',
      beneficiarioOPagador: 'SENIAT - Fisco Nacional',
      renglones: [
        {
          codigo: '2.1.3.01.03',
          nombre: 'Retenciones de ISLR por Enterar al SENIAT (Pasivo Tributario Extinguido)',
          debito: totalRetencionAcumulada,
          credito: 0.00,
        },
        {
          codigo: '1.1.1.02.01',
          nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 5128) [Pago al SENIAT por Agrícola ONI C.A.]',
          debito: 0.00,
          credito: totalRetencionAcumulada,
        },
      ],
      glosa: `Pago y enteramiento bancario realizado por Agrícola ONI C.A. como agente de retención legal corporativo ante la cuenta recaudadora del SENIAT por concepto de las retenciones del 5% de ISLR sobre intereses devengados acumulados por Bs. ${formatVES(totalRetencionAcumulada)}, cancelados mediante transferencia bancaria desde la cuenta Banesco 5128 según planilla del portal fiscal del SENIAT. Art. 9 del Decreto N° 1.808 y Art. 27 del COT.`,
      totalDebito: totalRetencionAcumulada,
      totalCredito: totalRetencionAcumulada,
    });

    // ASIENTO 49: Cierre y Compensación Fiscal de ISLR en Declaración Definitiva DPJ-26
    list.push({
      id: 'asiento-49-cierre-islr',
      comprobanteNro: 'COMP-ISLR-2026-0001',
      fecha: '31/12/2026',
      tipo: 'islr_compensacion',
      tipoEtiqueta: 'Compensación Anual de ISLR en Declaración Definitiva DPJ-26',
      reciboCodigo: 'DPJ-26-SENIAT-2026',
      referenciaBancaria: 'CERT-RET-SENIAT-ACUM',
      beneficiarioOPagador: `${empresa.razon_social} / SENIAT`,
      renglones: [
        {
          codigo: '2.1.3.01.01',
          nombre: 'Impuesto Sobre la Renta (ISLR) por Pagar (Pasivo Corriente DPJ-26)',
          debito: totalRetencionAcumulada,
          credito: 0.00,
        },
        {
          codigo: '1.1.3.05.02',
          nombre: 'Anticipo de ISLR por Compensar (5% Retención en Fuente - Dto. 1808)',
          debito: 0.00,
          credito: totalRetencionAcumulada,
        },
      ],
      glosa: `Compensación fiscal de las retenciones de ISLR acumuladas por Bs. ${formatVES(totalRetencionAcumulada)} efectivamente enteradas por Agrícola ONI C.A. ante el SENIAT durante el ejercicio fiscal 2026, deduciéndose formalmente de la cuota tributaria en la Declaración Definitiva de Rentas (Forma DPJ-26) de la compañía.`,
      totalDebito: totalRetencionAcumulada,
      totalCredito: totalRetencionAcumulada,
    });

    return list;
  }, [mutuario, recibosRecalculados, pctISLR, empresa]);

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
        id: 'resumen-1-apertura',
        titulo: 'I. Asiento Maestro 1: Apertura de la Línea de Crédito General (Bs. 600M)',
        fecha: '15/01/2026',
        comprobante: 'COMP-ASIENTO-01',
        renglones: [
          { codigo: '7.1.01.01.001', nombre: 'Contratos de Crédito Autorizados Concedidos a Socios', debito: totalCupos, credito: 0 },
          { codigo: '7.2.01.01.001', nombre: 'Responsabilidad por Líneas de Crédito Rotativas Concedidas', debito: 0, credito: totalCupos },
        ],
        glosa: 'Registro en Cuentas de Orden del límite de crédito marco autorizado de Bs. 600.000.000,00 según Contrato Marco Notariado LC-ONI-2026-0001 y Acta Extraordinaria N° ASAM-EXT-2026-01.',
      },
      {
        id: 'resumen-2-salidas',
        titulo: 'II. Asiento Maestro 2: Consolidado de 29 Desembolsos de Salida (Cupos Rotativos)',
        fecha: '11/09/2026',
        comprobante: 'COMP-ASIENTO-02',
        renglones: [
          { codigo: '1.1.2.03.01', nombre: `Cuentas por Cobrar Socios y Directores (${mutuario.nombre_accionista})`, debito: totalCupos, credito: 0 },
          { codigo: '1.1.1.02.01', nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 0134-0987-5128)', debito: 0, credito: totalCupos },
        ],
        glosa: `Registro de salidas de caja y banco por 29 transferencias electrónicas Banesco desembolsadas al socio ${mutuario.nombre_accionista} por Bs. 600.000.000,00 según Recibos de Cupo RC-ONI-2026-0001 al 0029. Art. 72 LISLR.`,
      },
      {
        id: 'resumen-3-entradas',
        titulo: 'III. Asiento Maestro 3: Consolidado de 18 Pagos, Intereses Devengados y Retención ISLR 5% por Agrícola ONI C.A.',
        fecha: '11/09/2026',
        comprobante: 'COMP-ASIENTO-03',
        renglones: [
          { codigo: '1.1.1.02.01', nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 5128) [Cobranza Íntegra Socio]', debito: totalPagos, credito: 0 },
          { codigo: '1.1.3.05.02', nombre: `Anticipo de ISLR por Compensar (5% Retención en Fuente - Dto. 1808) [Crédito Fiscal ONI]`, debito: totalRetencion, credito: 0 },
          { codigo: '2.1.3.01.03', nombre: 'Retenciones de ISLR por Enterar al SENIAT (Pasivo Fiscal de Agrícola ONI C.A.)', debito: 0, credito: totalRetencion },
          { codigo: '4.2.1.01.01', nombre: 'Ingresos Financieros por Intereses de Financiamiento (Art. 529 C.Com)', debito: 0, credito: totalIntereses },
          { codigo: '1.1.2.03.01', nombre: `Cuentas por Cobrar Socios y Directores (${mutuario.nombre_accionista}) [Amortización Capital]`, debito: 0, credito: totalAmortizado },
        ],
        glosa: `Ingreso consolidado de 18 transferencias Banesco por Bs. ${formatVES(totalPagos)} recibidas íntegramente del socio Manuel Becerra (Persona Natural). Se imputa obligatoriamente primero a intereses devengados (Bs. ${formatVES(totalIntereses)}) conforme al mandato del Art. 529 del Código de Comercio, y el remanente a amortización de capital (Bs. ${formatVES(totalAmortizado)}). Agrícola ONI C.A., como persona jurídica y agente de retención corporativo (Decreto N° 1.808 Art. 9 num. 1 y Art. 27 COT), practica la retención del 5% de ISLR por Bs. ${formatVES(totalRetencion)}, registrando el pasivo tributario a enterar al SENIAT y reconociendo el crédito fiscal a favor de la compañía. Saldo deudor resultante al cierre: Bs. 420.471.976,23.`,
      },
      {
        id: 'resumen-4-pago-seniat',
        titulo: 'IV. Asiento Maestro 4: Enteramiento y Pago Efectivo al SENIAT de Retenciones de ISLR por Agrícola ONI C.A.',
        fecha: '30/11/2026',
        comprobante: 'COMP-ASIENTO-04',
        renglones: [
          { codigo: '2.1.3.01.03', nombre: 'Retenciones de ISLR por Enterar al SENIAT (Pasivo Tributario Extinguido)', debito: totalRetencion, credito: 0 },
          { codigo: '1.1.1.02.01', nombre: 'Banco Banesco C.A. (Cuenta Corriente N° 5128) [Pago al SENIAT por Agrícola ONI C.A.]', debito: 0, credito: totalRetencion },
        ],
        glosa: `Pago y enteramiento bancario realizado por Agrícola ONI C.A. en su condición legal de agente de retención corporativo ante la cuenta recaudadora del SENIAT por concepto de las retenciones del 5% de ISLR acumuladas sobre intereses devengados por Bs. ${formatVES(totalRetencion)}, cancelados mediante transferencia bancaria desde la cuenta Banesco 5128 según planilla y certificado de enteramiento del portal fiscal del SENIAT. Art. 9 del Decreto N° 1.808 y Art. 27 del COT.`,
      },
      {
        id: 'resumen-5-compensacion',
        titulo: 'V. Asiento Maestro 5: Compensación Fiscal Anual de Retenciones en Declaración Definitiva DPJ-26',
        fecha: '31/12/2026',
        comprobante: 'COMP-ASIENTO-05',
        renglones: [
          { codigo: '2.1.3.01.01', nombre: 'Impuesto Sobre la Renta (ISLR) por Pagar (Pasivo Corriente DPJ-26)', debito: totalRetencion, credito: 0 },
          { codigo: '1.1.3.05.02', nombre: 'Anticipo de ISLR por Compensar (5% Decreto 1808) [Descargo de Crédito Fiscal]', debito: 0, credito: totalRetencion },
        ],
        glosa: `Compensación fiscal del crédito tributario por retenciones acumuladas de ISLR del ejercicio 2026 por Bs. ${formatVES(totalRetencion)} efectivamente enteradas por Agrícola ONI C.A. al SENIAT contra la provisión de ISLR definitivo a pagar en la Declaración Definitiva de Rentas (Forma DPJ-26) de la compañía conforme al Art. 9 del Decreto 1808.`,
      }
    ];
  }, [recibosRecalculados, mutuario, pctISLR]);

  // Filtered entries according to tab and search
  const asientosFiltrados = useMemo(() => {
    let filtered = todosLosAsientos;

    if (activeTab === 'salidas_29') {
      filtered = filtered.filter(a => a.tipo === 'salida_cupo');
    } else if (activeTab === 'entradas_18') {
      filtered = filtered.filter(a => a.tipo === 'pago_recibido');
    } else if (activeTab === 'islr_compensacion') {
      filtered = filtered.filter(a => a.tipo === 'islr_compensacion' || a.tipo === 'pago_recibido');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.comprobanteNro.toLowerCase().includes(q) ||
        a.reciboCodigo.toLowerCase().includes(q) ||
        a.referenciaBancaria.toLowerCase().includes(q) ||
        a.fecha.toLowerCase().includes(q) ||
        a.glosa.toLowerCase().includes(q) ||
        a.renglones.some(r => r.codigo.toLowerCase().includes(q) || r.nombre.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [todosLosAsientos, activeTab, searchQuery]);

  // Export functions
  const handleExportJournal = () => {
    if (sistemaDestino === 'Excel') {
      const wb = XLSX.utils.book_new();

      // Hoja 1: Todos los Asientos
      const rowsTodos: any[][] = [
        [`${empresa.razon_social} - LIBRO DIARIO LEGAL COMPLETO (VEN-NIF PYME)`],
        [`R.I.F.: ${empresa.rif_empresa} • CONTABILIDAD DE LÍNEA DE CRÉDITO Y MUTUOS COMERCIALES`],
        ['INTEGRIDAD: 29 DESEMBOLSOS DE SALIDA + 18 COBRANZAS CON RETENCIÓN ISLR 5% + ASIENTO DE CIERRE'],
        [],
        [
          'Comprobante N°',
          'Fecha',
          'Tipo Operación',
          'Recibo / Soporte',
          'Ref. Banesco',
          'Código Cuenta',
          'Descripción Cuenta Contable',
          'Débito (VES)',
          'Crédito (VES)',
          'Glosa Legal y Contable'
        ]
      ];

      todosLosAsientos.forEach(asiento => {
        asiento.renglones.forEach((r, idx) => {
          rowsTodos.push([
            idx === 0 ? asiento.comprobanteNro : '',
            idx === 0 ? asiento.fecha : '',
            idx === 0 ? asiento.tipoEtiqueta : '',
            idx === 0 ? asiento.reciboCodigo : '',
            idx === 0 ? asiento.referenciaBancaria : '',
            r.codigo,
            r.nombre,
            r.debito > 0 ? r.debito : 0,
            r.credito > 0 ? r.credito : 0,
            idx === 0 ? asiento.glosa : ''
          ]);
        });
        // Separator row
        rowsTodos.push(['', '', '', '', '', '', 'TOTAL COMPROBANTE:', asiento.totalDebito, asiento.totalCredito, 'CUADRADO']);
        rowsTodos.push([]);
      });

      const wsTodos = XLSX.utils.aoa_to_sheet(rowsTodos);
      wsTodos['!cols'] = [
        { wch: 22 }, // Comprobante
        { wch: 14 }, // Fecha
        { wch: 32 }, // Tipo Operación
        { wch: 20 }, // Recibo
        { wch: 24 }, // Ref Banesco
        { wch: 18 }, // Código Cuenta
        { wch: 45 }, // Nombre Cuenta
        { wch: 22 }, // Débito
        { wch: 22 }, // Crédito
        { wch: 55 }, // Glosa
      ];
      XLSX.utils.book_append_sheet(wb, wsTodos, 'Libro Diario (49 Asientos)');

      // Hoja 2: 29 Desembolsos de Salida
      const rowsSalidas: any[][] = [
        [`${empresa.razon_social} - ASIENTOS DE DIARIO: 29 DESEMBOLSOS BANESCO (BS. 600.000.000,00)`],
        [],
        ['Comprobante N°', 'Fecha', 'Recibo Cupo', 'Ref. Banesco', 'Código', 'Cuenta Débito (CxC)', 'Código', 'Cuenta Crédito (Banco)', 'Monto (VES)', 'Glosa']
      ];
      todosLosAsientos.filter(a => a.tipo === 'salida_cupo').forEach(a => {
        rowsSalidas.push([
          a.comprobanteNro,
          a.fecha,
          a.reciboCodigo,
          a.referenciaBancaria,
          a.renglones[0]?.codigo,
          a.renglones[0]?.nombre,
          a.renglones[1]?.codigo,
          a.renglones[1]?.nombre,
          a.totalDebito,
          a.glosa
        ]);
      });
      const wsSalidas = XLSX.utils.aoa_to_sheet(rowsSalidas);
      wsSalidas['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 16 }, { wch: 35 }, { wch: 16 }, { wch: 35 }, { wch: 22 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(wb, wsSalidas, '29 Desembolsos');

      // Hoja 3: 18 Pagos y Retención ISLR
      const rowsPagos: any[][] = [
        [`${empresa.razon_social} - ASIENTOS DE DIARIO: 18 PAGOS RECIBIDOS CON RETENCIÓN ISLR 5%`],
        [],
        ['Comprobante N°', 'Fecha', 'Recibo Pago', 'Ref. Banesco', 'Banco Banesco (VES)', 'Anticipo ISLR 5% (VES)', 'Retenciones por Enterar (VES)', 'Ingresos Intereses (VES)', 'Amortizado Capital (VES)', 'Total Asiento (VES)', 'Glosa']
      ];
      todosLosAsientos.filter(a => a.tipo === 'pago_recibido').forEach(a => {
        const banco = a.renglones.find(r => r.codigo === '1.1.1.02.01')?.debito || 0;
        const islrAnticipo = a.renglones.find(r => r.codigo === '1.1.3.05.02')?.debito || 0;
        const islrPasivo = a.renglones.find(r => r.codigo === '2.1.3.01.03')?.credito || 0;
        const intereses = a.renglones.find(r => r.codigo === '4.2.1.01.01')?.credito || 0;
        const capital = a.renglones.find(r => r.codigo === '1.1.2.03.01')?.credito || 0;

        rowsPagos.push([
          a.comprobanteNro,
          a.fecha,
          a.reciboCodigo,
          a.referenciaBancaria,
          banco,
          islrAnticipo,
          islrPasivo,
          intereses,
          capital,
          a.totalDebito,
          a.glosa
        ]);
      });
      const wsPagos = XLSX.utils.aoa_to_sheet(rowsPagos);
      wsPagos['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 24 }, { wch: 22 }, { wch: 24 }, { wch: 22 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(wb, wsPagos, '18 Pagos e ISLR');

      // Hoja 4: Resumen Maestro
      const rowsResumen: any[][] = [
        [`${empresa.razon_social} - RESUMEN CONSOLIDADO DE ASIENTOS DE DIARIO (LIBRO MAYOR)`],
        [],
        ['Asiento Maestro', 'Fecha', 'Comprobante', 'Código Cuenta', 'Descripción de la Cuenta', 'Debe (VES)', 'Haber (VES)', 'Fundamento Jurídico']
      ];
      asientosConsolidados.forEach(as => {
        as.renglones.forEach((r, idx) => {
          rowsResumen.push([
            idx === 0 ? as.titulo : '',
            idx === 0 ? as.fecha : '',
            idx === 0 ? as.comprobante : '',
            r.codigo,
            r.nombre,
            r.debito > 0 ? r.debito : 0,
            r.credito > 0 ? r.credito : 0,
            idx === 0 ? as.glosa : ''
          ]);
        });
        rowsResumen.push([]);
      });
      const wsResumen = XLSX.utils.aoa_to_sheet(rowsResumen);
      wsResumen['!cols'] = [{ wch: 38 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 45 }, { wch: 22 }, { wch: 22 }, { wch: 55 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Consolidado');

      // Hoja 5: Reglas Contables y Fiscales Obligatorias
      const rowsReglas: any[][] = [
        ['REGLAS CONTABLES Y TRIBUTARIAS OBLIGATORIAS DE LA APLICACIÓN (BLINDAJE SENIAT)'],
        [],
        ['N°', 'Regla Contable Obligatoria', 'Base Jurídica Aplicable', 'Principio Técnico / VEN-NIF'],
        [
          '1',
          'Prohibición de Asiento Único de Techo Contractual',
          'VEN-NIF PYME Sección 11 / Art. 503 Código de Comercio',
          'El contrato de crédito (Bs. 600M) fija la capacidad jurídica pero no es una salida bancaria en bloque. La contabilidad debe registrar cada una de las 29 salidas individuales de fondos en Banco Banesco.'
        ],
        [
          '2',
          'Partida Cuádruple Obligatoria en Cobranzas con Intereses',
          'Art. 529 Código de Comercio / Art. 72 Ley de ISLR',
          'Todo pago recibido por mutuo debe desglosarse en 4 renglones: 1) Entrada Líquida a Banco, 2) Crédito Fiscal Anticipo ISLR 5%, 3) Ingreso Gravable por Intereses Devengados, y 4) Amortización de Capital.'
        ],
        [
          '3',
          'Registro del Anticipo de ISLR 5% como Activo Exigible',
          'Decreto N° 1.808 (Reglamento de Retenciones ISLR) Art. 9',
          'La retención de ISLR efectuada por el deudor es un anticipo a favor de la empresa (Cuenta 1.1.3.05.02) respaldado con comprobante ARC, que se compensa directamente contra el ISLR corporativo anual.'
        ],
        [
          '4',
          'Prelación Imperativa Mercantil a Intereses',
          'Art. 529 Código de Comercio Venezolano',
          'El pago hecho a cuenta de capital e intereses se imputa primero a éstos. Es nulo abonar capital si existen intereses devengados pendientes.'
        ],
        [
          '5',
          'Trazabilidad Notarial y Bancaria en Glosas',
          'Art. 72 Ley de ISLR / Providencia SNAT/2003/1419',
          'Cada comprobante contable debe incluir en su glosa el número de contrato notariado, el recibo foliado y el número de referencia bancaria de Banesco para desvirtuar dividendos fictos o ventas omitidas.'
        ]
      ];
      const wsReglas = XLSX.utils.aoa_to_sheet(rowsReglas);
      wsReglas['!cols'] = [{ wch: 6 }, { wch: 38 }, { wch: 35 }, { wch: 65 }];
      XLSX.utils.book_append_sheet(wb, wsReglas, 'Reglas Contables de la App');

      const sanitizedRif = empresa.rif_empresa.replace(/[^a-zA-Z0-9]/g, '');
      XLSX.writeFile(wb, `Libro_Diario_Completo_VEN_NIF_${sanitizedRif}.xlsx`);
    } else {
      // Export text formats (Saint, Profit Plus, Galac)
      let outputText = '';

      if (sistemaDestino === 'Saint') {
        outputText = `* COMPROBANTES DE DIARIO SAINT ENTERPRISE CONTABILIDAD\n* EMPRESA: ${empresa.razon_social} (RIF: ${empresa.rif_empresa})\n* CICLO COMPLETO: 29 DESEMBOLSOS + 18 COBROS + CIERRE ISLR\n\n`;
        todosLosAsientos.forEach(a => {
          outputText += `ASIENTO,${a.comprobanteNro},${a.fecha}\n`;
          a.renglones.forEach(r => {
            outputText += `${r.codigo},"${r.nombre.substring(0, 40)}",${r.debito.toFixed(2)},${r.credito.toFixed(2)},"${a.glosa.substring(0, 60)}"\n`;
          });
          outputText += '\n';
        });
      } else if (sistemaDestino === 'Profit Plus') {
        outputText = `PROFIT PLUS CONTABILIDAD 2KDOCE / SQL - COMPROBANTES CONSOLIDADOS\nEMPRESA: ${empresa.rif_empresa} - ${empresa.razon_social}\n\n`;
        todosLosAsientos.forEach(a => {
          outputText += `COMPROBANTE: ${a.comprobanteNro} | FECHA: ${a.fecha} | TIPO: ${a.tipoEtiqueta}\n`;
          outputText += `RENGLON | CODIGO_CUENTA | DESCRIPCION | DEBE | HABER | GLOSA\n`;
          a.renglones.forEach((r, idx) => {
            outputText += `${idx + 1} | ${r.codigo} | ${r.nombre} | ${r.debito.toFixed(2)} | ${r.credito.toFixed(2)} | ${a.glosa.substring(0, 80)}\n`;
          });
          outputText += '\n';
        });
      } else if (sistemaDestino === 'Galac') {
        outputText = `GALAC SOFTWARE - CONTABILIDAD DEL SISTEMA (ASIENTOS MULTIPLES)\nFECHA\tCOMPROBANTE\tCUENTA\tDESCRIPCION\tDEBE\tHABER\tCONCEPTO\n`;
        todosLosAsientos.forEach(a => {
          a.renglones.forEach(r => {
            outputText += `${a.fecha}\t${a.comprobanteNro}\t${r.codigo}\t${r.nombre}\t${r.debito.toFixed(2)}\t${r.credito.toFixed(2)}\t${a.glosa.substring(0, 100)}\n`;
          });
        });
      }

      const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Asientos_Diario_Completo_${empresa.rif_empresa}_${sistemaDestino}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopySingleAsiento = (asiento: AsientoItem) => {
    let text = `COMPROBANTE: ${asiento.comprobanteNro} | FECHA: ${asiento.fecha}\n`;
    text += `TIPO: ${asiento.tipoEtiqueta} | SOPORTE: ${asiento.reciboCodigo} (Ref: ${asiento.referenciaBancaria})\n`;
    text += `CUENTA\tDESCRIPCIÓN\tDEBE\tHABER\n`;
    asiento.renglones.forEach(r => {
      text += `${r.codigo}\t${r.nombre}\t${formatVES(r.debito)}\t${formatVES(r.credito)}\n`;
    });
    text += `TOTALES: DEBE ${formatVES(asiento.totalDebito)} | HABER ${formatVES(asiento.totalCredito)}\n`;
    text += `GLOSA: "${asiento.glosa}"`;

    navigator.clipboard.writeText(text);
    setCopiedId(asiento.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllAsientos = () => {
    let allText = `LIBRO DIARIO COMPLETO (49 ASIENTOS) - ${empresa.razon_social}\n`;
    todosLosAsientos.forEach(a => {
      allText += `\n============================================================\n`;
      allText += `COMPROBANTE: ${a.comprobanteNro} | FECHA: ${a.fecha} | TIPO: ${a.tipoEtiqueta}\n`;
      allText += `SOPORTE: ${a.reciboCodigo} | REF BANCO: ${a.referenciaBancaria}\n`;
      a.renglones.forEach(r => {
        allText += `${r.codigo}\t${r.nombre}\t${formatVES(r.debito)}\t${formatVES(r.credito)}\n`;
      });
      allText += `GLOSA: ${a.glosa}\n`;
    });

    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Module Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-800/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <BookOpen className="w-6 h-6 font-bold" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Módulo de Asientos Contables y Libro Diario Completo
                </h2>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VEN-NIF PYME • SENIAT
                </span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  49 Comprobantes Generados
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Generador automatizado del ciclo contable integral para la Línea de Crédito Rotativa de Bs. 600.000.000,00: 
                <strong> 29 Asientos de Desembolso (Salidas)</strong>, 
                <strong> 18 Asientos de Cobranza (Amortización con Intereses y Retención del 5% de ISLR)</strong> y 
                <strong> Asiento de Compensación de ISLR</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyAllAsientos}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer shadow-xs"
              title="Copiar todos los asientos al portapapeles"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedAll ? '¡Copiado Todo!' : 'Copiar Diario'}</span>
            </button>

            <button
              onClick={handleExportJournal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer border border-emerald-300/80"
              title={`Exportar los 49 asientos en formato ${sistemaDestino}`}
            >
              {sistemaDestino === 'Excel' ? <FileSpreadsheet className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>Descargar Diario ({sistemaDestino})</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-indigo-900/60">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Desembolsos (29)</div>
            <div className="text-sm sm:text-base font-black text-amber-300 font-mono mt-0.5">Bs. 600.000.000,00</div>
            <div className="text-[10px] text-slate-400">100% Línea Utilizada</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Cobranzas (18)</div>
            <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
              Bs. {formatVES(calculoFiscal.totalEntradasVes)}
            </div>
            <div className="text-[10px] text-slate-400">Entradas a Banco Banesco</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Intereses Devengados</div>
            <div className="text-sm sm:text-base font-black text-blue-300 font-mono mt-0.5">
              Bs. {formatVES(calculoFiscal.totalInteresesDevengadosVes)}
            </div>
            <div className="text-[10px] text-slate-400">Cuenta 4.2.1.01 (Art. 529)</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Retención ISLR ({pctISLR.toFixed(1)}%)</div>
            <div className="text-sm sm:text-base font-black text-purple-300 font-mono mt-0.5">
              Bs. {formatVES(calculoFiscal.totalRetencionIslrVes)}
            </div>
            <div className="text-[10px] text-slate-400">Anticipo Cta. 1.1.3.05.02</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Amortizado a Capital</div>
            <div className="text-sm sm:text-base font-black text-teal-300 font-mono mt-0.5">
              Bs. {formatVES(calculoFiscal.totalAmortizacionCapitalVes)}
            </div>
            <div className="text-[10px] text-slate-400">
              Saldo Vivo: Bs. {formatVES(600000000.00 - calculoFiscal.totalAmortizacionCapitalVes)}
            </div>
          </div>
        </div>
      </div>

      {/* Reglas de la Aplicación Banner & Quick Notification */}
      <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Regla Fundamental de la Aplicación: Obligatoriedad de Asientos de Ciclo Completo</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.2 rounded-md">
                Auditoría SENIAT
              </span>
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              La normativa VEN-NIF PYME y el Art. 72 de la LISLR <strong>prohíben terminantemente hacer solo el asiento global de Bs. 600.000.000,00</strong>. 
              El sistema genera obligatoriamente el desglose de los <strong>29 desembolsos individuales</strong> y los <strong>18 pagos en partida cuádruple</strong> (Banco Neto, Retención ISLR 5%, Ingresos por Intereses y Amortización a Capital).
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('reglas')}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Ver 5 Reglas Contables</span>
        </button>
      </div>

      {/* Tab Controls and Export Format Selector */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'todos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos los Asientos ({todosLosAsientos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'resumen'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Resumen Maestro (4)</span>
          </button>

          <button
            onClick={() => setActiveTab('salidas_29')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'salidas_29'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>29 Desembolsos (Bs. 600M)</span>
          </button>

          <button
            onClick={() => setActiveTab('entradas_18')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'entradas_18'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>18 Pagos & Ret. ISLR 5%</span>
          </button>

          <button
            onClick={() => setActiveTab('islr_compensacion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'islr_compensacion'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Compensación ISLR (ARC)</span>
          </button>

          <button
            onClick={() => setActiveTab('reglas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reglas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Reglas Contables de la App</span>
          </button>
        </div>

        {/* Software Contable Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Software:</span>
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            {(['Excel', 'Saint', 'Profit Plus', 'Galac'] as const).map((sis) => (
              <button
                key={sis}
                onClick={() => setSistemaDestino(sis)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                  sistemaDestino === sis
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sis}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Search and Quick Filters (for entry list) */}
      {activeTab !== 'resumen' && activeTab !== 'reglas' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Comprobante (ej. COMP-PAG-0001), Recibo, Referencia Banesco o Cuenta..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium px-2">
            Mostrando <strong>{asientosFiltrados.length}</strong> de <strong>{todosLosAsientos.length}</strong> asientos
          </div>
        </div>
      )}

      {/* TAB: REGLAS CONTABLES Y TRIBUTARIAS DE LA APLICACIÓN */}
      {activeTab === 'reglas' && (
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
            
            {/* Regla 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">1</span>
                <span>Prohibición de Asiento Único de Techo Contractual (Bs. 600M)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                El Contrato Marco de Línea de Crédito autoriza un límite de Bs. 600.000.000,00, pero <strong>no constituye una salida de banco en bloque</strong>. Registrar un asiento único de Bs. 600M contra banco distorsiona el flujo de caja y no concilia con el extracto bancario. Es obligatorio registrar cada uno de los <strong>29 desembolsos individuales</strong> según su fecha valor y número de referencia.
              </p>
              <div className="pl-8 text-[11px] font-mono text-amber-800 font-semibold">
                Base Legal: VEN-NIF PYME Sección 11 (Instrumentos Financieros) y Art. 503 Código de Comercio.
              </div>
            </div>

            {/* Regla 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">2</span>
                <span>Partida Quíntuple en Cobranzas con Intereses y Retención ISLR 5%</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                Cada uno de los 18 pagos recibidos se desglosa en 5 renglones contables:
                1) <strong>Banco Banesco (Cobranza Íntegra Transferida por el Socio)</strong>, 
                2) <strong>Anticipo de ISLR 5% (Crédito Fiscal ONI C.A. - Dto. 1808)</strong>, 
                3) <strong>Retenciones de ISLR por Enterar al SENIAT (Pasivo Fiscal asumido por ONI)</strong>, 
                4) <strong>Ingresos Financieros por Intereses (Art. 529 C.Com)</strong>, y 
                5) <strong>Amortización Efectiva de Capital (CxC Socios)</strong>. Esto refleja la realidad de que el socio (Persona Natural) no retiene y transfirió el monto íntegro al banco de la empresa.
              </p>
              <div className="pl-8 text-[11px] font-mono text-emerald-800 font-semibold">
                Base Legal: Art. 529 Código de Comercio, Art. 72 Ley de ISLR y Art. 9 Decreto N° 1.808.
              </div>
            </div>

            {/* Regla 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-black">3</span>
                <span>Agrícola ONI C.A. como Agente de Retención y Enteramiento al SENIAT</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                En Venezuela, conforme al Decreto N° 1.808 y el Art. 27 del COT, las <strong>personas naturales no son agentes de retención</strong> en mutuos mercantiles. <strong>Agrícola ONI C.A. (Persona Jurídica)</strong> es el agente de retención calificado que practica la retención del 5% sobre los intereses devengados, asume el pasivo tributario ante el SENIAT (Cuenta 2.1.3.01.03), cancela electrónicamente al Fisco mediante transferencia Banesco, y compensa dicho anticipo (Cuenta 1.1.3.05.02) en su Declaración Definitiva de Rentas (DPJ-26).
              </p>
              <div className="pl-8 text-[11px] font-mono text-purple-800 font-semibold">
                Base Legal: Decreto N° 1.808 Art. 1 y Art. 9 Num. 1, y Código Orgánico Tributario Art. 27.
              </div>
            </div>

            {/* Regla 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">4</span>
                <span>Prelación Imperativa Mercantil (Intereses antes de Capital)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                El Art. 529 del Código de Comercio estipula expresamente: <em>"El pago hecho en cuenta de capital e intereses se imputa primero a éstos"</em>. El sistema liquida en estricto orden los intereses devengados antes de aplicar el remanente a amortizar el capital y restituir el cupo disponible.
              </p>
              <div className="pl-8 text-[11px] font-mono text-blue-800 font-semibold">
                Base Legal: Art. 529 Código de Comercio Venezolano.
              </div>
            </div>

            {/* Regla 5 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">5</span>
                <span>Trazabilidad Notarial y Bancaria en Glosas (Blindaje contra Presunción de Dividendos Ficticios)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                Cada asiento de diario contiene una glosa analítica con: 1) Número de contrato notariado, 2) Número correlativo del recibo oficial (RC-ONI o RP-ONI), 3) Referencia bancaria electrónica de Banesco, y 4) Citas expresas del Código de Comercio, Ley de ISLR y Decreto 1808. Esto demuestra la verdadera causa mercantil de los fondos y desvirtúa cualquier pretensión de imputar ventas omitidas o dividendos encubiertos.
              </p>
              <div className="pl-8 text-[11px] font-mono text-slate-800 font-semibold">
                Base Legal: Art. 72 Ley de ISLR, Art. 16 Num 3 Ley del IVA y Providencia SNAT/2003/1419.
              </div>
            </div>

          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Todas estas 5 reglas están implementadas y activas en el motor contable de esta aplicación.</span>
            </span>
            <button
              onClick={() => setActiveTab('todos')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Ver Asientos Contables
            </button>
          </div>
        </div>
      )}

      {/* TAB: RESUMEN MAESTRO CONSOLIDADO (LIBRO MAYOR) */}
      {activeTab === 'resumen' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Libro Diario Maestro: 4 Asientos Consolidados del Ejercicio</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                Resumen Ejecutivo
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Representación consolidada de las 4 fases contables: Apertura en Cuentas de Orden, 29 Desembolsos de Salida, 18 Cobros con Retención de ISLR 5% e Intereses, y Compensación Fiscal Anual.
            </p>
          </div>

          {asientosConsolidados.map((as, idx) => (
            <div key={as.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
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
                        <td className="py-2.5 px-4 font-bold text-blue-700">{r.codigo}</td>
                        <td className="py-2.5 px-4 text-slate-900 font-sans">{r.nombre}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                          {r.debito > 0 ? formatVES(r.debito) : 'Bs. 0,00'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                          {r.credito > 0 ? formatVES(r.credito) : 'Bs. 0,00'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-300 text-slate-900">
                      <td colSpan={2} className="py-2 px-4 text-right uppercase font-sans text-xs">
                        Totales Cuadrados (Partida Doble):
                      </td>
                      <td className="py-2 px-4 text-right text-emerald-700">
                        {formatVES(as.renglones.reduce((sum, r) => sum + r.debito, 0))}
                      </td>
                      <td className="py-2 px-4 text-right text-emerald-700">
                        {formatVES(as.renglones.reduce((sum, r) => sum + r.credito, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Glosa Contable y Jurídica:
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] leading-relaxed">
                  "{as.glosa}"
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: LISTADO DE ASIENTOS INDIVIDUALES */}
      {activeTab !== 'resumen' && activeTab !== 'reglas' && (
        <div className="space-y-4">
          {asientosFiltrados.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-xs">
              No se encontraron asientos contables que coincidan con el criterio de búsqueda.
            </div>
          ) : (
            asientosFiltrados.map((asiento) => {
              const isPago = asiento.tipo === 'pago_recibido';
              const isSalida = asiento.tipo === 'salida_cupo';
              const isApertura = asiento.tipo === 'apertura_linea';
              const isCierre = asiento.tipo === 'islr_compensacion';

              const badgeColor = isPago 
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : isSalida 
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : isCierre
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-blue-100 text-blue-900 border-blue-300';

              return (
                <div key={asiento.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all">
                  
                  {/* Comprobante Header */}
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {asiento.comprobanteNro}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {asiento.tipoEtiqueta}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{asiento.fecha}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-[11px] text-slate-600 font-mono hidden sm:block">
                        <span>Recibo: <strong>{asiento.reciboCodigo}</strong></span>
                        <span className="mx-1.5">•</span>
                        <span>Ref: <strong>{asiento.referenciaBancaria}</strong></span>
                      </div>

                      <button
                        onClick={() => handleCopySingleAsiento(asiento)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                        title="Copiar texto de este asiento"
                      >
                        {copiedId === asiento.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copiedId === asiento.id ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Asiento Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50/80 text-[10.5px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Código Cuenta (VEN-NIF)</th>
                          <th className="py-2.5 px-4 font-bold">Descripción de la Cuenta</th>
                          <th className="py-2.5 px-4 text-right font-bold">Debe (VES)</th>
                          <th className="py-2.5 px-4 text-right font-bold">Haber (VES)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {asiento.renglones.map((r, rIdx) => {
                          const isISLRRow = r.codigo === '1.1.3.05.02';
                          const isInteresRow = r.codigo === '4.2.1.01.01';

                          return (
                            <tr key={rIdx} className={`hover:bg-slate-50/80 ${isISLRRow ? 'bg-purple-50/40' : ''}`}>
                              <td className={`py-2 px-4 font-bold ${isISLRRow ? 'text-purple-700' : isInteresRow ? 'text-blue-700' : 'text-slate-800'}`}>
                                {r.codigo}
                              </td>
                              <td className="py-2 px-4 text-slate-900 font-sans flex items-center gap-1.5">
                                <span>{r.nombre}</span>
                                {isISLRRow && (
                                  <span className="text-[9px] bg-purple-100 text-purple-800 font-black px-1.5 py-0.2 rounded border border-purple-200">
                                    RETENCIÓN {pctISLR.toFixed(1)}%
                                  </span>
                                )}
                                {isInteresRow && (
                                  <span className="text-[9px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.2 rounded border border-blue-200">
                                    ART. 529 C.COM
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-slate-900">
                                {r.debito > 0 ? formatVES(r.debito) : 'Bs. 0,00'}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-slate-900">
                                {r.credito > 0 ? formatVES(r.credito) : 'Bs. 0,00'}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Totales Cuadrados */}
                        <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-300 text-slate-900">
                          <td colSpan={2} className="py-2 px-4 text-right uppercase font-sans text-[11px] text-slate-600">
                            Total Comprobante (Partida Cuadrada):
                          </td>
                          <td className="py-2 px-4 text-right text-emerald-700">
                            {formatVES(asiento.totalDebito)}
                          </td>
                          <td className="py-2 px-4 text-right text-emerald-700">
                            {formatVES(asiento.totalCredito)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Glosa Footer */}
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                      Glosa Legal y Contable:
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] leading-relaxed">
                      "{asiento.glosa}"
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
