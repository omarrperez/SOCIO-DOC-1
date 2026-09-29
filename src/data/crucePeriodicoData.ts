import { MovimientoCrucePeriodico } from '../types';
import { RECIBOS_CUPO_AGRICOLA_ONI } from './recibosCupoData';
import { RECIBOS_PAGOS_AGRICOLA_ONI } from './recibosPagosData';

export const LIMITE_LINEA_CREDITO_GLOBAL_VES = 600000000.00;
export const TOTAL_CUPOS_DESEMBOLSADOS_VES = 498400605.30;
export const TOTAL_PAGOS_RECIBIDOS_VES = 186376000.00;
export const TOTAL_INTERESES_DEVENGADOS_VES = 16248372.46;
export const TOTAL_RETENCION_ISLR_5PCT_VES = 812418.62;
export const TOTAL_INTERES_NETO_PERCIBIDO_VES = 15435953.84;
export const TOTAL_AMORTIZACION_CAPITAL_VES = 170127627.54;
export const SALDO_CAPITAL_VIVO_FINAL_VES = 420471976.23;
export const CUPO_DISPONIBLE_RECONSTITUIDO_FINAL_VES = 179528023.77;
export const PORCENTAJE_UTILIZACION_FINAL = 70.08;

/**
 * Builds the 47 chronological transactions merging Cupos (29) and Pagos (18)
 */
export function generarMovimientosCrucePeriodico(): MovimientoCrucePeriodico[] {
  const cuposMovimientos: MovimientoCrucePeriodico[] = RECIBOS_CUPO_AGRICOLA_ONI.map((c) => ({
    correlativo: c.numero_cupo,
    fecha: c.fecha,
    tipo: 'CUPO_DISPOSICION' as const,
    recibo_codigo: c.numero_recibo,
    referencia_bancaria: c.referencia_bancaria,
    concepto: c.concepto,
    debito_cupo_ves: c.monto_ves,
    pago_total_recibido_ves: 0,
    intereses_pagados_ves: 0,
    retencion_islr_ves: 0,
    credito_capital_ves: 0,
    saldo_capital_vivo_ves: c.acumulado_actual_ves,
    limite_linea_ves: c.limite_linea_ves,
    cupo_disponible_ves: c.remanente_disponible_ves,
    porcentaje_utilizado: c.porcentaje_consumido,
    tasa_bcv: c.tasa_bcv,
    saldo_capital_usd: c.acumulado_actual_ves / c.tasa_bcv,
    recibo_origen_id: c.id,
  }));

  const pagosMovimientos: MovimientoCrucePeriodico[] = RECIBOS_PAGOS_AGRICOLA_ONI.map((p) => ({
    correlativo: 29 + p.numero_pago,
    fecha: p.fecha,
    tipo: 'PAGO_AMORTIZACION' as const,
    recibo_codigo: p.numero_recibo,
    referencia_bancaria: p.referencia_bancaria,
    concepto: p.concepto,
    debito_cupo_ves: 0,
    pago_total_recibido_ves: p.monto_total_ves,
    intereses_pagados_ves: p.intereses_pagados_ves,
    retencion_islr_ves: p.monto_retencion_islr_ves,
    credito_capital_ves: p.capital_amortizado_ves,
    saldo_capital_vivo_ves: p.nuevo_saldo_capital_ves,
    limite_linea_ves: p.limite_linea_ves,
    cupo_disponible_ves: p.cupo_disponible_actual_ves,
    porcentaje_utilizado: p.porcentaje_linea_utilizado,
    tasa_bcv: p.tasa_bcv,
    saldo_capital_usd: p.nuevo_saldo_capital_ves / p.tasa_bcv,
    recibo_origen_id: p.id,
  }));

  // Maintain the natural order: 1..29 Cupos de Disposición, then 30..47 Pagos de Amortización
  return [...cuposMovimientos, ...pagosMovimientos];
}

export const MOVIMIENTOS_CRUCE_PERIODICO: MovimientoCrucePeriodico[] = generarMovimientosCrucePeriodico();
