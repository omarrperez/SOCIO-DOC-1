import React, { useState, useEffect, useMemo } from 'react';
import { ContratoMutuo, Empresa, Accionista, ActaAsamblea, CapitalizacionAcreencia } from '../types';
import { formatVES, formatUSD, formatUSDT, formatFechaLarga, numeroALetras } from '../utils/formatters';
import { Printer, Copy, Check, X, ShieldCheck, FileText, Landmark, Download, FileDown, FileSpreadsheet, Calculator } from 'lucide-react';
import { 
  downloadContractWord, 
  downloadContractPDF, 
  generateContractText,
  generateActaAsambleaText,
  downloadActaWord,
  downloadActaExcel,
  downloadActaPDF,
  generateReciboInteresesText,
  downloadReciboInteresesWord,
  downloadReciboInteresesPDF,
  generateLineaCreditoRotativaText,
  downloadLineaCreditoWord,
  downloadLineaCreditoPDF,
  downloadLineaCreditoExcel
} from '../utils/documentExport';

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'contrato' | 'recibo_caja' | 'acta_macro' | 'acta_capitalizacion' | 'informe_comisario' | 'recibo_intereses' | 'linea_credito';
  contrato?: ContratoMutuo;
  empresa: Empresa;
  accionista?: Accionista;
  accionistas?: Accionista[];
  actaMacro?: ActaAsamblea;
  capitalizacionData?: CapitalizacionAcreencia;
  tasaBCV?: number;
  onOpenMonthlyCalc?: (contrato: ContratoMutuo) => void;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  contrato,
  empresa,
  accionista,
  accionistas = [],
  actaMacro,
  capitalizacionData,
  tasaBCV = 412.50,
  onOpenMonthlyCalc,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(documentType);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(documentType);
    }
  }, [documentType, isOpen]);

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const socio1: Accionista = sociosValidos[0] || {
    id: 's-1',
    empresa_id: empresa.id,
    nombre_accionista: empresa.representante_legal,
    cedula_accionista: empresa.cedula_representante,
    rif_accionista: `V-${empresa.cedula_representante}`,
    porcentaje_acciones: 50,
    cargo_o_condicion: empresa.cargo_representante,
    es_accionista: true,
  };
  const socio2: Accionista = sociosValidos[1] || (
    accionista && accionista.cedula_accionista !== socio1.cedula_accionista
      ? accionista
      : {
          id: 's-2',
          empresa_id: empresa.id,
          nombre_accionista: 'Carlos Eduardo Mendoza Silva',
          cedula_accionista: '14.285.920',
          rif_accionista: 'V-14285920-1',
          porcentaje_acciones: 50,
          cargo_o_condicion: 'Accionista',
          es_accionista: true,
        }
  );
  const socioContrato = contrato?.accionista_id ? accionistas.find(a => a.id === contrato.accionista_id) : undefined;
  const socioBecerra = accionistas.find(a => a.nombre_accionista.toLowerCase().includes('becerra') || a.cedula_accionista.includes('24.224.176'));
  const socioFirmante: Accionista = socioContrato || accionista || ((empresa.id === 'emp-oni' || empresa.razon_social.toUpperCase().includes('AGRICOLA ONI')) && socioBecerra ? socioBecerra : undefined) || socio2 || socio1;

  // Memoized structured document texts (Called unconditionally before any early return)
  const lineaCreditoData = useMemo(() => {
    return generateLineaCreditoRotativaText(contrato, empresa, socioFirmante);
  }, [contrato, empresa, socioFirmante]);

  const contratoData = useMemo(() => {
    if (!contrato) return null;
    return generateContractText(contrato, empresa, socioFirmante);
  }, [contrato, empresa, socioFirmante]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    if (activeTab === 'linea_credito') {
      downloadLineaCreditoWord(contrato, empresa, socioFirmante);
      return;
    }

    if (contrato && activeTab === 'contrato') {
      downloadContractWord(contrato, empresa, socioFirmante);
      return;
    }

    if (activeTab === 'acta_macro') {
      downloadActaWord(actaMacro, empresa, accionistas, contrato, socioFirmante);
      return;
    }

    if (activeTab === 'recibo_intereses') {
      downloadReciboInteresesWord(contrato, empresa, socioFirmante, 'Febrero 2026', tasaBCV);
      return;
    }

    // Generic Word download for Recibo, Acta Capitalización, Informe
    const text = getActiveText();
    const docTitle = activeTab === 'recibo_caja' ? 'Recibo_Caja' :
      activeTab === 'acta_capitalizacion' ? 'Acta_Capitalizacion' :
      activeTab === 'informe_comisario' ? 'Informe_Comisario' : 'Documento_Legal';

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page { size: letter; margin: 1.0in; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #000000; margin: 0; padding: 0; }
          p { margin-bottom: 10pt; margin-top: 0pt; text-align: justify; text-justify: inter-ideograph; }
          table.header-box { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 16pt; border: 1.5pt solid #1e3a8a; background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table class="header-box" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 10pt 14pt; text-align: center; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="font-family: Arial, sans-serif; font-size: 12.5pt; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin-bottom: 3pt;">
                ${empresa.razon_social}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #334155;">
                <strong>R.I.F.:</strong> ${empresa.rif_empresa} &nbsp;|&nbsp; <strong>REGISTRO MERCANTIL:</strong> ${empresa.registro_mercantil}
              </div>
            </td>
          </tr>
        </table>
        ${text.split('\n\n').filter((p: string) => p.trim()).map((p: string) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`).join('')}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle}_${contrato ? contrato.correlativo : empresa.rif_empresa}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    if (activeTab === 'linea_credito') {
      downloadLineaCreditoExcel(contrato, empresa, socioFirmante);
      return;
    }
    downloadActaExcel(actaMacro, empresa, accionistas, contrato, socioFirmante);
  };

  const handleDownloadPDF = () => {
    if (activeTab === 'linea_credito') {
      downloadLineaCreditoPDF(contrato, empresa, socioFirmante);
      return;
    }

    if (contrato && activeTab === 'contrato') {
      downloadContractPDF(contrato, empresa, socioFirmante);
      return;
    }

    if (activeTab === 'acta_macro') {
      downloadActaPDF(actaMacro, empresa, accionistas, contrato, socioFirmante);
      return;
    }

    if (activeTab === 'recibo_intereses') {
      downloadReciboInteresesPDF(contrato, empresa, socioFirmante, 'Febrero 2026', tasaBCV);
      return;
    }

    window.print();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate legal texts
  const renderContratoText = () => {
    return contratoData?.body || '';
  };

  const renderReciboCaja = () => {
    if (!contrato) return '';
    const targetAccionista = accionista || socioFirmante;
    const isDirectivo = 
      targetAccionista.es_accionista === false || 
      targetAccionista.porcentaje_acciones === 0 || 
      targetAccionista.tipo_vinculo === 'director' || 
      targetAccionista.tipo_vinculo === 'gerente';

    const condicionPersona = isDirectivo
      ? `${targetAccionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${targetAccionista.departamento ? ` (${targetAccionista.departamento})` : ''} - Personal de Confianza de la Sociedad.`
      : `Accionista / Socio Titular del ${targetAccionista.porcentaje_acciones}% del Capital Social.`;

    const etiquetaFirma = isDirectivo
      ? `${targetAccionista.cargo_o_condicion || 'Director / Gerente'} (Mutuario/Mutuante)`
      : 'Accionista Mutuante';

    return `================================================================================
RECIBO DE INGRESO A CAJA PRINCIPAL (DIVISAS EN EFECTIVO)
Control Interno Contable Nro: ${contrato.soporte.recibo_caja_correlativo || 'REC-2026-0042'}
================================================================================

EMPRESA: ${empresa.razon_social}
R.I.F.: ${empresa.rif_empresa}
CONDICIÓN TRIBUTARIA: Contribuyente ${empresa.tipo_contribuyente} (Sujeto Pasivo Especial)
DIRECCIÓN: ${empresa.direccion_fiscal}

FECHA DE INGRESO: ${formatFechaLarga(contrato.soporte.fecha_transaccion)}
VALOR REFERENCIAL OFICIAL BCV: Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por 1.00 USD
EQUIVALENCIA CONTABLE EN BOLÍVARES: ${formatVES(contrato.monto_indexado_ves)}

RECIBÍ del ciudadano(a): ${targetAccionista.nombre_accionista}
Cédula de Identidad: ${targetAccionista.cedula_accionista} | R.I.F.: ${targetAccionista.rif_accionista}
Condición en la entidad: ${condicionPersona}

LA CANTIDAD DE:
${numeroALetras(contrato.monto_original)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA (${formatUSD(contrato.monto_original)}) en billetes físicos de curso legal.

POR CONCEPTO DE:
Aporte financiero temporal en calidad de Mutuo (Préstamo de Accionista), según lo estipulado formalmente en el Contrato de Mutuo Nro. ${contrato.correlativo} de fecha ${formatFechaLarga(contrato.fecha_inicio)}, destinado exclusivamente para: "${contrato.destino_fondos}".

ASIENTO CONTABLE VENEZOLANO (VEN-NIF):
--------------------------------------------------------------------------------
1.01.01.02.001 - CAJA PRINCIPAL MONEDA EXTRANJERA (ACTIVO)      ${formatVES(contrato.monto_indexado_ves)} [DÉBITO]
2.01.03.01.001 - CUENTAS POR PAGAR SOCIOS / ACCIONISTAS (PASIVO) ${formatVES(contrato.monto_indexado_ves)} [CRÉDITO]
--------------------------------------------------------------------------------

CONTROL DE RETENCIÓN DE IGTF (IMPUESTO A GRANDES TRANSACCIONES):
${empresa.tipo_contribuyente === 'Especial' ? `• Alícuota aplicable IGTF: 3.00% (Sujeto Pasivo Especial en percepción de moneda extranjera en efectivo).
• Base Imponible: ${formatUSD(contrato.monto_original)} (Bs. ${contrato.monto_indexado_ves.toFixed(2)})
• Monto IGTF Determinado: ${formatUSD(contrato.soporte.igtf_monto_usd)} (Bs. ${contrato.soporte.igtf_monto_ves.toFixed(2)})
• Estatus: Comprobante emitido para entero ante el portal fiscal del SENIAT dentro del calendario legal.` : '• No aplica percepción de IGTF por condición de Contribuyente Ordinario.'}

ENTREGADO POR:                                RECIBIDO EN CAJA POR:
_________________________________             _________________________________
${targetAccionista.nombre_accionista}               ${empresa.representante_legal}
C.I. V-${targetAccionista.cedula_accionista}        C.I. V-${empresa.cedula_representante}
${etiquetaFirma}                              ${empresa.cargo_representante}
                                              (SELLO HÚMEDO DE LA EMPRESA)`;
  };

  const renderActaMacro = () => {
    return generateActaAsambleaText(actaMacro, empresa, accionistas, contrato, socioFirmante);
  };

  const renderReciboIntereses = () => {
    return generateReciboInteresesText(contrato, empresa, socioFirmante, 'Febrero 2026', tasaBCV);
  };

  const renderActaCapitalizacion = () => {
    if (!capitalizacionData && !contrato) return '';
    const cap = capitalizacionData || {
      monto_capitalizado_ves: contrato?.monto_indexado_ves || 540000,
      monto_capitalizado_usd: contrato?.monto_original || 12500,
      capital_anterior_ves: empresa.capital_social_ves,
      capital_nuevo_ves: empresa.capital_social_ves + (contrato?.monto_indexado_ves || 540000),
      valor_nominal_accion_ves: 100,
      numero_acciones_nuevas: Math.floor((contrato?.monto_indexado_ves || 540000) / 100),
      nombre_comisario: 'Lic. Gladys Elena Peña Morales',
      cpc_comisario: 'CPC Nro. 48.912',
      fecha_asamblea: '2026-03-20',
      uuid_acta: 'CAP-2026-0089',
    };

    return `ACTA DE ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS DE LA SOCIEDAD MERCANTIL ${empresa.razon_social} (AUMENTO DE CAPITAL MEDIANTE CAPITALIZACIÓN DE ACREENCIA DE SOCIO)

Hoy, ${formatFechaLarga(cap.fecha_asamblea)}, siendo las 10:00 AM, en la sede social de ${empresa.razon_social}, inscrita en el ${empresa.registro_mercantil}, RIF Nro. ${empresa.rif_empresa}, se encuentran presentes los accionistas que representan el 100% del capital social de la compañía. Preside la reunión el Director Presidente ${empresa.representante_legal}. El Presidente constata el quórum legal y declara abierta la Asamblea Extraordinaria.

ORDEN DEL DÍA:
PUNTO PRIMERO: Consideración y aprobación del Informe del Comisario Mercantil sobre la acreencia cierta, líquida y exigible mantenida a favor del accionista ${socioFirmante?.nombre_accionista || 'Carlos Eduardo Mendoza Silva'}.
PUNTO SEGUNDO: Aumento del Capital Social de la compañía de la cantidad de ${formatVES(cap.capital_anterior_ves)} a la cantidad de ${formatVES(cap.capital_nuevo_ves)}, mediante la extinción y capitalización total de la referida acreencia, y consecuente reforma de la Cláusula Quinta de los Estatutos Sociales.

DESARROLLO:
PUNTO PRIMERO: El Presidente somete a consideración el Informe Técnico presentado por el Comisario de la sociedad, ${cap.nombre_comisario}, debidamente inscrito en el Colegio de Contadores Públicos bajo el ${cap.cpc_comisario}, en el cual se certifica que la sociedad mercantil adeuda legítimamente al accionista la suma de ${formatVES(cap.monto_capitalizado_ves)} (equivalente a ${formatUSD(cap.monto_capitalizado_usd)}), producto de los fondos inyectados bajo el Contrato de Mutuo ${contrato?.correlativo || 'MUT-2026-0001'} debidamente respaldado en comprobantes y asientos de diario. La Asamblea APROBÓ POR UNANIMIDAD el informe del comisario.

PUNTO SEGUNDO: El accionista manifiesta expresamente su voluntad de liberar a la sociedad mercantil del desembolso en efectivo de dicha deuda, aceptando en su lugar la capitalización íntegra de la misma. Sometido a votación, los accionistas APROBARON POR UNANIMIDAD aumentar el Capital Social de la sociedad mercantil en la suma de ${formatVES(cap.monto_capitalizado_ves)}, emitiéndose ${cap.numero_acciones_nuevas.toLocaleString()} nuevas acciones nominativas no convertibles al portador con un valor nominal de ${formatVES(cap.valor_nominal_accion_ves)} cada una. Con este acto, la deuda queda completamente extinguida en los libros pasivos de la sociedad y se incorpora al Patrimonio neto de la empresa.

REFORMA ESTATUTARIA: Se reforma la Cláusula Quinta de los Estatutos Sociales, quedando redactada así: "CLÁUSULA QUINTA: El Capital Social de la compañía es de ${formatVES(cap.capital_nuevo_ves)}, dividido y representado en ${((cap.capital_nuevo_ves) / cap.valor_nominal_accion_ves).toLocaleString()} acciones comunes y nominativas de ${formatVES(cap.valor_nominal_accion_ves)} cada una, totalmente suscritas y pagadas...".

Se autoriza al Director Presidente a consignar copia certificada de la presente acta ante el Registro Mercantil correspondiente dentro de los lapsos previstos en el Código de Comercio. (Firmas de los accionistas y el comisario).`;
  };

  const renderInformeComisario = () => {
    return `INFORME DEL COMISARIO MERCANTIL INDEPENDIENTE A LA ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS DE ${empresa.razon_social}

A los Señores Accionistas:

En mi condición de Comisario de la sociedad mercantil ${empresa.razon_social}, titular de la inscripción en el Colegio de Contadores Públicos bajo el CPC Nro. 48.912, y en cumplimiento de los Artículos 287, 309 y 311 del Código de Comercio de la República Bolivariana de Venezuela, he procedido a efectuar una auditoría especial a los libros auxiliares y principales de contabilidad al día de hoy.

DICTAMEN Y CERTIFICACIÓN DE ACREENCIA:
1. He examinado el saldo registrado en la cuenta de Pasivo "2.01.03.01 Cuentas por Pagar Socios / Accionistas", constatando la existencia de una obligación cierta, líquida y legalmente exigible a favor del accionista ${socioFirmante?.nombre_accionista || 'Carlos Eduardo Mendoza Silva'}.
2. Se verificó el Contrato de Mutuo Nro. ${contrato?.correlativo || 'MUT-2026-0001'}, así como el soporte de ingreso de fondos en caja/banco y su correspondiente asiento en el libro de diario.
3. Se certifica que los fondos fueron empleados efectivamente en capital de trabajo y adquisición de inventarios para la operatividad de la empresa.
4. Por tanto, RECOMIENDO FAVORABLEMENTE a la Asamblea General de Accionistas la aprobación de la capitalización de la acreencia por un monto de ${formatVES(contrato?.monto_indexado_ves || 540000)}, extinguiendo el pasivo y fortaleciendo el patrimonio neto de la entidad frente a los requerimientos de la Administración Tributaria Nacional (SENIAT).

En Caracas, a la fecha de celebración de la Asamblea.
Lic. Gladys Elena Peña Morales
Contador Público Colegiado - CPC Nro. 48.912`;
  };

  const renderLineaCredito = () => {
    return lineaCreditoData.body;
  };

  const getActiveText = () => {
    switch (activeTab) {
      case 'linea_credito':
        return renderLineaCredito();
      case 'contrato':
        return renderContratoText();
      case 'recibo_caja':
        return renderReciboCaja();
      case 'acta_macro':
        return renderActaMacro();
      case 'recibo_intereses':
        return renderReciboIntereses();
      case 'acta_capitalizacion':
        return renderActaCapitalizacion();
      case 'informe_comisario':
        return renderInformeComisario();
      default:
        return renderContratoText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar with Action Buttons */}
        <div className="shrink-0 px-6 pt-6 pb-6 bg-white border-b-2 border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Expediente Documental Legal SENIAT</span>
                {contrato && (
                  <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                    {contrato.correlativo}
                  </span>
                )}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Redactado con formalismos del Código Civil, Código de Comercio y VEN-NIF
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar documento en formato PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar documento editable en formato Word (.doc)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Descargar Word</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Descargar Acta de Asamblea y Resumen en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Descargar Excel</span>
            </button>

            {contrato && onOpenMonthlyCalc && (
              <button
                onClick={() => onOpenMonthlyCalc(contrato)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title="Calcular memoria de intereses y emitir Nota de Débito fiscal"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Memoria & Nota Débito</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(getActiveText())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Imprimir o guardar vista del navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Selection Tabs Bar (Always fully visible with shrink-0) */}
        <div className="shrink-0 px-6 py-3.5 bg-slate-100 border-b-2 border-slate-300 flex items-center gap-2 overflow-x-auto text-xs z-10 shadow-xs">
          <div className="flex items-center gap-1.5 mr-2 shrink-0 text-slate-700 font-bold text-xs uppercase tracking-wide">
            <Landmark className="w-4 h-4 text-blue-600" />
            <span>Documentos:</span>
          </div>

          <button
            onClick={() => setActiveTab('contrato')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contrato'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 border border-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Contrato de Mutuo</span>
          </button>

          <button
            onClick={() => setActiveTab('linea_credito')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'linea_credito'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 border border-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
            }`}
            title="Contrato Marco de Apertura de Línea Rotativa (1 sola Notaría al año para agrupar múltiples transferencias)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Línea Crédito Rotativa (1 Notaría/Año)</span>
          </button>

          <button
            onClick={() => setActiveTab('acta_macro')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'acta_macro'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 border border-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Acta de Asamblea Extraordinaria</span>
          </button>

          <button
            onClick={() => setActiveTab('recibo_intereses')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'recibo_intereses'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40 border border-amber-700'
                : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Recibo Mensual Intereses (SENIAT)</span>
          </button>

          {contrato?.tipo_activo === 'USD_EFECTIVO' && (
            <button
              onClick={() => setActiveTab('recibo_caja')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'recibo_caja'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 border border-blue-700'
                  : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Recibo de Caja Principal</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('acta_capitalizacion')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'acta_capitalizacion'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40 border border-emerald-700'
                : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Acta de Capitalización</span>
          </button>

          <button
            onClick={() => setActiveTab('informe_comisario')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'informe_comisario'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 border border-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Informe del Comisario</span>
          </button>
        </div>

        {/* Paper Container (Formatted for Legal Venezuelan A4 print) */}
        <div className="flex-1 overflow-y-auto bg-slate-200/90 p-4 sm:p-8 select-text">
          <div className="bg-white border border-slate-300 rounded-xl px-8 sm:px-12 py-8 sm:py-10 shadow-xl max-w-4xl mx-auto print-page font-serif">
            
            {/* Header in Document */}
            <div className="border-2 border-blue-900 bg-slate-50/70 p-4 m-0 mb-6 text-center rounded font-sans">
              <div className="font-extrabold text-sm sm:text-base text-blue-950 uppercase tracking-wide">
                {empresa.razon_social}
              </div>
              <div className="text-xs text-slate-700 mt-1">
                <strong>R.I.F. Nro.:</strong> {empresa.rif_empresa} &nbsp;|&nbsp; <strong>REGISTRO MERCANTIL:</strong> {empresa.registro_mercantil}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Domicilio Fiscal: {empresa.ciudad}, Estado {empresa.estado}, República Bolivariana de Venezuela
              </div>
            </div>

            {/* Document Body depending on Active Tab */}
            {activeTab === 'linea_credito' ? (
              <div className="text-slate-900 m-0 p-0">
                {/* Document Title */}
                <div className="text-center font-bold text-sm sm:text-base text-slate-950 uppercase tracking-wide m-0 mb-6 pb-2 border-b-2 border-slate-300 font-sans">
                  {lineaCreditoData.title}
                </div>

                {/* Informational Banner */}
                <div className="m-0 mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-300 text-slate-800 font-sans text-xs print:hidden shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Estrategia de Blindaje: 1 Sola Notaría Anual para Múltiples Retiros Mensuales</span>
                  </div>
                  <p className="m-0 text-slate-700 leading-relaxed text-justify" style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                    Con este <strong>Contrato Marco de Línea de Crédito Rotativa</strong> autenticado <strong>una sola vez al año</strong>, se eliminan los costos y trámites de notariar 20 contratos individuales al mes. Las transferencias mensuales quedan soportadas por este contrato, la <strong>Memoria de Cálculo mensual</strong> (papel de trabajo) y una única <strong>Nota de Débito Fiscal mensual No Sujeta al IVA</strong> (Art. 73 LISLR y Art. 16 Num 3 LIVA).
                  </p>
                </div>

                {/* Preamble - Strictly Justified, margins reset */}
                <p 
                  className="m-0 mb-5 text-justify [text-justify:inter-word] leading-relaxed text-xs sm:text-[13px] text-slate-900 font-serif"
                  style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                >
                  {lineaCreditoData.preamble}
                </p>

                {/* Clauses - Strictly Justified on Both Left & Right */}
                <div className="space-y-5 m-0 p-0">
                  {lineaCreditoData.clauses.map((clause: { title: string; text: string }, idx: number) => (
                    <div key={idx} className="space-y-1.5 m-0 p-0">
                      <h3 className="font-bold text-xs sm:text-[13px] text-slate-950 uppercase font-sans tracking-tight m-0 pt-1">
                        {clause.title}:
                      </h3>
                      {clause.text.split('\n').filter((p: string) => p.trim()).map((paragraph: string, pIdx: number) => {
                        const isParagrafo = paragraph.trim().startsWith('PARÁGRAFO');
                        return (
                          <p
                            key={pIdx}
                            className={`m-0 text-justify [text-justify:inter-word] leading-relaxed text-xs sm:text-[13px] font-serif ${
                              isParagrafo
                                ? 'my-2 border-l-2 border-blue-400 bg-blue-50/40 py-2 px-3.5 rounded-r text-slate-900 text-xs sm:text-[12.5px] font-sans'
                                : 'mb-2.5 text-slate-900'
                            }`}
                            style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                          >
                            {isParagrafo ? (
                              <>
                                <strong className="font-bold text-blue-950 uppercase not-italic">{paragraph.split(':')[0]}:</strong>
                                {paragraph.substring(paragraph.indexOf(':') + 1)}
                              </>
                            ) : (
                              paragraph
                            )}
                          </p>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Signatures for Línea de Crédito */}
                <div className="m-0 mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                  <div>
                    <div className="w-56 mx-auto border-b-2 border-slate-600 mb-2"></div>
                    <div className="font-bold text-slate-900 uppercase">{empresa.representante_legal}</div>
                    <div className="text-slate-600">C.I. V-{empresa.cedula_representante} • R.I.F. {empresa.rif_representante || 'V-23997829-7'}</div>
                    <div className="text-[11px] text-blue-800 font-semibold">{empresa.cargo_representante} (LA MUTUANTE)</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5">{empresa.razon_social}</div>
                  </div>
                  <div>
                    <div className="w-56 mx-auto border-b-2 border-slate-600 mb-2"></div>
                    <div className="font-bold text-slate-900 uppercase">{socioFirmante.nombre_accionista}</div>
                    <div className="text-slate-600">C.I. V-{socioFirmante.cedula_accionista} • R.I.F. {socioFirmante.rif_accionista}</div>
                    <div className="text-[11px] text-emerald-800 font-semibold">EL MUTUARIO (ACREDITADO)</div>
                    <div className="text-[10px] text-slate-500">Socio Vinculado / Receptor de Fondos</div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'contrato' ? (
              <div className="text-slate-900 m-0 p-0">
                {contratoData ? (
                  <>
                    <div className="text-center font-bold text-sm sm:text-base text-slate-950 uppercase tracking-wide m-0 mb-6 pb-2 border-b-2 border-slate-300 font-sans">
                      {contratoData.title}
                    </div>
                    <p 
                      className="m-0 mb-5 text-justify [text-justify:inter-word] leading-relaxed text-xs sm:text-[13px] text-slate-900 font-serif"
                      style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                    >
                      {contratoData.preamble}
                    </p>
                    <div className="space-y-5 m-0 p-0">
                      {contratoData.clauses.map((clause: { title: string; text: string }, idx: number) => (
                        <div key={idx} className="space-y-1.5 m-0 p-0">
                          <h3 className="font-bold text-xs sm:text-[13px] text-slate-950 uppercase font-sans tracking-tight m-0 pt-1">
                            {clause.title}:
                          </h3>
                          <p
                            className="m-0 mb-2.5 text-justify [text-justify:inter-word] leading-relaxed text-xs sm:text-[13px] font-serif text-slate-900"
                            style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                          >
                            {clause.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3.5 font-serif text-xs sm:text-[13px] leading-relaxed text-slate-900 m-0 p-0">
                    {getActiveText().split('\n\n').filter((p: string) => p.trim()).map((paragraph: string, idx: number) => (
                      <p 
                        key={idx} 
                        className="m-0 mb-3 text-justify [text-justify:inter-word] leading-relaxed"
                        style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Signatures for Contrato */}
                <div className="m-0 mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                  <div>
                    <div className="w-56 mx-auto border-b-2 border-slate-600 mb-2"></div>
                    <div className="font-bold text-slate-900 uppercase">{empresa.representante_legal}</div>
                    <div className="text-slate-600">C.I. V-{empresa.cedula_representante}</div>
                    <div className="text-[11px] text-slate-500">{empresa.cargo_representante}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{empresa.razon_social}</div>
                  </div>
                  <div>
                    <div className="w-56 mx-auto border-b-2 border-slate-600 mb-2"></div>
                    <div className="font-bold text-slate-900 uppercase">{socioFirmante?.nombre_accionista || 'Accionista'}</div>
                    <div className="text-slate-600">C.I. V-{socioFirmante?.cedula_accionista || ''}</div>
                    <div className="text-[11px] text-slate-500">Accionista / Mutuario</div>
                    <div className="text-[10px] text-slate-500">R.I.F. {socioFirmante?.rif_accionista || ''}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-900 m-0 p-0">
                {/* Generic Legal Document View */}
                <div className="space-y-3.5 font-serif text-xs sm:text-[13px] leading-relaxed text-slate-900 m-0 p-0">
                  {getActiveText().split('\n\n').filter((p: string) => p.trim()).map((paragraph: string, idx: number) => (
                    <p 
                      key={idx} 
                      className="m-0 mb-3 text-justify [text-justify:inter-word] leading-relaxed"
                      style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Signature Blocks according to Document Type */}
                {activeTab === 'acta_macro' ? (
                  <div className="m-0 mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                    <div>
                      <div className="w-48 mx-auto border-b-2 border-slate-400 mb-2"></div>
                      <div className="font-bold text-slate-900">{socio1.nombre_accionista}</div>
                      <div className="text-slate-600">C.I. V-{socio1.cedula_accionista}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">Accionista ({socio1.porcentaje_acciones}%)</div>
                    </div>

                    <div>
                      <div className="w-48 mx-auto border-b-2 border-slate-400 mb-2"></div>
                      <div className="font-bold text-slate-900">{socio2.nombre_accionista}</div>
                      <div className="text-slate-600">C.I. V-{socio2.cedula_accionista}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">Accionista ({socio2.porcentaje_acciones}%)</div>
                    </div>
                  </div>
                ) : activeTab === 'recibo_intereses' ? (
                  <div className="m-0 mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                    <div>
                      <div className="w-48 mx-auto border-b-2 border-slate-400 mb-2"></div>
                      <div className="font-bold text-slate-900">{empresa.representante_legal}</div>
                      <div className="text-slate-600">C.I. V-{empresa.cedula_representante}</div>
                      <div className="text-[11px] text-slate-500">{empresa.cargo_representante}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{empresa.razon_social} (Sello Húmedo)</div>
                    </div>

                    <div>
                      <div className="w-48 mx-auto border-b-2 border-slate-400 mb-2"></div>
                      <div className="font-bold text-slate-900">{socioFirmante?.nombre_accionista || 'Accionista Beneficiario'}</div>
                      <div className="text-slate-600">C.I. V-{socioFirmante?.cedula_accionista || ''}</div>
                      <div className="text-[11px] text-slate-500">Mutuario / Deudor</div>
                      <div className="text-[10px] text-slate-500">R.I.F. {socioFirmante?.rif_accionista || ''}</div>
                    </div>
                  </div>
                ) : (
                  <div className="m-0 mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                    <div>
                      <div className="w-48 mx-auto border-b-2 border-slate-400 mb-2"></div>
                      <div className="font-bold text-slate-900">{empresa.representante_legal}</div>
                      <div className="text-slate-600">C.I. V-{empresa.cedula_representante}</div>
                      <div className="text-[11px] text-slate-500">{empresa.cargo_representante}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{empresa.razon_social}</div>
                    </div>

                    <div>
                      <div className="w-48 mx-auto border-b-2 border-slate-400 mb-2"></div>
                      <div className="font-bold text-slate-900">{socioFirmante?.nombre_accionista || 'Accionista'}</div>
                      <div className="text-slate-600">C.I. V-{socioFirmante?.cedula_accionista || ''}</div>
                      <div className="text-[11px] text-slate-500">Accionista / Mutuario</div>
                      <div className="text-[10px] text-slate-500">R.I.F. {socioFirmante?.rif_accionista || ''}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 pt-6 pb-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span className="font-medium">Documento respaldado conforme a normativa venezolana 2026 (Código Civil, Código de Comercio y VEN-NIF)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Cerrar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
};
