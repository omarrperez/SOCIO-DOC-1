import { Empresa, ReciboPagoRecibido, ConfiguracionFiscalEmpresa, ConceptoRetencionISLR } from '../types';

export interface ConceptoFiscalInfo {
  id: ConceptoRetencionISLR;
  titulo: string;
  subtitulo: string;
  porcentajeDefecto: number;
  articuloLegal: string;
  reglamento: string;
  aplicaA: 'Persona Natural' | 'Persona Jurídica' | 'Cualquiera';
  permiteSustraendo: boolean;
  descripcion: string;
}

export const CATALOGO_CONCEPTOS_ISLR: Record<ConceptoRetencionISLR, ConceptoFiscalInfo> = {
  honorarios_profesionales_pn: {
    id: 'honorarios_profesionales_pn',
    titulo: 'Honorarios Profesionales (Persona Natural Residente)',
    subtitulo: 'Asesorías, consultas médicas, contables, legales, peritajes y servicios profesionales independientes',
    porcentajeDefecto: 3.0,
    articuloLegal: 'Artículo 9, Numeral 1, Literal a)',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203 de fecha 12/05/1997)',
    aplicaA: 'Persona Natural',
    permiteSustraendo: true,
    descripcion: 'Aplica a honorarios pagados a profesionales no mercantiles personas naturales residentes en Venezuela. Alícuota estándar 3% sobre el pago bruto.',
  },
  servicios_profesionales_pj: {
    id: 'servicios_profesionales_pj',
    titulo: 'Servicios Profesionales y Técnicos (Persona Jurídica Domiciliada)',
    subtitulo: 'Servicios de consultoría, ingeniería, firmas contables y sociedades de servicios profesionales',
    porcentajeDefecto: 5.0,
    articuloLegal: 'Artículo 9, Numeral 1, Literal b) y Numeral 11',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203 de fecha 12/05/1997)',
    aplicaA: 'Persona Jurídica',
    permiteSustraendo: false,
    descripcion: 'Aplica a honorarios y servicios especializados pagados a sociedades mercantiles o firmas jurídicas domiciliadas en el país. Alícuota legal 5%.',
  },
  intereses_mutuo_pn: {
    id: 'intereses_mutuo_pn',
    titulo: 'Intereses sobre Préstamos y Mutuos (Persona Natural)',
    subtitulo: 'Intereses devengados por financiamiento dinerario y líneas de crédito pagados a personas naturales',
    porcentajeDefecto: 5.0,
    articuloLegal: 'Artículo 9, Numeral 8',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203 de fecha 12/05/1997)',
    aplicaA: 'Persona Natural',
    permiteSustraendo: false,
    descripcion: 'Aplica a enriquecimientos netos por intereses de capitales tomados en préstamo o financiamientos otorgados por socios/particulares. Alícuota legal 5%.',
  },
  intereses_mutuo_pj: {
    id: 'intereses_mutuo_pj',
    titulo: 'Intereses sobre Financiamientos (Persona Jurídica)',
    subtitulo: 'Intereses de mutuo mercantil y financiamientos pagados a empresas vinculadas o terceros',
    porcentajeDefecto: 5.0,
    articuloLegal: 'Artículo 9, Numeral 8',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203 de fecha 12/05/1997)',
    aplicaA: 'Persona Jurídica',
    permiteSustraendo: false,
    descripcion: 'Aplica a intereses y rendimientos financieros pagados a entidades corporativas domiciliadas. Alícuota legal 5%.',
  },
  comisiones_mercantiles_pn: {
    id: 'comisiones_mercantiles_pn',
    titulo: 'Comisiones y Corretaje (Persona Natural)',
    subtitulo: 'Comisiones por intermediación de ventas, compras y corretaje a personas naturales',
    porcentajeDefecto: 3.0,
    articuloLegal: 'Artículo 9, Numeral 2',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203)',
    aplicaA: 'Persona Natural',
    permiteSustraendo: true,
    descripcion: 'Aplica a remuneraciones por comisiones pagadas a personas naturales residentes. Alícuota legal 3%.',
  },
  comisiones_mercantiles_pj: {
    id: 'comisiones_mercantiles_pj',
    titulo: 'Comisiones Mercantiles (Persona Jurídica)',
    subtitulo: 'Comisiones comerciales entre personas jurídicas domiciliadas',
    porcentajeDefecto: 5.0,
    articuloLegal: 'Artículo 9, Numeral 2',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203)',
    aplicaA: 'Persona Jurídica',
    permiteSustraendo: false,
    descripcion: 'Aplica a comisiones de ventas e intermediación entre sociedades jurídicas. Alícuota legal 5%.',
  },
  ejecucion_obras_servicios_pn: {
    id: 'ejecucion_obras_servicios_pn',
    titulo: 'Ejecución de Obras y Servicios en General (Persona Natural)',
    subtitulo: 'Contrataciones de mano de obra, mantenimiento, construcción y servicios en general',
    porcentajeDefecto: 1.0,
    articuloLegal: 'Artículo 9, Numeral 11',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203)',
    aplicaA: 'Persona Natural',
    permiteSustraendo: true,
    descripcion: 'Aplica a pagos por ejecución de obras o prestación de servicios materiales. Alícuota legal 1%.',
  },
  ejecucion_obras_servicios_pj: {
    id: 'ejecucion_obras_servicios_pj',
    titulo: 'Ejecución de Obras y Servicios en General (Persona Jurídica)',
    subtitulo: 'Contratistas mercantiles de obras, servicios y suministros',
    porcentajeDefecto: 2.0,
    articuloLegal: 'Artículo 9, Numeral 11',
    reglamento: 'Decreto N° 1.808 (Gaceta Oficial N° 36.203)',
    aplicaA: 'Persona Jurídica',
    permiteSustraendo: false,
    descripcion: 'Aplica a pagos a contratistas y empresas de servicios generales. Alícuota legal 2%.',
  },
  no_domiciliados_exterior: {
    id: 'no_domiciliados_exterior',
    titulo: 'Pagos al Exterior / No Domiciliados (Tarifa General)',
    subtitulo: 'Servicios técnicos, asesorías y regalías a empresas o personas no residentes en Venezuela',
    porcentajeDefecto: 34.0,
    articuloLegal: 'Artículo 9, Numeral 14 / Art. 50 LISLR',
    reglamento: 'Ley de Impuesto sobre la Renta y Decreto N° 1.808',
    aplicaA: 'Cualquiera',
    permiteSustraendo: false,
    descripcion: 'Tasa fija aplicable a beneficiarios del exterior sin domicilio ni establecimiento permanente en Venezuela.',
  },
  personalizado: {
    id: 'personalizado',
    titulo: 'Tasa Personalizada Definida por el Usuario',
    subtitulo: 'Alícuota configurada según dictamen fiscal específico o convenio particular',
    porcentajeDefecto: 5.0,
    articuloLegal: 'Providencia Administrativa SENIAT / Dictamen Particular',
    reglamento: 'Decreto N° 1.808',
    aplicaA: 'Cualquiera',
    permiteSustraendo: false,
    descripcion: 'Permite definir libremente el porcentaje de retención para cálculos especiales auditados.',
  },
};

export const CONFIGURACION_FISCAL_DEFAULT: ConfiguracionFiscalEmpresa = {
  aplicar_retencion_automatica: true,
  concepto_activo: 'honorarios_profesionales_pn',
  porcentaje_retencion_activo: 3.0,
  porcentaje_honorarios_profesionales_pn: 3.0,
  porcentaje_servicios_profesionales_pj: 5.0,
  porcentaje_intereses_mutuo_pn: 5.0,
  porcentaje_intereses_mutuo_pj: 5.0,
  porcentaje_comisiones_pn: 3.0,
  porcentaje_comisiones_pj: 5.0,
  porcentaje_obras_servicios_pn: 1.0,
  porcentaje_obras_servicios_pj: 2.0,
  porcentaje_no_domiciliados: 34.0,
  porcentaje_personalizado: 3.0,
  es_agente_retencion: true,
  resolucion_agente_retencion: 'SNAT/2023/000035 - Sujeto Pasivo Especial',
  unidad_tributaria_ves: 9.00,
  aplicar_sustraendo_pn: false,
  sustraendo_ut_unidades: 83.3334,
  cuenta_contable_retencion: '2.1.03.01.002 - Retenciones de ISLR por Enterar al SENIAT',
  prefijo_comprobante_retencion: 'ISLR-2026-',
};

export const CONFIGURACION_FISCAL_AGRICOLA_ONI: ConfiguracionFiscalEmpresa = {
  aplicar_retencion_automatica: true,
  concepto_activo: 'intereses_mutuo_pn', // Inicialmente intereses de mutuo (5%), conmutables a honorarios (3%)
  porcentaje_retencion_activo: 5.0,
  porcentaje_honorarios_profesionales_pn: 3.0,
  porcentaje_servicios_profesionales_pj: 5.0,
  porcentaje_intereses_mutuo_pn: 5.0,
  porcentaje_intereses_mutuo_pj: 5.0,
  porcentaje_comisiones_pn: 3.0,
  porcentaje_comisiones_pj: 5.0,
  porcentaje_obras_servicios_pn: 1.0,
  porcentaje_obras_servicios_pj: 2.0,
  porcentaje_no_domiciliados: 34.0,
  porcentaje_personalizado: 5.0,
  es_agente_retencion: true,
  resolucion_agente_retencion: 'SNAT/2021/000048 - Sujeto Pasivo Especial',
  unidad_tributaria_ves: 9.00,
  aplicar_sustraendo_pn: false,
  sustraendo_ut_unidades: 83.3334,
  cuenta_contable_retencion: '2.1.03.01.002 - Retenciones de ISLR por Enterar al SENIAT',
  prefijo_comprobante_retencion: 'COMP-ISLR-ONI-2026-',
};

/**
 * Obtiene la configuración fiscal de una empresa o una por defecto
 */
export function obtenerConfiguracionFiscal(empresa?: Empresa): ConfiguracionFiscalEmpresa {
  if (empresa?.configuracion_fiscal) {
    return empresa.configuracion_fiscal;
  }
  if (empresa?.id === 'emp-oni') {
    return { ...CONFIGURACION_FISCAL_AGRICOLA_ONI };
  }
  return { ...CONFIGURACION_FISCAL_DEFAULT };
}

/**
 * Retorna el texto legal y cita jurídica del concepto fiscal activo
 */
export function obtenerCitaLegalConcepto(concepto: ConceptoRetencionISLR, porcentaje: number): {
  articulo: string;
  reglamento: string;
  textoCompleto: string;
} {
  const info = CATALOGO_CONCEPTOS_ISLR[concepto] || CATALOGO_CONCEPTOS_ISLR.personalizado;
  const textoCompleto = `Retención del ${porcentaje.toFixed(2)}% de I.S.L.R. practicada de conformidad con el ${info.articuloLegal} del ${info.reglamento}`;
  return {
    articulo: info.articuloLegal,
    reglamento: info.reglamento,
    textoCompleto,
  };
}

export interface ResultadoCalculoRecibosFiscal {
  recibosRecalculados: ReciboPagoRecibido[];
  totalEntradasVes: number;
  totalEntradasUsd: number;
  totalInteresesDevengadosVes: number;
  totalInteresesDevengadosUsd: number;
  totalRetencionIslrVes: number;
  totalRetencionIslrUsd: number;
  totalInteresNetoPercibidoVes: number;
  totalAmortizacionCapitalVes: number;
  totalAmortizacionCapitalUsd: number;
  porcentajeAplicado: number;
  conceptoActivo: ConceptoRetencionISLR;
  conceptoInfo: ConceptoFiscalInfo;
}

/**
 * Aplica automáticamente la configuración fiscal a una lista de recibos de pago
 */
export function calcularRecibosConConfiguracionFiscal(
  recibosBase: ReciboPagoRecibido[],
  fiscalConfig: ConfiguracionFiscalEmpresa
): ResultadoCalculoRecibosFiscal {
  const porcentaje = fiscalConfig.aplicar_retencion_automatica
    ? Number(fiscalConfig.porcentaje_retencion_activo) || 0
    : 0;

  const conceptoActivo = fiscalConfig.concepto_activo || 'honorarios_profesionales_pn';
  const conceptoInfo = CATALOGO_CONCEPTOS_ISLR[conceptoActivo] || CATALOGO_CONCEPTOS_ISLR.personalizado;

  let totalEntradasVes = 0;
  let totalEntradasUsd = 0;
  let totalInteresesDevengadosVes = 0;
  let totalInteresesDevengadosUsd = 0;
  let totalRetencionIslrVes = 0;
  let totalRetencionIslrUsd = 0;
  let totalInteresNetoPercibidoVes = 0;
  let totalAmortizacionCapitalVes = 0;
  let totalAmortizacionCapitalUsd = 0;

  const sustraendoMontoVes = fiscalConfig.aplicar_sustraendo_pn && conceptoInfo.permiteSustraendo
    ? Math.round(
        (fiscalConfig.sustraendo_ut_unidades * fiscalConfig.unidad_tributaria_ves * (porcentaje / 100)) * 100
      ) / 100
    : 0;

  const recibosRecalculados: ReciboPagoRecibido[] = recibosBase.map((r) => {
    const baseInteresesVes = r.intereses_pagados_ves || r.intereses_devengados_ves || 0;
    
    // Cálculo de retención
    let retencionCalculadaVes = (baseInteresesVes * porcentaje) / 100;
    if (sustraendoMontoVes > 0 && retencionCalculadaVes > sustraendoMontoVes) {
      retencionCalculadaVes -= sustraendoMontoVes;
    } else if (sustraendoMontoVes > 0) {
      retencionCalculadaVes = 0;
    }
    retencionCalculadaVes = Math.round(retencionCalculadaVes * 100) / 100;

    const interesNetoVes = Math.round((baseInteresesVes - retencionCalculadaVes) * 100) / 100;
    const amortizacionVes = r.capital_amortizado_ves || (r.monto_total_ves - baseInteresesVes);
    const tasa = r.tasa_bcv || 1;
    const retencionUsd = Math.round((retencionCalculadaVes / tasa) * 100) / 100;
    const interesesUsd = Math.round((baseInteresesVes / tasa) * 100) / 100;
    const amortizacionUsd = Math.round((amortizacionVes / tasa) * 100) / 100;

    totalEntradasVes += r.monto_total_ves;
    totalEntradasUsd += r.monto_total_usd;
    totalInteresesDevengadosVes += baseInteresesVes;
    totalInteresesDevengadosUsd += interesesUsd;
    totalRetencionIslrVes += retencionCalculadaVes;
    totalRetencionIslrUsd += retencionUsd;
    totalInteresNetoPercibidoVes += interesNetoVes;
    totalAmortizacionCapitalVes += amortizacionVes;
    totalAmortizacionCapitalUsd += amortizacionUsd;

    return {
      ...r,
      retencion_islr_porcentaje: porcentaje,
      porcentaje_retencion_islr: porcentaje,
      monto_retencion_islr_ves: retencionCalculadaVes,
      interes_neto_percibido_ves: interesNetoVes,
      intereses_netos_ves: interesNetoVes,
      capital_amortizado_ves: amortizacionVes,
      capital_amortizado_usd: amortizacionUsd,
      intereses_pagados_usd: interesesUsd,
    };
  });

  totalEntradasVes = Math.round(totalEntradasVes * 100) / 100;
  totalEntradasUsd = Math.round(totalEntradasUsd * 100) / 100;
  totalInteresesDevengadosVes = Math.round(totalInteresesDevengadosVes * 100) / 100;
  totalInteresesDevengadosUsd = Math.round(totalInteresesDevengadosUsd * 100) / 100;
  totalRetencionIslrVes = Math.round(totalRetencionIslrVes * 100) / 100;
  totalRetencionIslrUsd = Math.round(totalRetencionIslrUsd * 100) / 100;
  totalInteresNetoPercibidoVes = Math.round(totalInteresNetoPercibidoVes * 100) / 100;
  totalAmortizacionCapitalVes = Math.round(totalAmortizacionCapitalVes * 100) / 100;
  totalAmortizacionCapitalUsd = Math.round(totalAmortizacionCapitalUsd * 100) / 100;

  return {
    recibosRecalculados,
    totalEntradasVes,
    totalEntradasUsd,
    totalInteresesDevengadosVes,
    totalInteresesDevengadosUsd,
    totalRetencionIslrVes,
    totalRetencionIslrUsd,
    totalInteresNetoPercibidoVes,
    totalAmortizacionCapitalVes,
    totalAmortizacionCapitalUsd,
    porcentajeAplicado: porcentaje,
    conceptoActivo,
    conceptoInfo,
  };
}

export interface ReglaContableApp {
  id: string;
  numero: number;
  titulo: string;
  resumen: string;
  baseJuridica: string;
  principioTecnico: string;
  descripcionDetallada: string;
  aplicacionEnApp: string;
}

/**
 * REGLAS CONTABLES Y FISCALES OBLIGATORIAS DE LA APLICACIÓN
 * Directriz permanente: La aplicación SIEMPRE debe generar los asientos completos de ciclo:
 * - Asiento 0: Apertura de Línea en Cuentas de Orden estatutarias (Bs. 600.000.000,00).
 * - 29 Asientos de Salida: Desembolso individual de cada cupo rotativo en Banco Banesco.
 * - 18 Asientos de Entrada: Cobranza en Partida Cuádruple (Banco Neto, Anticipo ISLR 5%, Ingresos por Intereses y Amortización Capital).
 * - Asiento de Cierre: Registro y Compensación del ISLR retenido (Crédito Fiscal 1.1.3.05.02 vs Pasivo 2.1.3.01.01).
 */
export const REGLAS_CONTABLES_OBLIGATORIAS_APP: ReglaContableApp[] = [
  {
    id: 'regla-1-ciclo-completo-prohibicion-asiento-unico',
    numero: 1,
    titulo: 'Obligatoriedad de Asientos de Ciclo Completo y Prohibición de Asiento Único de Bs. 600M',
    resumen: 'Prohibido registrar únicamente el asiento consolidado de Bs. 600.000.000,00. Es obligatorio desglosar los 29 desembolsos de salida, los 18 pagos de entrada y el registro de ISLR.',
    baseJuridica: 'VEN-NIF PYME Sección 11 (Instrumentos Financieros) y Art. 503 del Código de Comercio.',
    principioTecnico: 'Realidad Económica sobre la Forma Jurídica y Conciliación Bancaria Íntegra.',
    descripcionDetallada: 'El Contrato Marco de Línea de Crédito Rotativa autoriza una capacidad financiera de hasta Bs. 600.000.000,00, pero no representa una erogación bancaria en un solo bloque. Registrar un asiento único de Bs. 600M contra la cuenta bancaria es un error contable grave que falsea el saldo de caja y bancos, destruye la conciliación bancaria y activa presunciones fiscales de ventas omitidas o dividendos fictos ante el SENIAT. Por ende, la aplicación debe generar SIEMPRE los 29 comprobantes de salida correspondientes a cada transferencia bancaria de cupo efectuada.',
    aplicacionEnApp: 'El sistema genera automáticamente el Asiento 0 de apertura en Cuentas de Orden (7.1/7.2) y los 29 asientos individuales de salida (Débito a CxC Socio 1.1.2.03.01 y Crédito a Banco Banesco 1.1.1.02.01) con fecha y referencia bancaria individual.'
  },
  {
    id: 'regla-2-partida-quintuple-cobranzas-islr',
    numero: 2,
    titulo: 'Partida Quíntuple en Cobranzas con Intereses y Retención del 5% de ISLR por Agrícola ONI C.A.',
    resumen: 'Todo cobro de cuota registra: 1) Banco Banesco (Cobranza Íntegra del Socio), 2) Anticipo ISLR 5% (Crédito Fiscal ONI), 3) Retenciones por Enterar al SENIAT (Pasivo Fiscal de ONI), 4) Ingresos por Intereses, y 5) Amortización de Capital.',
    baseJuridica: 'Art. 529 Código de Comercio, Art. 72 Ley de ISLR y Art. 9 Decreto N° 1.808.',
    principioTecnico: 'Devengo Contable, Cobranza Íntegra en Banco e Imputación Legal Imperativa de Pagos.',
    descripcionDetallada: 'Cada uno de los 18 pagos recibidos debe descomponerse en 5 renglones obligatorios: 1) Entrada Líquida a Banco Banesco por el monto íntegro transferido por el socio (Manuel Becerra es Persona Natural y no es agente de retención), 2) Anticipo de ISLR 5% como Crédito Fiscal a favor de la empresa (Cuenta 1.1.3.05.02), 3) Retenciones de ISLR por Enterar al SENIAT como Pasivo Tributario asumido por Agrícola ONI C.A. (Cuenta 2.1.3.01.03), 4) Reconocimiento de Ingresos Financieros por Intereses de Financiamiento (Cuenta 4.2.1.01.01), y 5) Disminución efectiva de la Cuenta por Cobrar al Socio (Amortización de Capital). Omitir el desglose de intereses o registrar todo a amortización de capital es causal de reparo tributario según el Art. 72 LISLR.',
    aplicacionEnApp: 'Cada uno de los 18 recibos de pago genera su propio comprobante contable quíntuple, garantizando que sumas iguales cuadren exactamente al céntimo y reflejando que Agrícola ONI C.A. retiene y entera el impuesto al SENIAT.'
  },
  {
    id: 'regla-3-anticipo-islr-activo-exigible',
    numero: 3,
    titulo: 'Retención de ISLR asumida y enterada al SENIAT por Agrícola ONI C.A. (Crédito Fiscal)',
    resumen: 'Al ser el mutuario persona natural no agente de retención, Agrícola ONI C.A. retiene y entera el 5% al SENIAT, registrando el crédito fiscal deducible (Cuenta 1.1.3.05.02).',
    baseJuridica: 'Decreto N° 1.808 (Reglamento Parcial de Retenciones de la Ley de ISLR), Art. 9, Numeral 8 y Art. 27 del COT.',
    principioTecnico: 'Tratamiento de Anticipos Impositivos y Retenciones en Fuente conforme a VEN-NIF PYME Sección 29.',
    descripcionDetallada: 'Dado que el deudor es una persona natural no calificada como agente de retención ante el portal fiscal del SENIAT, la sociedad mercantil Agrícola ONI C.A. (como persona jurídica y sujeto corporativo) practica formalmente la retención del 5% de ISLR sobre los intereses de mutuo devengados, declarándola y enterándola directamente ante el SENIAT mediante su portal fiscal, registrando el pasivo por enterar y acreditando el anticipo tributario recuperable (Cuenta 1.1.3.05.02) que se deduce íntegramente de la cuota anual del ISLR corporativo.',
    aplicacionEnApp: 'El sistema registra el pasivo y acumula el crédito fiscal retenido, generando los comprobantes de retención, de enteramiento al SENIAT y el Asiento de Cierre y Compensación Fiscal de ISLR.'
  },
  {
    id: 'regla-4-prelacion-imperativa-intereses',
    numero: 4,
    titulo: 'Prelación Imperativa Mercantil: Intereses antes de Capital',
    resumen: 'El pago efectuado se imputa primero y obligatoriamente a satisfacer los intereses devengados; únicamente el excedente amortiza el capital deudor.',
    baseJuridica: 'Art. 529 del Código de Comercio Venezolano.',
    principioTecnico: 'Prelación de Imputación de Créditos Civiles y Mercantiles.',
    descripcionDetallada: 'El Art. 529 del Código de Comercio prescribe de manera imperativa: "El pago hecho en cuenta de capital e intereses se imputa primero a éstos". Cualquier pacto o registro en contrario que pretenda abonar capital adeudando intereses corrientes devengados es nulo de pleno derecho frente al SENIAT y a los órganos jurisdiccionales.',
    aplicacionEnApp: 'El algoritmo de amortización y asientos de la aplicación descuenta en primer término los intereses causados a la fecha valor antes de abonar a capital y recomponer el cupo rotativo disponible.'
  },
  {
    id: 'regla-5-trazabilidad-glosas-desvirtuacion-dividendos',
    numero: 5,
    titulo: 'Trazabilidad Bancaria Integral en Glosas y Desvirtuación de Dividendos Fictos',
    resumen: 'Cada comprobante debe incorporar en su glosa el número de recibo oficial, la referencia bancaria Banesco y el contrato notariado soporte.',
    baseJuridica: 'Art. 72 Ley de ISLR, Art. 128 del Código Orgánico Tributario y Providencia SNAT/2003/1419.',
    principioTecnico: 'Certeza Jurídica, Documentación Soporte y Bancarización Plena.',
    descripcionDetallada: 'El SENIAT presume como dividendo gravable o venta no declarada cualquier salida o entrada de fondos entre socios y la sociedad que carezca de trazabilidad documental fehaciente. La glosa de cada asiento contable debe contener el contrato notariado de mutuo, el número correlativo de recibo foliado y el identificador de transacción bancaria (Banesco Ref/TXID).',
    aplicacionEnApp: 'Todas las glosas generadas en el sistema (en pantalla, en exportación a Excel, Saint, Profit Plus y Galac) incorporan automáticamente la trazabilidad bancaria y notarial completa.'
  }
];

