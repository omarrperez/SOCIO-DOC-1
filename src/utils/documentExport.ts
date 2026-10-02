import { jsPDF } from 'jspdf';
import XLSX from 'xlsx-js-style';
import {
  createHeaderCell,
  createDataNumberCell,
  createDataPercentCell,
  createDataTextCell,
  createTotalCell,
  createSubtotalCell,
  createTitleBannerCell,
  saveExcelWorkbook,
  EXCEL_COLORS
} from './excelStyler';
import { ContratoMutuo, Empresa, Accionista, ActaAsamblea, CapitalizacionAcreencia, ReciboCupo, ReciboPagoRecibido, MovimientoCrucePeriodico } from '../types';
import { formatVES, formatUSD, formatUSDT, formatFechaLarga, numeroALetras } from './formatters';
import { RECIBOS_CUPO_AGRICOLA_ONI } from '../data/recibosCupoData';
import { RECIBOS_PAGOS_AGRICOLA_ONI } from '../data/recibosPagosData';
import { REGLAS_CONTABLES_OBLIGATORIAS_APP } from './fiscalUtils';

/**
 * Generates the clean legal text for a Mutuo contract
 */
export function generateContractText(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): { title: string; body: string; clauses: { title: string; text: string }[]; preamble: string } {
  const isCrypto = contrato.tipo_activo === 'USDT';
  const isEfectivo = contrato.tipo_activo === 'USD_EFECTIVO';
  const isVES = contrato.tipo_activo === 'VES';
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const title = isCrypto
    ? 'CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES (CRIPTOPRÉSTAMO)'
    : 'CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmanteTexto = isDirectivoOGerente
    ? `en su condición de ${accionista.cargo_o_condicion || 'Director / Gerente'} y personal de confianza de la sociedad mercantil`
    : `en su cualidad de accionista titular del ${accionista.porcentaje_acciones}% del capital social de la compañía`;

  const condicionFirmanteHTML = isDirectivoOGerente
    ? `en su carácter de <strong>${accionista.cargo_o_condicion || 'Director / Gerente'}</strong> y personal de confianza de la sociedad mercantil`
    : `en su carácter de accionista titular del <strong>${accionista.porcentaje_acciones}%</strong> del capital social`;

  const cargoFirmaHTML = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${accionista.departamento ? ` (${accionista.departamento})` : ''}`
    : `Accionista (${accionista.porcentaje_acciones}% Acciones)`;

  const preamble = `Nosotros, ${empresa.razon_social}, sociedad mercantil domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, constituida e inscrita por ante el ${empresa.registro_mercantil}, inscrita en el Registro Único de Información Fiscal (R.I.F.) Nro. ${empresa.rif_empresa}, debidamente representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. ${empresa.cedula_representante}, en lo sucesivo denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, de nacionalidad venezolana, mayor de edad, titular de la Cédula de Identidad Nro. ${accionista.cedula_accionista} y del R.I.F. Nro. ${accionista.rif_accionista}, ${condicionFirmanteTexto}, quien en lo sucesivo se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", hemos convenido en celebrar como en efecto celebramos el presente ${title}, el cual se regirá por las disposiciones del Código Civil de Venezuela, el Código de Comercio y por las siguientes cláusulas:`;

  const clauses: { title: string; text: string }[] = [];

  if (isCrypto) {
    clauses.push({
      title: 'PRIMERA (OBJETO Y NATURALEZA DEL ACTIVO)',
      text: `${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'} entrega a título de mutuo a ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, un bien mueble intangible y digital, específicamente la cantidad de ${numeroALetras(contrato.monto_original)} TOKENS DE LA CRIPTOMONEDA ESTABLE DENOMINADA UNITED STATES DOLLAR TETHER (${formatUSDT(contrato.monto_original)}). Las partes reconocen que el token USDT es un criptoactivo fungible respaldado en valor paritario con el Dólar de los Estados Unidos de América, ampliamente aceptado en transacciones comerciales lícitas en la República Bolivariana de Venezuela.`,
    });

    clauses.push({
      title: 'SEGUNDA (ENTREGA, RED Y VERIFICACIÓN BLOCKCHAIN - PRUEBA MATERIAL)',
      text: `La entrega efectiva e irreversible del activo se efectuó mediante transferencia electrónica en la red de bloques ${contrato.soporte.red_blockchain || 'TRON (TRC-20)'}, originada desde la Billetera Digital (Wallet) propiedad de ${isSocioAEmpresa ? 'EL MUTUANTE' : 'LA MUTUANTE'}, dirección: [${contrato.soporte.wallet_origen || 'Wallet_Origen'}], con destino a la Billetera Digital corporativa propiedad de ${isSocioAEmpresa ? 'LA MUTUARIA' : 'EL MUTUARIO'}, dirección: [${contrato.soporte.wallet_destino || 'Wallet_Destino'}]. Identificador Hash (TXID): [${contrato.soporte.txid_blockchain || 'TXID_PENDIENTE'}], ejecutada en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}. La consulta pública del referido Hash en el explorador de bloques constituye prueba plena ante cualquier ente de fiscalización.`,
    });

    clauses.push({
      title: 'TERCERA (VALORACIÓN CONTABLE Y FISCAL VEN-NIF)',
      text: `A los efectos de su asentamiento contable en los libros de la empresa conforme a VEN-NIF y exigencias del SENIAT, se registra la operación en moneda de curso legal por la cantidad de ${formatVES(contrato.monto_indexado_ves)} (${numeroALetras(contrato.monto_indexado_ves)} BOLÍVARES), calculados a la tasa de cambio oficial de referencia del Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por unidad para la fecha de la transferencia.`,
    });

    clauses.push({
      title: 'CUARTA (INTERESES Y CONDICIÓN FISCAL)',
      text: isSocioAEmpresa
        ? 'El presente préstamo se efectúa a título estrictamente gratuito, motivado directamente en la condición de socio del MUTUANTE y su interés en el financiamiento de la empresa, no devengando intereses de ninguna naturaleza para enervar la presunción de intereses prevista en las leyes tributarias.'
        : `Por tratarse de un préstamo otorgado por la sociedad a su accionista y para mitigar la presunción de dividendo del Artículo 72 de la Ley de Impuesto Sobre la Renta (LISLR), la operación devengará una tasa de interés comercial pactada del ${contrato.tasa_interes || 1.5}% mensual, debiendo facturarse y declararse como ingresos gravables.`,
    });

    clauses.push({
      title: 'QUINTA (DESTINO DE LOS FONDOS Y PLAZO)',
      text: `Los fondos son destinados expresamente a: "${contrato.destino_fondos}". La restitución de los tokens USDT entregados se efectuará en un plazo no mayor a ${contrato.plazo_meses} meses, con fecha límite improrrogable el ${formatFechaLarga(contrato.fecha_vencimiento)}.`,
    });

    clauses.push({
      title: 'SEXTA (DOMICILIO Y JURISDICCIÓN)',
      text: `Para todos los efectos derivados de este contrato, las partes eligen como domicilio especial, único y excluyente la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se otorgan dos (02) ejemplares de un mismo tenor y efecto el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  } else if (contrato.tipo_flujo === 'empresa_a_socio') {
    // BLINDAJE ART. 72 & 73 LISLR: Cuentas por Cobrar Socios o Directores
    const montoUSD = contrato.monto_indexado_usd || (contrato.tipo_activo === 'VES' ? contrato.monto_original / contrato.tasa_bcv_fecha : contrato.monto_original);
    const montoVES = contrato.monto_indexado_ves || (contrato.tipo_activo === 'VES' ? contrato.monto_original : contrato.monto_original * contrato.tasa_bcv_fecha);
    const montoLetrasUSD = numeroALetras(montoUSD).toUpperCase();
    const montoLetrasVES = numeroALetras(montoVES).toUpperCase();

    // 1. OBJETO Y EXPRESIÓN DINERARIA
    clauses.push({
      title: 'CLÁUSULA PRIMERA (OBJETO Y EXPRESIÓN DINERARIA)',
      text: `LA MUTUANTE concede a EL MUTUARIO a título de mutuo mercantil la cantidad de ${montoLetrasUSD} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${formatUSD(montoUSD)} USD), equivalentes a la fecha de este otorgamiento a la suma de ${montoLetrasVES} BOLÍVARES (${formatVES(montoVES)} Bs.), calculados al tipo de cambio oficial de referencia publicado por el Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por dólar. Las partes convienen que la moneda de cuenta podrá ser el Dólar de los Estados Unidos de América (USD) o la Unidad de Valor de Crédito (UVC), y la moneda de pago de curso legal en Bolívares (Bs.) de conformidad con la normativa del BCV y la legislación monetaria patria vigente.`,
    });

    // 2. BANCARIZACIÓN OBLIGATORIA
    const bancoOrigen = contrato.soporte?.banco_origen || 'Banco Mercantil';
    const bancoDestino = contrato.soporte?.banco_destino || 'Banesco Banco Universal';
    const cuentaOrigen = contrato.soporte?.numero_cuenta_origen || '0105-0114-88-9876543210';
    const cuentaDestino = contrato.soporte?.numero_cuenta_destino || '0134-0012-34-1234567890';
    const refBancaria = contrato.soporte?.referencia_bancaria || 'REF-TRANSF-BCV-7741';

    clauses.push({
      title: 'CLÁUSULA SEGUNDA (BANCARIZACIÓN OBLIGATORIA Y COMPROBACIÓN ANTE EL SENIAT)',
      text: `En estricto cumplimiento de los principios de trazabilidad bancaria y materialidad tributaria exigidos por el Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT), la totalidad del desembolso objeto de este contrato se ejecuta única y exclusivamente mediante transferencia bancaria electrónica y verificable, desde la cuenta bancaria de LA MUTUANTE Nro. ${cuentaOrigen} en ${bancoOrigen}, hacia la cuenta personal bancaria de EL MUTUARIO Nro. ${cuentaDestino} en ${bancoDestino}, bajo la referencia bancaria electrónica Nro. ${refBancaria}, en fecha ${formatFechaLarga(contrato.soporte?.fecha_transaccion || contrato.fecha_inicio)}. Las partes prohíben de forma absoluta las entregas informales de dinero o cruces de cuentas que carezcan de soporte bancario fehaciente.`,
    });

    // 3. NO SUJECIÓN AL IVA
    clauses.push({
      title: 'CLÁUSULA TERCERA (NO SUJECIÓN AL IMPUESTO AL VALOR AGREGADO - IVA)',
      text: `De conformidad con el Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado (LIVA), las partes reconocen expresamente que las operaciones financieras de mutuo de dinero y los intereses devengados se encuentran NO SUJETOS al IVA. En virtud de ello, LA MUTUANTE no trasladará alícuota tributaria alguna de dicho impuesto, debiendo emitir la correspondiente Nota de Débito Fiscal bajo la condición de no sujeta/exenta de IVA al cierre de cada periodo de causación, para su inclusión en la contabilidad y declaración de rentas correspondientes.`,
    });

    // 4. RETENCIÓN DE ISLR
    if (contrato.aplica_interes) {
      clauses.push({
        title: 'CLÁUSULA CUARTA (RÉGIMEN DE RETENCIÓN DE ISLR - DECRETO 1.808)',
        text: `En estricto cumplimiento de los Artículos 1 y 9 (Numeral 8) del Decreto Nro. 1.808 (Reglamento Parcial de la Ley de Impuesto Sobre la Renta en Materia de Retenciones), se deja expresa constancia de que al momento del pago o abono en cuenta de los intereses devengados —lo que ocurra primero—, se practicará la respectiva retención de ISLR, aplicando la alícuota del CINCO POR CIENTO (5%) sobre el cien por ciento (100%) del monto bruto de los intereses devengados por ser el beneficiario Persona Natural Residente (o 3% si fuese Persona Jurídica Domiciliada, o 34% para No Residentes). Dicha retención será enterada en las cuentas del Tesoro Nacional conforme al calendario oficial de Sujetos Pasivos Especiales del SENIAT.`,
      });
    }

    // 5. REGIMEN DE INTERESES COMPENSATORIOS Y BLINDAJE ART. 73 LISLR
    if (contrato.aplica_interes) {
      if (contrato.modalidad_tasa === 'indexada_uvc_16') {
        const idVigente = contrato.idi_bcv_fecha || 250.0;
        const montoUVC = contrato.monto_uvc || (montoVES / idVigente);
        clauses.push({
          title: 'CLÁUSULA QUINTA (DE LA INDEXACIÓN Y LOS INTERESES COMPENSATORIOS EN UVC)',
          text: `Las partes acuerdan expresamente que, con el objeto de mantener el valor real del capital objeto de este mutuo, la obligación dineraria se expresa bajo la metodología de Unidades de Valor de Crédito (UVC), de conformidad con las resoluciones dictadas por el Banco Central de Venezuela (BCV) (incluyendo la Resolución Nro. 26-08-01, Gaceta Oficial Extraordinaria Nro. 7.073). A tales efectos, el capital entregado en Bolívares se divide entre el Índice de Inversión (IDI) publicado por el BCV a la fecha del desembolso, determinando el número de UVC adeudadas (${montoUVC.toFixed(2)} UVC).\nPARÁGRAFO PRIMERO: Sobre el saldo deudor expresado en UVC, EL MUTUARIO pagará a LA MUTUANTE un interés compensatorio fijo del DIECISÉIS POR CIENTO (16%) anual, el cual representa la tasa mínima legal bancaria comercial vigente fijada por el Ente Emisor.\nPARÁGRAFO SEGUNDO: Al momento de cada pago mensual (sea de capital o de intereses), las UVC a amortizar se multiplicarán por el Índice de Inversión (IDI) vigente para el día respectivo, debiendo realizarse el pago en Bolívares resultantes de dicha conversión. Las partes dejan constancia de que esta estructura cumple con la equivalencia financiera del mercado y el marco fiscal del artículo 73 de la LISLR.`,
        });
      } else if (contrato.modalidad_tasa === 'divisas_usd' || contrato.modalidad_tasa === 'indexada_12_usd' || contrato.modalidad_tasa === 'indexada_usd_12') {
        const tasaMensual = contrato.tasa_interes || (contrato.tasa_interes_anual ? contrato.tasa_interes_anual / 12 : 1.0);
        const tasaAnual = contrato.tasa_interes_anual || (tasaMensual * 12);
        clauses.push({
          title: 'CLÁUSULA QUINTA (DE LOS INTERESES EN MONEDA EXTRANJERA - TASA FIJA DE MERCADO)',
          text: `El capital objeto de este contrato devengará a favor de LA MUTUANTE un interés compensatorio fijo del ${tasaAnual.toFixed(1)}% anual (${tasaMensual.toFixed(1)}% mensual), calculado sobre el saldo deudor del capital expresado en Dólares de los Estados Unidos de América (USD). Las partes dejan constancia de que la tasa aquí pactada refleja fielmente el valor del mercado financiero nacional para operaciones de financiamiento en divisas, cumpliendo las directrices del Banco Central de Venezuela y los criterios jurisprudenciales de la Sala Constitucional y Sala de Casación Civil del Tribunal Supremo de Justicia sobre obligaciones pactadas en moneda extranjera. Los intereses se liquidarán mensualmente en la moneda pactada o en su equivalente en Bolívares al tipo de cambio oficial del BCV vigente a la fecha del efectivo pago, satisfaciendo a cabalidad las exigencias del artículo 73 de la Ley de Impuesto sobre la Renta.`,
        });
      } else {
        // Nominal Variable BCV (~59.12% anual) - Criterio exacto venezolano Art. 73 LISLR
        const tasaVigente = contrato.tasa_interes_anual || 59.12;
        clauses.push({
          title: 'CLÁUSULA QUINTA (DE LOS INTERESES COMPENSATORIOS NOMINALES - TASA ACTIVA BCV ART. 73 LISLR)',
          text: `El presente contrato de mutuo es a título oneroso. Por tanto, EL MUTUARIO se obliga a pagar a LA MUTUANTE por concepto de intereses compensatorios, una tasa de interés nominal anual variable, calculada mes a mes sobre los saldos deudores del capital pendiente por restituir. Dicha tasa será la equivalente exacta a la Tasa Activa Promedio Ponderada de los seis (6) principales bancos comerciales y universales del país con mayor volumen de depósitos, fijada y publicada mensualmente por el Banco Central de Venezuela (BCV) (la cual a la presente fecha se ubica en el ${tasaVigente.toFixed(2)}% anual), ajustándose de pleno derecho al inicio de cada mes calendario de conformidad con las variaciones que sufra la referida tasa oficial. Los intereses se causarán de manera vencida y serán pagaderos dentro de los primeros cinco (5) días de cada mes subsiguiente a su causación. Esta tasa se estipula a los fines de dar estricto cumplimiento a lo previsto en el artículo 73 de la Ley de Impuesto sobre la Renta.`,
        });
      }
    } else {
      // Gratuito sin intereses corrientes
      clauses.push({
        title: 'CLÁUSULA QUINTA (CARÁCTER GRATUITO DEL MUTUO Y SALVAGUARDA OPERATIVA)',
        text: `Las partes declaran de forma expresa, voluntaria e irrevocable, de conformidad con el artículo 1.745 del Código Civil de Venezuela, que el presente contrato de mutuo se pacta a TÍTULO ESTRICTAMENTE GRATUITO, por lo que NO devengará intereses corrientes ordinarios. Esta gratuidad se establece en virtud de la vinculación de confianza con la empresa y para el cumplimiento de fines operativos estrictamente lícitos (tales como anticipos para gastos por comprobar o compras urgentes por cuenta de la sociedad). EL MUTUARIO se obliga formalmente a presentar la debida rendición de cuentas, comprobantes contables y/o restituir la totalidad de los fondos antes del cierre del ejercicio económico en curso de la sociedad para dar cumplimiento a las previsiones de los Artículos 72 y 73 de la LISLR, conociendo las partes los efectos fiscales aplicables en caso de fondos no reintegrados.`,
      });
    }

    // 6. CLÁUSULA DE INTERESES MORATORIOS
    const isUVC = contrato.modalidad_tasa === 'indexada_uvc_16';
    const isDivisas = contrato.modalidad_tasa === 'divisas_usd' || contrato.modalidad_tasa === 'indexada_12_usd' || contrato.modalidad_tasa === 'indexada_usd_12';
    const textoMora = isUVC
      ? `cero coma ochenta por ciento (0,80%) anual adicional sobre el saldo deudor expresado en UVC, conforme al límite fijado por el Banco Central de Venezuela para obligaciones indexadas`
      : isDivisas
      ? `dos por ciento (2,0%) anual adicional sobre el capital insoluto expresado en divisas`
      : `tres por ciento (3,0%) anual adicional, calculada sobre la porción de capital vencido y no pagado`;

    clauses.push({
      title: 'CLÁUSULA SEXTA (DE LOS INTERESES MORATORIOS)',
      text: `En caso de que EL MUTUARIO incumpla con el pago oportuno de cualquiera de las cuotas de capital o intereses pactadas, entrará en mora de pleno derecho sin necesidad de requerimiento previo. Durante el tiempo que persista el retraso, además de los intereses compensatorios aquí pactados, se causará un interés moratorio computado a una tasa de ${textoMora}, hasta la total y definitiva resolución del saldo adeudado, conforme a las directrices y límites máximos establecidos por el Banco Central de Venezuela.`,
    });

    // 7. CLÁUSULA DE APROBACIÓN CORPORATIVA (LIBRO DE ACTAS DE ASAMBLEA - BLINDAJE SENIAT)
    const fechaAsamblea = contrato.acta_asamblea_fecha || '15 de enero de 2026';
    const numActa = contrato.acta_asamblea_numero || 'ASAM-EXT-2026-01';
    const paginasLibro = contrato.libro_actas_paginas || '45 a la 48';
    clauses.push({
      title: 'CLÁUSULA SÉPTIMA (DE LA APROBACIÓN CORPORATIVA Y SOPORTE LEGAL - BLINDAJE SENIAT)',
      text: `Las partes dejan expresa constancia de que la celebración del presente contrato de mutuo, así como sus condiciones de plazo, montos e intereses, fueron previamente discutidas y aprobadas por unanimidad en la Asamblea General de Accionistas de la sociedad mercantil LA MUTUANTE, celebrada en fecha ${fechaAsamblea} (bajo el Acta identificada como Nro. ${numActa}). Dicha aprobación consta debidamente asentada en las páginas número ${paginasLibro} del Libro de Actas de Asambleas de Accionistas de la compañía, el cual se encuentra legalmente foliado, sellado y registrado ante el ${empresa.registro_mercantil}. En consecuencia, este negocio jurídico constituye una obligación líquida, exigible y plenamente válida de carácter corporativo, de conformidad con lo establecido en el artículo 280 del Código de Comercio y la legislación tributaria nacional, descartando de plano cualquier naturaleza distinta a la de un préstamo mercantil oneroso o presunción de dividendo encubierto ante el SENIAT.`,
    });

    // 8. DESTINO DE LOS FONDOS Y PLAZO
    clauses.push({
      title: 'CLÁUSULA OCTAVA (DESTINO DE LOS FONDOS, PLAZO Y RESTITUCIÓN)',
      text: `Los fondos concedidos son destinados exclusivamente para: "${contrato.destino_fondos}". ${contrato.motivo_comercial ? `Justificación comercial documentada: ${contrato.motivo_comercial}.` : ''} El plazo acordado es de ${contrato.plazo_meses} meses, fijándose el vencimiento final improrrogable el ${formatFechaLarga(contrato.fecha_vencimiento)}, fecha en la cual el saldo total deberá encontrarse íntegramente restituido y cancelado en las cuentas bancarias de la empresa.`,
    });

    // 9. DOMICILIO Y JURISDICCIÓN
    clauses.push({
      title: 'CLÁUSULA NOVENA (DOMICILIO Y JURISDICCIÓN)',
      text: `Para todos los efectos y controversias derivados del presente contrato, las partes eligen como domicilio especial, único y excluyente la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se firman dos (02) ejemplares de un mismo tenor y efecto en ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  } else {
    // Socio a Empresa: Préstamo de Socio para Capital de Trabajo
    const montoUSD = contrato.monto_indexado_usd || (contrato.tipo_activo === 'VES' ? contrato.monto_original / contrato.tasa_bcv_fecha : contrato.monto_original);
    const montoLetrasUSD = numeroALetras(montoUSD).toUpperCase();

    clauses.push({
      title: 'CLÁUSULA PRIMERA (OBJETO Y EXPRESIÓN EN DIVISAS - DOBLE MONEDA)',
      text: `EL MUTUANTE entrega en calidad de mutuo a LA MUTUARIA la cantidad de ${montoLetrasUSD} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${formatUSD(montoUSD)} USD), acordándose como moneda de cuenta el Dólar (USD) y moneda de pago Bolívares (Bs.) o divisas. Si la entrega se realiza en Bolívares (${formatVES(contrato.monto_original)} Bs.), el monto se indexa a la tasa oficial del Banco Central de Venezuela (BCV) de Bs. ${contrato.tasa_bcv_fecha.toFixed(2)} por dólar vigente a la fecha de la transacción.`,
    });

    clauses.push({
      title: 'CLÁUSULA SEGUNDA (ENTREGA Y COMPROBACIÓN ANTE EL SENIAT)',
      text: isEfectivo
        ? `La entrega de los fondos se realizó físicamente en billetes de curso legal en las oficinas de la empresa, expidiéndose simultáneamente el RECIBO DE INGRESO A CAJA PRINCIPAL Nro. ${contrato.soporte.recibo_caja_correlativo || 'REC-001'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}, el cual forma parte indivisible de la contabilidad mercantil de la compañía.`
        : `La entrega se ejecutó mediante transferencia bancaria desde la cuenta Nro. ${contrato.soporte.numero_cuenta_origen || '0134...'} en ${contrato.soporte.banco_origen || 'Banco Origen'}, hacia la cuenta Nro. ${contrato.soporte.numero_cuenta_destino || '0105...'} en ${contrato.soporte.banco_destino || 'Banco Destino'}, bajo la Referencia Bancaria ${contrato.soporte.referencia_bancaria || 'REF-BANCARIA'} en fecha ${formatFechaLarga(contrato.soporte.fecha_transaccion)}.`,
    });

    if (contrato.aplica_interes) {
      const tasaMensual = contrato.tasa_interes || (contrato.tasa_interes_anual ? contrato.tasa_interes_anual / 12 : 1.0);
      const tasaAnual = contrato.tasa_interes_anual || (tasaMensual * 12);
      clauses.push({
        title: 'CLÁUSULA TERCERA (DE LOS INTERESES CORRIENTES Y REMUNERACIÓN DEL PRÉSTAMO)',
        text: `Las partes acuerdan expresamente que la operación devengará un interés corriente del ${tasaMensual.toFixed(1)}% mensual (equivalente al ${tasaAnual.toFixed(1)}% anual), el cual será liquidado mensualmente conforme al tipo de cambio oficial de referencia del BCV, mediante la emisión de Nota de Débito Fiscal No Sujeta al IVA (Art. 16 Num. 3 LIVA), practicándose la correspondiente retención de Impuesto Sobre la Renta (ISLR) del 5% para Personas Naturales Residentes de conformidad con el Decreto 1.808.`,
      });
    } else {
      clauses.push({
        title: 'CLÁUSULA TERCERA (GRATUIDAD EXPRESA Y AUSENCIA DE INTERESES OCULTOS)',
        text: `Las partes declaran de forma expresa e irrevocable que el presente mutuo se concede a TÍTULO ESTRICTAMENTE GRATUITO (Art. 1.745 Código Civil), no devengando intereses corrientes de ninguna naturaleza en consideración a la cualidad de accionista o directivo de EL MUTUANTE y su legítimo interés societario en el apalancamiento operativo de la empresa, enervando cualquier presunción de intereses ocultos o enriquecimientos netos no declarados ante el SENIAT.`,
      });
    }

    clauses.push({
      title: 'CLÁUSULA CUARTA (NO SUJECIÓN AL IMPUESTO AL VALOR AGREGADO - IVA)',
      text: `De conformidad con el Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado (LIVA), la presente operación de préstamo de dinero se encuentra expresamente NO SUJETA al IVA, no generando débito fiscal alguno.`,
    });

    clauses.push({
      title: 'CLÁUSULA QUINTA (DESTINO Y APLICACIÓN DE FONDOS)',
      text: `Los fondos recibidos serán aplicados de manera estricta y comprobable para: "${contrato.destino_fondos}".`,
    });

    const fechaAsam = contrato.acta_asamblea_fecha || '15 de enero de 2026';
    const numAsam = contrato.acta_asamblea_numero || 'ASAM-EXT-2026-01';
    const pagLibro = contrato.libro_actas_paginas || '45 a la 48';
    clauses.push({
      title: 'CLÁUSULA SEXTA (APROBACIÓN EN ASAMBLEA Y ASENTAMIENTO EN LIBRO DE ACTAS)',
      text: `La recepción de los fondos en calidad de mutuo y sus condiciones de restitución fueron expresamente conocidas y autorizadas por la Asamblea General de Accionistas de LA MUTUARIA celebrada el ${fechaAsam} (${numAsam}), según consta asentado en las páginas Nro. ${pagLibro} del Libro de Actas de Asambleas de Accionistas sellado por el ${empresa.registro_mercantil}, sirviendo de soporte fehaciente de la acreencia ante el SENIAT y a los fines de su eventual capitalización o pago.`,
    });

    clauses.push({
      title: 'CLÁUSULA SÉPTIMA (PLAZO, RESTITUCIÓN Y JURISDICCIÓN)',
      text: `El plazo acordado para la restitución del capital es de ${contrato.plazo_meses} meses, con vencimiento el ${formatFechaLarga(contrato.fecha_vencimiento)}. Las partes eligen como domicilio especial la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}. Se firman dos (02) ejemplares en ${empresa.ciudad}, el ${formatFechaLarga(contrato.fecha_inicio)}.`,
    });
  }

  const fullBody = preamble + '\n\n' + clauses.map(c => `${c.title}:\n${c.text}`).join('\n\n');

  return { title, body: fullBody, clauses, preamble };
}

/**
 * Downloads the contract as a natively formatted Microsoft Word document (.doc)
 */
export function downloadContractWord(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): void {
  const { title, clauses } = generateContractText(contrato, empresa, accionista);
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmanteHTML = isDirectivoOGerente
    ? `en su carácter de <strong>${accionista.cargo_o_condicion || 'Director / Gerente'}</strong> y personal de confianza de la sociedad mercantil`
    : `en su carácter de accionista titular del <strong>${accionista.porcentaje_acciones}%</strong> del capital social`;

  const cargoFirmaHTML = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${accionista.departamento ? ` (${accionista.departamento})` : ''}`
    : `Accionista (${accionista.porcentaje_acciones}% Acciones)`;

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title} - ${contrato.correlativo}</title>
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
        @page {
          size: letter;
          margin: 2.5cm 2.5cm 2.5cm 2.5cm;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11.5pt;
          line-height: 1.4;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border-bottom: 2pt solid #1e3a8a;
          margin-bottom: 18pt;
          padding-bottom: 6pt;
          table-layout: fixed;
        }
        .company-name {
          font-size: 13pt;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
          word-break: break-word;
        }
        .company-details {
          font-size: 9.5pt;
          color: #334155;
        }
        .doc-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          margin-top: 14pt;
          margin-bottom: 8pt;
          color: #0f172a;
        }
        .correlativo-badge {
          text-align: center;
          font-size: 10pt;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 16pt;
        }
        p.clause-title {
          font-weight: bold;
          margin-top: 12pt;
          margin-bottom: 3pt;
          text-align: justify;
        }
        p.clause-text {
          margin-top: 0;
          margin-bottom: 10pt;
          text-indent: 24pt;
          text-align: justify;
        }
        .signatures-table {
          width: 100%;
          margin-top: 36pt;
          border-collapse: collapse;
          table-layout: fixed;
          page-break-inside: avoid;
        }
        .signature-cell {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 10pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 70%; vertical-align: top;">
            <div class="company-name">${empresa.razon_social}</div>
            <div class="company-details">R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}</div>
            <div class="company-details">Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado}</div>
          </td>
          <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="font-size: 9pt; font-weight: bold; color: #1e3a8a;">EXPEDIENTE TRIBUTARIO</div>
            <div style="font-size: 8pt; color: #64748b;">Art. 72 LISLR / VEN-NIF</div>
          </td>
        </tr>
      </table>

      <div class="doc-title">${title}</div>
      <div class="correlativo-badge">INSTRUMENTO LEGAL NRO: ${contrato.correlativo}</div>

      <p class="clause-text">
        Nosotros, <strong>${empresa.razon_social}</strong>, sociedad mercantil debidamente domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, inscrita en el Registro Mercantil bajo el R.I.F. Nro. <strong>${empresa.rif_empresa}</strong>, representada en este acto por su ${empresa.cargo_representante}, ciudadano(a) <strong>${empresa.representante_legal}</strong>, titular de la Cédula de Identidad Nro. <strong>${empresa.cedula_representante}</strong>, en lo sucesivo denominada "${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}", por una parte; y por la otra, el ciudadano(a) <strong>${accionista.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>${accionista.cedula_accionista}</strong> y R.I.F. Nro. <strong>${accionista.rif_accionista}</strong>, ${condicionFirmanteHTML}, quien se denominará "${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}", convenimos en suscribir el presente instrumento bajo las siguientes cláusulas:
      </p>

      ${clauses.map(c => `
        <p class="clause-title">${c.title}</p>
        <p class="clause-text">${c.text}</p>
      `).join('')}

      <table class="signatures-table" width="100%" cellpadding="0" cellspacing="0">
        <colgroup>
          <col width="50%" />
          <col width="50%" />
        </colgroup>
        <tr>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <span style="font-size: 9pt; text-transform: uppercase;">${empresa.razon_social}</span>
          </td>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${accionista.nombre_accionista}</strong><br/>
            C.I. V-${accionista.cedula_accionista}<br/>
            R.I.F. ${accionista.rif_accionista}<br/>
            <span style="font-size: 9pt;">${cargoFirmaHTML}</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Contrato_Mutuo_${contrato.correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the contract as a crisp, professional legal PDF using jsPDF
 */
export function downloadContractPDF(
  contrato: ContratoMutuo,
  empresa: Empresa,
  accionista: Accionista
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header Banner
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138); // Blue
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin, y);
  y += 4;
  doc.text(`Domicilio Fiscal: ${empresa.ciudad}, Estado ${empresa.estado}, Venezuela`, margin, y);
  y += 4;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Document Title
  const isCrypto = contrato.tipo_activo === 'USDT';
  const docTitle = isCrypto
    ? 'CONTRATO DE MUTUO DE BIENES MUEBLES DIGITALES'
    : 'CONTRATO DE MUTUO (PRÉSTAMO DE DINERO)';

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`CORRELATIVO OFICIAL: ${contrato.correlativo}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Document Content
  const { clauses } = generateContractText(contrato, empresa, accionista);
  const isSocioAEmpresa = contrato.tipo_flujo === 'socio_a_empresa';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmantePDF = isDirectivoOGerente
    ? `en su condición de ${accionista.cargo_o_condicion || 'Director / Gerente'} y personal de confianza de la sociedad`
    : `accionista titular del ${accionista.porcentaje_acciones}% del capital social`;

  const cargoFirmaPDF = isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}`
    : `Accionista (${accionista.porcentaje_acciones}%)`;

  const preamble = `Nosotros, ${empresa.razon_social}, R.I.F. Nro. ${empresa.rif_empresa}, debidamente representada por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, C.I. V-${empresa.cedula_representante}, ("${isSocioAEmpresa ? 'LA MUTUARIA' : 'LA MUTUANTE'}"), por una parte; y el ciudadano(a) ${accionista.nombre_accionista}, C.I. V-${accionista.cedula_accionista}, R.I.F. ${accionista.rif_accionista}, ${condicionFirmantePDF} ("${isSocioAEmpresa ? 'EL MUTUANTE' : 'EL MUTUARIO'}"), convenimos en suscribir el presente CONTRATO DE MUTUO bajo las siguientes cláusulas:`;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  const splitPreamble = doc.splitTextToSize(preamble, contentWidth);
  doc.text(splitPreamble, margin, y);
  y += splitPreamble.length * 4.5 + 4;

  // Loop through clauses with pagination check
  for (const clause of clauses) {
    // Check if we need a new page for clause title + some lines
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(clause.title, margin, y);
    y += 4.5;

    doc.setFont('times', 'normal');
    const splitClause = doc.splitTextToSize(clause.text, contentWidth);

    // If clause text spills across page boundary
    for (let i = 0; i < splitClause.length; i++) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitClause[i], margin, y);
      y += 4.2;
    }
    y += 3;
  }

  // Signatures
  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin + 10;
  }

  const col1X = margin + 20;
  const col2X = margin + contentWidth - 45;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(col1X - 15, y, col1X + 35, y);
  doc.line(col2X - 25, y, col2X + 25, y);
  y += 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(empresa.representante_legal, col1X + 10, y, { align: 'center' });
  doc.text(accionista.nombre_accionista, col2X, y, { align: 'center' });
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})`, col1X + 10, y, { align: 'center' });
  doc.text(`C.I. V-${accionista.cedula_accionista} (${cargoFirmaPDF})`, col2X, y, { align: 'center' });

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${p} de ${totalPages} • Expediente Tributario ${contrato.correlativo}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Contrato_Mutuo_${contrato.correlativo}.pdf`);
}

/**
 * Generates clean legal text for Acta de Asamblea matching the corporate Venezuelan model
 */
export function generateActaAsambleaText(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): string {
  const beneficiario = socioBeneficiario ||
    (contrato ? accionistas.find(a => a.id === contrato.accionista_id) : undefined) ||
    accionistas[0] || {
      nombre_accionista: 'Carlos Eduardo Mendoza Silva',
      cedula_accionista: '14.285.920',
      rif_accionista: 'V-14285920-1',
      porcentaje_acciones: 50,
      cargo_o_condicion: 'Accionista y Director',
    };

  const folios = acta?.libro_paginas || '45 a la 48';
  const fechaAsamblea = acta ? formatFechaLarga(acta.fecha_asamblea) : '15 de enero de 2026';
  const horaAsamblea = acta?.hora_inicio || '10:00 a.m.';

  // Shareholders presence in Universal Assembly (Art. 280 Código de Comercio)
  let sociosPresenciaTexto = '';
  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);

  if (sociosValidos.length >= 2) {
    sociosPresenciaTexto = sociosValidos.map((s, idx) => {
      const isLast = idx === sociosValidos.length - 1;
      const prefix = idx === 0 ? '' : (isLast ? ' y ' : '; ');
      const suffix = isLast ? ' restante del capital social' : ' del capital social';
      return `${prefix}${s.nombre_accionista}, titular de la Cédula de Identidad Nro. V-${s.cedula_accionista}, propietario de ${s.porcentaje_acciones}%${suffix}`;
    }).join('');
  } else if (sociosValidos.length === 1) {
    const s1 = sociosValidos[0];
    const s2Nombre = empresa.representante_legal !== s1.nombre_accionista ? empresa.representante_legal : 'María Alejandra Gómez Rivas';
    const s2CI = empresa.cedula_representante !== s1.cedula_accionista ? empresa.cedula_representante : '16.890.123';
    const p1 = s1.porcentaje_acciones > 0 && s1.porcentaje_acciones < 100 ? s1.porcentaje_acciones : 50;
    const p2 = 100 - p1;
    sociosPresenciaTexto = `${s1.nombre_accionista}, titular de la Cédula de Identidad Nro. V-${s1.cedula_accionista}, propietario de ${p1}% del capital social; y ${s2Nombre}, titular de la Cédula de Identidad Nro. V-${s2CI}, propietario del ${p2}% restante del capital social`;
  } else {
    sociosPresenciaTexto = `${empresa.representante_legal}, titular de la Cédula de Identidad Nro. V-${empresa.cedula_representante}, propietario de 50% del capital social; y Carlos Eduardo Mendoza Silva, titular de la Cédula de Identidad Nro. V-14.285.920, propietario del 50% restante del capital social`;
  }

  // Beneficiary condition: Accionista / Director
  const condicionBeneficiario = beneficiario.cargo_o_condicion
    ? beneficiario.cargo_o_condicion
    : (beneficiario.es_accionista !== false ? 'Accionista' : 'Director');

  // Loan amount
  let montoTexto = '';
  if (contrato) {
    if (contrato.tipo_activo === 'VES') {
      montoTexto = `${numeroALetras(contrato.monto_original)} BOLÍVARES (Bs. ${contrato.monto_original.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    } else if (contrato.tipo_activo === 'USDT') {
      montoTexto = `${numeroALetras(contrato.monto_original)} CRIPTOACTIVOS USDT (${formatUSDT(contrato.monto_original)})`;
    } else {
      montoTexto = `${numeroALetras(contrato.monto_original)} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA ($${contrato.monto_original.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) [equivalentes a ${formatVES(contrato.monto_indexado_ves)} a la tasa oficial del Banco Central de Venezuela]`;
    }
  } else if (acta?.monto_prestamo) {
    montoTexto = `${numeroALetras(acta.monto_prestamo)} BOLÍVARES (Bs. ${acta.monto_prestamo.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  } else {
    montoTexto = `CIEN MIL BOLÍVARES (Bs. 100.000,00)`;
  }

  // Restitution term
  const plazoTexto = contrato
    ? `${contrato.plazo_meses} meses (con fecha límite de restitución al ${formatFechaLarga(contrato.fecha_vencimiento)})`
    : `${acta?.plazo_meses || 12} meses`;

  // Intereses & Modalidad
  let clausulaInteresesSegundo = '';
  const modalidad = contrato?.modalidad_tasa || acta?.regimen_interes_autorizado || 'nominal_bcv_59';

  if (modalidad === 'indexado_uvc_16') {
    clausulaInteresesSegundo = `SEGUNDO: Aprobar que dicho crédito se instrumente a través de un Contrato de Mutuo Mercantil Oneroso indexado en Unidades de Valor de Crédito (UVC) conforme a la Resolución N° 26-08-01 del Banco Central de Venezuela (BCV), devengando una tasa de interés compensatoria del dieciséis por ciento (16%) anual sobre el saldo deudor expresado en UVC, garantizando así que la empresa reciba el rendimiento legal mínimo exigido para evitar reparos tributarios.`;
  } else if (modalidad === 'divisas_usd') {
    clausulaInteresesSegundo = `SEGUNDO: Aprobar que dicho crédito en divisas se instrumente a través de un Contrato de Mutuo Mercantil Oneroso al amparo del Convenio Cambiario N° 1 del BCV, y que devengue una tasa de interés del doce por ciento (12%) anual sobre el saldo deudor, garantizando así que la empresa reciba el rendimiento legal mínimo exigido para evitar reparos tributarios.`;
  } else {
    clausulaInteresesSegundo = `SEGUNDO: Aprobar que dicho crédito en Bolívares se instrumente a través de un Contrato de Mutuo Mercantil Oneroso y que devengue intereses compensatorios mensuales calculados bajo la modalidad de Tasa Nominal Anual Variable, tomando como referencia exacta la Tasa Activa Promedio Ponderada de los seis (6) principales bancos comerciales y universales del país publicada mensualmente por el Banco Central de Venezuela (BCV), garantizando así que la empresa reciba el rendimiento legal mínimo exigido para evitar reparos tributarios.`;
  }

  return `ACTA DE ASAMBLEA EXTRAORDINARIA DE ACCIONISTAS DE LA SOCIEDAD MERCANTIL ${empresa.razon_social.toUpperCase()}
(ASENTADA EN EL LIBRO DE ASAMBLEAS DE ACCIONISTAS - FOLIOS / PÁGINAS: ${folios})

En el día de hoy, ${fechaAsamblea}, siendo las ${horaAsamblea}, se reunieron en la sede social de la compañía, ubicada en ${empresa.direccion_fiscal}, la totalidad de los accionistas que representan el cien por ciento (100%) del capital social de la firma mercantil ${empresa.razon_social}, sociedad inscrita por ante el ${empresa.registro_mercantil}, bajo el Nro. ${empresa.registro_mercantil}, con el R.I.F. Nro. ${empresa.rif_empresa}. Se constata la presencia de los siguientes ciudadanos: ${sociosPresenciaTexto}.

Estando presente la totalidad del capital social y tratándose de una Asamblea Universal, de conformidad con el artículo 280 del Código de Comercio venezolano, los accionistas acuerdan prescindir de la convocatoria por prensa y declarar válidamente constituida la Asamblea para deliberar sobre el siguiente ORDEN DEL DÍA:

ÚNICO: Discusión y aprobación del otorgamiento de un préstamo mercantil oneroso (Contrato de Mutuo) a favor del [${condicionBeneficiario}] ciudadano ${beneficiario.nombre_accionista}, con cargo a los fondos excedentes de la compañía y bajo las condiciones financieras de mercado que exigen las leyes de la República.

DESARROLLO DEL ÚNICO PUNTO DEL ORDEN DEL DÍA: Tomó la palabra el Presidente de la Asamblea, quien expuso a la consideración de los presentes la solicitud formal realizada por el ciudadano ${beneficiario.nombre_accionista}, en su carácter de [${condicionBeneficiario}], relativa a la obtención de un financiamiento temporal por parte de la empresa por la cantidad de ${montoTexto}. El Presidente consignó los informes financieros actualizados que demuestran la existencia de suficiente liquidez en las cuentas bancarias de la sociedad, validando que dicho desembolso no afecta el normal desarrollo operativo del negocio. Asimismo, recalcó que, para dar estricto cumplimiento al artículo 73 de la Ley de Impuesto sobre la Renta y evitar contingencias fiscales ante el SENIAT, la operación se estructurará bajo la modalidad de Mutuo Oneroso en moneda nacional, devengando intereses nominales a favor de la empresa de acuerdo con las tasas de referencia emitidas por el Banco Central de Venezuela (BCV).

Luego de una breve deliberación, los accionistas aprobaron por unanimidad de votos los siguientes acuerdos:

PRIMERO: Autorizar formalmente a la sociedad mercantil para otorgar el préstamo al ciudadano ${beneficiario.nombre_accionista} por el monto antes señalado, con un plazo de restitución de ${plazoTexto}.

${clausulaInteresesSegundo}

TERCERO: Facultar ampliamente al ${empresa.cargo_representante}, ciudadano ${empresa.representante_legal}, para que en nombre y representación de la compañía suscriba, firme y formalice el respectivo Contrato de Mutuo Mercantil Oneroso con el beneficiario bajo los términos aprobados.

No habiendo otro punto que tratar, se dio por terminada la reunión, procediéndose a la redacción, lectura y firma de la presente acta por todos los asistentes en señal de conformidad.`;
}

/**
 * Downloads Acta de Asamblea as a formatted Microsoft Word (.doc)
 * with strict Word MSO formatting, boxed header that never overflows,
 * structured legal paragraphs, and perfectly ordered signature block.
 */
export function downloadActaWord(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): void {
  const text = generateActaAsambleaText(acta, empresa, accionistas, contrato, socioBeneficiario);
  const numActa = acta?.numero_acta || 'ASAM-EXT-2026';

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const sociosAFirmar = sociosValidos.length > 0 ? sociosValidos : [
    { nombre_accionista: empresa.representante_legal, cedula_accionista: empresa.cedula_representante, porcentaje_acciones: 50, cargo_o_condicion: empresa.cargo_representante },
    { nombre_accionista: 'Carlos Eduardo Mendoza Silva', cedula_accionista: '14.285.920', porcentaje_acciones: 50, cargo_o_condicion: 'Accionista y Secretario' },
  ];

  const presidente = sociosAFirmar[0];
  const secretario = sociosAFirmar.length > 1 ? sociosAFirmar[1] : {
    nombre_accionista: 'Secretario Ad-Hoc de la Asamblea',
    cedula_accionista: '15.432.876',
    porcentaje_acciones: 0,
    cargo_o_condicion: 'Secretario Ad-Hoc'
  };

  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

  const formattedParagraphsHtml = paragraphs.map((p) => {
    let content = p.trim().replace(/\n/g, '<br/>');

    if (content.startsWith('ACTA DE ASAMBLEA')) {
      const parts = content.split('<br/>');
      const titleLine = parts[0] || content;
      const subLine = parts.slice(1).join('<br/>');
      return `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 12.5pt; font-weight: bold; text-align: center; text-transform: uppercase; color: #0f172a; margin-top: 14pt; margin-bottom: 4pt; letter-spacing: 0.5pt;">
          ${titleLine}
        </div>
        ${subLine ? `
          <div style="font-family: 'Courier New', monospace; font-size: 9.5pt; font-weight: bold; text-align: center; color: #1e3a8a; margin-bottom: 16pt;">
            ${subLine}
          </div>
        ` : ''}
      `;
    }

    content = content
      .replace(/(ORDEN DEL DÍA:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(DESARROLLO DEL ÚNICO PUNTO DEL ORDEN DEL DÍA:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(PRIMERO:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(SEGUNDO:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(TERCERO:)/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/(ÚNICO:)/g, '<strong style="color: #0f172a;">$1</strong>');

    return `<p style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.45; text-align: justify; text-justify: inter-ideograph; margin-top: 0pt; margin-bottom: 10pt; color: #000000;">${content}</p>`;
  }).join('\n');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Acta de Asamblea - ${empresa.razon_social}</title>
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
        @page Section1 {
          size: 8.5in 11.0in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.45;
          color: #000000;
          margin: 0;
          padding: 0;
        }
        table.mso-table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          width: 100%;
          table-layout: fixed;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Encabezado enmarcado de ancho fijo que nunca se desborda -->
        <table class="mso-table" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 16pt; border: 1.5pt solid #1e3a8a; background-color: #f8fafc;">
          <tr>
            <td style="padding: 10pt 14pt; text-align: center; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="font-family: 'Arial', sans-serif; font-size: 12.5pt; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin-bottom: 3pt; line-height: 1.25; word-break: break-word;">
                ${empresa.razon_social}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #334155; margin-bottom: 2pt;">
                <strong>R.I.F.:</strong> ${empresa.rif_empresa} &nbsp;|&nbsp; <strong>REGISTRO MERCANTIL:</strong> ${empresa.registro_mercantil}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9pt; color: #475569;">
                <strong>Domicilio Fiscal:</strong> ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado} &nbsp;|&nbsp; <strong>Libro de Asambleas:</strong> Folios ${acta?.libro_paginas || '45 a la 48'}
              </div>
            </td>
          </tr>
        </table>

        <!-- Cuerpo del Acta formateado párrafo a párrafo -->
        ${formattedParagraphsHtml}

        <!-- Bloque de Firmas en estricto orden y alineación -->
        <table class="mso-table" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 36pt; page-break-inside: avoid;">
          <colgroup>
            <col width="50%" />
            <col width="50%" />
          </colgroup>
          <tr>
            <td style="width: 50%; vertical-align: top; text-align: center; padding: 12pt 18pt;">
              <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
                <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
              </table>
              <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase;">
                ${presidente.nombre_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #1e293b;">
                C.I. V-${presidente.cedula_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2pt;">
                Presidente de la Asamblea
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 8.5pt; color: #475569;">
                Accionista (${presidente.porcentaje_acciones}% Acciones)
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: center; padding: 12pt 18pt;">
              <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
                <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
              </table>
              <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase;">
                ${secretario.nombre_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #1e293b;">
                C.I. V-${secretario.cedula_accionista}
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2pt;">
                Secretario de la Asamblea
              </div>
              <div style="font-family: 'Times New Roman', serif; font-size: 8.5pt; color: #475569;">
                Accionista (${secretario.porcentaje_acciones}% Acciones)
              </div>
            </td>
          </tr>
          ${sociosAFirmar.length > 2 ? `
            <tr>
              ${sociosAFirmar.slice(2, 4).map(s => `
                <td style="width: 50%; vertical-align: top; text-align: center; padding: 24pt 18pt 12pt 18pt;">
                  <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
                    <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
                  </table>
                  <div style="font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase;">
                    ${s.nombre_accionista}
                  </div>
                  <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #1e293b;">
                    C.I. V-${s.cedula_accionista}
                  </div>
                  <div style="font-family: 'Times New Roman', serif; font-size: 9.5pt; font-weight: bold; color: #1e3a8a; margin-top: 2pt;">
                    Accionista (${s.porcentaje_acciones}%)
                  </div>
                </td>
              `).join('')}
            </tr>
          ` : ''}
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Acta_Asamblea_${numActa}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Acta de Asamblea as a fully structured, styled Microsoft Excel spreadsheet (.xlsx)
 * formatted for SENIAT fiscal audits, shareholder ledger records, and corporate compliance.
 */
export function downloadActaExcel(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): void {
  const numActa = acta?.numero_acta || 'ASAM-EXT-2026-01';
  const folios = acta?.libro_paginas || '45 a la 48';
  const fechaAsamblea = acta ? formatFechaLarga(acta.fecha_asamblea) : '15 de enero de 2026';
  const horaAsamblea = acta?.hora_inicio || '10:00 a.m.';

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const sociosListado = sociosValidos.length > 0 ? sociosValidos : [
    { nombre_accionista: empresa.representante_legal, cedula_accionista: empresa.cedula_representante, rif_accionista: `V-${empresa.cedula_representante}-0`, porcentaje_acciones: 50, cargo_o_condicion: empresa.cargo_representante },
    { nombre_accionista: 'Carlos Eduardo Mendoza Silva', cedula_accionista: '14.285.920', rif_accionista: 'V-14285920-1', porcentaje_acciones: 50, cargo_o_condicion: 'Accionista y Secretario' },
  ];

  const fullText = generateActaAsambleaText(acta, empresa, accionistas, contrato, socioBeneficiario);
  const textParagraphs = fullText.split('\n\n').filter(p => p.trim().length > 0);

  const regimenInteres = acta?.regimen_interes_autorizado === 'indexado_uvc_16'
    ? 'Indexado UVC 16% (Resolución BCV N° 26-08-01)'
    : (acta?.regimen_interes_autorizado === 'divisas_usd'
      ? 'Divisas USD 12% (Convenio Cambiario N° 1 BCV)'
      : 'Tasa Activa Promedio Ponderada BCV ~59% (Art. 73 LISLR)');

  const montoPagarUSD = acta?.monto_maximo_autorizado_pagar || 150000;
  const montoCobrarUSD = acta?.monto_maximo_autorizado_cobrar || 25000;

  const rows: any[][] = [
    [empresa.razon_social.toUpperCase()],
    ['ACTA DE ASAMBLEA EXTRAORDINARIA DE ACCIONISTAS - EXPEDIENTE TRIBUTARIO SENIAT'],
    [`R.I.F.: ${empresa.rif_empresa} | ${empresa.registro_mercantil} | Domicilio: ${empresa.direccion_fiscal}, ${empresa.ciudad}`],
    [],
    ['1. FICHA TÉCNICA Y CONTROL DE ASENTAMIENTO EN LIBRO MERCANTIL'],
    ['Número de Control del Acta', numActa, '', 'Tipo de Asamblea', 'Asamblea Extraordinaria (Universal)'],
    ['Fecha de Celebración', `${fechaAsamblea} (${horaAsamblea})`, '', 'Quórum de Asistencia', '100,00% del Capital Social'],
    ['Folios del Libro Físico', `Páginas / Folios ${folios}`, '', 'Estatus Libro Mercantil', acta?.estatus_libro_fisico ? 'Asentado en Libro Oficial' : 'Pendiente Transcripción en Libro'],
    ['Régimen de Intereses (Art. 73 LISLR)', regimenInteres],
    ['Límite Autorizado a Pagar (Mutuante)', montoPagarUSD, '', 'Límite Autorizado a Cobrar (Mutuario)', montoCobrarUSD],
    [],
    ['2. NÓMINA DE ACCIONISTAS ASISTENTES (QUÓRUM UNIVERSAL ART. 280 C.COM)'],
    ['Item', 'Nombre y Apellidos del Accionista', 'Cédula de Identidad', 'R.I.F. Fiscal', 'Cargo / Condición', '% Acciones', 'Rol en la Asamblea']
  ];

  sociosListado.forEach((s, idx) => {
    rows.push([
      idx + 1,
      s.nombre_accionista.toUpperCase(),
      `V-${s.cedula_accionista}`,
      s.rif_accionista || `V-${s.cedula_accionista}-0`,
      s.cargo_o_condicion || 'Accionista Titular',
      `${s.porcentaje_acciones.toFixed(2)}%`,
      idx === 0 ? 'Presidente de la Asamblea' : (idx === 1 ? 'Secretario de la Asamblea' : 'Accionista Asistente')
    ]);
  });

  rows.push([]);
  rows.push(['3. TRANSCRIPCIÓN OFICIAL DEL ACTA (TEXTO ÍNTEGRO PARA EL LIBRO MERCANTIL)']);
  textParagraphs.forEach(para => {
    rows.push([para]);
  });

  rows.push([]);
  rows.push(['Documento emitido electrónicamente por el Sistema SOCIO-DOC • Cumplimiento Art. 280 Código de Comercio, Art. 73 LISLR y VEN-NIF.']);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 8 },
    { wch: 38 },
    { wch: 20 },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Acta de Asamblea');
  XLSX.writeFile(wb, `Acta_Asamblea_${numActa}.xlsx`);
}

/**
 * Downloads Acta de Asamblea as a professional legal PDF
 */
export function downloadActaPDF(
  acta: ActaAsamblea | undefined,
  empresa: Empresa,
  accionistas: Accionista[],
  contrato?: ContratoMutuo,
  socioBeneficiario?: Accionista
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Box
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin, y);
  y += 4;
  doc.text(`Asentada en el Libro de Actas de Asambleas - Folios: ${acta?.libro_paginas || '45 a la 48'}`, margin, y);
  y += 4;

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('ACTA DE ASAMBLEA GENERAL EXTRAORDINARIA DE ACCIONISTAS', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text(`IDENTIFICADOR: ${acta?.numero_acta || 'ASAM-EXT-2026-01'}`, pageWidth / 2, y, { align: 'center' });
  y += 7;

  const text = generateActaAsambleaText(acta, empresa, accionistas, contrato, socioBeneficiario);
  const paragraphs = text.split('\n\n');

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  for (const para of paragraphs) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }

    const isBoldHeader = para.startsWith('ACTA DE ASAMBLEA') || para.startsWith('ÚNICO:') || para.startsWith('DESARROLLO') || para.startsWith('PRIMERO:') || para.startsWith('SEGUNDO:') || para.startsWith('TERCERO:');

    if (isBoldHeader) {
      doc.setFont('times', 'bold');
    } else {
      doc.setFont('times', 'normal');
    }

    const lines = doc.splitTextToSize(para.trim(), contentWidth);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += 4.5;
    }
    y += 2.5;
  }

  // Signatures
  if (y > pageHeight - 42) {
    doc.addPage();
    y = margin + 12;
  }

  const sociosValidos = accionistas.filter(a => a.empresa_id === empresa.id);
  const sociosAFirmar = sociosValidos.length > 0 ? sociosValidos.slice(0, 2) : [
    { nombre_accionista: empresa.representante_legal, cedula_accionista: empresa.cedula_representante, porcentaje_acciones: 50 },
    { nombre_accionista: 'Carlos Eduardo Mendoza Silva', cedula_accionista: '14.285.920', porcentaje_acciones: 50 },
  ];

  const centerCol1 = margin + (contentWidth * 0.25);
  const centerCol2 = margin + (contentWidth * 0.75);

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(centerCol1 - 32, y + 10, centerCol1 + 32, y + 10);
  doc.line(centerCol2 - 32, y + 10, centerCol2 + 32, y + 10);
  y += 15;

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(sociosAFirmar[0].nombre_accionista.toUpperCase(), centerCol1, y, { align: 'center' });
  if (sociosAFirmar[1]) {
    doc.text(sociosAFirmar[1].nombre_accionista.toUpperCase(), centerCol2, y, { align: 'center' });
  }
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`C.I. V-${sociosAFirmar[0].cedula_accionista} (Presidente - ${sociosAFirmar[0].porcentaje_acciones}%)`, centerCol1, y, { align: 'center' });
  if (sociosAFirmar[1]) {
    doc.text(`C.I. V-${sociosAFirmar[1].cedula_accionista} (Secretario - ${sociosAFirmar[1].porcentaje_acciones}%)`, centerCol2, y, { align: 'center' });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${p} de ${totalPages} • Expediente Corporativo SENIAT`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Acta_Asamblea_${acta?.numero_acta || 'ASAM-EXT-2026'}.pdf`);
}

/**
 * Generates text for Recibo Mensual de Cobro de Intereses al Socio (SENIAT Art. 73 LISLR)
 */
export function generateReciboInteresesText(
  contrato: ContratoMutuo | undefined,
  empresa: Empresa,
  accionista?: Accionista | null,
  mesLiquidado: string = 'Febrero 2026',
  tasaBCV: number = 412.50
): string {
  const socio = accionista || {
    nombre_accionista: 'Carlos Eduardo Mendoza Silva',
    cedula_accionista: '14.285.920',
    rif_accionista: 'V-14285920-1',
    cargo_o_condicion: 'Accionista Titular',
    porcentaje_acciones: 50,
  };

  const capitalUSD = contrato?.monto_original || 10000;
  const capitalVES = contrato ? contrato.monto_indexado_ves : (capitalUSD * tasaBCV);
  
  // Nominal BCV ~59.12% anual -> 4.926% mensual
  const tasaAnual = contrato?.tasa_interes_anual || (contrato?.tasa_interes_anual || 16.0);
  const tasaMensual = tasaAnual / 12;

  const interesBrutoVES = (capitalVES * (tasaMensual / 100));
  const interesBrutoUSD = (capitalUSD * (tasaMensual / 100));

  // Retención 5% ISLR (Decreto 1.808 Art. 9 num. 8)
  const retencionISLR_VES = interesBrutoVES * 0.05;
  const retencionISLR_USD = interesBrutoUSD * 0.05;

  const netoCobrarVES = interesBrutoVES - retencionISLR_VES;
  const netoCobrarUSD = interesBrutoUSD - retencionISLR_USD;

  return `================================================================================
RECIBO MENSUAL DE LIQUIDACIÓN Y COBRO DE INTERESES MERCANTILES
(COMPROBANTE DE INGRESO FINANCIERO - BLINDAJE ART. 73 LISLR ANTE EL SENIAT)
Control Correlativo Nro: REC-INT-2026-02-${contrato?.correlativo || 'MUT-2026-0001'}
================================================================================

DATOS DE LA EMPRESA (MUTUANTE / ACREEDORA):
Razón Social: ${empresa.razon_social}
R.I.F.: ${empresa.rif_empresa}
Condición Fiscal: Contribuyente ${empresa.tipo_contribuyente} (Sujeto Pasivo Especial)
Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado}

DATOS DEL BENEFICIARIO (MUTUARIO / DEUDOR):
Ciudadano(a): ${socio.nombre_accionista}
Cédula de Identidad: V-${socio.cedula_accionista} | R.I.F.: ${socio.rif_accionista}
Carácter: ${socio.cargo_o_condicion || 'Accionista / Director'} titular del ${socio.porcentaje_acciones}% del capital social

FUNDAMENTACIÓN Y REFERENCIA LEGAL:
• Contrato de Mutuo Mercantil Oneroso Nro.: ${contrato?.correlativo || 'MUT-2026-0001'}
• Aprobación en Asamblea Extraordinaria: Acta asentada en los Folios ${contrato?.soporte?.recibo_caja_correlativo ? '45 a la 48' : '45 a la 48'} del Libro de Actas de Asambleas de Accionistas.
• Fundamento Tributario: Artículo 73 de la Ley de Impuesto sobre la Renta (LISLR) - Rendimiento financiero para desvirtuar Dividendo Ficto o Presunto.
• Calificación IVA: NO SUJETO AL IMPUESTO AL VALOR AGREGADO conforme al Artículo 16, Numeral 3 de la Ley de IVA (Decreto Constituyente / Gaceta Oficial Nro. 6.507 Extraordinario).
• Retención de ISLR: Decreto 1.808 (Reglamento de Retenciones de ISLR), Artículo 9, Numeral 8 (5% para personas naturales residentes / 3% para personas jurídicas).

LIQUIDACIÓN FINANCIERA DEL PERÍODO:
Período Liquidado: ${mesLiquidado} (30 días de causación efectiva)
Saldo de Capital Adeudado: ${formatVES(capitalVES)} (${formatUSD(capitalUSD)})
Régimen Aplicado: Tasa Activa Promedio Ponderada BCV (Art. 73 LISLR)
Tasa Nominal Anual BCV Aplicada: ${tasaAnual.toFixed(2)}% Anual (Tasa Mensual: ${tasaMensual.toFixed(4)}%)

DESGLOSE DE LA OPERACIÓN:
(+) Intereses Compensatorios Devengados (Bruto):   ${formatVES(interesBrutoVES)} (${formatUSD(interesBrutoUSD)})
(-) Retención de ISLR 5% (Decreto 1.808):         -${formatVES(retencionISLR_VES)} (-${formatUSD(retencionISLR_USD)})
--------------------------------------------------------------------------------
(=) NETO A COBRAR / ENTERAR POR LA EMPRESA:         ${formatVES(netoCobrarVES)} (${formatUSD(netoCobrarUSD)})

ASIENTO DE DIARIO CONTABLE (VEN-NIF / PRINCIPIOS CONTABLES VENEZOLANOS):
--------------------------------------------------------------------------------
CÓDIGO          CUENTA CONTABLE                               DÉBITO        CRÉDITO
1.01.02.01.001  Banco Nacional Moneda de Curso Legal          ${formatVES(netoCobrarVES)}
1.01.03.02.001  Anticipo de Impuesto / Retención ISLR 5%      ${formatVES(retencionISLR_VES)}
4.02.01.01.001  Ingresos Financieros por Intereses de Mutuo                 ${formatVES(interesBrutoVES)}
(Para registrar causación y cobro de intereses sobre mutuo a socio según Art. 73 LISLR)
--------------------------------------------------------------------------------

DECLARACIÓN DE CONFORMIDAD:
La empresa ${empresa.razon_social} declara haber liquidado la presente mensualidad y el mutuario declara su plena aceptación del cálculo financiero efectuado conforme a las regulaciones del Banco Central de Venezuela (BCV) y las disposiciones del SENIAT.

POR LA EMPRESA (MUTUANTE):                    EL MUTUARIO (BENEFICIARIO):
________________________________              ________________________________
${empresa.representante_legal}                ${socio.nombre_accionista}
C.I. V-${empresa.cedula_representante}        C.I. V-${socio.cedula_accionista}
${empresa.cargo_representante}                ${socio.cargo_o_condicion || 'Accionista'}
(Sello Húmedo de la Empresa)`;
}

/**
 * Downloads Recibo Mensual de Intereses as formatted Microsoft Word (.doc)
 */
export function downloadReciboInteresesWord(
  contrato: ContratoMutuo | undefined,
  empresa: Empresa,
  accionista?: Accionista | null,
  mesLiquidado: string = 'Mes en Curso 2026',
  tasaBCVCierre?: number
): void {
  const text = generateReciboInteresesText(contrato, empresa, accionista, mesLiquidado, tasaBCVCierre);
  const correlativo = contrato?.correlativo || 'REC-INT-2026';
  const socio = accionista || {
    nombre_accionista: 'Accionista / Beneficiario',
    cedula_accionista: '12.345.678',
    rif_accionista: 'V-12345678-0',
    cargo_o_condicion: 'Accionista Titular',
    porcentaje_acciones: 50,
  };

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Recibo de Intereses - ${correlativo}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.4; color: #111; margin: 20mm 20mm; }
        .header-box { text-align: center; font-weight: bold; border-bottom: 2pt solid #0f766e; padding-bottom: 6pt; margin-bottom: 12pt; }
        .receipt-title { font-size: 13pt; text-transform: uppercase; color: #0f766e; margin-bottom: 3pt; font-family: 'Arial', sans-serif; }
        .receipt-sub { font-size: 9pt; font-family: 'Courier New', monospace; color: #475569; }
        .receipt-body { font-family: 'Courier New', monospace; font-size: 9.5pt; white-space: pre-wrap; margin-bottom: 15pt; background: #f8fafc; padding: 12pt; border: 1pt solid #cbd5e1; }
        .signatures-table { width: 100%; margin-top: 30pt; border-collapse: collapse; }
        .sig-cell { width: 50%; text-align: center; vertical-align: top; padding: 10pt; }
        .sig-line { border-top: 1pt solid #333; width: 80%; margin: 0 auto 6pt auto; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="receipt-title">${empresa.razon_social}</div>
        <div class="receipt-sub">R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}</div>
        <div class="receipt-sub">Comprobante Oficial de Intereses (Art. 73 LISLR • No Sujeto a IVA Art. 16 LIVA)</div>
      </div>
      <div class="receipt-body">${text}</div>
      <table class="signatures-table">
        <tr>
          <td class="sig-cell">
            <div class="sig-line"></div>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <strong>${empresa.razon_social}</strong>
          </td>
          <td class="sig-cell">
            <div class="sig-line"></div>
            <strong>${socio.nombre_accionista}</strong><br/>
            C.I. V-${socio.cedula_accionista}<br/>
            ${socio.cargo_o_condicion || 'Accionista / Mutuario'}<br/>
            R.I.F. ${socio.rif_accionista}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Recibo_Intereses_${correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Recibo Mensual de Intereses as a professional legal PDF
 */
export function downloadReciboInteresesPDF(
  contrato: ContratoMutuo | undefined,
  empresa: Empresa,
  accionista?: Accionista | null,
  mesLiquidado: string = 'Mes en Curso 2026',
  tasaBCVCierre?: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110); // Teal 700
  doc.text(empresa.razon_social.toUpperCase(), margin, y);
  y += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • Domicilio: ${empresa.ciudad}, Estado ${empresa.estado}`, margin, y);
  y += 4;
  doc.text(`Contribuyente Especial • ${empresa.registro_mercantil}`, margin, y);
  y += 4;

  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RECIBO MENSUAL DE LIQUIDACIÓN DE INTERESES DE PRÉSTAMO A SOCIO', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  const correlativo = contrato?.correlativo || 'REC-INT-2026-001';
  doc.text(`NÚMERO DE CONTROL FISCAL: ${correlativo} | PERÍODO: ${mesLiquidado.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  const text = generateReciboInteresesText(contrato, empresa, accionista, mesLiquidado, tasaBCVCierre);
  const lines = text.split('\n');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  for (const line of lines) {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
    }

    if (line.includes('===') || line.includes('---')) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(line.substring(0, 85), margin, y);
      doc.setFont('courier', 'normal');
      doc.setTextColor(30, 41, 59);
    } else if (line.startsWith('DATOS') || line.startsWith('FUNDAMENTACIÓN') || line.startsWith('LIQUIDACIÓN') || line.startsWith('DESGLOSE') || line.startsWith('ASIENTO')) {
      doc.setFont('courier', 'bold');
      doc.setTextColor(15, 118, 110);
      doc.text(line, margin, y);
      doc.setFont('courier', 'normal');
      doc.setTextColor(30, 41, 59);
    } else {
      doc.text(line.substring(0, 95), margin, y);
    }
    y += 3.8;
  }

  // Footer & Page count
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} • Respaldo Tributario Art. 73 LISLR / Art. 16 LIVA - ${empresa.razon_social}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Recibo_Intereses_${correlativo}.pdf`);
}

/**
 * Generates the comprehensive legal text for the Contrato Marco de Apertura de Línea de Crédito Rotativa
 * (Mutuo Rotativo mediante Cuenta Corriente Mercantil - 1 solo documento notariado al año para agrupar múltiples transferencias)
 */
export function generateLineaCreditoRotativaText(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoPersonalizadoUSD?: number,
  tasaAnualPersonalizada?: number
): { title: string; body: string; clauses: { title: string; text: string }[]; preamble: string } {
  const isAgrícolaOni = empresa.razon_social.toUpperCase().includes('AGRICOLA ONI') || empresa.razon_social.toUpperCase().includes('AGRICOLA ONI, C.A.');
  const isManuelBecerra = accionista.nombre_accionista.toUpperCase().includes('BECERRA') || accionista.cedula_accionista.includes('24.224.176') || accionista.cedula_accionista.includes('24224176');
  const isVESLimit = Boolean(
    contrato?.limite_linea_credito_ves || 
    contrato?.tipo_activo === 'VES' || 
    (contrato?.monto_original && contrato.monto_original >= 1000000) || 
    isAgrícolaOni
  );

  const limiteVES = contrato?.limite_linea_credito_ves || 
    (contrato?.tipo_activo === 'VES' ? contrato.monto_original : 600000000.00);
  const techoUSD = techoPersonalizadoUSD || contrato?.limite_linea_credito_usd || (limiteVES / (contrato?.tasa_bcv_fecha || 633.36));
  
  // Tasa de mercado de los 6 principales bancos de Venezuela (BCV Art. 72 y 73 LISLR)
  const tasaAnual = tasaAnualPersonalizada || contrato?.tasa_interes_anual || (isAgrícolaOni ? 16.0 : 12.0);
  const tasaMensual = (tasaAnual / 12).toFixed(2);
  const techoLetrasVES = numeroALetras(limiteVES).toUpperCase();
  const techoLetrasUSD = numeroALetras(techoUSD);
  const fechaAsam = formatFechaLarga(contrato?.fecha_inicio || '2026-01-15');
  const pagLibro = '45 al 48';

  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmante = isManuelBecerra
    ? `en su carácter de mutuario y socio del ciudadano ELÍAS RAFAEL TRÍAS ABREU en sociedad mercantil vinculada constituida conjuntamente por ellos (no teniendo condición de accionista en ${empresa.razon_social})`
    : isDirectivoOGerente
    ? `en su carácter de ${accionista.cargo_o_condicion || 'Director / Gerente'} y personal de confianza de la sociedad mercantil`
    : `en su condición de accionista y titular propietario del ${accionista.porcentaje_acciones}% del capital social de la compañía`;

  const facultadTextoPreambulo = isAgrícolaOni || empresa.facultad_estatutaria_mutuo || contrato?.facultad_estatutaria_mutuo
    ? `debidamente facultado(a) según los Estatutos Sociales de la compañía inscritos en el Registro de Comercio en fecha 13/09/2021, específicamente en su CAPÍTULO IV, CLÁUSULA DÉCIMA CUARTA, NUMERAL O, que confiere atribución expresa para intervenir en todas las actuaciones que tengan por objeto adquirir, vender, hipotecar, gravar o limitar inmuebles, suscribir acciones en la compañía y otras cualesquiera, dividir bienes y raíces, DAR O RECIBIR DINERO EN MUTUO, CELEBRAR CUALQUIER ACTO O CONTRATO SIN NECESIDAD DE AUTORIZACIÓN DE LA ASAMBLEA`
    : `facultado(a) según los Estatutos Sociales vigentes de la sociedad`;

  const title = isAgrícolaOni || isVESLimit
    ? 'CONTRATO DE LÍNEA DE CRÉDITO GENERAL EN CUENTA CORRIENTE MERCANTIL (MUTUO ROTATIVO)'
    : 'CONTRATO MARCO DE APERTURA DE LÍNEA DE CRÉDITO ROTATIVA MEDIANTE CUENTA CORRIENTE MERCANTIL (MUTUO ROTATIVO)';

  const preamble = `Nosotros, ${empresa.razon_social}, sociedad mercantil legalmente constituida y domiciliada en ${empresa.ciudad}, Estado ${empresa.estado}, inscrita por ante el ${empresa.registro_mercantil}, con el Registro de Información Fiscal (R.I.F.) Nro. ${empresa.rif_empresa}, en este acto válidamente representada por su ${empresa.cargo_representante}, ciudadano(a) ${empresa.representante_legal}, titular de la Cédula de Identidad Nro. V-${empresa.cedula_representante}, ${facultadTextoPreambulo}, en lo sucesivo y para todos los efectos denominada "LA MUTUANTE" (o LA ACREDITANTE), por una parte; y por la otra, el ciudadano(a) ${accionista.nombre_accionista}, mayor de edad, titular de la Cédula de Identidad Nro. V-${accionista.cedula_accionista} y con R.I.F. Nro. ${accionista.rif_accionista || `V-${accionista.cedula_accionista}-0`}, ${condicionFirmante}, en lo sucesivo denominado "EL MUTUARIO" (o EL ACREDITADO), convenimos en celebrar el presente ${title}, el cual se regirá por las disposiciones del Código de Comercio venezolano, el Código Civil, la Ley de Impuesto Sobre la Renta y las siguientes cláusulas:`;

  const clauses: { title: string; text: string }[] = [
    {
      title: 'CLÁUSULA PRIMERA (OBJETO Y LÍMITE MÁXIMO DE LA LÍNEA DE CRÉDITO GENERAL)',
      text: isVESLimit
        ? `LA MUTUANTE conviene en abrir y mantener disponible a favor de EL MUTUARIO una Línea de Crédito General rotativa por un monto límite consolidado (Techo Máximo de Crédito) de ${formatVES(limiteVES)} (${techoLetrasVES} BOLÍVARES), durante el plazo improrrogable de un (1) año. Por tratarse de una línea de crédito de carácter rotativo en cuenta corriente mercantil, los pagos, amortizaciones o restituciones de fondos que realice EL MUTUARIO reconstituirán automáticamente la disponibilidad crediticia en igual cuantía, permitiéndole efectuar nuevas solicitudes y retiros sin necesidad de otorgar nuevos instrumentos contractuales, siempre y cuando el saldo deudor consolidado no exceda en ningún momento del límite máximo establecido.`
        : `LA MUTUANTE conviene en abrir y mantener disponible a favor de EL MUTUARIO una Línea de Crédito Rotativa no garantizada hasta por un monto máximo consolidado (Techo Máximo de Crédito) de ${formatUSD(techoUSD)} (${techoLetrasUSD} DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA), o su contravalor en Bolívares liquidado al tipo de cambio oficial de referencia publicado por el Banco Central de Venezuela (BCV) a la fecha de cada disposición. Por tratarse de una línea de crédito de carácter rotativo, los pagos, amortizaciones o restituciones de capital que realice EL MUTUARIO durante la vigencia del contrato reconstituirán automáticamente la disponibilidad crediticia en igual cuantía, permitiéndole efectuar nuevas solicitudes y retiros sin necesidad de otorgar nuevos instrumentos contractuales, siempre y cuando el saldo deudor no exceda en ningún momento del límite máximo establecido.`,
    },
    {
      title: 'CLÁUSULA SEGUNDA (DE LAS DISPOSICIONES MÚLTIPLES MEDIANTE SALIDAS Y TRANSFERENCIAS DE BANESCO BANCO UNIVERSAL)',
      text: `Queda expresamente convenido que EL MUTUARIO podrá hacer uso de la presente línea de crédito mediante múltiples y sucesivas solicitudes de fondos o transferencias bancarias electrónicas realizadas desde las cuentas de LA MUTUANTE en BANESCO BANCO UNIVERSAL hacia las cuentas personales o bancarias de EL MUTUARIO. Cada salida bancaria individual de Banesco constituirá una utilización efectiva del crédito, quedando las partes expresamente eximidas de suscribir contratos particulares o adicionales por cada desembolso, bastando como plena prueba de la deuda y de su aceptación el comprobante oficial de débito bancario emitido por Banesco Banco Universal y el estado de cuenta auxiliar de la empresa ante el SENIAT.`,
    },
    {
      title: 'CLÁUSULA TERCERA (REGISTRO Y CONTROL EN CUENTA CORRIENTE MERCANTIL AUXILIAR - ART. 503 CÓDIGO DE COMERCIO)',
      text: `Las operaciones dinerarias de desembolso, disposición de fondos y amortizaciones derivadas de la presente línea de crédito rotativa se canalizarán y registrarán bajo el régimen de Cuenta Corriente Mercantil, de conformidad con lo preceptuado en los Artículos 503 y siguientes del Código de Comercio de la República Bolivariana de Venezuela y los principios de contabilidad generalmente aceptados (VEN-NIF). A tal efecto, LA MUTUANTE mantendrá un libro auxiliar analítico denominado "Cuentas por Cobrar Accionistas y Entidades Vinculadas" donde se asentarán cronológicamente cada una de las transferencias efectuadas, los saldos diarios deudores y los abonos de capital, constituyendo la contabilidad mercantil de la sociedad plena prueba fehaciente de las obligaciones entre las partes y soporte auditable ante el Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT).`,
    },
    {
      title: 'CLÁUSULA CUARTA (RÉGIMEN DE INTERESES - TASA DE MERCADO DE LOS 6 PRINCIPALES BANCOS DE VENEZUELA Y ART. 72 Y 73 LISLR)',
      text: `En estricto cumplimiento de los Artículos 72 y 73 de la Ley de Impuesto Sobre la Renta (LISLR) y para enervar y desvirtuar de pleno derecho cualquier presunción legal de dividendo ficto o de intereses presuntos o disminuidos ante el SENIAT, los saldos efectivamente dispuestos de la línea de crédito devengarán a favor de LA MUTUANTE un interés corriente fijado a la TASA ACTIVA PROMEDIO PONDERADA DE LOS SEIS (6) PRINCIPALES BANCOS COMERCIALES Y UNIVERSALES DEL PAÍS con mayor volumen de depósitos, fijada y publicada mensualmente por el Banco Central de Venezuela (BCV) (la cual actualmente se ubica en el ${tasaAnual.toFixed(2)}% anual, equivalente al ${tasaMensual}% mensual). Dicha tasa se aplicará de conformidad con las variaciones oficiales que certifique el Ente Emisor. Los intereses se computarán y liquidarán mensualmente sobre el saldo promedio deudor diario que arroje la cuenta corriente mercantil al cierre de cada mes calendario (año comercial de 360 días).`,
    },
    {
      title: 'CLÁUSULA QUINTA (MEMORIA DE CÁLCULO MENSUAL, EMISIÓN DE NOTA DE DÉBITO FISCAL NO SUJETA AL IVA Y RETENCIÓN DE ISLR)',
      text: `Al cierre de cada mes calendario, el Departamento Contable de LA MUTUANTE elaborará una Memoria de Cálculo Auxiliar (Papel de Trabajo de Auditoría) en la cual se detallarán de forma cronológica las salidas bancarias de Banesco realizadas durante el período, los saldos diarios ponderados y la liquidación matemática de los intereses causados. Con fundamento en dicha Memoria de Cálculo mensual, LA MUTUANTE emitirá una única Nota de Débito Fiscal mensual (bajo formato autorizado por el SENIAT según Providencia SNAT/2011/00071) a cargo de EL MUTUARIO por el monto total de los intereses devengados en el mes.\nPARÁGRAFO PRIMERO: De conformidad con el Artículo 16, Numeral 3 de la Ley que Establece el Impuesto al Valor Agregado (LIVA), la presente operación de financiamiento dinerario y sus intereses se encuentra expresamente NO SUJETA AL IMPUESTO AL VALOR AGREGADO (IVA), asentándose en el Libro de Ventas en la columna de operaciones no gravadas.\nPARÁGRAFO SEGUNDO: Al momento de la liquidación y cobro de intereses, se practicará la retención del Impuesto Sobre la Renta (ISLR) del cinco por ciento (5%) sobre el monto bruto de los intereses devengados, de conformidad con el Artículo 9, Numeral 8 del Decreto Nro. 1.808 (Reglamento Parcial de Retenciones de ISLR), por tratarse EL MUTUARIO de una persona natural residente en el territorio nacional, enterándose en las arcas del Tesoro Nacional dentro del calendario fiscal del SENIAT.`,
    },
    {
      title: isAgrícolaOni || empresa.facultad_estatutaria_mutuo || contrato?.facultad_estatutaria_mutuo
        ? 'CLÁUSULA SEXTA (DE LA POTESTAD ESTATUTARIA EXPRESA Y EXENCIÓN DE AUTORIZACIÓN DE ASAMBLEA - CAPÍTULO IV, CLÁUSULA DÉCIMA CUARTA, NUMERAL O)'
        : 'CLÁUSULA SEXTA (AUTORIZACIÓN CORPORATIVA Y ASENTAMIENTO EN LIBRO DE ACTAS)',
      text: isAgrícolaOni || empresa.facultad_estatutaria_mutuo || contrato?.facultad_estatutaria_mutuo
        ? `Las partes dejan expresa y formal constancia de que, de conformidad con los Estatutos Sociales vigentes de LA MUTUANTE debidamente inscritos por ante el Registro de Comercio en fecha 13 de septiembre de 2021, el Director Presidente cuenta con la potestad estatutaria directa, suficiente, autónoma e incondicional contemplada en el CAPÍTULO IV, CLÁUSULA DÉCIMA CUARTA, NUMERAL O: "Intervenir en todas las actuaciones que tenga por objeto, adquirir, vender, hipotecar, gravar o limitar inmuebles, suscribir acciones en la compañía y otras cualesquiera, dividir bienes y raíces, dar o recibir, dinero en mutuo, celebrar cualquier acto o contrato sin necesidad de autorización de la asamblea". En tal virtud, el otorgamiento de la presente línea de crédito general goza de plena validez, fuerza vinculante y eficacia jurídica de pleno derecho desde su suscripción, sin requerir convocatoria ni autorización previa de la asamblea de accionistas, dotando a las operaciones de blindaje corporativo irrefutable ante el SENIAT y terceros.`
        : `El otorgamiento de la presente línea de crédito rotativa, la fijación del techo crediticio y las condiciones financieras pactadas cuentan con la autorización previa, expresa y unánime de los accionistas que representan el cien por ciento (100%) del capital social de LA MUTUANTE en Asamblea General Extraordinaria de Accionistas de fecha ${fechaAsam}, debidamente asentada en las páginas Nro. ${pagLibro} del Libro de Actas de Asambleas de Accionistas sellado por el ${empresa.registro_mercantil}, sirviendo de soporte corporativo inimpugnable ante el SENIAT.`,
    },
    {
      title: 'CLÁUSULA SÉPTIMA (DE LA RELACIÓN SOCIETARIA Y VINCULACIÓN ENTRE LAS PARTES)',
      text: isManuelBecerra
        ? `Las partes declaran formal y expresamente que el ciudadano MANUEL ALEJANDRO BECERRA LUIS (C.I. V-24.224.176, RIF V24224176-9) es socio del ciudadano ELÍAS RAFAEL TRÍAS ABREU (C.I. V-2.997.829, RIF V23997829-7) en otra empresa mercantil formalmente constituida por ellos, no teniendo condición de accionista en AGRICOLA ONI, C.A. La presente línea de crédito general se otorga en consideración a dicha vinculación comercial legítima y de mutua confianza, bajo estrictos estándares de materialidad, transparencia corporativa y justificación de fondos lícitos, descartándose de plano toda simulación o interposición de personas ante la Administración Tributaria.`
        : `Las partes declaran que la presente línea de crédito se instrumenta bajo el marco de relaciones de confianza corporativa y transparencia operativa, cumpliendo cabalmente los postulados de debida diligencia mercantil y tributaria.`,
    },
    {
      title: 'CLÁUSULA OCTAVA (PLAZO, REPOSICIÓN Y VIGENCIA ANUAL)',
      text: `El plazo de duración de la presente línea de crédito rotativa es de doce (12) meses (un año) contados a partir de su suscripción o autenticación notarial. A su vencimiento, el contrato podrá ser renovado anualmente de mutuo acuerdo. EL MUTUARIO podrá amortizar total o parcialmente el capital adeudado en cualquier momento mediante transferencias bancarias a las cuentas de LA MUTUANTE en Banesco Banco Universal, cheques o compensación mercantil lícita, sin penalidad alguna.`,
    },
    {
      title: 'CLÁUSULA NOVENA (DOMICILIO, NOTIFICACIONES Y AUTENTICACIÓN NOTARIAL)',
      text: `Para todos los efectos derivados y consecuencias del presente contrato, las partes eligen como domicilio especial y excluyente a la ciudad de ${empresa.ciudad}, Estado ${empresa.estado}, a la jurisdicción de cuyos tribunales declaran someterse. Se suscriben dos (02) ejemplares de un mismo tenor y a un solo efecto en ${empresa.ciudad}, a los fines de su autenticación ante la Notaría Pública correspondiente, confiriéndole fecha cierta y plena oponibilidad ante el SENIAT y terceros mediante un único acto notarial anual.`,
    },
  ];

  const fullBody = preamble + '\n\n' + clauses.map(c => `${c.title}:\n${c.text}`).join('\n\n');

  return { title, body: fullBody, clauses, preamble };
}

/**
 * Downloads the Contrato Marco de Línea de Crédito Rotativa as Microsoft Word (.doc)
 */
export function downloadLineaCreditoWord(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoUSD?: number,
  tasaAnual?: number
): void {
  const { title, body, clauses } = generateLineaCreditoRotativaText(contrato, empresa, accionista, techoUSD, tasaAnual);
  const isAgrícolaOni = empresa.razon_social.toUpperCase().includes('AGRICOLA ONI');
  const isVESLimit = Boolean(
    contrato?.limite_linea_credito_ves || 
    contrato?.tipo_activo === 'VES' || 
    (contrato?.monto_original && contrato.monto_original >= 1000000) || 
    isAgrícolaOni
  );
  const limiteVES = contrato?.limite_linea_credito_ves || (contrato?.tipo_activo === 'VES' ? contrato.monto_original : 600000000.00);
  const limite = techoUSD || contrato?.limite_linea_credito_usd || (limiteVES / (contrato?.tasa_bcv_fecha || 633.36));
  const tasa = tasaAnual || contrato?.tasa_interes_anual || (isAgrícolaOni ? 16.0 : 12.0);

  const isManuelBecerra = accionista.nombre_accionista.toUpperCase().includes('BECERRA') || accionista.cedula_accionista.includes('24.224.176') || accionista.cedula_accionista.includes('24224176');
  const isDirectivoOGerente =
    accionista.es_accionista === false ||
    accionista.porcentaje_acciones === 0 ||
    accionista.tipo_vinculo === 'director' ||
    accionista.tipo_vinculo === 'gerente' ||
    accionista.tipo_vinculo === 'personal_confianza';

  const condicionFirmanteHTML = isManuelBecerra
    ? `en su carácter de <strong>Mutuario y Socio en Empresa Vinculada</strong> (socio del Sr. Elías Rafael Trías Abreu en otra entidad jurídica, sin tenencia accionaria directa en ${empresa.razon_social})`
    : isDirectivoOGerente
    ? `en su carácter de <strong>${accionista.cargo_o_condicion || 'Director / Gerente'}</strong> y personal de confianza de la sociedad mercantil`
    : `en su condición de accionista y titular propietario del <strong>${accionista.porcentaje_acciones}%</strong> del capital social`;

  const cargoFirmaHTML = isManuelBecerra
    ? 'Mutuario / Socio Empresa Vinculada (C.I. V-24.224.176)'
    : isDirectivoOGerente
    ? `${accionista.cargo_o_condicion || 'Director / Gerente de Confianza'}${accionista.departamento ? ` (${accionista.departamento})` : ''}`
    : `Accionista (${accionista.porcentaje_acciones}% Acciones)`;

  const correlativo = contrato?.correlativo || 'LC-ONI-2026-0001';
  const preambleText = body.split('\n\n')[0];

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title} - ${correlativo}</title>
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
        @page {
          size: letter;
          margin: 1in 1in 1in 1in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
          text-align: justify;
          text-justify: inter-ideograph;
        }
        .header-box {
          width: 100%;
          table-layout: fixed;
          border: 1.5pt solid #1e3a8a;
          background-color: #f8fafc;
          margin-bottom: 16pt;
          border-collapse: collapse;
        }
        .header-box td {
          padding: 8pt 10pt;
          vertical-align: top;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .company-name {
          font-size: 12pt;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
        }
        .company-details {
          font-size: 8.5pt;
          color: #334155;
          line-height: 1.3;
        }
        .doc-title {
          font-size: 13pt;
          font-weight: bold;
          text-align: center;
          margin-top: 14pt;
          margin-bottom: 6pt;
          color: #0f172a;
          line-height: 1.25;
          text-transform: uppercase;
        }
        .correlativo-badge {
          text-align: center;
          font-size: 9.5pt;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 14pt;
        }
        .techo-banner {
          width: 100%;
          border: 1pt dashed #0284c7;
          background-color: #f0f9ff;
          padding: 6pt 10pt;
          margin-bottom: 14pt;
          font-size: 9.5pt;
          color: #0369a1;
          text-align: center;
          font-weight: bold;
        }
        p.preamble-text {
          margin-top: 0;
          margin-bottom: 12pt;
          text-indent: 28pt;
          text-align: justify;
        }
        p.clause-title {
          font-weight: bold;
          font-size: 11pt;
          margin-top: 14pt;
          margin-bottom: 4pt;
          color: #0f172a;
          text-align: justify;
        }
        p.clause-text {
          margin-top: 0;
          margin-bottom: 10pt;
          text-indent: 28pt;
          text-align: justify;
        }
        .signatures-table {
          width: 100%;
          margin-top: 36pt;
          border-collapse: collapse;
          table-layout: fixed;
          page-break-inside: avoid;
        }
        .signature-cell {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 10pt;
        }
      </style>
    </head>
    <body>
      <table class="header-box" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 70%;">
            <div class="company-name">${empresa.razon_social}</div>
            <div class="company-details"><strong>R.I.F.:</strong> ${empresa.rif_empresa} • <strong>REGISTRO:</strong> ${empresa.registro_mercantil}</div>
            <div class="company-details"><strong>DOMICILIO FISCAL:</strong> ${empresa.direccion_fiscal}, ${empresa.ciudad}, Edo. ${empresa.estado}</div>
            <div class="company-details"><strong>CONDICIÓN FISCAL:</strong> Contribuyente ${empresa.tipo_contribuyente}</div>
          </td>
          <td style="width: 30%; text-align: right;">
            <div style="font-size: 9pt; font-weight: bold; color: #1e3a8a;">BLINDAJE TRIBUTARIO SENIAT</div>
            <div style="font-size: 8pt; color: #475569;">Facultad Estatutaria 13/09/2021</div>
            <div style="font-size: 8pt; color: #475569;">Cap. IV Cláusula 14ª Numeral O</div>
            <div style="font-size: 8pt; color: #475569;">Tasa Mercado 6 Bancos BCV</div>
          </td>
        </tr>
      </table>

      <div class="doc-title">${title}</div>
      <div class="correlativo-badge">INSTRUMENTO LEGAL NOTARIAL NRO: ${correlativo}</div>

      <div class="techo-banner">
        TECHO MÁXIMO AUTORIZADO: ${isVESLimit ? `${formatVES(limiteVES)} (Bs. 600.000.000,00)` : `$${formatUSD(limite)} USD`} • TASA PACTADA: ${tasa}% ANUAL (Tasa Mercado 6 Bancos BCV) • MODALIDAD: LÍNEA DE CRÉDITO GENERAL EN CUENTA CORRIENTE ROTATIVA
      </div>

      <p class="preamble-text">
        ${preambleText}
      </p>

      ${clauses.map(c => `
        <p class="clause-title">${c.title}</p>
        <p class="clause-text">${c.text}</p>
      `).join('')}

      <table class="signatures-table" width="100%" cellpadding="0" cellspacing="0">
        <colgroup>
          <col width="50%" />
          <col width="50%" />
        </colgroup>
        <tr>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${empresa.representante_legal}</strong><br/>
            C.I. V-${empresa.cedula_representante}<br/>
            ${empresa.cargo_representante}<br/>
            <span style="font-size: 8.5pt; text-transform: uppercase;">Por LA MUTUANTE (${empresa.razon_social})</span><br/>
            <span style="font-size: 8pt; color: #475569;">(Facultado según Cap. IV Cláusula 14ª Numeral O del 13/09/2021)</span>
          </td>
          <td class="signature-cell">
            <table width="85%" align="center" style="margin: 0 auto 6pt auto; border-top: 1.5pt solid #000000; border-collapse: collapse;">
              <tr><td style="font-size: 1pt; height: 1px; line-height: 1px;">&nbsp;</td></tr>
            </table>
            <strong>${accionista.nombre_accionista}</strong><br/>
            C.I. V-${accionista.cedula_accionista}<br/>
            R.I.F. ${accionista.rif_accionista || `V-${accionista.cedula_accionista}-0`}<br/>
            <span style="font-size: 8.5pt;">Por EL MUTUARIO (${cargoFirmaHTML})</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Contrato_Linea_Credito_General_${correlativo}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the Contrato Marco de Línea de Crédito Rotativa as PDF
 */
export function downloadLineaCreditoPDF(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoUSD?: number,
  tasaAnual?: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const { title, body, clauses } = generateLineaCreditoRotativaText(contrato, empresa, accionista, techoUSD, tasaAnual);
  const isAgrícolaOni = empresa.razon_social.toUpperCase().includes('AGRICOLA ONI');
  const isVESLimit = Boolean(
    contrato?.limite_linea_credito_ves || 
    contrato?.tipo_activo === 'VES' || 
    (contrato?.monto_original && contrato.monto_original >= 1000000) || 
    isAgrícolaOni
  );
  const limiteVES = contrato?.limite_linea_credito_ves || (contrato?.tipo_activo === 'VES' ? contrato.monto_original : 600000000.00);
  const limite = techoUSD || contrato?.limite_linea_credito_usd || (limiteVES / (contrato?.tasa_bcv_fecha || 633.36));
  const tasa = tasaAnual || contrato?.tasa_interes_anual || (isAgrícolaOni ? 16.0 : 12.0);
  const correlativo = contrato?.correlativo || 'LC-ONI-2026-0001';

  const margin = 20;
  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Box
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, usableWidth, 22, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text(empresa.razon_social, margin + 4, y + 5);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, margin + 4, y + 9);
  doc.text(`Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Edo. ${empresa.estado}`, margin + 4, y + 13);
  doc.text(`Condición Fiscal: Contribuyente ${empresa.tipo_contribuyente}`, margin + 4, y + 17);

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('BLINDAJE TRIBUTARIO SENIAT', pageWidth - margin - 4, y + 5, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Facultad Estatutaria 13/09/2021', pageWidth - margin - 4, y + 9, { align: 'right' });
  doc.text(`Límite: ${isVESLimit ? formatVES(limiteVES) : `$${formatUSD(limite)}`} • Tasa 6 Bancos: ${tasa}%`, pageWidth - margin - 4, y + 13, { align: 'right' });
  doc.text('Art. 72 y 73 LISLR • Art. 16 Num 3 LIVA', pageWidth - margin - 4, y + 17, { align: 'right' });

  y += 26;

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(title, usableWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 4.5 + 1;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`INSTRUMENTO NOTARIAL NRO: ${correlativo}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Banner
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, usableWidth, 6, 1, 1, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(3, 105, 161);
  const bannerText = isVESLimit
    ? `LÍNEA GENERAL: ${formatVES(limiteVES)} • TASA MERCADO 6 BANCOS BCV (${tasa}%) • BANESCO BANCO UNIVERSAL`
    : `LÍNEA ROTATIVA: ${formatUSD(limite)} USD • 12% INTERÉS ANUAL • EXENCIÓN DE CONTRATOS MENSUALES`;
  doc.text(bannerText, pageWidth / 2, y + 4.2, { align: 'center' });
  y += 9;

  // Preamble
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const preambleText = body.split('\n\n')[0];
  const pLines = doc.splitTextToSize(preambleText, usableWidth);
  doc.text(pLines, margin, y, { align: 'justify', maxWidth: usableWidth });
  y += pLines.length * 4 + 3;

  // Clauses
  for (const clause of clauses) {
    if (y > pageHeight - 32) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const cTitleLines = doc.splitTextToSize(clause.title, usableWidth);
    doc.text(cTitleLines, margin, y);
    y += cTitleLines.length * 3.8 + 1;

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const cTextLines = doc.splitTextToSize(clause.text, usableWidth);
    for (const line of cTextLines) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 3.6;
    }
    y += 2.5;
  }

  // Signatures
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin + 10;
  } else {
    y += 8;
  }

  const colWidth = usableWidth / 2;
  const lineW = 60;

  // Left signature (Empresa)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, y, margin + 10 + lineW, y);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(empresa.representante_legal, margin + 10 + lineW / 2, y + 4, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`C.I. V-${empresa.cedula_representante} • ${empresa.cargo_representante}`, margin + 10 + lineW / 2, y + 7.5, { align: 'center' });
  doc.text(`Por LA MUTUANTE (${empresa.razon_social.substring(0, 30)})`, margin + 10 + lineW / 2, y + 11, { align: 'center' });
  doc.text(`(Facultado Cap. IV Cláusula 14ª Numeral O 13/09/2021)`, margin + 10 + lineW / 2, y + 14.5, { align: 'center' });

  // Right signature (Accionista)
  const rightX = margin + colWidth + 10;
  doc.line(rightX, y, rightX + lineW, y);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.text(accionista.nombre_accionista, rightX + lineW / 2, y + 4, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text(`C.I. V-${accionista.cedula_accionista} • R.I.F. ${accionista.rif_accionista || `V-${accionista.cedula_accionista}-0`}`, rightX + lineW / 2, y + 7.5, { align: 'center' });
  doc.text(`Por EL MUTUARIO (Socio Empresa Vinculada)`, rightX + lineW / 2, y + 11, { align: 'center' });

  // Footers
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('times', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} • Contrato de Línea de Crédito General - Respaldo SENIAT Art. 72 y 73 LISLR / Art. 16 LIVA - ${empresa.razon_social}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Contrato_Linea_Credito_General_${correlativo}.pdf`);
}

/**
 * Downloads the Contrato Marco de Línea de Crédito Rotativa as an Excel document (.xlsx)
 * with the Ficha Técnica, Tracking Table for Multiple Transfers, and Legal Contract
 */
export function downloadLineaCreditoExcel(
  contrato: ContratoMutuo | null | undefined,
  empresa: Empresa,
  accionista: Accionista,
  techoUSD?: number,
  tasaAnual?: number
): void {
  const { title, clauses } = generateLineaCreditoRotativaText(contrato, empresa, accionista, techoUSD, tasaAnual);
  const isAgrícolaOni = empresa.razon_social.toUpperCase().includes('AGRICOLA ONI');
  const isVESLimit = Boolean(
    contrato?.limite_linea_credito_ves || 
    contrato?.tipo_activo === 'VES' || 
    (contrato?.monto_original && contrato.monto_original >= 1000000) || 
    isAgrícolaOni
  );
  const limiteVES = contrato?.limite_linea_credito_ves || (contrato?.tipo_activo === 'VES' ? contrato.monto_original : 600000000.00);
  const limite = techoUSD || contrato?.limite_linea_credito_usd || (limiteVES / (contrato?.tasa_bcv_fecha || 633.36));
  const tasa = tasaAnual || contrato?.tasa_interes_anual || (isAgrícolaOni ? 16.0 : 12.0);
  const correlativo = contrato?.correlativo || 'LC-ONI-2026-0001';

  const wb = XLSX.utils.book_new();

  // Sheet 1: Ficha Técnica
  const rowsFicha: any[][] = [
    [empresa.razon_social.toUpperCase()],
    ['EXPEDIENTE TRIBUTARIO: LÍNEA DE CRÉDITO ROTATIVA CON DISPOSICIONES MÚLTIPLES'],
    [`R.I.F. ${empresa.rif_empresa} • Mutuario: ${accionista.nombre_accionista} (C.I. V-${accionista.cedula_accionista})`],
    [],
    ['1. PARÁMETROS GENERALES DEL CONTRATO NOTARIAL'],
    ['Instrumento:', `${correlativo} - Apertura de Línea General de Crédito`, '', 'Techo Máximo:', isVESLimit ? limiteVES : limite],
    ['Mutuante:', `${empresa.razon_social} (RIF: ${empresa.rif_empresa})`, '', 'Tasa Interés:', `${tasa}% Anual (${(tasa / 12).toFixed(2)}% Mensual - Mercado 6 Bancos BCV)`],
    ['Mutuario:', `${accionista.nombre_accionista} (CI: ${accionista.cedula_accionista})`, '', 'Régimen IVA:', 'No Sujeto (Art. 16 Num 3 LIVA)'],
    ['Potestad Legal:', 'Cap. IV Cláusula 14ª Numeral O (Reg. 13/09/2021)', '', 'Retención ISLR:', '5% Dto. 1808 (Personas Naturales Residentes)'],
    [],
    ['2. CRONOGRAMA DE DISPOSICIONES BANCARIAS Y CÁLCULO DE INTERESES'],
    [
      'N°',
      'Fecha Tx',
      'Referencia Banesco',
      'Banco & Beneficiario',
      'Días Mes',
      isVESLimit ? 'Salida Banesco (VES)' : 'Monto Dispuesto (USD)',
      isVESLimit ? 'Interés Mes (VES)' : 'Interés Mes (USD)',
      isVESLimit ? 'Ret. ISLR 5% (VES)' : 'Equiv. Bs (BCV)'
    ]
  ];

  const txRows = isVESLimit ? [
    { n: 1, f: '20/01/2026', ref: 'REF-BCO-55410928', b: 'Banesco (Manuel Becerra)', d: 29, ves: 150000000 },
    { n: 2, f: '10/02/2026', ref: 'REF-BCO-77821903', b: 'Banesco (Manuel Becerra)', d: 27, ves: 200000000 },
    { n: 3, f: '05/03/2026', ref: 'REF-BCO-99120485', b: 'Banesco (Manuel Becerra)', d: 24, ves: 125000000 },
    { n: 4, f: '18/03/2026', ref: 'REF-BCO-11849203', b: 'Banesco (Manuel Becerra)', d: 13, ves: 75000000 },
  ] : [
    { n: 1, f: '18/01/2026', ref: 'REF-BCO-0091823', b: 'Banco Mercantil (Transferencia)', d: 30, usd: 2500 },
    { n: 2, f: '25/01/2026', ref: 'TX-BNB-8837190', b: 'Binance USDT (Red TRC-20)', d: 23, usd: 1800 },
    { n: 3, f: '02/02/2026', ref: 'REC-CAJA-0044', b: 'Caja Central USD Efectivo', d: 16, usd: 2800 },
  ];

  let totalMonto = 0;
  let totalInteres = 0;
  let totalRet = 0;

  txRows.forEach(t => {
    const val = (t as any).ves || (t as any).usd;
    const interes = (val * (tasa / 100) * t.d) / 360;
    const retencion = isVESLimit ? (interes * 0.05) : (interes * 44.52);
    totalMonto += val;
    totalInteres += interes;
    totalRet += retencion;

    rowsFicha.push([
      t.n,
      t.f,
      t.ref,
      t.b,
      t.d,
      val,
      Number(interes.toFixed(2)),
      Number(retencion.toFixed(2))
    ]);
  });

  rowsFicha.push([
    'TOTAL',
    '',
    'Disposiciones acumuladas',
    '',
    '',
    totalMonto,
    Number(totalInteres.toFixed(2)),
    Number(totalRet.toFixed(2))
  ]);

  const wsFicha = XLSX.utils.aoa_to_sheet(rowsFicha);
  wsFicha['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 22 },
    { wch: 32 },
    { wch: 12 },
    { wch: 24 },
    { wch: 22 },
    { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFicha, 'Ficha Técnica');

  // Sheet 2: Contrato Notarial
  const rowsContrato: any[][] = [
    [title],
    [],
    ['Encabezamiento / Partes:'],
    [`Nosotros, ${empresa.razon_social} (LA MUTUANTE) y ${accionista.nombre_accionista} (EL MUTUARIO), convenimos en suscribir el presente Contrato Marco de Apertura de Línea de Crédito Rotativa.`],
    []
  ];

  clauses.forEach(c => {
    rowsContrato.push([c.title, c.text]);
  });

  rowsContrato.push([]);
  rowsContrato.push(['Firma LA MUTUANTE:', `${empresa.representante_legal} - C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})`]);
  rowsContrato.push(['Firma EL MUTUARIO:', `${accionista.nombre_accionista} - C.I. V-${accionista.cedula_accionista} (Accionista ${accionista.porcentaje_acciones}%)`]);

  const wsContrato = XLSX.utils.aoa_to_sheet(rowsContrato);
  wsContrato['!cols'] = [
    { wch: 32 },
    { wch: 75 }
  ];
  XLSX.utils.book_append_sheet(wb, wsContrato, 'Texto Contrato Notarial');

  XLSX.writeFile(wb, `Expediente_Linea_Credito_Rotativa_${correlativo}.xlsx`);
}

/**
 * Generates structured text for a single Recibo de Cupo / Disposición
 */
export function generateReciboCupoText(
  recibo: ReciboCupo,
  empresa: Empresa,
  accionista: Accionista,
  contrato?: ContratoMutuo
): {
  title: string;
  reciboNumero: string;
  cupoNumero: number;
  empresaTexto: string;
  mutuarioTexto: string;
  montoTexto: string;
  montoLetras: string;
  bancoTexto: string;
  referenciaTexto: string;
  estatutosTexto: string;
  declaracionTributaria: string;
  controlLinea: {
    limiteTotal: number;
    acumuladoPrevio: number;
    disposicionActual: number;
    acumuladoActual: number;
    disponibleRestante: number;
    porcentajeConsumido: number;
  };
} {
  const montoLetras = numeroALetras(recibo.monto_ves).toUpperCase();
  const title = `RECIBO DE DISPOSICIÓN DE CUPO NRO. ${recibo.numero_recibo} (CUPO ${recibo.numero_cupo} DE 29)`;

  const estatutosTexto = empresa.facultad_estatutaria_mutuo || 
    'Registro de Comercio de fecha 13/09/2021, bajo el Nro. 24, Tomo 89-A (Capítulo IV, Cláusula Décima Cuarta, Numeral O: Intervenir en todas las actuaciones que tenga por objeto dar o recibir dinero en mutuo y celebrar cualquier acto o contrato sin necesidad de autorización de la asamblea).';

  const declaracionTributaria = `La presente entrega se efectúa con cargo al Contrato Marco de Línea de Crédito Rotativa Nro. ${recibo.contrato_correlativo}. La operación devenga intereses a la Tasa Activa Promedio Ponderada de los 6 principales bancos comerciales de Venezuela fijada por el BCV (${recibo.tasa_interes_anual}% anual / ${recibo.tasa_interes_mensual}% mensual), sujeta a retención del ${recibo.retencion_islr_porcentaje}% de I.S.L.R. de conformidad con el Decreto 1808 y desvirtuando presunción de dividendo conforme a los Artículos 72 y 73 de la LISLR. Operación no sujeta a IVA de conformidad con el Artículo 16 Numeral 3 de la Ley del IVA. El Sr. Manuel Alejandro Becerra Luis (C.I. V-24.224.176, RIF V24224176-9) declara que es socio del Sr. Elías Rafael Trías Abreu (C.I. V-2.997.829, RIF V23997829-7) en otra sociedad mercantil formalmente constituida, no poseyendo acciones en Agrícola Oni, C.A., acreditando transparencia absoluta ante la Administración Tributaria.`;

  return {
    title,
    reciboNumero: recibo.numero_recibo,
    cupoNumero: recibo.numero_cupo,
    empresaTexto: `${empresa.razon_social} (R.I.F. ${empresa.rif_empresa})`,
    mutuarioTexto: `${accionista.nombre_accionista} (C.I. V-${accionista.cedula_accionista} / R.I.F. ${accionista.rif_accionista})`,
    montoTexto: `${formatVES(recibo.monto_ves)} (${formatUSD(recibo.monto_usd)} USD aprox. a Tasa BCV Bs. ${recibo.tasa_bcv.toFixed(2)})`,
    montoLetras,
    bancoTexto: `${recibo.banco_emisor} • Cta. Origen: ${recibo.cuenta_origen} -> Cta. Destino: ${recibo.cuenta_destino}`,
    referenciaTexto: recibo.referencia_bancaria,
    estatutosTexto,
    declaracionTributaria,
    controlLinea: {
      limiteTotal: recibo.limite_linea_ves,
      acumuladoPrevio: recibo.acumulado_anterior_ves,
      disposicionActual: recibo.monto_ves,
      acumuladoActual: recibo.acumulado_actual_ves,
      disponibleRestante: recibo.remanente_disponible_ves,
      porcentajeConsumido: recibo.porcentaje_consumido,
    }
  };
}

/**
 * Downloads a single Recibo de Cupo as Microsoft Word (.doc)
 */
export function downloadReciboCupoWord(
  recibo: ReciboCupo,
  empresa: Empresa,
  accionista: Accionista,
  contrato?: ContratoMutuo
): void {
  const data = generateReciboCupoText(recibo, empresa, accionista, contrato);

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        @page {
          size: letter;
          margin: 1in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border: 1.5pt solid #1e3a8a;
          background-color: #f8fafc;
          margin-bottom: 14pt;
          border-collapse: collapse;
        }
        .header-table td {
          padding: 8pt 10pt;
          vertical-align: top;
        }
        .title {
          font-size: 13pt;
          font-weight: bold;
          text-align: center;
          color: #1e3a8a;
          margin: 12pt 0;
          text-transform: uppercase;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin: 10pt 0;
        }
        .table-data th, .table-data td {
          border: 1pt solid #cbd5e1;
          padding: 6pt 8pt;
          font-size: 10pt;
        }
        .table-data th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: left;
        }
        .highlight {
          font-weight: bold;
          color: #1e3a8a;
        }
        .signatures {
          margin-top: 35pt;
          width: 100%;
          border-collapse: collapse;
        }
        .signatures td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 0 15pt;
          font-size: 9.5pt;
        }
        .sig-line {
          border-top: 1pt solid #000000;
          padding-top: 4pt;
          margin-top: 45pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td>
            <strong style="font-size: 12pt; color: #1e3a8a;">${empresa.razon_social}</strong><br/>
            <span style="font-size: 9pt; color: #475569;">
              R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}<br/>
              Domicilio: ${empresa.direccion_fiscal}, ${empresa.ciudad}, Estado ${empresa.estado}
            </span>
          </td>
          <td style="text-align: right; width: 35%;">
            <strong style="color: #047857; font-size: 11pt;">COMPROBANTE OFICIAL SENIAT</strong><br/>
            <span style="font-family: monospace; font-size: 10pt; font-weight: bold; color: #1e3a8a;">${recibo.numero_recibo}</span><br/>
            <span style="font-size: 8.5pt; color: #64748b;">Fecha: ${formatFechaLarga(recibo.fecha)}</span>
          </td>
        </tr>
      </table>

      <div class="title">
        RECIBO DE DISPOSICIÓN DE CUPO ROTATIVO NRO. ${recibo.numero_cupo} DE 29<br/>
        <span style="font-size: 10pt; font-weight: normal; color: #475569;">Amparado bajo Contrato Marco de Línea de Crédito General Nro. ${recibo.contrato_correlativo}</span>
      </div>

      <p>
        Por medio del presente documento, la sociedad mercantil <strong>${empresa.razon_social}</strong> (R.I.F. <strong>${empresa.rif_empresa}</strong>), debidamente representada por su Director Presidente, ciudadano <strong>${empresa.representante_legal}</strong> (C.I. <strong>${empresa.cedula_representante}</strong>), actuando con fundamento en la potestad estatutaria directa contenida en el <strong>${data.estatutosTexto}</strong>, hace constar la entrega material e irrevocable de fondos por concepto de desembolso parcial de cupo de la Línea de Crédito Rotativa autorizada al ciudadano <strong>${accionista.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>V-${accionista.cedula_accionista}</strong> y R.I.F. Nro. <strong>${accionista.rif_accionista}</strong>, por los siguientes conceptos y especificaciones:
      </p>

      <table class="table-data">
        <tr>
          <th style="width: 35%;">Concepto de Operación:</th>
          <td>Disposición de Cupo Nro. ${recibo.numero_cupo} de 29 en Línea de Crédito Rotativa General</td>
        </tr>
        <tr>
          <th>Monto Desembolsado (VES):</th>
          <td class="highlight">${formatVES(recibo.monto_ves)} Bs.</td>
        </tr>
        <tr>
          <th>Monto en Letras:</th>
          <td><strong>${data.montoLetras} BOLÍVARES CON ${((recibo.monto_ves % 1) * 100).toFixed(0).padStart(2, '0')}/100 CÉNTIMOS</strong></td>
        </tr>
        <tr>
          <th>Equivalente Oficial BCV:</th>
          <td>$${formatUSD(recibo.monto_usd)} USD (Tasa Oficial BCV: Bs. ${recibo.tasa_bcv.toFixed(2)} / USD)</td>
        </tr>
        <tr>
          <th>Banco Emisor & Cuenta Origen:</th>
          <td>${recibo.banco_emisor} • Cuenta Nro. ${recibo.cuenta_origen}</td>
        </tr>
        <tr>
          <th>Cuenta Destino Beneficiario:</th>
          <td>${accionista.nombre_accionista} • Cuenta Banesco Nro. ${recibo.cuenta_destino}</td>
        </tr>
        <tr>
          <th>Referencia Bancaria Electrónica:</th>
          <td style="font-family: monospace; font-weight: bold; color: #1e3a8a;">${recibo.referencia_bancaria}</td>
        </tr>
        <tr>
          <th>Concepto Extracto Bancario:</th>
          <td style="font-size: 8.5pt;">${recibo.concepto}</td>
        </tr>
      </table>

      <div style="margin: 12pt 0; font-size: 10pt; font-weight: bold; color: #0f172a;">
        CONTROL Y ESTADO ROTATIVO DE LA LÍNEA DE CRÉDITO GENERAL (LÍMITE AUTORIZADO: Bs. 600.000.000,00):
      </div>

      <table class="table-data" style="font-size: 9.5pt;">
        <tr style="background-color: #f8fafc;">
          <th>Límite Máximo Aprobado:</th>
          <th>Disposiciones Previas:</th>
          <th>Este Desembolso (${recibo.numero_recibo}):</th>
          <th>Total Acumulado:</th>
          <th>Cupo Remanente:</th>
        </tr>
        <tr>
          <td>${formatVES(recibo.limite_linea_ves)}</td>
          <td>${formatVES(recibo.acumulado_anterior_ves)}</td>
          <td style="color: #b45309; font-weight: bold;">${formatVES(recibo.monto_ves)}</td>
          <td style="font-weight: bold;">${formatVES(recibo.acumulado_actual_ves)}</td>
          <td style="color: #047857; font-weight: bold;">${formatVES(recibo.remanente_disponible_ves)}</td>
        </tr>
      </table>

      <p style="font-size: 9.5pt; color: #334155; margin-top: 10pt;">
        <strong>BLINDAJE Y CONFORMIDAD TRIBUTARIA SENIAT:</strong> ${data.declaracionTributaria}
      </p>

      <table class="signatures">
        <tr>
          <td>
            <div class="sig-line">
              <strong>POR LA EMPRESA MUTUANTE</strong><br/>
              <strong>${empresa.razon_social}</strong><br/>
              ${empresa.representante_legal}<br/>
              C.I. V-${empresa.cedula_representante} • R.I.F. ${empresa.rif_representante || 'V-23997829-7'}<br/>
              ${empresa.cargo_representante}
            </div>
          </td>
          <td>
            <div class="sig-line">
              <strong>POR EL BENEFICIARIO MUTUARIO</strong><br/>
              <strong>CONFORME RECIBIDO</strong><br/>
              ${accionista.nombre_accionista}<br/>
              C.I. V-${accionista.cedula_accionista} • R.I.F. ${accionista.rif_accionista}<br/>
              Mutuario / Socio Vinculado
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Recibo_Cupo_${recibo.numero_recibo}_${recibo.fecha}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads ALL 29 Recibos de Cupo as a SINGLE consolidated Word document (.doc)
 * Each receipt formatted on an individual page with page break.
 */
export function downloadTodosRecibosWord(
  recibos: ReciboCupo[],
  empresa: Empresa,
  accionista: Accionista,
  contrato?: ContratoMutuo
): void {
  const receiptsHtml = recibos.map((recibo, index) => {
    const data = generateReciboCupoText(recibo, empresa, accionista, contrato);
    const isLast = index === recibos.length - 1;

    return `
      <div class="receipt-page">
        <table class="header-table">
          <tr>
            <td>
              <strong style="font-size: 12pt; color: #1e3a8a;">${empresa.razon_social}</strong><br/>
              <span style="font-size: 9pt; color: #475569;">
                R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}<br/>
                Domicilio: ${empresa.direccion_fiscal}, ${empresa.ciudad}
              </span>
            </td>
            <td style="text-align: right; width: 35%;">
              <strong style="color: #047857; font-size: 11pt;">COMPROBANTE OFICIAL SENIAT</strong><br/>
              <span style="font-family: monospace; font-size: 10pt; font-weight: bold; color: #1e3a8a;">${recibo.numero_recibo}</span><br/>
              <span style="font-size: 8.5pt; color: #64748b;">Fecha: ${formatFechaLarga(recibo.fecha)}</span>
            </td>
          </tr>
        </table>

        <div class="title">
          RECIBO DE DISPOSICIÓN DE CUPO ROTATIVO NRO. ${recibo.numero_cupo} DE 29<br/>
          <span style="font-size: 9.5pt; font-weight: normal; color: #475569;">Amparado bajo Contrato Marco de Línea de Crédito General Nro. ${recibo.contrato_correlativo}</span>
        </div>

        <p style="font-size: 10pt; line-height: 1.35;">
          Por medio del presente documento, la sociedad mercantil <strong>${empresa.razon_social}</strong> (R.I.F. <strong>${empresa.rif_empresa}</strong>), debidamente representada por su Director Presidente, ciudadano <strong>${empresa.representante_legal}</strong> (C.I. <strong>${empresa.cedula_representante}</strong>), actuando con fundamento en la potestad estatutaria directa contenida en el <strong>${data.estatutosTexto}</strong>, hace constar la entrega material e irrevocable de fondos por concepto de desembolso parcial de cupo de la Línea de Crédito Rotativa autorizada al ciudadano <strong>${accionista.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>V-${accionista.cedula_accionista}</strong> y R.I.F. Nro. <strong>${accionista.rif_accionista}</strong>, por los siguientes conceptos y especificaciones:
        </p>

        <table class="table-data">
          <tr>
            <th style="width: 35%;">Concepto de Operación:</th>
            <td>Disposición de Cupo Nro. ${recibo.numero_cupo} de 29 en Línea de Crédito Rotativa General</td>
          </tr>
          <tr>
            <th>Monto Desembolsado (VES):</th>
            <td class="highlight">${formatVES(recibo.monto_ves)} Bs.</td>
          </tr>
          <tr>
            <th>Monto en Letras:</th>
            <td><strong>${data.montoLetras} BOLÍVARES CON ${((recibo.monto_ves % 1) * 100).toFixed(0).padStart(2, '0')}/100 CÉNTIMOS</strong></td>
          </tr>
          <tr>
            <th>Equivalente Oficial BCV:</th>
            <td>$${formatUSD(recibo.monto_usd)} USD (Tasa Oficial BCV: Bs. ${recibo.tasa_bcv.toFixed(2)} / USD)</td>
          </tr>
          <tr>
            <th>Banco Emisor & Cuenta Origen:</th>
            <td>${recibo.banco_emisor} • Cuenta Nro. ${recibo.cuenta_origen}</td>
          </tr>
          <tr>
            <th>Cuenta Destino Beneficiario:</th>
            <td>${accionista.nombre_accionista} • Cuenta Banesco Nro. ${recibo.cuenta_destino}</td>
          </tr>
          <tr>
            <th>Referencia Bancaria Electrónica:</th>
            <td style="font-family: monospace; font-weight: bold; color: #1e3a8a;">${recibo.referencia_bancaria}</td>
          </tr>
        </table>

        <div style="margin: 8pt 0; font-size: 9.5pt; font-weight: bold; color: #0f172a;">
          CONTROL Y ESTADO ROTATIVO DE LA LÍNEA DE CRÉDITO GENERAL (LÍMITE AUTORIZADO: Bs. 600.000.000,00):
        </div>

        <table class="table-data" style="font-size: 9pt;">
          <tr style="background-color: #f8fafc;">
            <th>Límite Máximo:</th>
            <th>Acumulado Previo:</th>
            <th>Este Cupo:</th>
            <th>Acumulado Actual:</th>
            <th>Remanente Disponible:</th>
          </tr>
          <tr>
            <td>${formatVES(recibo.limite_linea_ves)}</td>
            <td>${formatVES(recibo.acumulado_anterior_ves)}</td>
            <td style="color: #b45309; font-weight: bold;">${formatVES(recibo.monto_ves)}</td>
            <td style="font-weight: bold;">${formatVES(recibo.acumulado_actual_ves)}</td>
            <td style="color: #047857; font-weight: bold;">${formatVES(recibo.remanente_disponible_ves)}</td>
          </tr>
        </table>

        <p style="font-size: 8.5pt; color: #334155; margin-top: 8pt;">
          <strong>BLINDAJE Y CONFORMIDAD TRIBUTARIA SENIAT:</strong> ${data.declaracionTributaria}
        </p>

        <table class="signatures">
          <tr>
            <td>
              <div class="sig-line">
                <strong>POR LA EMPRESA MUTUANTE</strong><br/>
                <strong>${empresa.razon_social}</strong><br/>
                ${empresa.representante_legal}<br/>
                C.I. V-${empresa.cedula_representante} • R.I.F. ${empresa.rif_representante || 'V-23997829-7'}<br/>
                ${empresa.cargo_representante}
              </div>
            </td>
            <td>
              <div class="sig-line">
                <strong>POR EL BENEFICIARIO MUTUARIO</strong><br/>
                <strong>CONFORME RECIBIDO</strong><br/>
                ${accionista.nombre_accionista}<br/>
                C.I. V-${accionista.cedula_accionista} • R.I.F. ${accionista.rif_accionista}<br/>
                Mutuario / Socio Vinculado
              </div>
            </td>
          </tr>
        </table>
      </div>
      ${!isLast ? '<br clear="all" style="mso-special-character:line-break;page-break-before:always;" />' : ''}
    `;
  }).join('\n');

  const fullDoc = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Expediente Completo 29 Recibos de Cupo - ${empresa.razon_social}</title>
      <style>
        @page {
          size: letter;
          margin: 0.8in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10.5pt;
          line-height: 1.3;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border: 1.5pt solid #1e3a8a;
          background-color: #f8fafc;
          margin-bottom: 10pt;
          border-collapse: collapse;
        }
        .header-table td {
          padding: 6pt 8pt;
          vertical-align: top;
        }
        .title {
          font-size: 11.5pt;
          font-weight: bold;
          text-align: center;
          color: #1e3a8a;
          margin: 8pt 0;
          text-transform: uppercase;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin: 6pt 0;
        }
        .table-data th, .table-data td {
          border: 1pt solid #cbd5e1;
          padding: 4.5pt 6pt;
          font-size: 9pt;
        }
        .table-data th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: left;
        }
        .highlight {
          font-weight: bold;
          color: #1e3a8a;
        }
        .signatures {
          margin-top: 25pt;
          width: 100%;
          border-collapse: collapse;
        }
        .signatures td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 0 10pt;
          font-size: 8.5pt;
        }
        .sig-line {
          border-top: 1pt solid #000000;
          padding-top: 3pt;
          margin-top: 30pt;
        }
      </style>
    </head>
    <body>
      ${receiptsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullDoc], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Expediente_29_Recibos_Cupo_Banesco_${empresa.rif_empresa}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single Recibo de Cupo as PDF using jsPDF
 */
export function downloadReciboCupoPDF(
  recibo: ReciboCupo,
  empresa: Empresa,
  accionista: Accionista,
  contrato?: ContratoMutuo
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const data = generateReciboCupoText(recibo, empresa, accionista, contrato);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.rect(14, 12, pageWidth - 28, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(empresa.razon_social, 18, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}`, 18, 24);
  doc.text(`Cuenta Emisora Banesco: ${recibo.cuenta_origen}`, 18, 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(4, 120, 87);
  doc.text('COMPROBANTE OFICIAL SENIAT', pageWidth - 18, 19, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(recibo.numero_recibo, pageWidth - 18, 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha: ${formatFechaLarga(recibo.fecha)}`, pageWidth - 18, 29, { align: 'right' });

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`RECIBO DE DISPOSICIÓN DE CUPO ROTATIVO NRO. ${recibo.numero_cupo} DE 29`, pageWidth / 2, 43, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Línea de Crédito General Nro. ${recibo.contrato_correlativo} • Límite Bs. 600.000.000,00`, pageWidth / 2, 47, { align: 'center' });

  // Content Paragraph
  let y = 54;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const introText = `Por medio del presente documento, la sociedad mercantil ${empresa.razon_social} (R.I.F. ${empresa.rif_empresa}), representada por su Director Presidente, ${empresa.representante_legal} (C.I. ${empresa.cedula_representante}), en ejercicio de la facultad estatutaria directa de la Cláusula 14 Numeral O del Registro de Comercio del 13/09/2021, hace constar la entrega de fondos por concepto de disposición de cupo de la Línea de Crédito Rotativa autorizada al ciudadano ${accionista.nombre_accionista} (C.I. V-${accionista.cedula_accionista} / R.I.F. ${accionista.rif_accionista}), conforme a las siguientes estipulaciones:`;

  const splitIntro = doc.splitTextToSize(introText, pageWidth - 28);
  doc.text(splitIntro, 14, y);
  y += splitIntro.length * 4.2 + 3;

  // Key Fields Table
  const fields = [
    ['Concepto de Operación', `Disposición de Cupo Nro. ${recibo.numero_cupo} de 29 en Línea Rotativa`],
    ['Monto Desembolsado', `${formatVES(recibo.monto_ves)} Bs.`],
    ['Monto en Letras', `${data.montoLetras} BOLÍVARES`],
    ['Contravalor BCV', `$${formatUSD(recibo.monto_usd)} USD (Tasa BCV: Bs. ${recibo.tasa_bcv.toFixed(2)})`],
    ['Banco Emisor / Origen', `${recibo.banco_emisor} • Cta: ${recibo.cuenta_origen}`],
    ['Beneficiario / Destino', `${accionista.nombre_accionista} • Cta: ${recibo.cuenta_destino}`],
    ['Referencia Bancaria', recibo.referencia_bancaria],
    ['Tasa de Interés Pactada', `${recibo.tasa_interes_anual}% Anual (Tasa Mercado 6 Bancos BCV) • Ret. ISLR 5%`],
  ];

  fields.forEach(([label, value], i) => {
    doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 6.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(label + ':', 17, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    if (label === 'Monto Desembolsado' || label === 'Referencia Bancaria') {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
    }
    doc.text(String(value), 62, y + 4.5);

    y += 6.5;
  });

  y += 4;

  // Balance Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('LÍMITE TOTAL', 18, y + 5);
  doc.text('ACUMULADO PREVIO', 55, y + 5);
  doc.text('DISPOSICIÓN ACTUAL', 95, y + 5);
  doc.text('TOTAL ACUMULADO', 135, y + 5);
  doc.text('CUPO DISPONIBLE', pageWidth - 18, y + 5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatVES(recibo.limite_linea_ves), 18, y + 10.5);
  doc.text(formatVES(recibo.acumulado_anterior_ves), 55, y + 10.5);

  doc.setTextColor(180, 83, 9);
  doc.text(formatVES(recibo.monto_ves), 95, y + 10.5);

  doc.setTextColor(15, 23, 42);
  doc.text(formatVES(recibo.acumulado_actual_ves), 135, y + 10.5);

  doc.setTextColor(4, 120, 87);
  doc.text(formatVES(recibo.remanente_disponible_ves), pageWidth - 18, y + 10.5, { align: 'right' });

  y += 18;

  // Tax disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const taxLines = doc.splitTextToSize(`BLINDAJE SENIAT: ${data.declaracionTributaria}`, pageWidth - 28);
  doc.text(taxLines, 14, y);
  y += taxLines.length * 3.2 + 8;

  // Signatures
  const sigY = 240;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);

  // Left signature
  doc.line(20, sigY, 90, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('POR LA EMPRESA MUTUANTE', 55, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(empresa.representante_legal, 55, sigY + 8, { align: 'center' });
  doc.text(`C.I. V-${empresa.cedula_representante} • R.I.F. ${empresa.rif_representante || 'V-23997829-7'}`, 55, sigY + 11.5, { align: 'center' });
  doc.text(empresa.cargo_representante, 55, sigY + 15, { align: 'center' });

  // Right signature
  doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('POR EL BENEFICIARIO MUTUARIO', pageWidth - 55, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(accionista.nombre_accionista, pageWidth - 55, sigY + 8, { align: 'center' });
  doc.text(`C.I. V-${accionista.cedula_accionista} • R.I.F. ${accionista.rif_accionista}`, pageWidth - 55, sigY + 11.5, { align: 'center' });
  doc.text('Mutuario / Conforme Recibido', pageWidth - 55, sigY + 15, { align: 'center' });

  doc.save(`Recibo_Cupo_${recibo.numero_recibo}.pdf`);
}

/**
 * Downloads the complete ledger of all 29 Recibos de Cupo as Microsoft Excel (.xlsx)
 */
export function downloadLibroCuposExcel(
  recibos: ReciboCupo[],
  empresa: Empresa,
  accionista: Accionista,
  contrato?: ContratoMutuo
): void {
  const totalDisposicion = Number(recibos.reduce((sum, r) => sum + r.monto_ves, 0).toFixed(2));
  const limiteVES = recibos[0]?.limite_linea_ves || 600000000.00;
  const remanenteVES = Number((limiteVES - totalDisposicion).toFixed(2));

  const wb = XLSX.utils.book_new();

  // Sheet 1: 29 Cupos
  const rows: any[][] = [
    [`${empresa.razon_social} - LIBRO DE CONTROL DE CUPOS ROTATIVOS`],
    [`LÍNEA DE CRÉDITO GENERAL BS. 600.000.000,00 • BENEFICIARIO: ${accionista.nombre_accionista} (C.I. V-${accionista.cedula_accionista})`],
    [],
    [
      'N°',
      'N° Recibo',
      'Fecha',
      'Referencia Banesco',
      'Beneficiario / Destino',
      'Monto Cupo (VES)',
      'Tasa BCV',
      'Monto USD',
      'Total Acumulado (VES)',
      'Remanente Línea (VES)',
      '% Usado'
    ]
  ];

  recibos.forEach(r => {
    rows.push([
      r.numero_cupo,
      r.numero_recibo,
      r.fecha,
      r.referencia_bancaria,
      accionista.nombre_accionista,
      r.monto_ves,
      r.tasa_bcv,
      r.monto_usd,
      r.acumulado_actual_ves,
      r.remanente_disponible_ves,
      `${r.porcentaje_consumido.toFixed(1)}%`
    ]);
  });

  rows.push([
    'TOTALES',
    '',
    '',
    '29 Salidas Banesco',
    '',
    totalDisposicion,
    '',
    '',
    totalDisposicion,
    remanenteVES,
    `${((totalDisposicion / limiteVES) * 100).toFixed(1)}%`
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 30 },
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Libro 29 Cupos');

  // Sheet 2: Resumen
  const rowsResumen: any[][] = [
    ['=== RESUMEN DE LÍNEA DE CRÉDITO Y POTESTAD ESTATUTARIA ==='],
    [],
    ['EMPRESA:', empresa.razon_social],
    ['R.I.F.:', empresa.rif_empresa],
    ['BENEFICIARIO:', `${accionista.nombre_accionista} (C.I. V-${accionista.cedula_accionista})`],
    ['LÍMITE TOTAL DE LA LÍNEA:', limiteVES],
    ['TOTAL DISPUESTO (29 CUPOS):', totalDisposicion],
    ['REMANENTE DISPONIBLE:', remanenteVES],
    ['% UTILIZACIÓN:', `${((totalDisposicion / limiteVES) * 100).toFixed(2)}%`],
    ['FACULTAD ESTATUTARIA:', empresa.facultad_estatutaria_mutuo || 'Capítulo IV, Cláusula Décima Cuarta, Numeral O'],
    ['BASE LEGAL TRIBUTARIA:', 'Art. 72 LISLR (Bancarización íntegra con transferencias Banesco Cta. 5128)']
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(rowsResumen);
  wsResumen['!cols'] = [{ wch: 32 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Línea');

  const sanitizedRif = empresa.rif_empresa.replace(/[^a-zA-Z0-9]/g, '');
  XLSX.writeFile(wb, `Libro_Control_29_Cupos_Banesco_${sanitizedRif}.xlsx`);
}

export function generateReciboPagoText(
  recibo: ReciboPagoRecibido,
  empresa: Empresa,
  pagador: Accionista,
  contrato?: ContratoMutuo
) {
  const montoLetras = numeroALetras(recibo.monto_total_ves).toUpperCase();
  const interesesLetras = numeroALetras(recibo.intereses_pagados_ves).toUpperCase();
  const capitalLetras = numeroALetras(recibo.capital_amortizado_ves).toUpperCase();

  const estatutosTexto = empresa.facultad_estatutaria_mutuo ||
    'Capítulo IV, Cláusula Décima Cuarta, Numeral O de los Estatutos Sociales vigentes (Registro de Comercio de fecha 13/09/2021, Nro. 24, Tomo 89-A)';

  const fiscal = empresa.configuracion_fiscal;
  const pctRet = recibo.retencion_islr_porcentaje !== undefined 
    ? recibo.retencion_islr_porcentaje 
    : (fiscal?.porcentaje_retencion_activo ?? 5.0);

  let legalArticleText = 'Artículo 9, Numeral 8 del Decreto N° 1.808 (Reglamento de Retenciones de ISLR para Intereses de Financiamiento)';
  if (fiscal?.concepto_activo === 'honorarios_profesionales_pn') {
    legalArticleText = 'Artículo 9, Numeral 1, Literal a) del Decreto N° 1.808 (Reglamento de Retenciones de ISLR para Honorarios Profesionales a Personas Naturales Residentes)';
  } else if (fiscal?.concepto_activo === 'servicios_profesionales_pj') {
    legalArticleText = 'Artículo 9, Numeral 1, Literal b) y Numeral 11 del Decreto N° 1.808 (Servicios Profesionales y Técnicos a Personas Jurídicas Domiciliadas)';
  } else if (fiscal?.concepto_activo === 'comisiones_mercantiles_pn' || fiscal?.concepto_activo === 'comisiones_mercantiles_pj') {
    legalArticleText = 'Artículo 9, Numeral 2 del Decreto N° 1.808 (Comisiones Mercantiles)';
  }

  const declaracionTributaria =
    `La presente amortización bancaria cumple estrictamente con el Artículo 529 del Código de Comercio y Artículo 1.292 del Código Civil venezolano (imputación preferente del pago a intereses devengados y remanente al capital principal). ` +
    `Los intereses devengados por financiamiento dinerario están EXENTOS DEL IMPUESTO AL VALOR AGREGADO (IVA) según el Artículo 16, Numeral 3 de la Ley de IVA. ` +
    `Asimismo, se practica y entera la RETENCIÓN DEL ${pctRet.toFixed(2)}% DE I.S.L.R. sobre el monto de los intereses (${formatVES(recibo.monto_retencion_islr_ves)}) de conformidad con el ${legalArticleText}, emitiéndose el Comprobante correspondiente. ` +
    `La porción de capital amortizada (${formatVES(recibo.capital_amortizado_ves)}) reconstituye de pleno derecho la disponibilidad de la Línea de Crédito Rotativa según la Cláusula Primera y Octava del Contrato ${recibo.contrato_correlativo}.`;

  return {
    montoLetras,
    interesesLetras,
    capitalLetras,
    estatutosTexto,
    declaracionTributaria,
  };
}

/**
 * Downloads a single Recibo de Pago Recibido as a formatted Microsoft Word document (.doc)
 */
export function downloadReciboPagoWord(
  recibo: ReciboPagoRecibido,
  empresa: Empresa,
  pagador: Accionista,
  contrato?: ContratoMutuo
): void {
  const data = generateReciboPagoText(recibo, empresa, pagador, contrato);

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Recibo de Pago ${recibo.numero_recibo}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10.5pt;
          line-height: 1.35;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border: 1.5pt solid #047857;
          background-color: #f0fdf4;
          margin-bottom: 12pt;
          border-collapse: collapse;
        }
        .header-table td {
          padding: 8pt 10pt;
          vertical-align: top;
        }
        .title {
          font-size: 12pt;
          font-weight: bold;
          text-align: center;
          color: #047857;
          margin: 10pt 0;
          text-transform: uppercase;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin: 8pt 0;
        }
        .table-data th, .table-data td {
          border: 1pt solid #cbd5e1;
          padding: 5pt 7pt;
          font-size: 9pt;
        }
        .table-data th {
          background-color: #f8fafc;
          font-weight: bold;
          text-align: left;
        }
        .highlight-green {
          font-weight: bold;
          color: #047857;
          font-size: 10pt;
        }
        .signatures {
          margin-top: 30pt;
          width: 100%;
          border-collapse: collapse;
        }
        .signatures td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 0 15pt;
        }
        .sig-line {
          border-top: 1pt solid #000000;
          padding-top: 4pt;
          margin-top: 35pt;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td>
            <strong style="font-size: 13pt; color: #047857;">${empresa.razon_social}</strong><br/>
            <span style="font-size: 9pt; color: #475569;">
              R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}<br/>
              Domicilio Fiscal: ${empresa.direccion_fiscal}, ${empresa.ciudad}
            </span>
          </td>
          <td style="text-align: right; width: 40%;">
            <strong style="color: #047857; font-size: 11pt;">COMPROBANTE OFICIAL DE PAGO</strong><br/>
            <span style="font-family: monospace; font-size: 11pt; font-weight: bold; color: #0f172a;">${recibo.numero_recibo}</span><br/>
            <span style="font-size: 8.5pt; color: #64748b;">Fecha: ${formatFechaLarga(recibo.fecha)} (${recibo.hora || '10:00 AM'})</span>
          </td>
        </tr>
      </table>

      <div class="title">
        RECIBO DE PAGO RECIBIDO • AMORTIZACIÓN A INTERESES Y CAPITAL (CUOTA ${recibo.numero_pago} DE 18)<br/>
        <span style="font-size: 9.5pt; font-weight: normal; color: #475569;">Línea de Crédito General Rotativa • Contrato Marco Nro. ${recibo.contrato_correlativo}</span>
      </div>

      <p>
        Por medio del presente documento, la sociedad mercantil <strong>${empresa.razon_social}</strong> (R.I.F. <strong>${empresa.rif_empresa}</strong>), en su carácter de <strong>MUTUANTE (ACREDITANTE)</strong>, válidamente representada por su Director Presidente, ciudadano <strong>${empresa.representante_legal}</strong> (C.I. <strong>${empresa.cedula_representante}</strong>), actuando con fundamento en la potestad estatutaria directa conferida en el <strong>${data.estatutosTexto}</strong>, hace constar que ha recibido a su entera y cabal satisfacción en su Cuenta Corriente Nro. <strong>${recibo.cuenta_receptora}</strong> en <strong>${recibo.banco_receptor}</strong>, la cantidad de fondos transferida por el ciudadano <strong>${pagador.nombre_accionista}</strong>, titular de la Cédula de Identidad Nro. <strong>V-${pagador.cedula_accionista}</strong> y R.I.F. Nro. <strong>${pagador.rif_accionista}</strong>, imputándose conforme a derecho de la siguiente forma:
      </p>

      <div style="margin: 8pt 0; padding: 6pt; background-color: #f1f5f9; border-left: 3pt solid #047857; font-size: 9pt;">
        <strong>IMPUTACIÓN LEGAL DEL PAGO (ART. 529 CÓDIGO DE COMERCIO & ART. 1.292 CÓDIGO CIVIL):</strong><br/>
        De acuerdo con el ordenamiento jurídico mercantil y civil, todo pago efectuado se aplica en primer orden a los intereses devengados por el capital en uso durante el período (${recibo.dias_transcurridos} días), y el excedente se aplica directamente a la amortización y disminución del capital adeudado.
      </div>

      <table class="table-data">
        <tr>
          <th style="width: 38%;">Concepto del Movimiento:</th>
          <td>${recibo.concepto}</td>
        </tr>
        <tr>
          <th>Monto Total Pagado (VES):</th>
          <td class="highlight-green">${formatVES(recibo.monto_total_ves)} Bs.</td>
        </tr>
        <tr>
          <th>Monto en Letras:</th>
          <td><strong>${data.montoLetras} BOLÍVARES</strong></td>
        </tr>
        <tr>
          <th>Equivalente Oficial BCV:</th>
          <td>$${formatUSD(recibo.monto_total_usd)} USD (Tasa Oficial BCV: Bs. ${recibo.tasa_bcv.toFixed(2)} / USD)</td>
        </tr>
        <tr>
          <th>Banco Receptor & Cuenta Destino:</th>
          <td>${recibo.banco_receptor} • Cuenta Nro. ${recibo.cuenta_receptora}</td>
        </tr>
        <tr>
          <th>Cuenta Origen del Pagador:</th>
          <td>${pagador.nombre_accionista} • Cuenta Banesco Nro. ${recibo.cuenta_emisora}</td>
        </tr>
        <tr>
          <th>Referencia Bancaria Electrónica:</th>
          <td style="font-family: monospace; font-weight: bold; color: #047857;">${recibo.referencia_bancaria}</td>
        </tr>
      </table>

      <div style="margin: 10pt 0 4pt 0; font-size: 9.5pt; font-weight: bold; color: #0f172a;">
        DISCRIMINACIÓN MATEMÁTICA DEL PAGO (INTERESES VS. CAPITAL):
      </div>

      <table class="table-data">
        <tr style="background-color: #f8fafc;">
          <th>Concepto Liquidado</th>
          <th>Base de Cálculo / Días</th>
          <th>Tasa Aplicada</th>
          <th>Monto Imputado (VES)</th>
        </tr>
        <tr>
          <td><strong>1. Intereses Devengados en el Período:</strong></td>
          <td>Sobre saldo de ${formatVES(recibo.saldo_capital_anterior_ves)} (${recibo.dias_transcurridos} días)</td>
          <td>${recibo.tasa_interes_anual || 16.00}% anual (${recibo.tasa_interes_mensual || 1.33}% mes) UVC (6 Bancos BCV)</td>
          <td style="font-weight: bold; color: #b45309;">${formatVES(recibo.intereses_pagados_ves)}</td>
        </tr>
        <tr>
          <td><strong>2. Retención de I.S.L.R. (5% s/Intereses):</strong></td>
          <td>Art. 9 num. 1 Dec. 1808 (Persona Natural Residente)</td>
          <td>5.00% Retención SENIAT</td>
          <td style="color: #dc2626;">- ${formatVES(recibo.monto_retencion_islr_ves)}</td>
        </tr>
        <tr>
          <td><strong>3. Interés Neto Percibido por la Empresa:</strong></td>
          <td>Intereses brutos deducida la retención fiscal</td>
          <td>Neto a Tesorería</td>
          <td style="font-weight: bold;">${formatVES(recibo.interes_neto_percibido_ves)}</td>
        </tr>
        <tr style="background-color: #f0fdf4;">
          <td><strong style="color: #047857;">4. Amortización Directa a Capital (Principal):</strong></td>
          <td>Monto total pagado menos intereses brutos cubiertos</td>
          <td>Reducción Pasivo</td>
          <td style="font-weight: bold; color: #047857; font-size: 10pt;">${formatVES(recibo.capital_amortizado_ves)}</td>
        </tr>
      </table>

      <div style="margin: 10pt 0 4pt 0; font-size: 9.5pt; font-weight: bold; color: #0f172a;">
        ESTADO ACTUALIZADO DE LA LÍNEA DE CRÉDITO GENERAL ROTATIVA:
      </div>

      <table class="table-data">
        <tr style="background-color: #f8fafc;">
          <th>Límite Máximo Aprobado:</th>
          <th>Saldo Capital Anterior:</th>
          <th>Amortización Este Pago:</th>
          <th>Nuevo Saldo Capital:</th>
          <th>Cupo Restaurado / Disponible:</th>
        </tr>
        <tr>
          <td>${formatVES(recibo.limite_linea_ves)}</td>
          <td>${formatVES(recibo.saldo_capital_anterior_ves)}</td>
          <td style="color: #047857; font-weight: bold;">- ${formatVES(recibo.capital_amortizado_ves)}</td>
          <td style="font-weight: bold; color: #0f172a;">${formatVES(recibo.nuevo_saldo_capital_ves)}</td>
          <td style="color: #047857; font-weight: bold;">${formatVES(recibo.cupo_disponible_actual_ves)}</td>
        </tr>
      </table>

      <p style="font-size: 8.5pt; color: #475569; margin-top: 8pt; line-height: 1.3;">
        <strong>BLINDAJE TRIBUTARIO & CONSTANCIA FISCAL:</strong> ${data.declaracionTributaria}
      </p>

      <table class="signatures">
        <tr>
          <td>
            <div class="sig-line">
              <strong>POR LA EMPRESA MUTUANTE (RECEPTORA)</strong><br/>
              <strong>${empresa.razon_social}</strong><br/>
              ${empresa.representante_legal}<br/>
              C.I. V-${empresa.cedula_representante}<br/>
              ${empresa.cargo_representante}
            </div>
          </td>
          <td>
            <div class="sig-line">
              <strong>POR EL MUTUARIO (PAGADOR)</strong><br/>
              <strong>CONFORME PAGADO</strong><br/>
              ${pagador.nombre_accionista}<br/>
              C.I. V-${pagador.cedula_accionista}<br/>
              R.I.F. ${pagador.rif_accionista}
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Recibo_Pago_${recibo.numero_recibo}_${recibo.fecha}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single Recibo de Pago Recibido as a PDF document
 */
export function downloadReciboPagoPDF(
  recibo: ReciboPagoRecibido,
  empresa: Empresa,
  pagador: Accionista,
  contrato?: ContratoMutuo
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const data = generateReciboPagoText(recibo, empresa, pagador, contrato);

  // Top header banner
  doc.setFillColor(4, 120, 87);
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(empresa.razon_social.toUpperCase(), 14, 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`R.I.F. ${empresa.rif_empresa} • COMPROBANTE OFICIAL DE PAGO Y AMORTIZACIÓN`, 14, 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(recibo.numero_recibo, pageWidth - 14, 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Fecha: ${recibo.fecha} (${recibo.hora || '10:00 AM'})`, pageWidth - 14, 13, { align: 'right' });

  let y = 24;

  // Title Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.rect(14, y, pageWidth - 28, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`RECIBO DE PAGO RECIBIDO • CUOTA ${recibo.numero_pago} DE 18 (INTERESES Y CAPITAL)`, pageWidth / 2, y + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Línea de Crédito General Rotativa • Contrato ${recibo.contrato_correlativo}`, pageWidth / 2, y + 9.5, { align: 'center' });

  y += 16;

  // Preamble text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const preambleLines = doc.splitTextToSize(
    `La sociedad mercantil ${empresa.razon_social} (R.I.F. ${empresa.rif_empresa}), representada por su Director Presidente ${empresa.representante_legal} (C.I. V-${empresa.cedula_representante}), hace constar el pago recibido a entera satisfacción en su Cuenta Corriente ${recibo.cuenta_receptora} de ${recibo.banco_receptor}, transferido por el ciudadano ${pagador.nombre_accionista} (C.I. V-${pagador.cedula_accionista}), imputado según los Artículos 529 del Código de Comercio y 1.292 del Código Civil:`,
    pageWidth - 28
  );
  doc.text(preambleLines, 14, y);
  y += preambleLines.length * 3.3 + 3;

  // Details Table
  const rows = [
    ['Monto Total Pagado (VES):', `${formatVES(recibo.monto_total_ves)} Bs.`],
    ['Equivalente Oficial BCV:', `$${formatUSD(recibo.monto_total_usd)} USD (Tasa BCV: Bs. ${recibo.tasa_bcv.toFixed(2)})`],
    ['Referencia Bancaria Banesco:', recibo.referencia_bancaria],
    ['Banco Receptor & Cuenta:', `${recibo.banco_receptor} (Cta. ${recibo.cuenta_receptora})`],
    ['Cuenta Origen Pagador:', `${pagador.nombre_accionista} (Cta. ${recibo.cuenta_emisora})`],
    ['Saldo Capital Anterior:', `${formatVES(recibo.saldo_capital_anterior_ves)}`],
    ['Intereses Causados en Lapso:', `${formatVES(recibo.intereses_pagados_ves)} (${recibo.dias_transcurridos} días al ${recibo.tasa_interes_anual || 16.00}% anual UVC)`],
    ['Retención ISLR 5% (SENIAT):', `- ${formatVES(recibo.monto_retencion_islr_ves)} (Dec. 1808 Art. 9 num. 1)`],
    ['Interés Neto Percibido:', `${formatVES(recibo.interes_neto_percibido_ves)}`],
    ['Amortización Neta a Capital:', `${formatVES(recibo.capital_amortizado_ves)} (Disminución Principal)`],
    ['Nuevo Saldo Capital Deudor:', `${formatVES(recibo.nuevo_saldo_capital_ves)}`],
    ['Cupo Reconstituido / Disponible:', `${formatVES(recibo.cupo_disponible_actual_ves)} (Límite: Bs. 600M)`],
  ];

  rows.forEach(([label, value], i) => {
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
    doc.rect(14, y, pageWidth - 28, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 5.5, pageWidth - 14, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(label, 16, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    if (label.includes('Monto Total') || label.includes('Amortización Neta')) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(4, 120, 87);
    } else if (label.includes('Intereses Causados')) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
    }
    doc.text(String(value), 72, y + 3.8);

    y += 5.5;
  });

  y += 4;

  // Control Banner Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 13, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('LÍMITE TOTAL', 18, y + 4.5);
  doc.text('SALDO PREVIO', 55, y + 4.5);
  doc.text('AMORTIZACIÓN', 95, y + 4.5);
  doc.text('NUEVO SALDO', 135, y + 4.5);
  doc.text('CUPO DISPONIBLE', pageWidth - 18, y + 4.5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(formatVES(recibo.limite_linea_ves), 18, y + 9.5);
  doc.text(formatVES(recibo.saldo_capital_anterior_ves), 55, y + 9.5);

  doc.setTextColor(4, 120, 87);
  doc.text(formatVES(recibo.capital_amortizado_ves), 95, y + 9.5);

  doc.setTextColor(15, 23, 42);
  doc.text(formatVES(recibo.nuevo_saldo_capital_ves), 135, y + 9.5);

  doc.setTextColor(4, 120, 87);
  doc.text(formatVES(recibo.cupo_disponible_actual_ves), pageWidth - 18, y + 9.5, { align: 'right' });

  y += 17;

  // Legal Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const taxLines = doc.splitTextToSize(`CONFORMIDAD TRIBUTARIA: ${data.declaracionTributaria}`, pageWidth - 28);
  doc.text(taxLines, 14, y);

  // Signatures
  const sigY = 245;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);

  // Left
  doc.line(20, sigY, 90, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('POR LA EMPRESA MUTUANTE', 55, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(empresa.representante_legal, 55, sigY + 8, { align: 'center' });
  doc.text(`C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})`, 55, sigY + 11.5, { align: 'center' });

  // Right
  doc.line(pageWidth - 90, sigY, pageWidth - 20, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('POR EL MUTUARIO PAGADOR', pageWidth - 55, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(pagador.nombre_accionista, pageWidth - 55, sigY + 8, { align: 'center' });
  doc.text(`C.I. V-${pagador.cedula_accionista} • Conforme Pagado`, pageWidth - 55, sigY + 11.5, { align: 'center' });

  doc.save(`Recibo_Pago_${recibo.numero_recibo}.pdf`);
}

/**
 * Downloads ALL 18 Recibos de Pagos as a SINGLE consolidated Word document (.doc)
 */
export function downloadTodosRecibosPagosWord(
  recibos: ReciboPagoRecibido[],
  empresa: Empresa,
  pagador: Accionista,
  contrato?: ContratoMutuo
): void {
  const receiptsHtml = recibos.map((recibo, index) => {
    const data = generateReciboPagoText(recibo, empresa, pagador, contrato);
    const isLast = index === recibos.length - 1;

    return `
      <div class="receipt-page">
        <table class="header-table">
          <tr>
            <td>
              <strong style="font-size: 12pt; color: #047857;">${empresa.razon_social}</strong><br/>
              <span style="font-size: 9pt; color: #475569;">
                R.I.F. ${empresa.rif_empresa} • ${empresa.registro_mercantil}<br/>
                Domicilio: ${empresa.direccion_fiscal}, ${empresa.ciudad}
              </span>
            </td>
            <td style="text-align: right; width: 35%;">
              <strong style="color: #047857; font-size: 11pt;">COMPROBANTE OFICIAL DE PAGO</strong><br/>
              <span style="font-family: monospace; font-size: 10pt; font-weight: bold; color: #0f172a;">${recibo.numero_recibo}</span><br/>
              <span style="font-size: 8.5pt; color: #64748b;">Fecha: ${formatFechaLarga(recibo.fecha)}</span>
            </td>
          </tr>
        </table>

        <div class="title">
          RECIBO DE PAGO RECIBIDO NRO. ${recibo.numero_pago} DE 18 • INTERESES Y CAPITAL<br/>
          <span style="font-size: 9.5pt; font-weight: normal; color: #475569;">Línea de Crédito General Rotativa • Contrato Marco Nro. ${recibo.contrato_correlativo}</span>
        </div>

        <p style="font-size: 10pt; line-height: 1.35;">
          Por medio del presente documento, la sociedad mercantil <strong>${empresa.razon_social}</strong> (R.I.F. <strong>${empresa.rif_empresa}</strong>), debidamente representada por su Director Presidente, ciudadano <strong>${empresa.representante_legal}</strong> (C.I. <strong>${empresa.cedula_representante}</strong>), actuando con fundamento en la potestad estatutaria directa contenida en el <strong>${data.estatutosTexto}</strong>, hace constar que ha recibido a su entera y cabal satisfacción en su Cuenta Corriente Nro. <strong>${recibo.cuenta_receptora}</strong> de ${recibo.banco_receptor}, la cantidad transferida por el ciudadano <strong>${pagador.nombre_accionista}</strong> (C.I. <strong>V-${pagador.cedula_accionista}</strong> y R.I.F. <strong>${pagador.rif_accionista}</strong>), imputándose según el Artículo 529 del Código de Comercio y Artículo 1.292 del Código Civil venezolano:
        </p>

        <table class="table-data">
          <tr>
            <th style="width: 38%;">Concepto del Movimiento:</th>
            <td>${recibo.concepto}</td>
          </tr>
          <tr>
            <th>Monto Total Pagado (VES):</th>
            <td class="highlight-green">${formatVES(recibo.monto_total_ves)} Bs.</td>
          </tr>
          <tr>
            <th>Monto en Letras:</th>
            <td><strong>${data.montoLetras} BOLÍVARES</strong></td>
          </tr>
          <tr>
            <th>Equivalente Oficial BCV:</th>
            <td>$${formatUSD(recibo.monto_total_usd)} USD (Tasa BCV: Bs. ${recibo.tasa_bcv.toFixed(2)} / USD)</td>
          </tr>
          <tr>
            <th>Banco Receptor & Cuenta:</th>
            <td>${recibo.banco_receptor} • Cuenta Nro. ${recibo.cuenta_receptora}</td>
          </tr>
          <tr>
            <th>Cuenta Origen Pagador:</th>
            <td>${pagador.nombre_accionista} • Cuenta Banesco Nro. ${recibo.cuenta_emisora}</td>
          </tr>
          <tr>
            <th>Referencia Bancaria Electrónica:</th>
            <td style="font-family: monospace; font-weight: bold; color: #047857;">${recibo.referencia_bancaria}</td>
          </tr>
        </table>

        <div style="margin: 8pt 0 4pt 0; font-size: 9.5pt; font-weight: bold; color: #0f172a;">
          DESGLOSE DEL PAGO (INTERESES CAUSADOS VS. AMORTIZACIÓN A CAPITAL):
        </div>

        <table class="table-data" style="font-size: 9pt;">
          <tr style="background-color: #f8fafc;">
            <th>Intereses Devengados (${recibo.dias_transcurridos} días):</th>
            <th>Retención ISLR 5% (SENIAT):</th>
            <th>Interés Neto Percibido:</th>
            <th>Amortización al Capital:</th>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #b45309;">${formatVES(recibo.intereses_pagados_ves)}</td>
            <td style="color: #dc2626;">- ${formatVES(recibo.monto_retencion_islr_ves)}</td>
            <td style="font-weight: bold;">${formatVES(recibo.interes_neto_percibido_ves)}</td>
            <td style="font-weight: bold; color: #047857;">${formatVES(recibo.capital_amortizado_ves)}</td>
          </tr>
        </table>

        <div style="margin: 8pt 0 4pt 0; font-size: 9.5pt; font-weight: bold; color: #0f172a;">
          ESTADO DE LA LÍNEA ROTATIVA (LÍMITE MÁXIMO BS. 600.000.000,00):
        </div>

        <table class="table-data" style="font-size: 9pt;">
          <tr style="background-color: #f8fafc;">
            <th>Saldo Capital Anterior:</th>
            <th>Capital Amortizado:</th>
            <th>Nuevo Saldo Capital:</th>
            <th>Cupo Restaurado / Disponible:</th>
          </tr>
          <tr>
            <td>${formatVES(recibo.saldo_capital_anterior_ves)}</td>
            <td style="color: #047857; font-weight: bold;">- ${formatVES(recibo.capital_amortizado_ves)}</td>
            <td style="font-weight: bold;">${formatVES(recibo.nuevo_saldo_capital_ves)}</td>
            <td style="color: #047857; font-weight: bold;">${formatVES(recibo.cupo_disponible_actual_ves)}</td>
          </tr>
        </table>

        <p style="font-size: 8pt; color: #475569; margin-top: 6pt; line-height: 1.3;">
          <strong>CONFORMIDAD TRIBUTARIA SENIAT:</strong> ${data.declaracionTributaria}
        </p>

        <table class="signatures">
          <tr>
            <td>
              <div class="sig-line">
                <strong>POR LA EMPRESA MUTUANTE</strong><br/>
                ${empresa.representante_legal}<br/>
                C.I. V-${empresa.cedula_representante} (${empresa.cargo_representante})
              </div>
            </td>
            <td>
              <div class="sig-line">
                <strong>POR EL MUTUARIO PAGADOR</strong><br/>
                ${pagador.nombre_accionista}<br/>
                C.I. V-${pagador.cedula_accionista} (Conforme Pagado)
              </div>
            </td>
          </tr>
        </table>
      </div>
      ${!isLast ? '<div style="page-break-after: always; mso-special-character: line-break;"></div>' : ''}
    `;
  }).join('');

  const fullDoc = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Consolidado 18 Recibos de Pagos - ${empresa.razon_social}</title>
      <style>
        @page {
          size: 21.59cm 27.94cm;
          margin: 1.8cm 1.5cm 1.8cm 1.5cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10.5pt;
          line-height: 1.3;
          color: #000000;
          text-align: justify;
        }
        .header-table {
          width: 100%;
          border: 1.5pt solid #047857;
          background-color: #f0fdf4;
          margin-bottom: 10pt;
          border-collapse: collapse;
        }
        .header-table td {
          padding: 6pt 8pt;
          vertical-align: top;
        }
        .title {
          font-size: 11.5pt;
          font-weight: bold;
          text-align: center;
          color: #047857;
          margin: 8pt 0;
          text-transform: uppercase;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin: 6pt 0;
        }
        .table-data th, .table-data td {
          border: 1pt solid #cbd5e1;
          padding: 4.5pt 6pt;
          font-size: 9pt;
        }
        .table-data th {
          background-color: #f8fafc;
          font-weight: bold;
          text-align: left;
        }
        .highlight-green {
          font-weight: bold;
          color: #047857;
        }
        .signatures {
          margin-top: 25pt;
          width: 100%;
          border-collapse: collapse;
        }
        .signatures td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 0 10pt;
          font-size: 8.5pt;
        }
        .sig-line {
          border-top: 1pt solid #000000;
          padding-top: 3pt;
          margin-top: 30pt;
        }
      </style>
    </head>
    <body>
      ${receiptsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullDoc], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CONSOLIDADO_18_RECIBOS_PAGOS_${empresa.rif_empresa}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the complete ledger of all 18 Recibos de Pagos as Microsoft Excel (.xlsx)
 */
export function downloadLibroPagosExcel(
  recibos: ReciboPagoRecibido[],
  empresa: Empresa,
  pagador: Accionista,
  contrato?: ContratoMutuo
): void {
  const totalPagado = Number(recibos.reduce((sum, r) => sum + r.monto_total_ves, 0).toFixed(2));
  const totalIntereses = Number(recibos.reduce((sum, r) => sum + r.intereses_pagados_ves, 0).toFixed(2));
  const totalRetencion = Number(recibos.reduce((sum, r) => sum + r.monto_retencion_islr_ves, 0).toFixed(2));
  const totalCapital = Number(recibos.reduce((sum, r) => sum + r.capital_amortizado_ves, 0).toFixed(2));
  const saldoFinal = Number((recibos[recibos.length - 1]?.nuevo_saldo_capital_ves || 0).toFixed(2));
  const cupoDisponibleFinal = Number((recibos[recibos.length - 1]?.cupo_disponible_actual_ves || 0).toFixed(2));
  const avgPct = recibos[0]?.retencion_islr_porcentaje ?? empresa.configuracion_fiscal?.porcentaje_retencion_activo ?? 5.0;

  const wb = XLSX.utils.book_new();

  // HOJA 1: 18 PAGOS Y AMORTIZACION
  const rowsSheet1: any[][] = [
    [`${empresa.razon_social} - LIBRO DE CONTROL DE AMORTIZACIÓN Y PAGOS RECIBIDOS`],
    [`LÍNEA DE CRÉDITO GENERAL BS. 600.000.000,00 • MUTUARIO PAGADOR: ${pagador.nombre_accionista} (C.I. V-${pagador.cedula_accionista})`],
    [`Régimen de Retención ISLR: Decreto N° 1.808 (${avgPct.toFixed(1)}%) • Imputación Art. 529 Código de Comercio y Art. 72 LISLR`],
    [],
    [
      'N°',
      'N° Recibo',
      'Fecha',
      'Referencia Banesco',
      'Monto Total Pagado (VES)',
      'Intereses Pagados (VES)',
      `Ret. ISLR (${avgPct.toFixed(1)}%) (VES)`,
      'Amortizado Capital (VES)',
      'Saldo Capital Deudor (VES)',
      'Cupo Disponible (VES)'
    ]
  ];

  recibos.forEach(r => {
    rowsSheet1.push([
      r.numero_pago,
      r.numero_recibo,
      r.fecha,
      r.referencia_bancaria,
      r.monto_total_ves,
      r.intereses_pagados_ves,
      r.monto_retencion_islr_ves,
      r.capital_amortizado_ves,
      r.nuevo_saldo_capital_ves,
      r.cupo_disponible_actual_ves
    ]);
  });

  // Totales
  rowsSheet1.push([
    'TOTALES',
    '',
    '',
    '18 PAGOS BANESCO (VES)',
    totalPagado,
    totalIntereses,
    totalRetencion,
    totalCapital,
    saldoFinal,
    cupoDisponibleFinal
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(rowsSheet1);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Amortización 18 Pagos');

  // HOJA 2: RESUMEN FISCAL
  const rowsSheet2: any[][] = [
    ['=== RESUMEN EJECUTIVO Y DICTAMEN FISCAL DE AMORTIZACIÓN ==='],
    [],
    ['EMPRESA ACREEDORA:', empresa.razon_social],
    ['R.I.F. EMPRESA:', empresa.rif_empresa],
    ['REPRESENTANTE LEGAL:', `${empresa.representante_legal} (C.I. ${empresa.cedula_representante})`],
    ['DOMICILIO FISCAL:', `${empresa.direccion_fiscal}, ${empresa.ciudad}`],
    [],
    ['MUTUARIO PAGADOR:', pagador.nombre_accionista],
    ['CÉDULA / RIF PAGADOR:', `V-${pagador.cedula_accionista} / ${pagador.rif_accionista || 'S/N'}`],
    ['CARGO / VÍNCULO:', pagador.cargo_o_condicion || 'Accionista'],
    [],
    ['INSTRUMENTO JURÍDICO:', 'Línea de Crédito Rotativa Mercantil con Intereses Indexados'],
    ['LÍMITE TOTAL APROBADO:', 600000000.00],
    ['TOTAL RECAUDADO (18 PAGOS):', totalPagado],
    ['TOTAL INTERESES DEVENGADOS:', totalIntereses],
    [`TOTAL RETENCIÓN ISLR (${avgPct.toFixed(1)}%):`, totalRetencion],
    ['TOTAL CAPITAL AMORTIZADO:', totalCapital],
    ['SALDO CAPITAL VIVO FINAL:', saldoFinal],
    ['CUPO DISPONIBLE FINAL:', cupoDisponibleFinal],
    [],
    ['MARCO JURÍDICO APLICADO:'],
    ['1. Art. 529 Código de Comercio:', 'El pago hecho en cuenta de capital e intereses se imputa primero a éstos. Cumplimiento estricto de prelación legal.'],
    ['2. Art. 72 Ley de ISLR:', 'Desvirtuación de dividendos presuntos. Operación respaldada con contrato notariado, trazabilidad bancaria Banesco y retención de ISLR.'],
    ['3. Decreto N° 1.808 SENIAT:', `Retención de ISLR aplicada sobre la totalidad de los intereses devengados (${avgPct.toFixed(1)}%), enterable ante el SENIAT con comprobante ARC.`],
    ['4. Art. 16 Num 3 Ley del IVA:', 'Las operaciones de crédito y los intereses devengados por mutuo dinerario no están sujetos a IVA.']
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(rowsSheet2);
  ws2['!cols'] = [
    { wch: 36 },
    { wch: 65 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen Fiscal');

  const sanitizedRif = empresa.rif_empresa.replace(/[^a-zA-Z0-9]/g, '');
  XLSX.writeFile(wb, `Libro_Control_Amortizacion_18_Pagos_${sanitizedRif}.xlsx`);
}

/**
 * Generates and downloads the comprehensive Expert Accounting Workbook in Excel (.xlsx)
 * Crossing the 29 Cupos de Salida with the 18 Pagos Recibidos in periodic/chronological order (47 movements).
 * Conforms to VEN-NIF PYME, Art. 503 y 529 del Código de Comercio y Art. 72 de la LISLR.
 */
export function downloadCrucePeriodicoExcel(
  movimientos: MovimientoCrucePeriodico[],
  empresa: Empresa,
  mutuario: Accionista,
  contrato?: ContratoMutuo,
  recibosCupos?: ReciboCupo[],
  recibosPagos?: ReciboPagoRecibido[]
): void {
  const totalCupos = Number(movimientos.reduce((sum, m) => sum + m.debito_cupo_ves, 0).toFixed(2));
  const totalPagos = Number(movimientos.reduce((sum, m) => sum + m.pago_total_recibido_ves, 0).toFixed(2));
  const totalIntereses = Number(movimientos.reduce((sum, m) => sum + m.intereses_pagados_ves, 0).toFixed(2));
  const totalRetencionISLR = Number(movimientos.reduce((sum, m) => sum + m.retencion_islr_ves, 0).toFixed(2));
  const totalAmortizadoCapital = Number(movimientos.reduce((sum, m) => sum + m.credito_capital_ves, 0).toFixed(2));
  const saldoCapitalFinal = Number((movimientos[movimientos.length - 1]?.saldo_capital_vivo_ves || 420471976.23).toFixed(2));
  const cupoDisponibleFinal = Number((movimientos[movimientos.length - 1]?.cupo_disponible_ves || 179528023.77).toFixed(2));
  const limiteLinea = 600000000.00;
  const totalEntradaBancoNeto = Number((totalPagos - totalRetencionISLR).toFixed(2));

  const cuposList = (recibosCupos && recibosCupos.length > 0) ? recibosCupos : RECIBOS_CUPO_AGRICOLA_ONI;
  const pagosListCompleto = (recibosPagos && recibosPagos.length > 0) ? recibosPagos : RECIBOS_PAGOS_AGRICOLA_ONI;
  const totalCuposUSD = Number(cuposList.reduce((sum, c) => sum + c.monto_usd, 0).toFixed(2));
  const totalISLRRetenidoAcumulado = Math.round(
    pagosListCompleto.reduce((sum, p) => sum + p.monto_retencion_islr_ves, 0) * 100
  ) / 100;

  const wb = XLSX.utils.book_new();

  // ==========================================
  // HOJA 1: CRUCE PERIÓDICO (47 MOVIMIENTOS)
  // ==========================================
  const sheet1Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - LIBRO MAESTRO DE CRUCE PERIÓDICO Y AMORTIZACIÓN`, 'title')],
    [createTitleBannerCell(`LÍNEA DE CRÉDITO ROTATIVA BS. 600.000.000,00 • BENEFICIARIO: ${mutuario.nombre_accionista} (C.I. V-${mutuario.cedula_accionista} / R.I.F. ${mutuario.rif_accionista})`, 'subtitle')],
    [createTitleBannerCell('AUDITORÍA INTEGRAL: 29 DESEMBOLSOS BANESCO VS. 18 PAGOS CON PRELACIÓN LEGAL (ART. 529 C.COM) Y RETENCIÓN ISLR 5%', 'meta')],
    []
  ];

  const headersSheet1 = [
    'N°',
    'Fecha',
    'Tipo Movimiento',
    'N° Recibo / Soporte',
    'Ref. Banesco / TXID',
    'Concepto Contable y Operativo',
    'Débito Cupo [+] (VES)',
    'Pago Total Recibido (VES)',
    'Intereses Pagados (VES)',
    'Retención ISLR 5% (VES)',
    'Crédito Capital [-] (VES)',
    'Saldo Capital Deudor (VES)',
    'Límite Línea (VES)',
    'Cupo Disponible (VES)',
    '% Utilización',
    'Tasa BCV (Bs./USD)'
  ];

  sheet1Data.push(headersSheet1.map((h, idx) => {
    const isAmountCol = idx >= 6 && idx <= 13;
    const isRateOrPct = idx >= 14;
    return createHeaderCell(h, isAmountCol || isRateOrPct ? 'right' : 'center', EXCEL_COLORS.NAVY_HEADER);
  }));

  movimientos.forEach((m, idx) => {
    sheet1Data.push([
      createDataTextCell(m.correlativo, 'center', idx),
      createDataTextCell(m.fecha, 'center', idx),
      createDataTextCell(m.tipo === 'CUPO_DISPOSICION' ? 'Desembolso Cupo (Salida)' : 'Pago Recibido (Amortización)', 'center', idx),
      createDataTextCell(m.recibo_codigo, 'center', idx),
      createDataTextCell(m.referencia_bancaria, 'center', idx),
      createDataTextCell(m.concepto, 'left', idx),
      createDataNumberCell(m.debito_cupo_ves, idx),
      createDataNumberCell(m.pago_total_recibido_ves, idx),
      createDataNumberCell(m.intereses_pagados_ves, idx),
      createDataNumberCell(m.retencion_islr_ves, idx),
      createDataNumberCell(m.credito_capital_ves, idx),
      createDataNumberCell(m.saldo_capital_vivo_ves, idx),
      createDataNumberCell(m.limite_linea_ves, idx),
      createDataNumberCell(m.cupo_disponible_ves, idx),
      createDataPercentCell(m.porcentaje_utilizado / 100, idx),
      createDataNumberCell(m.tasa_bcv, idx)
    ]);
  });

  // Totales al final de las columnas con montos
  sheet1Data.push([
    createTotalCell('TOTALES', false, 'center'),
    createTotalCell('', false, 'center'),
    createTotalCell('47 Operaciones Banesco', false, 'center'),
    createTotalCell('', false, 'center'),
    createTotalCell('', false, 'center'),
    createTotalCell('Balance Consolidado Línea', false, 'left'),
    createTotalCell(totalCupos, true, 'right'),
    createTotalCell(totalPagos, true, 'right'),
    createTotalCell(totalIntereses, true, 'right'),
    createTotalCell(totalRetencionISLR, true, 'right'),
    createTotalCell(totalAmortizadoCapital, true, 'right'),
    createTotalCell(saldoCapitalFinal, true, 'right'),
    createTotalCell(limiteLinea, true, 'right'),
    createTotalCell(cupoDisponibleFinal, true, 'right'),
    createTotalCell(saldoCapitalFinal / limiteLinea, true, 'right', '0.00%'),
    createTotalCell('', false, 'center')
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [
    { wch: 8 },  { wch: 14 }, { wch: 30 }, { wch: 22 },
    { wch: 24 }, { wch: 48 }, { wch: 24 }, { wch: 26 },
    { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 26 },
    { wch: 24 }, { wch: 24 }, { wch: 16 }, { wch: 16 }
  ];
  ws1['!rows'] = [
    { hpt: 26 }, { hpt: 20 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Cruce Periódico (47 Mov)');

  // ==========================================
  // HOJA 2: LIBRO DIARIO COMPLETO (49 ASIENTOS)
  // ==========================================
  const sheet2Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - LIBRO DIARIO LEGAL COMPLETO (VEN-NIF PYME / SENIAT)`, 'title')],
    [createTitleBannerCell(`R.I.F.: ${empresa.rif_empresa} • CONTABILIDAD DE LÍNEA DE CRÉDITO ROTATIVA BS. 600.000.000,00`, 'subtitle')],
    [createTitleBannerCell('CICLO COMPLETO: ASIENTO APERTURA ORDEN + 29 DESEMBOLSOS BANCO + 18 COBRANZAS CON RETENCIÓN ISLR 5% + COMPENSACIÓN FISCAL', 'meta')],
    [createTitleBannerCell('PROHIBICIÓN EXPRESA DE ASIENTO ÚNICO: CADA TRANSACCIÓN BANCARIA TIENE SU COMPROBANTE PROPIO Y AUDITABLE', 'warning')],
    []
  ];

  const headersSheet2 = [
    'Comprobante N°',
    'Fecha',
    'Tipo de Operación',
    'N° Recibo / Soporte',
    'Ref. Banesco / TXID',
    'Código Cuenta',
    'Descripción de la Cuenta Contable',
    'Débito (VES)',
    'Crédito (VES)',
    'Glosa Legal y Fundamento Tributario'
  ];

  sheet2Data.push(headersSheet2.map((h, idx) => {
    const isAmountCol = idx === 7 || idx === 8;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.BLUE_HEADER);
  }));

  let totalDebitoLibroDiario = 0;
  let totalCreditoLibroDiario = 0;

  // Asiento 0: Apertura de Línea en Cuentas de Orden
  totalDebitoLibroDiario += 600000000.00;
  totalCreditoLibroDiario += 600000000.00;
  sheet2Data.push([
    createDataTextCell('COMP-APERT-2026-0001', 'center', 0, true),
    createDataTextCell('15/01/2026', 'center', 0),
    createDataTextCell('Apertura Línea (Cuentas de Orden)', 'left', 0),
    createDataTextCell('CONTRATO-MARCO-001', 'center', 0),
    createDataTextCell('NOTARIA-CHACAO-T12', 'center', 0),
    createDataTextCell('7.1.01.01.001', 'center', 0, true),
    createDataTextCell('Contratos de Crédito Autorizados y Concedidos a Socios', 'left', 0),
    createDataNumberCell(600000000.00, 0),
    createDataNumberCell(0.00, 0),
    createDataTextCell(`Registro de orden y control estatutario de apertura de Línea de Crédito Rotativa General por Bs. 600.000.000,00 concedida a ${mutuario.nombre_accionista} según Contrato Notariado LC-ONI-2026-0001 y Acta de Asamblea. VEN-NIF PYME Sección 11.`, 'left', 0)
  ]);
  sheet2Data.push([
    createDataTextCell('', 'center', 1),
    createDataTextCell('', 'center', 1),
    createDataTextCell('', 'left', 1),
    createDataTextCell('', 'center', 1),
    createDataTextCell('', 'center', 1),
    createDataTextCell('7.2.01.01.001', 'center', 1, true),
    createDataTextCell('Responsabilidad por Líneas de Crédito Rotativas Concedidas', 'left', 1),
    createDataNumberCell(0.00, 1),
    createDataNumberCell(600000000.00, 1),
    createDataTextCell('', 'left', 1)
  ]);
  sheet2Data.push([
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('TOTAL COMPROBANTE APERTURA:', false, 'right'),
    createSubtotalCell(600000000.00, true, 'right'),
    createSubtotalCell(600000000.00, true, 'right'),
    createSubtotalCell('CUADRADO (SUMAS IGUALES)', false, 'left')
  ]);
  sheet2Data.push([]);

  // Asientos 1 al 29: Los 29 Desembolsos de Salida (Cupos Rotativos)
  cuposList.forEach((cupo, cupoIdx) => {
    const compNum = `COMP-CUP-${String(cupo.numero_cupo).padStart(4, '0')}`;
    const glosaCupo = `Desembolso cupo rotativo N° ${cupo.numero_cupo} mediante transferencia bancaria de salida por Bs. ${formatVES(cupo.monto_ves)} (${formatUSD(cupo.monto_usd)} a tasa BCV ${cupo.tasa_bcv.toFixed(2)}) imputado a Línea de Crédito. Soporte: Recibo ${cupo.numero_recibo} y Transferencia Banesco Ref. ${cupo.referencia_bancaria}. Art. 72 LISLR y VEN-NIF PYME Sección 11.`;

    totalDebitoLibroDiario += cupo.monto_ves;
    totalCreditoLibroDiario += cupo.monto_ves;

    sheet2Data.push([
      createDataTextCell(compNum, 'center', cupoIdx * 2, true),
      createDataTextCell(cupo.fecha, 'center', cupoIdx * 2),
      createDataTextCell(`Desembolso Cupo N° ${cupo.numero_cupo} (Salida)`, 'left', cupoIdx * 2),
      createDataTextCell(cupo.numero_recibo, 'center', cupoIdx * 2),
      createDataTextCell(cupo.referencia_bancaria, 'center', cupoIdx * 2),
      createDataTextCell('1.1.2.03.01', 'center', cupoIdx * 2, true),
      createDataTextCell(`Cuentas por Cobrar Socios y Directores - ${mutuario.nombre_accionista.toUpperCase()}`, 'left', cupoIdx * 2),
      createDataNumberCell(cupo.monto_ves, cupoIdx * 2),
      createDataNumberCell(0.00, cupoIdx * 2),
      createDataTextCell(glosaCupo, 'left', cupoIdx * 2)
    ]);
    sheet2Data.push([
      createDataTextCell('', 'center', cupoIdx * 2 + 1),
      createDataTextCell('', 'center', cupoIdx * 2 + 1),
      createDataTextCell('', 'left', cupoIdx * 2 + 1),
      createDataTextCell('', 'center', cupoIdx * 2 + 1),
      createDataTextCell('', 'center', cupoIdx * 2 + 1),
      createDataTextCell('1.1.1.02.01', 'center', cupoIdx * 2 + 1, true),
      createDataTextCell('Banco Banesco C.A. (Cuenta Corriente N° 0134-0987-5128)', 'left', cupoIdx * 2 + 1),
      createDataNumberCell(0.00, cupoIdx * 2 + 1),
      createDataNumberCell(cupo.monto_ves, cupoIdx * 2 + 1),
      createDataTextCell('', 'left', cupoIdx * 2 + 1)
    ]);
    sheet2Data.push([
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell(`TOTAL ${compNum}:`, false, 'right'),
      createSubtotalCell(cupo.monto_ves, true, 'right'),
      createSubtotalCell(cupo.monto_ves, true, 'right'),
      createSubtotalCell('CUADRADO', false, 'left')
    ]);
    sheet2Data.push([]);
  });

  // Asientos 30 al 47: Las 18 Cobranzas Recibidas en Partida Cuádruple con Retención ISLR 5%
  pagosListCompleto.forEach((pago, pIdx) => {
    const compNum = `COMP-PAG-${String(pago.numero_pago).padStart(4, '0')}`;
    const entradaBancoNeto = Math.round((pago.monto_total_ves - pago.monto_retencion_islr_ves) * 100) / 100;
    const islrRet = pago.monto_retencion_islr_ves;
    const intereses = pago.intereses_pagados_ves;
    const capital = pago.capital_amortizado_ves;
    const glosaPago = `Cobranza de transferencia Banesco de abono por Bs. ${formatVES(pago.monto_total_ves)}. Se imputa con prelación legal imperativa primero a intereses devengados (Bs. ${formatVES(intereses)}) según mandato del Art. 529 del Código de Comercio, reconociendo el anticipo de ISLR retenido en fuente (5% por Bs. ${formatVES(islrRet)}) según Decreto N° 1.808 y el remanente a amortización efectiva del capital (Bs. ${formatVES(capital)}). Saldo deudor resultante: Bs. ${formatVES(pago.nuevo_saldo_capital_ves)}. Soporte: Recibo ${pago.numero_recibo} y Ref. Banesco ${pago.referencia_bancaria}.`;

    totalDebitoLibroDiario += pago.monto_total_ves;
    totalCreditoLibroDiario += pago.monto_total_ves;

    sheet2Data.push([
      createDataTextCell(compNum, 'center', pIdx * 4, true),
      createDataTextCell(pago.fecha, 'center', pIdx * 4),
      createDataTextCell(`Pago Recibido N° ${pago.numero_pago} (Amortización e ISLR)`, 'left', pIdx * 4),
      createDataTextCell(pago.numero_recibo, 'center', pIdx * 4),
      createDataTextCell(pago.referencia_bancaria, 'center', pIdx * 4),
      createDataTextCell('1.1.1.02.01', 'center', pIdx * 4, true),
      createDataTextCell('Banco Banesco C.A. (Cuenta Corriente N° 0134-0987-5128) [Entrada Neta]', 'left', pIdx * 4),
      createDataNumberCell(entradaBancoNeto, pIdx * 4),
      createDataNumberCell(0.00, pIdx * 4),
      createDataTextCell(glosaPago, 'left', pIdx * 4)
    ]);
    sheet2Data.push([
      createDataTextCell('', 'center', pIdx * 4 + 1),
      createDataTextCell('', 'center', pIdx * 4 + 1),
      createDataTextCell('', 'left', pIdx * 4 + 1),
      createDataTextCell('', 'center', pIdx * 4 + 1),
      createDataTextCell('', 'center', pIdx * 4 + 1),
      createDataTextCell('1.1.3.05.02', 'center', pIdx * 4 + 1, true),
      createDataTextCell('Anticipo de ISLR Retenido por Clientes y Socios (5% Decreto 1808)', 'left', pIdx * 4 + 1),
      createDataNumberCell(islrRet, pIdx * 4 + 1),
      createDataNumberCell(0.00, pIdx * 4 + 1),
      createDataTextCell('', 'left', pIdx * 4 + 1)
    ]);
    sheet2Data.push([
      createDataTextCell('', 'center', pIdx * 4 + 2),
      createDataTextCell('', 'center', pIdx * 4 + 2),
      createDataTextCell('', 'left', pIdx * 4 + 2),
      createDataTextCell('', 'center', pIdx * 4 + 2),
      createDataTextCell('', 'center', pIdx * 4 + 2),
      createDataTextCell('4.2.1.01.01', 'center', pIdx * 4 + 2, true),
      createDataTextCell('Ingresos Financieros por Intereses de Financiamiento (Art. 529 C.Com)', 'left', pIdx * 4 + 2),
      createDataNumberCell(0.00, pIdx * 4 + 2),
      createDataNumberCell(intereses, pIdx * 4 + 2),
      createDataTextCell('', 'left', pIdx * 4 + 2)
    ]);
    sheet2Data.push([
      createDataTextCell('', 'center', pIdx * 4 + 3),
      createDataTextCell('', 'center', pIdx * 4 + 3),
      createDataTextCell('', 'left', pIdx * 4 + 3),
      createDataTextCell('', 'center', pIdx * 4 + 3),
      createDataTextCell('', 'center', pIdx * 4 + 3),
      createDataTextCell('1.1.2.03.01', 'center', pIdx * 4 + 3, true),
      createDataTextCell(`Cuentas por Cobrar Socios y Directores - ${mutuario.nombre_accionista.toUpperCase()} [Amortización Capital]`, 'left', pIdx * 4 + 3),
      createDataNumberCell(0.00, pIdx * 4 + 3),
      createDataNumberCell(capital, pIdx * 4 + 3),
      createDataTextCell('', 'left', pIdx * 4 + 3)
    ]);
    sheet2Data.push([
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell('', false),
      createSubtotalCell(`TOTAL ${compNum}:`, false, 'right'),
      createSubtotalCell(pago.monto_total_ves, true, 'right'),
      createSubtotalCell(pago.monto_total_ves, true, 'right'),
      createSubtotalCell('CUADRADO', false, 'left')
    ]);
    sheet2Data.push([]);
  });

  // Asiento 48: Cierre y Compensación Fiscal de ISLR Retenido
  totalDebitoLibroDiario += totalISLRRetenidoAcumulado;
  totalCreditoLibroDiario += totalISLRRetenidoAcumulado;

  sheet2Data.push([
    createDataTextCell('COMP-ISLR-2026-0001', 'center', 0, true),
    createDataTextCell('31/12/2026', 'center', 0),
    createDataTextCell('Compensación Fiscal de ISLR Retenido', 'left', 0),
    createDataTextCell('ARC-SENIAT-2026', 'center', 0),
    createDataTextCell('COMP-ARC-ACUMULADO', 'center', 0),
    createDataTextCell('2.1.3.01.01', 'center', 0, true),
    createDataTextCell('Impuesto Sobre la Renta (ISLR) por Pagar (Pasivo Corriente)', 'left', 0),
    createDataNumberCell(totalISLRRetenidoAcumulado, 0),
    createDataNumberCell(0.00, 0),
    createDataTextCell(`Compensación fiscal de retenciones de ISLR acumuladas por Bs. ${formatVES(totalISLRRetenidoAcumulado)} practicadas al 5% sobre la totalidad de los intereses de mutuo devengados en el período 2026, conforme al Art. 9 del Decreto N° 1.808. Soportado formalmente con los Comprobantes de Retención ARC emitidos por el mutuario pagador, deduciéndose directamente de la cuota tributaria en la Declaración Definitiva de Rentas ante el SENIAT.`, 'left', 0)
  ]);
  sheet2Data.push([
    createDataTextCell('', 'center', 1),
    createDataTextCell('', 'center', 1),
    createDataTextCell('', 'left', 1),
    createDataTextCell('', 'center', 1),
    createDataTextCell('', 'center', 1),
    createDataTextCell('1.1.3.05.02', 'center', 1, true),
    createDataTextCell('Anticipo de ISLR Retenido por Clientes y Socios (5% Decreto 1808)', 'left', 1),
    createDataNumberCell(0.00, 1),
    createDataNumberCell(totalISLRRetenidoAcumulado, 1),
    createDataTextCell('', 'left', 1)
  ]);
  sheet2Data.push([
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('', false),
    createSubtotalCell('TOTAL COMP-ISLR-2026-0001:', false, 'right'),
    createSubtotalCell(totalISLRRetenidoAcumulado, true, 'right'),
    createSubtotalCell(totalISLRRetenidoAcumulado, true, 'right'),
    createSubtotalCell('CUADRADO', false, 'left')
  ]);
  sheet2Data.push([]);

  // Gran Total General del Libro Diario (49 Asientos)
  sheet2Data.push([
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('TOTAL GENERAL LIBRO DIARIO (SUMAS IGUALES):', false, 'right'),
    createTotalCell(totalDebitoLibroDiario, true, 'right'),
    createTotalCell(totalCreditoLibroDiario, true, 'right'),
    createTotalCell('CUADRADO AL CÉNTIMO (49 ASIENTOS AUDITADOS)', false, 'left')
  ]);

  const wsLibroDiario = XLSX.utils.aoa_to_sheet(sheet2Data);
  wsLibroDiario['!cols'] = [
    { wch: 24 }, // Comprobante
    { wch: 14 }, // Fecha
    { wch: 34 }, // Tipo Operación
    { wch: 22 }, // Recibo
    { wch: 24 }, // Ref Banesco
    { wch: 18 }, // Código Cuenta
    { wch: 50 }, // Nombre Cuenta
    { wch: 24 }, // Débito
    { wch: 24 }, // Crédito
    { wch: 65 }  // Glosa
  ];
  wsLibroDiario['!rows'] = [
    { hpt: 26 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }
  ];
  XLSX.utils.book_append_sheet(wb, wsLibroDiario, 'Libro Diario (49 Asientos)');

  // ==========================================
  // HOJA 3: 29 SALIDAS DE BANCO (DESEMBOLSOS)
  // ==========================================
  const sheet3Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - REGISTRO DE DIARIO DE LAS 29 SALIDAS DE BANCO BANESCO (CUPOS)`, 'title')],
    [createTitleBannerCell(`LÍNEA DE CRÉDITO BS. 600.000.000,00 • BENEFICIARIO: ${mutuario.nombre_accionista}`, 'subtitle')],
    [createTitleBannerCell('AUDITORÍA DE DESEMBOLSOS REALES BANCARIZADOS (ART. 72 LISLR Y VEN-NIF PYME SEC. 11)', 'meta')],
    []
  ];

  const headersSheet3 = [
    'Comprobante N°',
    'Fecha',
    'N° Recibo Cupo',
    'Referencia Banesco',
    'Cuenta Débito (CxC Socio)',
    'Cuenta Crédito (Banco Banesco)',
    'Monto Cupo (VES)',
    'Tasa BCV (Bs./USD)',
    'Equivalente (USD)',
    'Glosa y Justificación Mercantil'
  ];
  sheet3Data.push(headersSheet3.map((h, idx) => {
    const isAmountCol = idx === 6 || idx === 7 || idx === 8;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.NAVY_HEADER);
  }));

  cuposList.forEach((cupo, idx) => {
    sheet3Data.push([
      createDataTextCell(`COMP-CUP-${String(cupo.numero_cupo).padStart(4, '0')}`, 'center', idx, true),
      createDataTextCell(cupo.fecha, 'center', idx),
      createDataTextCell(cupo.numero_recibo, 'center', idx),
      createDataTextCell(cupo.referencia_bancaria, 'center', idx),
      createDataTextCell('1.1.2.03.01 (CxC Socios)', 'center', idx),
      createDataTextCell('1.1.1.02.01 (Banco Banesco 5128)', 'center', idx),
      createDataNumberCell(cupo.monto_ves, idx),
      createDataNumberCell(cupo.tasa_bcv, idx),
      createDataNumberCell(cupo.monto_usd, idx),
      createDataTextCell(`Transferencia Banesco Ref. ${cupo.referencia_bancaria} por desembolso de cupo rotativo N° ${cupo.numero_cupo} imputado a línea notariada.`, 'left', idx)
    ]);
  });

  sheet3Data.push([
    createTotalCell('TOTALES 29 SALIDAS', false, 'left'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('29 Transferencias Banesco', false, 'center'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell(totalCupos, true, 'right'),
    createTotalCell('', false),
    createTotalCell(totalCuposUSD, true, 'right'),
    createTotalCell('Total 100% Línea Utilizada en Desembolsos Reales', false, 'left')
  ]);

  const wsSalidas = XLSX.utils.aoa_to_sheet(sheet3Data);
  wsSalidas['!cols'] = [
    { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 24 },
    { wch: 28 }, { wch: 30 }, { wch: 24 }, { wch: 18 },
    { wch: 20 }, { wch: 55 }
  ];
  wsSalidas['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, wsSalidas, '29 Salidas de Banco');

  // ==========================================
  // HOJA 4: 18 ENTRADAS E ISLR (PAGOS RECIBIDOS)
  // ==========================================
  const sheet4Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - REGISTRO DE DIARIO DE LAS 18 ENTRADAS DE BANCO Y RETENCIÓN ISLR 5%`, 'title')],
    [createTitleBannerCell(`MUTUARIO PAGADOR: ${mutuario.nombre_accionista} • RÉGIMEN RETENCIONES: DECRETO N° 1.808 (ART. 9)`, 'subtitle')],
    [createTitleBannerCell('PRELACIÓN OBLIGATORIA ART. 529 C.COM: INTERESES PRIMERO, RETENCIÓN 5% ISLR Y AMORTIZACIÓN A CAPITAL', 'meta')],
    []
  ];

  const headersSheet4 = [
    'Comprobante N°',
    'Fecha',
    'N° Recibo Pago',
    'Referencia Banesco',
    'Banco Banesco Neto (VES)',
    'Anticipo ISLR Retenido 5% (VES)',
    'Ingresos Intereses (VES)',
    'Amortizado a Capital (VES)',
    'Total Pagado (VES)',
    'Glosa y Prelación Art. 529 C.Com'
  ];
  sheet4Data.push(headersSheet4.map((h, idx) => {
    const isAmountCol = idx >= 4 && idx <= 8;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.EMERALD_HEADER);
  }));

  pagosListCompleto.forEach((p, idx) => {
    const neto = Math.round((p.monto_total_ves - p.monto_retencion_islr_ves) * 100) / 100;
    sheet4Data.push([
      createDataTextCell(`COMP-PAG-${String(p.numero_pago).padStart(4, '0')}`, 'center', idx, true),
      createDataTextCell(p.fecha, 'center', idx),
      createDataTextCell(p.numero_recibo, 'center', idx),
      createDataTextCell(p.referencia_bancaria, 'center', idx),
      createDataNumberCell(neto, idx),
      createDataNumberCell(p.monto_retencion_islr_ves, idx),
      createDataNumberCell(p.intereses_pagados_ves, idx),
      createDataNumberCell(p.capital_amortizado_ves, idx),
      createDataNumberCell(p.monto_total_ves, idx),
      createDataTextCell(`Abono de mutuo imputado con prelación legal a intereses (Bs. ${formatVES(p.intereses_pagados_ves)}) y capital (Bs. ${formatVES(p.capital_amortizado_ves)}) con retención 5% ISLR.`, 'left', idx)
    ]);
  });

  sheet4Data.push([
    createTotalCell('TOTALES 18 PAGOS', false, 'left'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('18 Transferencias Banesco', false, 'center'),
    createTotalCell(totalEntradaBancoNeto, true, 'right'),
    createTotalCell(totalRetencionISLR, true, 'right'),
    createTotalCell(totalIntereses, true, 'right'),
    createTotalCell(totalAmortizadoCapital, true, 'right'),
    createTotalCell(totalPagos, true, 'right'),
    createTotalCell('Cuadrado al Céntimo según Art. 529 C.Com y Decreto 1808', false, 'left')
  ]);

  const wsPagosDetalle = XLSX.utils.aoa_to_sheet(sheet4Data);
  wsPagosDetalle['!cols'] = [
    { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 24 },
    { wch: 24 }, { wch: 26 }, { wch: 24 }, { wch: 24 },
    { wch: 24 }, { wch: 55 }
  ];
  wsPagosDetalle['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, wsPagosDetalle, '18 Entradas e ISLR');

  // ==========================================
  // HOJA 5: CIERRE Y COMPENSACIÓN FISCAL ISLR
  // ==========================================
  const sheet5Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - REGISTRO DE CIERRE Y COMPENSACIÓN FISCAL DE ISLR`, 'title')],
    [createTitleBannerCell('RÉGIMEN: DECRETO N° 1.808 (G.O. N° 36.203) • ARTÍCULO 9, NUMERAL 8 (INTERESES DE MUTUO)', 'subtitle')],
    [createTitleBannerCell('CRÉDITO FISCAL COMPROBANTES ARC DEDUCIBLE DIRECTAMENTE EN LA DECLARACIÓN DEFINITIVA DE RENTAS', 'meta')],
    []
  ];

  const headersSheet5 = [
    'N° Pago', 'N° Recibo', 'Fecha Pago', 'Base Intereses (VES)',
    'Porcentaje Retención', 'Retención ISLR 5% (VES)', 'Comprobante ARC Ref.', 'Estado Tributario'
  ];
  sheet5Data.push(headersSheet5.map((h, idx) => {
    const isAmountCol = idx === 3 || idx === 5;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.BLUE_HEADER);
  }));

  pagosListCompleto.forEach((p, idx) => {
    sheet5Data.push([
      createDataTextCell(p.numero_pago, 'center', idx),
      createDataTextCell(p.numero_recibo, 'center', idx),
      createDataTextCell(p.fecha, 'center', idx),
      createDataNumberCell(p.intereses_pagados_ves, idx),
      createDataPercentCell(0.05, idx),
      createDataNumberCell(p.monto_retencion_islr_ves, idx),
      createDataTextCell(`ARC-2026-${String(p.numero_pago).padStart(4, '0')}`, 'center', idx, true),
      createDataTextCell('Crédito Fiscal Retenido en Fuente', 'left', idx)
    ]);
  });

  sheet5Data.push([
    createTotalCell('TOTALES', false, 'center'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell(totalIntereses, true, 'right'),
    createTotalCell(0.05, true, 'right', '0.00%'),
    createTotalCell(totalRetencionISLR, true, 'right'),
    createTotalCell('18 Comprobantes ARC', false, 'center'),
    createTotalCell('Compensado contra ISLR Anual', false, 'left')
  ]);

  sheet5Data.push([]);
  sheet5Data.push([createTitleBannerCell('ASIENTO DE CIERRE CONTABLE Y COMPENSACIÓN FISCAL:', 'subtitle')]);

  const headersAsientoCierre = ['Fecha', 'Comprobante', 'Código Cuenta', 'Descripción de Cuenta', 'Debe (VES)', 'Haber (VES)'];
  sheet5Data.push(headersAsientoCierre.map((h, idx) => {
    const isAmountCol = idx === 4 || idx === 5;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.NAVY_HEADER);
  }));

  sheet5Data.push([
    createDataTextCell('31/12/2026', 'center', 0),
    createDataTextCell('COMP-ISLR-2026-0001', 'center', 0, true),
    createDataTextCell('2.1.3.01.01', 'center', 0, true),
    createDataTextCell('Impuesto Sobre la Renta (ISLR) por Pagar', 'left', 0),
    createDataNumberCell(totalRetencionISLR, 0),
    createDataNumberCell(0.00, 0)
  ]);
  sheet5Data.push([
    createDataTextCell('31/12/2026', 'center', 1),
    createDataTextCell('COMP-ISLR-2026-0001', 'center', 1, true),
    createDataTextCell('1.1.3.05.02', 'center', 1, true),
    createDataTextCell('Anticipo de ISLR Retenido por Clientes y Socios', 'left', 1),
    createDataNumberCell(0.00, 1),
    createDataNumberCell(totalRetencionISLR, 1)
  ]);
  sheet5Data.push([
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('TOTAL ASIENTO DE COMPENSACIÓN:', false, 'right'),
    createTotalCell(totalRetencionISLR, true, 'right'),
    createTotalCell(totalRetencionISLR, true, 'right')
  ]);

  const wsISLR = XLSX.utils.aoa_to_sheet(sheet5Data);
  wsISLR['!cols'] = [
    { wch: 10 }, { wch: 20 }, { wch: 14 }, { wch: 24 },
    { wch: 20 }, { wch: 24 }, { wch: 24 }, { wch: 34 }
  ];
  wsISLR['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, wsISLR, 'Compensación Fiscal ISLR');

  // ==========================================
  // HOJA 6: RESUMEN MAYOR (CONSOLIDADO)
  // ==========================================
  const sheet6Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - RESUMEN CONSOLIDADO DE ASIENTOS DE DIARIO (LIBRO MAYOR)`, 'title')],
    [createTitleBannerCell(`BALANCE CONSOLIDADO DE CUENTAS • EJERCICIO FISCAL 2026 • R.I.F. ${empresa.rif_empresa}`, 'subtitle')],
    []
  ];

  const headersSheet6 = ['Fase Contable', 'Fecha', 'Comprobante', 'Código Cuenta', 'Descripción Cuenta', 'Debe (VES)', 'Haber (VES)', 'Fundamento Jurídico'];
  sheet6Data.push(headersSheet6.map((h, idx) => {
    const isAmountCol = idx === 5 || idx === 6;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.NAVY_HEADER);
  }));

  const rowsMayorRaw = [
    { fase: 'Apertura Línea', fecha: '15/01/2026', comp: 'COMP-APERT-0001', cod: '7.1.01.01.001', desc: 'Contratos de Crédito Autorizados a Socios', debe: 600000000.00, haber: 0.00, fund: 'Contrato Notariado LC-ONI-2026-0001' },
    { fase: '', fecha: '', comp: '', cod: '7.2.01.01.001', desc: 'Responsabilidad por Líneas de Crédito Concedidas', debe: 0.00, haber: 600000000.00, fund: 'Cuentas de Orden Estatutarias' },
    { fase: '29 Desembolsos Cupo', fecha: '16/01-25/03/26', comp: 'COMP-CUP-0001/29', cod: '1.1.2.03.01', desc: `Cuentas por Cobrar Socios - ${mutuario.nombre_accionista}`, debe: totalCupos, haber: 0.00, fund: '29 Transferencias Banesco Cta. 5128' },
    { fase: '', fecha: '', comp: '', cod: '1.1.1.02.01', desc: 'Banco Banesco C.A. (Cuenta Corriente N° 5128)', debe: 0.00, haber: totalCupos, fund: 'Art. 72 LISLR y VEN-NIF PYME Sec. 11' },
    { fase: '18 Cobranzas e ISLR', fecha: '14/07-11/09/26', comp: 'COMP-PAG-0001/18', cod: '1.1.1.02.01', desc: 'Banco Banesco C.A. (Entrada Neta Líquida)', debe: totalEntradaBancoNeto, haber: 0.00, fund: 'Partida Cuádruple Art. 529 C.Com' },
    { fase: '', fecha: '', comp: '', cod: '1.1.3.05.02', desc: 'Anticipo de ISLR Retenido por Clientes (5%)', debe: totalRetencionISLR, haber: 0.00, fund: 'Decreto N° 1.808 Art. 9 Numeral 8' },
    { fase: '', fecha: '', comp: '', cod: '4.2.1.01.01', desc: 'Ingresos Financieros por Intereses de Financiamiento', debe: 0.00, haber: totalIntereses, fund: 'Ingreso Gravable para ISLR' },
    { fase: '', fecha: '', comp: '', cod: '1.1.2.03.01', desc: 'Cuentas por Cobrar Socios (Amortización Capital)', debe: 0.00, haber: totalAmortizadoCapital, fund: 'Saldo Vivo Capital: Bs. 420.47M' },
    { fase: 'Cierre Fiscal ISLR', fecha: '31/12/2026', comp: 'COMP-ISLR-0001', cod: '2.1.3.01.01', desc: 'Impuesto Sobre la Renta (ISLR) por Pagar', debe: totalRetencionISLR, haber: 0.00, fund: 'Compensación Fiscal contra Cuota Anual' },
    { fase: '', fecha: '', comp: '', cod: '1.1.3.05.02', desc: 'Anticipo de ISLR Retenido por Clientes (5%)', debe: 0.00, haber: totalRetencionISLR, fund: 'Descargo de Crédito Fiscal con ARC' }
  ];

  let totalMayorDebe = 0;
  let totalMayorHaber = 0;

  rowsMayorRaw.forEach((row, idx) => {
    totalMayorDebe += row.debe;
    totalMayorHaber += row.haber;
    sheet6Data.push([
      createDataTextCell(row.fase, 'left', idx, Boolean(row.fase)),
      createDataTextCell(row.fecha, 'center', idx),
      createDataTextCell(row.comp, 'center', idx, Boolean(row.comp)),
      createDataTextCell(row.cod, 'center', idx, true),
      createDataTextCell(row.desc, 'left', idx),
      createDataNumberCell(row.debe, idx),
      createDataNumberCell(row.haber, idx),
      createDataTextCell(row.fund, 'left', idx)
    ]);
  });

  totalMayorDebe = Math.round(totalMayorDebe * 100) / 100;
  totalMayorHaber = Math.round(totalMayorHaber * 100) / 100;

  // Totales al final de las columnas Debe y Haber
  sheet6Data.push([
    createTotalCell('TOTAL MAYOR CONSOLIDADO (SUMAS IGUALES):', false, 'left'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('Balance General Cuadrado', false, 'left'),
    createTotalCell(totalMayorDebe, true, 'right'),
    createTotalCell(totalMayorHaber, true, 'right'),
    createTotalCell('CUADRADO (SUMAS IGUALES)', false, 'left')
  ]);

  const wsResumenMayor = XLSX.utils.aoa_to_sheet(sheet6Data);
  wsResumenMayor['!cols'] = [
    { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 18 },
    { wch: 48 }, { wch: 24 }, { wch: 24 }, { wch: 42 }
  ];
  wsResumenMayor['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, wsResumenMayor, 'Resumen Mayor (Consolidado)');

  // ==========================================
  // HOJA 7: REGLAS CONTABLES Y TRIBUTARIAS
  // ==========================================
  const sheet7Data: any[][] = [
    [createTitleBannerCell('REGLAS CONTABLES Y TRIBUTARIAS OBLIGATORIAS DE LA APLICACIÓN SOCIO-DOC', 'title')],
    [createTitleBannerCell('DIRECTRICES PERMANENTES PROGRAMADAS EN EL CÓDIGO DEL SISTEMA PARA BLINDAJE ANTE EL SENIAT', 'subtitle')],
    []
  ];

  const headersSheet7 = ['N°', 'Regla Contable Obligatoria', 'Base Jurídica Aplicable', 'Principio Técnico / VEN-NIF', 'Descripción y Aplicación Obligatoria en la App'];
  sheet7Data.push(headersSheet7.map((h, idx) => {
    return createHeaderCell(h, idx === 0 ? 'center' : 'left', EXCEL_COLORS.NAVY_HEADER);
  }));

  REGLAS_CONTABLES_OBLIGATORIAS_APP.forEach((regla, idx) => {
    sheet7Data.push([
      createDataTextCell(regla.numero, 'center', idx, true),
      createDataTextCell(regla.titulo, 'left', idx, true),
      createDataTextCell(regla.baseJuridica, 'left', idx),
      createDataTextCell(regla.principioTecnico, 'left', idx),
      createDataTextCell(`${regla.descripcionDetallada} [Aplicación en el sistema: ${regla.aplicacionEnApp}]`, 'left', idx)
    ]);
  });

  const wsReglasApp = XLSX.utils.aoa_to_sheet(sheet7Data);
  wsReglasApp['!cols'] = [
    { wch: 8 }, { wch: 38 }, { wch: 32 }, { wch: 35 }, { wch: 75 }
  ];
  wsReglasApp['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, wsReglasApp, 'Reglas de la App (SENIAT)');

  // ==========================================
  // HOJA 8: LIBRO DE CUPOS (29 DESEMBOLSOS)
  // ==========================================
  const sheet8Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - LIBRO DE CONTROL DE CUPOS ROTATIVOS (29 DESEMBOLSOS)`, 'title')],
    [createTitleBannerCell(`LÍNEA DE CRÉDITO BS. 600.000.000,00 • MUTUARIO: ${mutuario.nombre_accionista} (C.I. V-${mutuario.cedula_accionista})`, 'subtitle')],
    []
  ];

  const headersSheet8 = [
    'N°', 'N° Recibo', 'Fecha', 'Referencia Banesco', 'Beneficiario',
    'Monto Cupo (VES)', 'Tasa BCV (Bs./USD)', 'Monto (USD)', 'Total Acumulado (VES)', 'Remanente Línea (VES)', '% Consumido'
  ];
  sheet8Data.push(headersSheet8.map((h, idx) => {
    const isAmountCol = idx >= 5 && idx <= 10;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.BLUE_HEADER);
  }));

  cuposList.forEach((c, idx) => {
    sheet8Data.push([
      createDataTextCell(c.numero_cupo, 'center', idx),
      createDataTextCell(c.numero_recibo, 'center', idx),
      createDataTextCell(c.fecha, 'center', idx),
      createDataTextCell(c.referencia_bancaria, 'center', idx),
      createDataTextCell(mutuario.nombre_accionista, 'left', idx),
      createDataNumberCell(c.monto_ves, idx),
      createDataNumberCell(c.tasa_bcv, idx),
      createDataNumberCell(c.monto_usd, idx),
      createDataNumberCell(c.acumulado_actual_ves, idx),
      createDataNumberCell(c.remanente_disponible_ves, idx),
      createDataPercentCell(c.porcentaje_consumido / 100, idx)
    ]);
  });

  sheet8Data.push([
    createTotalCell('TOTALES', false, 'center'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('29 Salidas Banesco', false, 'center'),
    createTotalCell('', false),
    createTotalCell(totalCupos, true, 'right'),
    createTotalCell('', false),
    createTotalCell(totalCuposUSD, true, 'right'),
    createTotalCell(totalCupos, true, 'right'),
    createTotalCell(limiteLinea - totalCupos, true, 'right'),
    createTotalCell(totalCupos / limiteLinea, true, 'right', '0.00%')
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(sheet8Data);
  ws3['!cols'] = [
    { wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 24 },
    { wch: 32 }, { wch: 24 }, { wch: 18 }, { wch: 20 },
    { wch: 24 }, { wch: 24 }, { wch: 16 }
  ];
  ws3['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Libro de Cupos (29)');

  // ==========================================
  // HOJA 9: LIBRO DE PAGOS (18 PAGOS)
  // ==========================================
  const sheet9Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - LIBRO DE PAGOS RECIBIDOS Y AMORTIZACIÓN (18 PAGOS)`, 'title')],
    [createTitleBannerCell(`LÍNEA DE CRÉDITO BS. 600.000.000,00 • MUTUARIO PAGADOR: ${mutuario.nombre_accionista}`, 'subtitle')],
    []
  ];

  const headersSheet9 = [
    'N°', 'N° Recibo', 'Fecha', 'Referencia Banesco', 'Monto Total Pagado (VES)',
    'Intereses Pagados (VES)', 'Ret. ISLR (5%) (VES)', 'Amortizado Capital (VES)', 'Saldo Capital Deudor (VES)', 'Cupo Disponible (VES)'
  ];
  sheet9Data.push(headersSheet9.map((h, idx) => {
    const isAmountCol = idx >= 4;
    return createHeaderCell(h, isAmountCol ? 'right' : 'center', EXCEL_COLORS.EMERALD_HEADER);
  }));

  pagosListCompleto.forEach((p, idx) => {
    sheet9Data.push([
      createDataTextCell(p.numero_pago, 'center', idx),
      createDataTextCell(p.numero_recibo, 'center', idx),
      createDataTextCell(p.fecha, 'center', idx),
      createDataTextCell(p.referencia_bancaria, 'center', idx),
      createDataNumberCell(p.monto_total_ves, idx),
      createDataNumberCell(p.intereses_pagados_ves, idx),
      createDataNumberCell(p.monto_retencion_islr_ves, idx),
      createDataNumberCell(p.capital_amortizado_ves, idx),
      createDataNumberCell(p.nuevo_saldo_capital_ves, idx),
      createDataNumberCell(p.cupo_disponible_actual_ves, idx)
    ]);
  });

  sheet9Data.push([
    createTotalCell('TOTALES', false, 'center'),
    createTotalCell('', false),
    createTotalCell('', false),
    createTotalCell('18 Pagos Banesco', false, 'center'),
    createTotalCell(totalPagos, true, 'right'),
    createTotalCell(totalIntereses, true, 'right'),
    createTotalCell(totalRetencionISLR, true, 'right'),
    createTotalCell(totalAmortizadoCapital, true, 'right'),
    createTotalCell(saldoCapitalFinal, true, 'right'),
    createTotalCell(cupoDisponibleFinal, true, 'right')
  ]);

  const ws4 = XLSX.utils.aoa_to_sheet(sheet9Data);
  ws4['!cols'] = [
    { wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 24 },
    { wch: 26 }, { wch: 24 }, { wch: 22 }, { wch: 26 },
    { wch: 26 }, { wch: 26 }
  ];
  ws4['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Libro de Pagos (18)');

  // ==========================================
  // HOJA 10: DICTAMEN DE BLINDAJE JURÍDICO Y TRIBUTARIO
  // ==========================================
  const sheet10Data: any[][] = [
    [createTitleBannerCell(`${empresa.razon_social} - DICTAMEN PERICIAL CONTABLE Y TRIBUTARIO ANTE EL SENIAT`, 'title')],
    [createTitleBannerCell('INFORME TÉCNICO DE DEFENSA FISCAL CONFORME A LA JURISPRUDENCIA TRIBUTARIA NACIONAL', 'subtitle')],
    []
  ];

  const headersSheet10 = ['Item', 'Base Jurídica Aplicable', 'Dictamen Contable y Fiscal', 'Efecto Legal y Probatorio'];
  sheet10Data.push(headersSheet10.map((h, idx) => {
    return createHeaderCell(h, idx === 0 ? 'center' : 'left', EXCEL_COLORS.NAVY_HEADER);
  }));

  const dictamenRows = [
    {
      item: '1',
      base: 'Art. 529 Código de Comercio Venezolano',
      dictamen: `El pago hecho en cuenta de capital e intereses se imputa primero a éstos. La prelación aplicada liquida en estricto orden los intereses devengados (${formatVES(totalIntereses)}) antes de abonar al capital (${formatVES(totalAmortizadoCapital)}).`,
      efecto: 'Cumplimiento obligatorio de prelación de cobros civiles y mercantiles.'
    },
    {
      item: '2',
      base: 'Art. 72 Ley de Impuesto sobre la Renta (LISLR)',
      dictamen: 'Se desvirtúa de forma fehaciente la presunción de dividendo ficticio. La operación cuenta con Contrato Notariado, bancarización íntegra (Banesco 5128), causación de intereses a tasa oficial y 18 pagos de amortización demostrables.',
      efecto: 'Inoponibilidad de presunción de dividendo presunto o venta omitida.'
    },
    {
      item: '3',
      base: 'Decreto N° 1.808 (Reglamento Parcial de Retenciones ISLR)',
      dictamen: `Se aplicó la retención del 5% de ISLR sobre la totalidad de los intereses cobrados por ${formatVES(totalRetencionISLR)}, enterable ante el SENIAT mediante comprobantes de retención ARC.`,
      efecto: 'Crédito fiscal formalmente acreditado deducible de la cuota anual.'
    },
    {
      item: '4',
      base: 'Art. 16 Numeral 3 de la Ley del IVA',
      dictamen: 'Las operaciones de mutuo dinerario y los intereses devengados por financiamiento no se encuentran sujetos al Impuesto al Valor Agregado (IVA).',
      efecto: 'No sujeción tributaria al IVA de conformidad con la ley especial.'
    },
    {
      item: '5',
      base: 'VEN-NIF PYME Sección 11 (Instrumentos Financieros)',
      dictamen: 'Los desembolsos y cobranzas se reconocen al costo amortizado por cada transacción individual, reflejando fielmente la realidad económica sobre la forma jurídica.',
      efecto: 'Estados financieros auditables y conformes con principios contables nacionales.'
    }
  ];

  dictamenRows.forEach((d, idx) => {
    sheet10Data.push([
      createDataTextCell(d.item, 'center', idx, true),
      createDataTextCell(d.base, 'left', idx, true),
      createDataTextCell(d.dictamen, 'left', idx),
      createDataTextCell(d.efecto, 'left', idx)
    ]);
  });

  const wsDictamen = XLSX.utils.aoa_to_sheet(sheet10Data);
  wsDictamen['!cols'] = [
    { wch: 8 }, { wch: 34 }, { wch: 65 }, { wch: 48 }
  ];
  wsDictamen['!rows'] = [{ hpt: 26 }, { hpt: 20 }, { hpt: 12 }, { hpt: 28 }];
  XLSX.utils.book_append_sheet(wb, wsDictamen, 'Dictamen Tributario SENIAT');

  const sanitizedRif = empresa.rif_empresa.replace(/[^a-zA-Z0-9]/g, '');
  saveExcelWorkbook(wb, `Cruce_Periodico_Cupos_vs_Amortizacion_${sanitizedRif}.xlsx`);
}

