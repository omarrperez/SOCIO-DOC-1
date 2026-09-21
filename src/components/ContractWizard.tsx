import React, { useState } from 'react';
import { Empresa, Accionista, ActaAsamblea, ContratoMutuo, TipoFlujo, TipoActivo, SoporteTransaccion, ModalidadContrato } from '../types';
import { formatVES, formatUSD, formatUSDT, generarHashSimulado } from '../utils/formatters';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Coins, 
  Receipt, 
  Check, 
  X,
  Sparkles,
  Link as LinkIcon,
  FileText,
  ShieldCheck,
  Percent,
  BookOpen,
  Landmark,
  Scale,
  Info
} from 'lucide-react';

interface ContractWizardProps {
  isOpen: boolean;
  onClose: () => void;
  empresas: Empresa[];
  selectedEmpresa: Empresa;
  accionistas: Accionista[];
  actas: ActaAsamblea[];
  tasaBCV: number;
  onSaveContract: (nuevoContrato: ContratoMutuo) => void;
  onOpenCreateActa: () => void;
}

export const ContractWizard: React.FC<ContractWizardProps> = ({
  isOpen,
  onClose,
  empresas,
  selectedEmpresa,
  accionistas,
  actas,
  tasaBCV,
  onSaveContract,
  onOpenCreateActa,
}) => {
  // Wizard Steps: 1: Tipo & Partes, 2: Moneda & Monto, 3: Datos de Soporte & Alertas, 4: Confirmación & Sello
  const [step, setStep] = useState<number>(1);

  // Form State
  const [accionistaId, setAccionistaId] = useState<string>(
    accionistas.filter(a => a.empresa_id === selectedEmpresa.id)[0]?.id || ''
  );
  const [tipoFlujo, setTipoFlujo] = useState<TipoFlujo>('socio_a_empresa');
  const [modalidadContrato, setModalidadContrato] = useState<ModalidadContrato>('mutuo_simple');
  const [limiteLineaCreditoUSD, setLimiteLineaCreditoUSD] = useState<number>(20000);
  const [regimenInteres, setRegimenInteres] = useState<'gratuito' | 'con_intereses'>('gratuito');
  const [tipoActivo, setTipoActivo] = useState<TipoActivo>('USD_EFECTIVO');
  const [monto, setMonto] = useState<number>(5000);
  const [plazoMeses, setPlazoMeses] = useState<number>(12);
  const [tasaInteres, setTasaInteres] = useState<number>(1.5);
  const [destinoFondos, setDestinoFondos] = useState<string>('Capital de trabajo y adquisición de inventarios para reposición.');
  const [motivoComercial, setMotivoComercial] = useState<string>('');
  
  // Soporte Fields
  const [bancoOrigen, setBancoOrigen] = useState<string>('Banesco Banco Universal');
  const [bancoDestino, setBancoDestino] = useState<string>('Banco Mercantil');
  const [cuentaOrigen, setCuentaOrigen] = useState<string>('0134-0012-34-1234567890');
  const [cuentaDestino, setCuentaDestino] = useState<string>('0105-0114-88-9876543210');
  const [referenciaBancaria, setReferenciaBancaria] = useState<string>('REF-' + Math.floor(1000000000 + Math.random() * 9000000000));
  
  // Crypto fields
  const [walletOrigen, setWalletOrigen] = useState<string>('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbXdf');
  const [walletDestino, setWalletDestino] = useState<string>('TCorp' + selectedEmpresa.razon_social.substring(0, 10).replace(/\s/g, '') + 'Treasury77X');
  const [redBlockchain, setRedBlockchain] = useState<string>('TRON (TRC-20)');
  const [txidBlockchain, setTxidBlockchain] = useState<string>('e4d812390a7865bc12ef89345091a2345bcdef901234567890abcdef' + Math.floor(10000000 + Math.random() * 90000000));

  // Risk Acceptance
  const [riesgoDividendoAceptado, setRiesgoDividendoAceptado] = useState<boolean>(false);
  const [showRedAlertModal, setShowRedAlertModal] = useState<boolean>(false);

  // Interest Modalities & Parameters (Blindaje SENIAT Art. 73 LISLR)
  const [modalidadTasa, setModalidadTasa] = useState<'nominal_bcv_59' | 'indexada_uvc_16' | 'divisas_usd' | 'personalizada'>('nominal_bcv_59');
  const [tasaNominalBCV, setTasaNominalBCV] = useState<number>(59.12);
  const [tasaUVC, setTasaUVC] = useState<number>(16.0);
  const [tasaDivisasUSD, setTasaDivisasUSD] = useState<number>(12.0);
  const [idiBCV, setIdiBCV] = useState<number>(250.0);
  const [tasaMoratoria, setTasaMoratoria] = useState<number>(3.0);

  // Corporate Assembly Linking (Cláusula Séptima - Libro de Actas de Asambleas)
  const empresaActas = actas.filter(a => a.empresa_id === selectedEmpresa.id);
  const hasActa = empresaActas.length > 0;
  const currentAccionistas = accionistas.filter(a => a.empresa_id === selectedEmpresa.id);
  const selectedAccionista = currentAccionistas.find(a => a.id === accionistaId) || currentAccionistas[0];

  const [actaId, setActaId] = useState<string>(empresaActas[0]?.id || '');
  const [actaNumero, setActaNumero] = useState<string>(empresaActas[0]?.numero_acta || 'ASAM-EXT-2026-01');
  const [actaFecha, setActaFecha] = useState<string>(empresaActas[0]?.fecha_asamblea || '2026-01-15');
  const [libroPaginas, setLibroPaginas] = useState<string>(empresaActas[0]?.libro_paginas || '45 a la 48');
  const [registroTomo, setRegistroTomo] = useState<string>(empresaActas[0]?.registro_mercantil_asiento || selectedEmpresa.registro_mercantil);

  if (!isOpen) return null;

  // Calculations
  const montoIndexadoUSD = tipoActivo === 'VES' ? monto / tasaBCV : monto;
  const montoIndexadoVES = tipoActivo === 'VES' ? monto : monto * tasaBCV;
  const aplicaIGTF = selectedEmpresa.tipo_contribuyente === 'Especial' && (tipoActivo === 'USD_EFECTIVO' || tipoActivo === 'USDT');
  const igtfMontoUSD = aplicaIGTF ? montoIndexadoUSD * 0.03 : 0;
  const igtfMontoVES = aplicaIGTF ? montoIndexadoVES * 0.03 : 0;

  // Calculation of effective rates based on selected modality:
  let tasaInteresAnualEfectiva = 0;
  let tasaInteresMensualEfectiva = 0;
  let tasaMoraEfectiva = tasaMoratoria;
  let modalidadTasaString: ContratoMutuo['modalidad_tasa'] = 'gratuito_societario';

  if (regimenInteres === 'con_intereses') {
    if (modalidadTasa === 'nominal_bcv_59') {
      tasaInteresAnualEfectiva = tasaNominalBCV;
      tasaInteresMensualEfectiva = parseFloat((tasaNominalBCV / 12).toFixed(2));
      tasaMoraEfectiva = 3.0;
      modalidadTasaString = 'activa_bcv_menos_3'; // nominal variable BCV Art. 73 LISLR
    } else if (modalidadTasa === 'indexada_uvc_16') {
      tasaInteresAnualEfectiva = tasaUVC;
      tasaInteresMensualEfectiva = parseFloat((tasaUVC / 12).toFixed(2));
      tasaMoraEfectiva = 0.80;
      modalidadTasaString = 'indexada_uvc_16';
    } else if (modalidadTasa === 'divisas_usd') {
      tasaInteresAnualEfectiva = tasaDivisasUSD;
      tasaInteresMensualEfectiva = parseFloat((tasaDivisasUSD / 12).toFixed(2));
      tasaMoraEfectiva = 2.0;
      modalidadTasaString = 'divisas_usd';
    } else {
      // personalizada
      tasaInteresMensualEfectiva = tasaInteres;
      tasaInteresAnualEfectiva = parseFloat((tasaInteres * 12).toFixed(2));
      tasaMoraEfectiva = tasaMoratoria;
      modalidadTasaString = 'personalizada';
    }
  }

  const montoUVCCalculado = montoIndexadoVES / (idiBCV > 0 ? idiBCV : 250);

  const handleNextFromStep1 = () => {
    if (tipoFlujo === 'empresa_a_socio' && !riesgoDividendoAceptado) {
      setShowRedAlertModal(true);
      return;
    }
    setStep(2);
  };

  const handleConfirmSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + plazoMeses);
    const expiryStr = expiry.toISOString().split('T')[0];

    const correlativoNum = Math.floor(1000 + Math.random() * 9000);
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 'c-' + Date.now();
    const hashDoc = generarHashSimulado(`${selectedEmpresa.rif_empresa}-${selectedAccionista?.rif_accionista}-${monto}-${today}`);

    const nuevoSoporte: SoporteTransaccion = {
      id: 'sop-' + Date.now(),
      contrato_id: 'cont-' + Date.now(),
      tipo_soporte: tipoActivo === 'USD_EFECTIVO' ? 'efectivo_caja' : (tipoActivo === 'USDT' ? 'blockchain_txid' : 'bancario'),
      referencia_bancaria: tipoActivo !== 'USD_EFECTIVO' && tipoActivo !== 'USDT' ? referenciaBancaria : undefined,
      banco_origen: tipoActivo !== 'USD_EFECTIVO' && tipoActivo !== 'USDT' ? bancoOrigen : undefined,
      banco_destino: tipoActivo !== 'USD_EFECTIVO' && tipoActivo !== 'USDT' ? bancoDestino : undefined,
      numero_cuenta_origen: tipoActivo !== 'USD_EFECTIVO' && tipoActivo !== 'USDT' ? cuentaOrigen : undefined,
      numero_cuenta_destino: tipoActivo !== 'USD_EFECTIVO' && tipoActivo !== 'USDT' ? cuentaDestino : undefined,
      wallet_origen: tipoActivo === 'USDT' ? walletOrigen : undefined,
      wallet_destino: tipoActivo === 'USDT' ? walletDestino : undefined,
      red_blockchain: tipoActivo === 'USDT' ? redBlockchain : undefined,
      txid_blockchain: tipoActivo === 'USDT' ? txidBlockchain : undefined,
      recibo_caja_correlativo: tipoActivo === 'USD_EFECTIVO' ? `REC-2026-${correlativoNum}` : undefined,
      fecha_transaccion: today,
      hora_transaccion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hash_documento_sha256: hashDoc,
      txhash_blockchain_polygon: '0x' + generarHashSimulado('poly-' + Date.now()),
      block_number: 63100000 + Math.floor(Math.random() * 50000),
      timestamp_iso: new Date().toISOString(),
      igtf_aplica: aplicaIGTF,
      igtf_monto_usd: igtfMontoUSD,
      igtf_monto_ves: igtfMontoVES,
    };

    const nuevoContrato: ContratoMutuo = {
      id: 'cont-' + Date.now(),
      uuid_publico: uuid,
      correlativo: `MUT-2026-${correlativoNum}`,
      empresa_id: selectedEmpresa.id,
      accionista_id: selectedAccionista?.id || accionistaId,
      tipo_flujo: tipoFlujo,
      modalidad_contrato: modalidadContrato,
      limite_linea_credito_usd: modalidadContrato === 'linea_credito_rotativa' ? limiteLineaCreditoUSD : undefined,
      tipo_activo: tipoActivo,
      monto_original: monto,
      tasa_bcv_fecha: tasaBCV,
      monto_indexado_usd: montoIndexadoUSD,
      monto_indexado_ves: montoIndexadoVES,
      aplica_interes: regimenInteres === 'con_intereses',
      tasa_interes: regimenInteres === 'con_intereses' ? tasaInteresMensualEfectiva : undefined,
      tasa_interes_anual: regimenInteres === 'con_intereses' ? tasaInteresAnualEfectiva : undefined,
      tasa_moratoria: regimenInteres === 'con_intereses' ? tasaMoraEfectiva : undefined,
      modalidad_tasa: modalidadTasaString,
      tipo_beneficiario_interes: 'persona_natural_residente',
      porcentaje_retencion_islr: regimenInteres === 'con_intereses' ? 5 : undefined,
      sujeto_iva: false,
      plazo_meses: plazoMeses,
      fecha_inicio: today,
      fecha_vencimiento: expiryStr,
      destino_fondos: destinoFondos,
      motivo_comercial: tipoFlujo === 'empresa_a_socio' ? motivoComercial : undefined,
      estado: 'activo',
      riesgo_dividendo_aceptado: riesgoDividendoAceptado,
      saldo_pendiente: monto,
      soporte: nuevoSoporte,
      // Corporate Assembly linking metadata (Cláusula Séptima)
      acta_asamblea_id: actaId || (empresaActas[0]?.id || undefined),
      acta_asamblea_numero: actaNumero,
      acta_asamblea_fecha: actaFecha,
      libro_actas_paginas: libroPaginas,
      registro_mercantil_tomo: registroTomo,
      monto_uvc: modalidadTasa === 'indexada_uvc_16' ? montoUVCCalculado : undefined,
      idi_bcv_fecha: idiBCV,
    };

    onSaveContract(nuevoContrato);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Emisión de Contrato de Mutuo Blindado
              </h2>
              <p className="text-xs text-slate-500">
                Paso {step} de 4 • Empresa: <span className="text-slate-800 font-semibold">{selectedEmpresa.razon_social.substring(0, 32)}...</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assembly Minute Requirement Alert if none exists */}
        {!hasActa && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-900 block">Falta Acta de Asamblea Macro de Socios</strong>
                <span>
                  Para que este contrato tenga pleno valor legal frente al SENIAT, la Junta Directiva debe contar con la autorización previa del máximo órgano de la empresa asentada en su Libro de Actas físico.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCreateActa();
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              Generar Acta Ahora
            </button>
          </div>
        )}

        {/* Wizard Stepper Progress Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-700 font-semibold' : 'text-slate-500 font-medium'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Tipo de Flujo</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-700 font-semibold' : 'text-slate-500 font-medium'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Moneda & Monto</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-700 font-semibold' : 'text-slate-500 font-medium'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Soporte & Alertas</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-blue-700 font-semibold' : 'text-slate-500 font-medium'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
            <span>Sello Digital</span>
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          
          {/* STEP 1: PARTES Y TIPO DE FLUJO */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Seleccione el Accionista Interviniente:
                </label>
                <select
                  value={accionistaId}
                  onChange={(e) => setAccionistaId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                >
                  {currentAccionistas.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nombre_accionista} • C.I. {acc.cedula_accionista} {acc.es_accionista === false || acc.porcentaje_acciones === 0 ? `(${acc.cargo_o_condicion || 'Director / Gerente'} - 0% Acciones)` : `(${acc.porcentaje_acciones}% acciones)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Dirección del Flujo de Fondos (Determinación Fiscal):
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  
                  {/* Option 1: Socio a Empresa (90% case) */}
                  <div
                    onClick={() => {
                      setTipoFlujo('socio_a_empresa');
                      setRegimenInteres('gratuito');
                      setRiesgoDividendoAceptado(false);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      tipoFlujo === 'socio_a_empresa'
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Accionista Inyecta a la Empresa
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Cuentas por Pagar (90%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal mb-2">
                      El socio aporta capital de trabajo para cubrir gastos o nómina. 
                    </p>
                    <div className="p-2.5 bg-white rounded-lg text-[10px] text-slate-600 border border-emerald-200/80">
                      🛡️ <strong>Protección SENIAT:</strong> Evita que el fiscal califique este ingreso bancario como <span className="text-amber-800 font-semibold">Ventas Omitidas</span> con reparo de IVA e ISLR.
                    </div>
                  </div>

                  {/* Option 2: Empresa a Socio (High Risk Dividendo Presunto) */}
                  <div
                    onClick={() => {
                      setTipoFlujo('empresa_a_socio');
                      setRegimenInteres('con_intereses');
                      setShowRedAlertModal(true);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      tipoFlujo === 'empresa_a_socio'
                        ? 'border-rose-500 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Empresa Presta al Accionista
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        Cuentas por Cobrar (Alto Riesgo)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal mb-2">
                      Salida de dinero de la cuenta de la empresa a favor del accionista.
                    </p>
                    <div className="p-2.5 bg-white rounded-lg text-[10px] text-rose-800 border border-rose-200">
                      🚨 <strong>Alerta Roja Art. 72 LISLR:</strong> Riesgo de imputación de <span className="font-bold underline">Dividendo Presunto</span> (retención del 34% inmediata por el SENIAT).
                    </div>
                  </div>

                </div>
              </div>

              {/* Modalidad Jurídica del Contrato (cuando la empresa presta al socio) */}
              {tipoFlujo === 'empresa_a_socio' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-600" />
                      Estrategia Legal & Notarial (Ahorro de Costos SAREN):
                    </label>
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      Recomendación SENIAT 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Option A: Contrato Individual */}
                    <div
                      onClick={() => setModalidadContrato('mutuo_simple')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        modalidadContrato === 'mutuo_simple'
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          1. Préstamo Individual
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">1 Notaría x Retiro</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Para operaciones únicas o muy esporádicas. Cada desembolso requiere redactar y notariar un contrato por separado.
                      </p>
                    </div>

                    {/* Option B: Línea de Crédito Rotativa */}
                    <div
                      onClick={() => setModalidadContrato('linea_credito_rotativa')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        modalidadContrato === 'linea_credito_rotativa'
                          ? 'border-indigo-600 bg-indigo-50/80 shadow-2xs ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          2. Línea Crédito Rotativa
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          1 Sola Notaría Anual
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong>Ideal para múltiples transferencias al mes (ej: 20 retiros).</strong> Un solo contrato marco anual, liquidado con Memoria de Cálculo y Nota de Débito mensual.
                      </p>
                    </div>
                  </div>

                  {modalidadContrato === 'linea_credito_rotativa' && (
                    <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-indigo-950">
                          Techo Máximo Autorizado para la Línea de Crédito (USD):
                        </label>
                        <div className="relative w-36">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                          <input
                            type="number"
                            value={limiteLineaCreditoUSD}
                            onChange={(e) => setLimiteLineaCreditoUSD(Number(e.target.value))}
                            className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-right focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="20000"
                          />
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-tight">
                        💡 Las transferencias bancarias que se hagan al socio durante el año consumirán y liberarán disponibilidad dentro de este límite sin volver a la Notaría.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Destination of funds */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Destino Específico de los Fondos (Cláusula de Justificación):
                </label>
                <textarea
                  rows={2}
                  value={destinoFondos}
                  onChange={(e) => setDestinoFondos(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  placeholder="Ej: Reposición de inventario, pago de fletes o mantenimiento operativo..."
                />
              </div>

              {tipoFlujo === 'empresa_a_socio' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1.5">
                    * Motivo Comercial / Corporativo Estricto (Obligatorio Art. 72 LISLR):
                  </label>
                  <input
                    type="text"
                    value={motivoComercial}
                    onChange={(e) => setMotivoComercial(e.target.value)}
                    placeholder="Justifique por qué la empresa otorga este préstamo para sus propios fines de negocio"
                    className="w-full bg-rose-50 border border-rose-300 rounded-xl px-3.5 py-2.5 text-xs text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

            </div>
          )}

          {/* STEP 2: MONEDA, ACTIVO Y CONDICIONES FINANCIERAS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Tipo de Activo o Moneda del Préstamo:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  <button
                    type="button"
                    onClick={() => setTipoActivo('USD_EFECTIVO')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      tipoActivo === 'USD_EFECTIVO'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">USD en Efectivo</div>
                    <div className="text-[10px] text-slate-500">Emite Recibo de Caja + IGTF</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoActivo('USD_TRANSFERENCIA')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      tipoActivo === 'USD_TRANSFERENCIA'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">USD Bancario</div>
                    <div className="text-[10px] text-slate-500">Cta. Divisas Nacional</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoActivo('VES')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      tipoActivo === 'VES'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Bolívares (VES)</div>
                    <div className="text-[10px] text-slate-500">Indexado a Tasa BCV</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoActivo('USDT')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      tipoActivo === 'USDT'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">USDT (Cripto)</div>
                    <div className="text-[10px] text-slate-500">Bien Incorpóreo + TXID</div>
                  </button>

                </div>
              </div>

              {/* Amount and BCV Rate details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Monto Original ({tipoActivo === 'VES' ? 'Bolívares Bs.' : (tipoActivo === 'USDT' ? 'Tokens USDT' : 'Dólares $ USD')}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={monto}
                    onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Equivalencia oficial: <strong className="text-blue-700">{tipoActivo === 'VES' ? formatUSD(montoIndexadoUSD) : formatVES(montoIndexadoVES)}</strong> (Tasa BCV: Bs. {tasaBCV.toFixed(2)})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Plazo de Devolución (Meses):
                  </label>
                  <select
                    value={plazoMeses}
                    onChange={(e) => setPlazoMeses(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value={3}>3 Meses (Recomendado para préstamos a socios)</option>
                    <option value={6}>6 Meses</option>
                    <option value={12}>12 Meses (1 Año calendario)</option>
                    <option value={24}>24 Meses</option>
                  </select>
                </div>
              </div>

              {/* Interest Rules & Fiscal Shielding (Blindaje SENIAT Art. 73 LISLR) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Régimen de Intereses y Blindaje Fiscal:</span>
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg font-mono border ${
                    regimenInteres === 'gratuito'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {regimenInteres === 'gratuito'
                      ? 'Gratuito (Sin Intereses Corrientes)'
                      : (modalidadTasa === 'nominal_bcv_59' 
                          ? `Nominal Variable BCV (${tasaNominalBCV}% Anual)` 
                          : (modalidadTasa === 'indexada_uvc_16' 
                              ? `Indexada UVC (${tasaUVC}% Anual)` 
                              : (modalidadTasa === 'divisas_usd' 
                                  ? `Divisas USD (${tasaDivisasUSD}% Anual)` 
                                  : `Personalizada (${(tasaInteres * 12).toFixed(1)}% Anual)`)))}
                  </span>
                </div>

                {/* Primary Selection: Gratuito vs Con Intereses Corrientes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Option 1: Gratuito sin intereses corrientes */}
                  <button
                    type="button"
                    onClick={() => setRegimenInteres('gratuito')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      regimenInteres === 'gratuito'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-semibold ring-2 ring-blue-300 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${regimenInteres === 'gratuito' ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-300'}`} />
                        Gratuito (Sin Intereses Corrientes)
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold font-mono">
                        Tasa 0%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Se pacta expresamente a <strong>título gratuito</strong> (Art. 1.745 Código Civil) para fines de apalancamiento operativo. Operación <strong>NO SUJETA A IVA</strong> (Art. 16 Num. 3 LIVA). Requiere reintegro o rendición de cuentas antes del cierre fiscal para evitar presunciones bajo Art. 72 LISLR.
                    </p>
                  </button>

                  {/* Option 2: Con intereses corrientes */}
                  <button
                    type="button"
                    onClick={() => setRegimenInteres('con_intereses')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      regimenInteres === 'con_intereses'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-300 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${regimenInteres === 'con_intereses' ? 'bg-emerald-600 ring-2 ring-emerald-200' : 'bg-slate-300'}`} />
                        Con Intereses Corrientes
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold font-mono">
                        Remunerado (Art. 73)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Operación retribuida con devengo de intereses bancarios. Es el blindaje pleno exigido por el <strong>Art. 73 de la LISLR</strong> para evitar que el SENIAT determine ingresos omitidos o presuma dividendos fictos (34% más sanciones).
                    </p>
                  </button>
                </div>

                {/* Sub-Panel: When Gratuito is selected */}
                {regimenInteres === 'gratuito' && (
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-semibold">Cláusula de Gratuidad Expresa (Art. 1.745 CC):</strong>{' '}
                        El contrato estipula formalmente que el mutuo se otorga sin devengo de intereses corrientes ordinarios en virtud del vínculo fiduciario con la sociedad.
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        • <strong>Impuesto al Valor Agregado:</strong> NO SUJETO (Art. 16 Num. 3 LIVA).
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        • <strong>Retenciones de ISLR:</strong> No aplica al no existir pago o abono en cuenta de intereses (Decreto 1.808).
                      </div>
                    </div>

                    {tipoFlujo === 'empresa_a_socio' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2 mt-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Advertencia SENIAT (Préstamos a Socios):</strong> De conformidad con el Artículo 73 de la LISLR, la Administración Tributaria presume un rendimiento mínimo equivalente a la tasa activa del BCV si el dinero no es restituido o liquidado antes del cierre del ejercicio económico de la sociedad. Si desea blindaje total contra reparos, seleccione <em>Con Intereses Corrientes</em>.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Panel: When Con Intereses Corrientes is selected */}
                {regimenInteres === 'con_intereses' && (
                  <div className="space-y-3.5 bg-white p-4 rounded-xl border border-emerald-100">
                    
                    {/* Legal Framework Clarification Box - Addressing the "3 points less" misconception */}
                    <div className="p-3 bg-blue-50/90 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <span>Aclaratoria Legal SENIAT: La regla de «3 puntos menos» no aplica en Venezuela</span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          En Venezuela <strong>no existe</strong> ninguna norma que permita prestar a socios con «3 puntos menos» que la banca (esa regla pertenece al Art. 35 del Estatuto Tributario de Colombia). En Venezuela rige el <strong>Artículo 73 de la LISLR</strong>, el cual presume como rendimiento mínimo legal la <strong>Tasa Activa Promedio Ponderada de los 6 principales bancos fijada por el BCV</strong>. Si se pacta una tasa inferior, el SENIAT liquida de oficio los ingresos omitidos y aplica sanciones.
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      Seleccione la Modalidad de Tasa Aprobada para el Contrato:
                    </div>

                    {/* 4 Modalities Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      
                      {/* Modality 1: Nominal Variable BCV */}
                      <button
                        type="button"
                        onClick={() => {
                          setModalidadTasa('nominal_bcv_59');
                          setTasaMoratoria(3.0);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalidadTasa === 'nominal_bcv_59'
                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-300'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>Tasa Nominal Variable BCV</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-mono">
                            ~{tasaNominalBCV}% Anual
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Tasa Activa BCV 6 principales bancos (Art. 73 LISLR). Para bolívares nominales. Se ajusta mensualmente según variaciones oficiales. Mora: <strong>3.0% anual</strong>.
                        </div>
                      </button>

                      {/* Modality 2: Indexada en UVC */}
                      <button
                        type="button"
                        onClick={() => {
                          setModalidadTasa('indexada_uvc_16');
                          setTasaMoratoria(0.80);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalidadTasa === 'indexada_uvc_16'
                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-300'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>Indexada UVC (16% Anual)</span>
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Recomendada</span>
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-mono">
                            UVC BCV
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Resolución BCV 26-08-01 (G.O.E. 7.073). Protege el patrimonio en Unidades de Valor de Crédito con tasa mínima legal del <strong>16% anual</strong>. Mora: <strong>0.80% anual</strong>.
                        </div>
                      </button>

                      {/* Modality 3: Divisas USD */}
                      <button
                        type="button"
                        onClick={() => {
                          setModalidadTasa('divisas_usd');
                          setTasaMoratoria(2.0);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalidadTasa === 'divisas_usd'
                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-2 ring-emerald-300'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>Operación en Divisas USD</span>
                          <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-mono">
                            {tasaDivisasUSD}% Anual
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Tasa fija de mercado en dólares (1.0% mensual / 12% anual). Conforme a directrices TSJ y libre convertibilidad. Mora: <strong>2.0% anual</strong>.
                        </div>
                      </button>

                      {/* Modality 4: Personalizada */}
                      <button
                        type="button"
                        onClick={() => {
                          setModalidadTasa('personalizada');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalidadTasa === 'personalizada'
                            ? 'border-blue-500 bg-blue-50/80 text-blue-950 font-semibold ring-2 ring-blue-300'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>Tasa Libre Personalizada</span>
                          <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-mono">
                            Convenio
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Pactada libremente entre las partes según acuerdo estatutario particular o condiciones específicas del préstamo.
                        </div>
                      </button>
                    </div>

                    {/* Modality Interactive Controls */}
                    {modalidadTasa === 'nominal_bcv_59' && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <label className="font-semibold text-emerald-950">
                            Tasa Activa Promedio 6 Principales Bancos BCV (% Anual):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="1"
                              max="120"
                              value={tasaNominalBCV}
                              onChange={(e) => setTasaNominalBCV(parseFloat(e.target.value) || 0)}
                              className="w-24 bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                            />
                            <span className="text-[11px] text-slate-600 font-mono">
                              (~{(tasaNominalBCV / 12).toFixed(2)}% mensual)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                          <span>Interés Moratorio adicional por retraso:</span>
                          <span className="font-mono font-semibold text-slate-900">3.00% Anual</span>
                        </div>
                      </div>
                    )}

                    {modalidadTasa === 'indexada_uvc_16' && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-700 block text-[11px] font-semibold mb-1">
                              Índice de Inversión (IDI) BCV a la fecha:
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                value={idiBCV}
                                onChange={(e) => setIdiBCV(parseFloat(e.target.value) || 250)}
                                className="w-28 bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                              />
                              <span className="text-[11px] text-slate-500 font-mono">Bs./UVC</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-slate-700 block text-[11px] font-semibold mb-1">
                              Equivalencia Inicial en UVC:
                            </label>
                            <div className="p-1.5 bg-white border border-emerald-200 rounded-lg font-mono font-bold text-emerald-800 text-xs">
                              {montoUVCCalculado.toFixed(2)} UVC
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                          <span>Tasa compensatoria fija: <strong>16.00% anual</strong></span>
                          <span>Interés moratorio UVC: <strong>0.80% anual</strong></span>
                        </div>
                      </div>
                    )}

                    {modalidadTasa === 'divisas_usd' && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium">Tasa Compensatoria en Moneda Extranjera:</span>
                          <span className="font-mono font-bold text-emerald-800">12.0% Anual (1.0% Mensual)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                          <span>Interés Moratorio en Divisas:</span>
                          <span className="font-mono font-semibold text-slate-900">2.00% Anual</span>
                        </div>
                      </div>
                    )}

                    {modalidadTasa === 'personalizada' && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-700 block text-[11px] font-semibold mb-1">
                              Tasa Mensual (%):
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="25"
                              value={tasaInteres}
                              onChange={(e) => setTasaInteres(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono"
                            />
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              Equiv. {(tasaInteres * 12).toFixed(1)}% Anual
                            </span>
                          </div>
                          <div>
                            <label className="text-slate-700 block text-[11px] font-semibold mb-1">
                              Tasa Moratoria (% Anual):
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="15"
                              value={tasaMoratoria}
                              onChange={(e) => setTasaMoratoria(parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tax Enforcement Matrix */}
                    <div className="text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>• <strong>No Sujeción a IVA:</strong> Art. 16 Numeral 3 LIVA (Emisión de Nota de Débito No Sujeta)</span>
                        <span className="text-emerald-700 font-bold">No Sujeto / Exento</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• <strong>Retención ISLR:</strong> 5% Persona Natural Residente (Decreto 1.808, Art. 9 Num. 8)</span>
                        <span className="text-slate-800 font-mono font-semibold">Al pago o abono</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• <strong>Impacto Patrimonial:</strong> Cuentas por Cobrar Socios excluidas de Ajuste por Inflación Fiscal</span>
                        <span className="text-blue-700 font-medium">Blindado Art. 73 LISLR</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* IGTF Alert & Calculation if applicable */}
              {aplicaIGTF && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Coins className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 block font-semibold">Sujeción al IGTF (3% Grandes Transacciones Financieras)</strong>
                    <span>
                      La empresa es Sujeto Pasivo Especial y está percibiendo divisas/criptos fuera del sistema bancario nacional. Monto estimado de IGTF a percibir y enterar al SENIAT: <strong className="text-amber-900 font-mono">{formatUSD(igtfMontoUSD)} ({formatVES(igtfMontoVES)})</strong>.
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: PROBATORIA (BANCO / CAJA / BLOCKCHAIN) */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <div className="text-xs text-slate-600 mb-1 font-medium">
                Ingrese los datos probatorios verificables requeridos por el SENIAT para dar plena certeza a la transacción:
              </div>

              {tipoActivo === 'USD_EFECTIVO' ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>Emisión de Recibo de Ingreso a Caja Principal Automático</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    El sistema generará el correlativo oficial numerado de caja con las cuentas contables VEN-NIF correspondientes para la firma física del cajero y el accionista.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Correlativo Control Interno:</span>
                      <span className="font-mono text-slate-900 font-bold">REC-2026-0042</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Cuenta Débito VEN-NIF:</span>
                      <span className="font-mono text-slate-900">1.01.01.02 Caja M.E.</span>
                    </div>
                  </div>
                </div>
              ) : tipoActivo === 'USDT' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Red Blockchain Descentralizada:
                    </label>
                    <select
                      value={redBlockchain}
                      onChange={(e) => setRedBlockchain(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="TRON (TRC-20)">TRON (TRC-20) - Estándar comercial en Venezuela</option>
                      <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                      <option value="Polygon (PoS)">Polygon Network</option>
                      <option value="BNB Smart Chain (BEP-20)">BNB Smart Chain (BEP-20)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Dirección Wallet Origen (Mutuante):
                    </label>
                    <input
                      type="text"
                      value={walletOrigen}
                      onChange={(e) => setWalletOrigen(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Dirección Wallet Destino Corporativa (Mutuaria):
                    </label>
                    <input
                      type="text"
                      value={walletDestino}
                      onChange={(e) => setWalletDestino(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Hash de Transacción Blockchain (TXID Obligatorio):
                    </label>
                    <input
                      type="text"
                      value={txidBlockchain}
                      onChange={(e) => setTxidBlockchain(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-emerald-700 font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Banco Origen:
                    </label>
                    <input
                      type="text"
                      value={bancoOrigen}
                      onChange={(e) => setBancoOrigen(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Banco Destino de la Empresa:
                    </label>
                    <input
                      type="text"
                      value={bancoDestino}
                      onChange={(e) => setBancoDestino(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cuenta Origen (20 dígitos):
                    </label>
                    <input
                      type="text"
                      value={cuentaOrigen}
                      onChange={(e) => setCuentaOrigen(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cuenta Destino (20 dígitos):
                    </label>
                    <input
                      type="text"
                      value={cuentaDestino}
                      onChange={(e) => setCuentaDestino(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Número de Referencia Bancaria (Clave de Matching SENIAT):
                    </label>
                    <input
                      type="text"
                      value={referenciaBancaria}
                      onChange={(e) => setReferenciaBancaria(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-blue-700 font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Corporate Approval & Libro de Actas de Asambleas (Cláusula Séptima - Blindaje SENIAT) */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Aprobación Corporativa en Asamblea (Cláusula Séptima - Blindaje SENIAT)</span>
                  </div>
                  {empresaActas.length > 0 && (
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-md border border-purple-200">
                      {empresaActas.length} Acta(s) Registrada(s)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-purple-900 leading-relaxed">
                  Para desvirtuar la calificación de <strong>«Dividendo Encubierto»</strong> y sustentar la causalidad del mutuo ante el SENIAT, el préstamo debe estar expresamente aprobado en una <strong>Asamblea Extraordinaria de Accionistas</strong> y asentado en el <strong>Libro de Actas de Asambleas</strong>.
                </p>

                {/* Quick Select from Existing Actas */}
                {empresaActas.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-semibold text-purple-950 block">
                      Vincular Acta de Asamblea Existente:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {empresaActas.map((acta) => {
                        const isSelected = actaId === acta.id || (!actaId && acta.numero_acta === actaNumero);
                        return (
                          <button
                            key={acta.id}
                            type="button"
                            onClick={() => {
                              setActaId(acta.id);
                              setActaNumero(acta.numero_acta);
                              setActaFecha(acta.fecha_asamblea);
                              if (acta.libro_paginas) setLibroPaginas(acta.libro_paginas);
                              if (acta.registro_mercantil_asiento) setRegistroTomo(acta.registro_mercantil_asiento);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                              isSelected
                                ? 'border-purple-600 bg-white ring-2 ring-purple-300 shadow-2xs'
                                : 'border-purple-200 bg-white/60 hover:bg-white text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{acta.numero_acta}</span>
                              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                                {acta.fecha_asamblea}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                              <span>Páginas: {acta.libro_paginas || '45 a la 48'}</span>
                              <span className="text-emerald-700 font-semibold">{acta.estatus_libro_fisico ? 'Asentada en Libro' : 'Pendiente'}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/80 border border-purple-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-600 text-[11px]">
                      No hay actas registradas para esta empresa. Puede ingresar los datos manualmente o redactar una nueva.
                    </span>
                    <button
                      type="button"
                      onClick={onOpenCreateActa}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
                    >
                      + Redactar Acta
                    </button>
                  </div>
                )}

                {/* Editable Assembly & Book details for Cláusula Séptima */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      * Número / Identificador del Acta:
                    </label>
                    <input
                      type="text"
                      value={actaNumero}
                      onChange={(e) => setActaNumero(e.target.value)}
                      placeholder="Ej. ASAM-EXT-2026-01"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      * Fecha de Celebración de la Asamblea:
                    </label>
                    <input
                      type="date"
                      value={actaFecha}
                      onChange={(e) => setActaFecha(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      * Páginas / Folios en el Libro de Actas:
                    </label>
                    <input
                      type="text"
                      value={libroPaginas}
                      onChange={(e) => setLibroPaginas(e.target.value)}
                      placeholder="Ej. 45 a la 48"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold text-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Registro Mercantil / Tomo de Asiento:
                    </label>
                    <input
                      type="text"
                      value={registroTomo}
                      onChange={(e) => setRegistroTomo(e.target.value)}
                      placeholder="Ej. Registro Mercantil Primero del Dtto. Capital, Tomo 45-A"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-purple-800 bg-white/70 p-2 rounded-lg border border-purple-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>
                    La <strong>Cláusula Séptima (Aprobación Corporativa y Libro de Actas)</strong> se compilará con estas referencias para blindar el expediente ante inspecciones tributarias.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: SELLO DIGITAL Y RESUMEN FINAL */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Parámetros Validados y Blindaje SENIAT Activo:</strong> Todas las cláusulas de protección fiscal conforme al Art. 73 LISLR y aprobación en el Libro de Actas han sido configuradas.
                </span>
              </div>

              {/* Summary table */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Flujo Tributario:</span>
                  <span className="font-semibold text-slate-900">
                    {tipoFlujo === 'socio_a_empresa' ? 'Cuentas por Pagar (Socio a Empresa)' : 'Cuentas por Cobrar (Empresa a Socio)'}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Monto del Préstamo:</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {tipoActivo === 'VES' ? formatVES(monto) : (tipoActivo === 'USDT' ? formatUSDT(monto) : formatUSD(monto))}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Equivalencia BCV Oficial:</span>
                  <span className="font-mono text-slate-800">
                    {tipoActivo === 'VES' ? formatUSD(montoIndexadoUSD) : formatVES(montoIndexadoVES)}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Accionista:</span>
                  <span className="text-slate-900 font-semibold">{selectedAccionista?.nombre_accionista} (C.I. {selectedAccionista?.cedula_accionista})</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Régimen de Intereses:</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    {regimenInteres === 'gratuito' ? (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Gratuito (Sin Intereses Corrientes - Art. 1.745 CC)
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        {modalidadTasa === 'nominal_bcv_59' 
                          ? `Nominal Variable BCV (${tasaNominalBCV}% Anual) + Mora 3.0%`
                          : (modalidadTasa === 'indexada_uvc_16'
                              ? `Indexada UVC (${tasaUVC}% Anual) [${montoUVCCalculado.toFixed(2)} UVC] + Mora 0.8%`
                              : (modalidadTasa === 'divisas_usd'
                                  ? `Divisas USD (${tasaDivisasUSD}% Anual) + Mora 2.0%`
                                  : `Personalizada (${(tasaInteres * 12).toFixed(1)}% Anual)`))}
                      </span>
                    )}
                  </span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Aprobación en Asamblea (Cláusula Séptima):</span>
                  <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono text-[11px]">
                    Acta {actaNumero} (Libro Pág. {libroPaginas}) - {actaFecha}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500 font-medium">Soporte Anexo:</span>
                  <span className="text-slate-900 font-mono">
                    {tipoActivo === 'USD_EFECTIVO' ? 'Recibo de Caja Principal' : (tipoActivo === 'USDT' ? `TXID: ${txidBlockchain.substring(0, 16)}...` : `Ref: ${referenciaBancaria}`)}
                  </span>
                </div>
              </div>

              {/* Legal emission notice */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Emisión Legal y Respaldo Documental</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Al emitir, el contrato quedará listo para su firma e incorporación al expediente tributario de la empresa, vinculado al comprobante bancario o recibo de caja correspondiente.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Navigation Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1) handleNextFromStep1();
                  else setStep(step + 1);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmSave}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Emitir y Sellar Contrato</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE ALERTA ROJA: DIVIDENDO PRESUNTO ART. 72 LISLR */}
      {showRedAlertModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border-2 border-rose-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-950">
                  ALERTA ROJA TRIBUTARIA: RIESGO DE DIVIDENDO PRESUNTO
                </h3>
                <span className="text-[11px] text-rose-700 font-semibold">Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR)</span>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-rose-50/70 p-4 rounded-xl border border-rose-200">
              <p>
                <strong>¡Atención Inmediata!</strong> Los préstamos que haga una sociedad mercantil a favor de sus socios o accionistas se consideran por mandato legal como <strong>Dividendos Presuntos</strong>.
              </p>
              <p>
                Si el SENIAT detecta este movimiento durante una fiscalización, exigirá a la empresa la <strong>retención inmediata de hasta el 34% del monto total</strong> en calidad de impuesto sobre dividendos, más severas multas de defraudación.
              </p>
              <p className="text-amber-800 font-semibold">
                Para mitigar este riesgo, la aplicación le obligará a:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>Fijar un plazo de devolución estricto y menor a 180 días.</li>
                <li>Establecer una tasa de interés comercial (los préstamos gratuitos a socios son rechazados por el SENIAT).</li>
                <li>Declarar el motivo corporativo estricto del préstamo.</li>
              </ul>
            </div>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={riesgoDividendoAceptado}
                onChange={(e) => setRiesgoDividendoAceptado(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <span className="text-xs text-slate-800 font-medium">
                Entiendo el riesgo fiscal previsto en el Art. 72 de la LISLR y deseo continuar bajo mi propia responsabilidad.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRedAlertModal(false);
                  setTipoFlujo('socio_a_empresa');
                  setRiesgoDividendoAceptado(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar y volver a Flujo Seguro
              </button>
              <button
                type="button"
                disabled={!riesgoDividendoAceptado}
                onClick={() => setShowRedAlertModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  riesgoDividendoAceptado
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Aceptar Riesgo y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
