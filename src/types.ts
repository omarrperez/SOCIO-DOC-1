export type TipoContribuyente = 'Ordinario' | 'Especial';

export type TipoFlujo = 'socio_a_empresa' | 'empresa_a_socio';

export type TipoActivo = 'VES' | 'USD_EFECTIVO' | 'USD_TRANSFERENCIA' | 'USDT';

export type EstadoContrato = 'activo' | 'cancelado' | 'capitalizado';

export type ModalidadContrato = 'mutuo_simple' | 'linea_credito_rotativa';

export interface Empresa {
  id: string;
  razon_social: string;
  rif_empresa: string;
  registro_mercantil: string; // Ej: Registro Mercantil Segundo de Caracas, Nro. 14, Tomo 22-A
  representante_legal: string;
  cedula_representante: string;
  rif_representante?: string;
  cargo_representante: string;
  facultad_estatutaria_mutuo?: string; // Ej: Capítulo IV, Cláusula Décima Cuarta, Numeral O
  tipo_contribuyente: TipoContribuyente;
  capital_social_ves: number;
  ciudad: string;
  estado: string;
  direccion_fiscal: string;
  telefono: string;
  email: string;
}

export type TipoVinculoPersona = 'accionista' | 'director' | 'gerente' | 'personal_confianza';

export interface Accionista {
  id: string;
  empresa_id: string;
  nombre_accionista: string;
  cedula_accionista: string;
  rif_accionista: string;
  porcentaje_acciones: number;
  cargo_o_condicion: string;
  tipo_vinculo?: TipoVinculoPersona; // 'accionista' | 'director' | 'gerente' | 'personal_confianza'
  es_accionista?: boolean; // true si posee acciones, false si es director o gerente
  departamento?: string; // Ej: 'Operaciones', 'Administración', 'Finanzas', 'Presidencia'
  facultades?: string; // Ej: 'Personal de Confianza', 'Firma autorizada'
  relacion_societaria_detalle?: string; // Ej: Socio en otra sociedad con el representante legal
  telefono: string;
  email: string;
  billetera_usdt?: string;
  banco_frecuente?: string;
  numero_cuenta?: string;
}

export interface ActaAsamblea {
  id: string;
  empresa_id: string;
  numero_acta: string;
  tipo_asamblea: 'extraordinaria' | 'ordinaria' | 'mixta';
  fecha_asamblea: string;
  hora_inicio: string;
  hora_fin: string;
  monto_maximo_autorizado_pagar: number; // en USD equivalente
  monto_maximo_autorizado_cobrar: number; // en USD equivalente
  quorum_capital_porcentaje: number;
  estatus_libro_fisico: boolean;
  fecha_asentamiento_libro?: string;
  libro_paginas?: string; // Ej: "45 a la 48"
  registro_mercantil_asiento?: string; // Tomo y Asiento mercantil
  regimen_interes_autorizado?: 'nominal_bcv_59' | 'indexado_uvc_16' | 'divisas_usd' | 'mixto_segun_contrato';
  beneficiario_id?: string;
  beneficiario_nombre?: string;
  beneficiario_cedula?: string;
  beneficiario_cargo?: string;
  monto_prestamo?: number;
  moneda_prestamo?: 'VES' | 'USD' | 'USDT';
  plazo_meses?: number;
  presidente_mesa: string;
  secretario_mesa: string;
  observaciones?: string;
}

export interface SoporteTransaccion {
  id: string;
  contrato_id: string;
  tipo_soporte: 'bancario' | 'efectivo_caja' | 'blockchain_txid';
  referencia_bancaria?: string;
  banco_origen?: string;
  banco_destino?: string;
  numero_cuenta_origen?: string;
  numero_cuenta_destino?: string;
  wallet_origen?: string;
  wallet_destino?: string;
  txid_blockchain?: string;
  red_blockchain?: string; // TRON TRC-20, ETH ERC-20, Polygon, etc.
  recibo_caja_correlativo?: string;
  fecha_transaccion: string;
  hora_transaccion?: string;
  hash_documento_sha256: string;
  txhash_blockchain_polygon: string;
  block_number: number;
  timestamp_iso: string;
  igtf_aplica: boolean;
  igtf_monto_ves: number;
  igtf_monto_usd: number;
}

export interface ContratoMutuo {
  id: string;
  uuid_publico: string;
  correlativo: string;
  empresa_id: string;
  accionista_id: string;
  tipo_flujo: TipoFlujo;
  tipo_activo: TipoActivo;
  monto_original: number;
  tasa_bcv_fecha: number;
  monto_indexado_usd: number;
  monto_indexado_ves: number;
  aplica_interes: boolean;
  tasa_interes?: number; // % mensual
  tasa_interes_anual?: number; // % anual
  tasa_moratoria?: number; // % anual de interés moratorio (ej. 3% nominal, 0.80% UVC, 2% divisas)
  modalidad_tasa?: 'nominal_bcv_59' | 'indexada_uvc_16' | 'divisas_usd' | 'indexada_12_usd' | 'indexada_usd_12' | 'tasa_activa_bcv_menos_3' | 'activa_bcv_menos_3' | 'tasa_mercado_6_bancos_bcv' | 'gratuito_socio' | 'gratuito_societario' | 'personalizada';
  tipo_beneficiario_interes?: 'persona_natural_residente' | 'persona_juridica_domiciliada' | 'no_residente';
  porcentaje_retencion_islr?: number; // 5% (PN), 3% (PJ), 34% (No domiciliado) - Dto. 1808
  sujeto_iva?: boolean; // false por Art. 16 Num 3 LIVA (No sujeto)
  tasa_bcv_cierre_estimada?: number;
  // Campos de Blindaje Corporativo (Libro de Actas y Aprobación de Asamblea - Cláusula Séptima)
  acta_asamblea_id?: string;
  acta_asamblea_numero?: string;
  acta_asamblea_fecha?: string;
  libro_actas_paginas?: string; // Ej: "45 a la 48"
  registro_mercantil_tomo?: string; // Ej: "Tomo 142-A, Nro. 28"
  facultad_estatutaria_mutuo?: string; // Cláusula estatutaria específica de mutuo sin asamblea
  vinculo_relacion_partes?: string; // Detalle de la vinculación entre socios y empresas
  // Variables UVC (Resolución BCV 26-08-01, G.O.E. 7.073)
  monto_uvc?: number;
  idi_bcv_fecha?: number;
  plazo_meses: number;
  modalidad_contrato?: ModalidadContrato; // 'mutuo_simple' | 'linea_credito_rotativa'
  limite_linea_credito_usd?: number; // Techo máximo rotativo anual en USD
  limite_linea_credito_ves?: number; // Techo máximo rotativo anual en VES (ej. Bs. 600.000.000,00)
  fecha_inicio: string;
  fecha_vencimiento: string;
  destino_fondos: string;
  motivo_comercial?: string; // Obligatorio si empresa_a_socio
  estado: EstadoContrato;
  riesgo_dividendo_aceptado: boolean;
  saldo_pendiente: number;
  soporte: SoporteTransaccion;
}

export interface TransaccionBancaria {
  id: string;
  empresa_id: string;
  fecha: string;
  banco: string;
  referencia: string;
  concepto: string;
  monto: number;
  tipo: 'credito' | 'debito';
  estado_conciliacion: 'pendiente' | 'conciliado';
  contrato_vinculado_id?: string;
  sugerencia_socio_id?: string;
}

export interface CuentaAsiento {
  codigo: string;
  nombre: string;
  debito: number;
  credito: number;
}

export interface AsientoContable {
  id: string;
  contrato_id: string;
  fecha: string;
  sistema_destino: 'Saint' | 'Profit Plus' | 'Galac' | 'Excel';
  cuentas: CuentaAsiento[];
  glosa: string;
}

export interface CapitalizacionAcreencia {
  id: string;
  contrato_id: string;
  empresa_id: string;
  accionista_id: string;
  fecha_asamblea: string;
  monto_capitalizado_ves: number;
  monto_capitalizado_usd: number;
  capital_anterior_ves: number;
  capital_nuevo_ves: number;
  valor_nominal_accion_ves: number;
  numero_acciones_nuevas: number;
  total_acciones_accionista: number;
  nombre_comisario: string;
  cpc_comisario: string;
  uuid_acta: string;
}

export interface ReciboCupo {
  id: string;
  numero_recibo: string; // ej. RC-ONI-2026-0001
  numero_cupo: number; // 1 a 29
  contrato_id: string; // cont-oni-1
  contrato_correlativo: string; // LC-ONI-2026-0001
  empresa_id: string;
  beneficiario_id: string;
  fecha: string; // YYYY-MM-DD
  hora?: string;
  banco_emisor: string;
  cuenta_origen: string;
  cuenta_destino: string;
  referencia_bancaria: string;
  concepto: string;
  monto_ves: number;
  tasa_bcv: number;
  monto_usd: number;
  limite_linea_ves: number;
  acumulado_anterior_ves: number;
  acumulado_actual_ves: number;
  remanente_disponible_ves: number;
  porcentaje_consumido: number;
  tasa_interes_anual: number;
  tasa_interes_mensual: number;
  retencion_islr_porcentaje: number;
  hash_sha256?: string;
}

export interface ReciboPagoRecibido {
  id: string;
  numero_recibo: string; // ej. RP-ONI-2026-0001
  numero_pago: number; // 1 a 18
  contrato_id: string; // cont-oni-1
  contrato_correlativo: string; // LC-ONI-2026-0001
  empresa_id: string;
  pagador_id: string; // acc-manuel-becerra
  fecha: string; // YYYY-MM-DD
  hora?: string;
  banco_receptor: string;
  cuenta_receptora?: string;
  cuenta_emisora?: string;
  cuenta_origen?: string;
  cuenta_destino?: string;
  referencia_bancaria: string;
  concepto: string;
  monto_total_ves: number;
  tasa_bcv: number;
  monto_total_usd: number;
  dias_transcurridos: number;
  saldo_capital_anterior_ves: number;
  saldo_anterior_capital_ves: number;
  intereses_devengados_ves: number;
  intereses_pagados_ves: number;
  retencion_islr_porcentaje: number; // 5%
  porcentaje_retencion_islr: number;
  monto_retencion_islr_ves: number;
  interes_neto_percibido_ves: number;
  intereses_netos_ves: number;
  capital_amortizado_ves: number;
  nuevo_saldo_capital_ves: number;
  limite_linea_ves: number;
  cupo_restaurado_ves: number;
  cupo_disponible_actual_ves: number;
  porcentaje_linea_utilizado: number;
  tasa_interes_anual?: number;
  tasa_interes_mensual?: number;
  aplica_retencion_islr?: boolean;
  exento_iva?: boolean;
  hash_sha256?: string;
}

export type TipoMovimientoCruce = 'CUPO_DISPOSICION' | 'PAGO_AMORTIZACION';

export interface MovimientoCrucePeriodico {
  correlativo: number; // 1 a 47
  fecha: string; // YYYY-MM-DD
  tipo: TipoMovimientoCruce;
  recibo_codigo: string; // RC-ONI-2026-XXXX o RP-ONI-2026-XXXX
  referencia_bancaria: string;
  concepto: string;
  debito_cupo_ves: number; // Disposición de fondos / Desembolso (incrementa deuda)
  pago_total_recibido_ves: number; // Entrada total a banco
  intereses_pagados_ves: number; // Porción asignada a intereses
  retencion_islr_ves: number; // Retención del 5% s/intereses
  credito_capital_ves: number; // Amortización a capital (reduce deuda)
  saldo_capital_vivo_ves: number; // Saldo deudor resultante
  limite_linea_ves: number; // Bs. 600.000.000,00
  cupo_disponible_ves: number; // Cupo restante en la línea
  porcentaje_utilizado: number;
  tasa_bcv: number;
  saldo_capital_usd: number;
  recibo_origen_id: string;
}
