/**
 * TABLA CRONOLÓGICA DE TASAS DE INTERÉS ACTIVAS PARA PRÉSTAMOS BANCARIOS
 * BANCO CENTRAL DE VENEZUELA (BCV) - PERÍODO MAYO A AGOSTO 2026
 *
 * Marco normativo unificado y de obligatorio cumplimiento para los 6 principales bancos:
 * 1. Banco de Venezuela
 * 2. Banesco Banco Universal
 * 3. BBVA Provincial
 * 4. Banco Mercantil
 * 5. Banco Nacional de Crédito (BNC)
 * 6. Banco Occidental de Descuento / Bancamiga
 *
 * Aspectos clave:
 * • Indexación obligatoria (UVC): El cálculo de intereses de préstamos comerciales
 *   no se realiza directamente sobre el monto nominal en bolívares, sino expresando
 *   el capital en Unidades de Valor de Crédito (UVC), variando diariamente según
 *   el tipo de cambio oficial del BCV.
 * • Comportamiento bancario: Para créditos comerciales indexados a UVC, la banca
 *   aplicó unánimemente el tope máximo legal permitido del 16% anual (antes de la
 *   reforma de septiembre 2026 que elevó el piso al 16%).
 */

import { ReciboPagoRecibido } from '../types';

export interface FilaTasasBcvMes {
  mes: string;
  ano: number;
  creditosComercialesUvc: string;
  tasaComercialMinPct: number;
  tasaComercialMaxPct: number;
  carteraProductivaNacional: string;
  tasaCarteraProductivaPct: number;
  tarjetasCredito: string;
  tasaTarjetaMinPct: number;
  tasaTarjetaMaxPct: number;
  tasaInterbancariaRef: string;
  tasaInterbancariaPct: number;
}

export const TABLA_CRONOLOGICA_TASAS_BCV: FilaTasasBcvMes[] = [
  {
    mes: 'Mayo',
    ano: 2026,
    creditosComercialesUvc: 'Mín. 13% / Máx. 16%',
    tasaComercialMinPct: 13.0,
    tasaComercialMaxPct: 16.0,
    carteraProductivaNacional: '12% anual',
    tasaCarteraProductivaPct: 12.0,
    tarjetasCredito: 'Mín. 17% / Máx. 60%',
    tasaTarjetaMinPct: 17.0,
    tasaTarjetaMaxPct: 60.0,
    tasaInterbancariaRef: '59,04%',
    tasaInterbancariaPct: 59.04,
  },
  {
    mes: 'Junio',
    ano: 2026,
    creditosComercialesUvc: 'Mín. 13% / Máx. 16%',
    tasaComercialMinPct: 13.0,
    tasaComercialMaxPct: 16.0,
    carteraProductivaNacional: '12% anual',
    tasaCarteraProductivaPct: 12.0,
    tarjetasCredito: 'Mín. 17% / Máx. 60%',
    tasaTarjetaMinPct: 17.0,
    tasaTarjetaMaxPct: 60.0,
    tasaInterbancariaRef: '59,12%',
    tasaInterbancariaPct: 59.12,
  },
  {
    mes: 'Julio',
    ano: 2026,
    creditosComercialesUvc: 'Mín. 13% / Máx. 16%',
    tasaComercialMinPct: 13.0,
    tasaComercialMaxPct: 16.0,
    carteraProductivaNacional: '12% anual',
    tasaCarteraProductivaPct: 12.0,
    tarjetasCredito: 'Mín. 17% / Máx. 60%',
    tasaTarjetaMinPct: 17.0,
    tasaTarjetaMaxPct: 60.0,
    tasaInterbancariaRef: '59,04%',
    tasaInterbancariaPct: 59.04,
  },
  {
    mes: 'Agosto',
    ano: 2026,
    creditosComercialesUvc: 'Mín. 13% / Máx. 16%',
    tasaComercialMinPct: 13.0,
    tasaComercialMaxPct: 16.0,
    carteraProductivaNacional: '12% anual',
    tasaCarteraProductivaPct: 12.0,
    tarjetasCredito: 'Mín. 17% / Máx. 60%',
    tasaTarjetaMinPct: 17.0,
    tasaTarjetaMaxPct: 60.0,
    tasaInterbancariaRef: '58,93%',
    tasaInterbancariaPct: 58.93,
  },
];

export const SEIS_PRINCIPALES_BANCOS_VENEZUELA = [
  { nombre: 'Banco de Venezuela, S.A.', sigla: 'BDV', tipo: 'Banca Pública' },
  { nombre: 'Banesco Banco Universal, C.A.', sigla: 'Banesco', tipo: 'Banca Privada' },
  { nombre: 'BBVA Banco Provincial, S.A.', sigla: 'Provincial', tipo: 'Banca Privada' },
  { nombre: 'Banco Mercantil, C.A.', sigla: 'Mercantil', tipo: 'Banca Privada' },
  { nombre: 'Banco Nacional de Crédito, C.A.', sigla: 'BNC', tipo: 'Banca Privada' },
  { nombre: 'Banco Occidental de Descuento / Bancamiga', sigla: 'BOD/Bancamiga', tipo: 'Banca Privada' },
];

export interface RegimenInteresDef {
  id: string;
  nombre: string;
  tasaAnual: number;
  esIndexadoUvc: boolean;
  descripcion: string;
  baseNormativa: string;
  etiquetaBadge: string;
}

export const REGIMENES_INTERES_DISPONIBLES: RegimenInteresDef[] = [
  {
    id: 'uvc_16',
    nombre: 'Crédito Comercial Indexado a UVC (16.00% Anual)',
    tasaAnual: 16.0,
    esIndexadoUvc: true,
    descripcion: 'Tope legal máximo fijado por el BCV y aplicado por los 6 principales bancos comerciales (reforma sept-2026 elevó el piso a 16%).',
    baseNormativa: 'Resolución BCV Créditos Comerciales en UVC • Rango 13% a 16% (Tope Banca 16%)',
    etiquetaBadge: 'Oficial Normativo (6 Bancos)',
  },
  {
    id: 'nominal_16',
    nombre: 'Crédito Comercial en Bolívares (16.00% Anual)',
    tasaAnual: 16.0,
    esIndexadoUvc: false,
    descripcion: 'Cálculo de interés sobre saldo nominal en bolívares a la tasa bancaria activa comercial del 16% anual.',
    baseNormativa: 'Normativa BCV Créditos Comerciales (Modalidad Nominal)',
    etiquetaBadge: 'Nominal VES 16%',
  },
  {
    id: 'cartera_12',
    nombre: 'Cartera Única Productiva Nacional (12.00% Anual)',
    tasaAnual: 12.0,
    esIndexadoUvc: true,
    descripcion: 'Tasa fija preferencial para créditos al sector agrario, agropecuario y productivo nacional regulado por el BCV.',
    baseNormativa: 'Resolución BCV Cartera Única Productiva Nacional (Sector Agrario)',
    etiquetaBadge: 'Cartera Productiva 12%',
  },
  {
    id: 'uvc_13',
    nombre: 'Crédito Comercial UVC Piso Mínimo (13.00% Anual)',
    tasaAnual: 13.0,
    esIndexadoUvc: true,
    descripcion: 'Piso mínimo regulatorio establecido por el BCV para créditos comerciales indexados previo a la reforma de septiembre.',
    baseNormativa: 'Rango Mínimo BCV Créditos en UVC (13%)',
    etiquetaBadge: 'Piso Mínimo 13%',
  },
  {
    id: 'interbancaria_59',
    nombre: 'Tasa Interbancaria de Referencia BCV (~59.04% - 59.12%)',
    tasaAnual: 59.12,
    esIndexadoUvc: false,
    descripcion: 'Promedio de referencia del mercado interbancario de dinero publicado por el BCV para operaciones entre entidades financieras.',
    baseNormativa: 'Publicación BCV Tasa Activa Interbancaria de Referencia',
    etiquetaBadge: 'Referencia Interbancaria',
  },
  {
    id: 'tarjeta_60',
    nombre: 'Financiamiento Libre / Tarjetas de Crédito (Tope 60.00%)',
    tasaAnual: 60.0,
    esIndexadoUvc: false,
    descripcion: 'Tope máximo permitido por la ley para financiamientos no comerciales y tarjetas de crédito aplicado unánimemente.',
    baseNormativa: 'Regulación BCV Tarjetas de Crédito (Tope 60%)',
    etiquetaBadge: 'Tope Tarjetas 60%',
  },
];
